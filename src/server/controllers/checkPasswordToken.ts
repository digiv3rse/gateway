import { handleAsyncErrors } from '@/server/lib/expressWrappers';
import { Request } from 'express';
import {
	RequestState,
	ResponseWithRequestState,
} from '@/server/models/Express';
import { validate as validateTokenInIDAPI } from '@/server/lib/idapi/changePassword';
import deepmerge from 'deepmerge';
import { getBrowserNameFromUserAgent } from '@/server/lib/getBrowserName';
import {
	readEncryptedStateCookie,
	setEncryptedStateCookie,
	updateEncryptedStateCookie,
} from '@/server/lib/encryptedStateCookie';
import { renderer } from '@/server/lib/renderer';
import { logger } from '@/server/lib/serverSideLogger';
import { PasswordRoutePath } from '@/shared/model/Routes';
import { PasswordPageTitle } from '@/shared/model/PageTitle';
import { getConfiguration } from '@/server/lib/getConfiguration';
import { validateRecoveryToken as validateTokenInOkta } from '@/server/lib/okta/api/authentication';
import { trackMetric } from '@/server/lib/trackMetric';
import { ChangePasswordErrors } from '@/shared/model/Errors';
import { FieldError, IsNativeApp } from '@/shared/model/ClientState';
import { PersistableQueryParams } from '@/shared/model/QueryParams';
import { validateReturnUrl } from '@/server/lib/validateUrl';
import { mergeRequestState } from '@/server/lib/requestState';
import { decryptOktaRecoveryToken } from '@/server/lib/deeplink/oktaRecoveryToken';
import { AppName, getAppName, getAppPrefix } from '@/shared/lib/appNameUtils';

const { okta, defaultReturnUri } = getConfiguration();

const handleBackButtonEventOnWelcomePage = (
	path: PasswordRoutePath,
	pageTitle: PasswordPageTitle,
	req: Request,
	res: ResponseWithRequestState,
) => {
	const { email, passwordSetOnWelcomePage } =
		readEncryptedStateCookie(req) ?? {};
	const requestState = mergeRequestState(res.locals, {
		pageData: {
			email,
		},
	});
	if (passwordSetOnWelcomePage) {
		return res.type('html').send(
			renderer(`${path}/complete`, {
				requestState,
				pageTitle,
			}),
		);
	} else {
		return res.type('html').send(
			renderer(`${path}/resend`, {
				requestState,
				pageTitle: `Resend ${pageTitle} Email`,
			}),
		);
	}
};

const checkTokenInIDAPI = async (
	path: PasswordRoutePath,
	pageTitle: PasswordPageTitle,
	req: Request,
	res: ResponseWithRequestState,
) => {
	const requestState = res.locals;
	const { token } = req.params;

	try {
		const { email, timeUntilTokenExpiry } = await validateTokenInIDAPI(
			token,
			req.ip,
			res.locals.requestId,
		);

		// add email to encrypted state, so we can display it on the confirmation page
		setEncryptedStateCookie(res, { email });

		trackMetric('ValidatePasswordToken::Success');

		const html = renderer(
			`${path}/:token`,
			{
				requestState: mergeRequestState(requestState, {
					pageData: {
						browserName: getBrowserNameFromUserAgent(req.header('User-Agent')),
						email,
						timeUntilTokenExpiry,
						token,
					},
				}),
				pageTitle,
			},
			{ token },
		);
		return res.type('html').send(html);
	} catch (error) {
		logger.error(`${req.method} ${req.originalUrl}  Error`, error, {
			request_id: res.locals.requestId,
		});

		trackMetric('ValidatePasswordToken::Failure');

		if (path === '/welcome') {
			handleBackButtonEventOnWelcomePage(path, pageTitle, req, res);
		} else {
			return res.type('html').send(
				renderer(`${path}/resend`, {
					requestState,
					pageTitle: `Resend ${pageTitle} Email`,
				}),
			);
		}
	}
};

/**
 * This function decides which return url should take presidence when multi choice are availble
 * If it's passed as a url query parameter, this takes highest precedence, followed by the value in the state cookie.
 * If neither are present the default return url is used
 *
 * @param requestState - this is request state from response.locals
 * @param encryptedStateQueryParams - this is the query parameters from the encryptedState Cookie
 * @returns string
 */
const getReturnUrl = (
	requestState: RequestState,
	encryptedStateQueryParams: PersistableQueryParams,
): string => {
	// check that the returnUrl in requestState is not the defaultReturnUri
	// as this suggests that it would have been modified, such as the native apps
	// setting the return url on email link intercept
	if (requestState.queryParams.returnUrl !== defaultReturnUri) {
		return requestState.queryParams.returnUrl;
	}
	// otherwise check the encrypted state cookie for a returnUrl
	// We always want to validate the returl url value, just in case it's been incorrectly set through developer error
	if (encryptedStateQueryParams.returnUrl) {
		return validateReturnUrl(encryptedStateQueryParams.returnUrl);
	}
	// finally use the defaultReturnUri if all else fails
	return defaultReturnUri;
};

export const checkTokenInOkta = async (
	path: PasswordRoutePath,
	pageTitle: PasswordPageTitle,
	req: Request,
	res: ResponseWithRequestState,
	error?: ChangePasswordErrors,
	fieldErrors?: Array<FieldError>,
) => {
	const state = res.locals;
	const { token } = req.params;

	try {
		// check if the token is prefixed with an app prefix
		const prefix = getAppPrefix(token);

		// decrypt the recovery token
		const decryptedRecoveryToken = decryptOktaRecoveryToken({
			encryptedToken: token,
			request_id: state.requestId,
		});
		const [recoveryToken] = decryptedRecoveryToken;

		// Verify that the recovery token is still valid. If invalid, this will
		// return an error and we will show the link expired page.
		const { _embedded } = await validateTokenInOkta({
			recoveryToken,
		});
		const email = _embedded?.user.profile.login;

		// Add the user's email
		// set at registration to the encrypted state cookie
		updateEncryptedStateCookie(req, res, { email });

		trackMetric('OktaValidatePasswordToken::Success');

		// since we can't pass query parameters through okta emails, we set the encryptedStateCookie
		// as the email was sent to the user containing the query params at that time
		// so we read them here, if the user comes back on the same browser
		const encryptedState = readEncryptedStateCookie(req);

		// get query params from the encrypted state cookie, or set empty object if not found
		const encryptedStateQueryParams =
			encryptedState?.queryParams ?? ({} as PersistableQueryParams);

		// get the returnUrl
		const returnUrl = getReturnUrl(state, encryptedStateQueryParams);

		// get fromURI and appClientId, which are parameters from the Okta SDK
		// and unique to this request
		const { fromURI, appClientId } = state.queryParams;

		// finally generate the queryParams object to merge in with the requestState
		// with the correct returnUrl for this request
		const queryParams = deepmerge<PersistableQueryParams>(
			encryptedStateQueryParams,
			{
				returnUrl,
				fromURI,
				appClientId,
			},
		);

		// attempt to determine if the user is using a native app
		// first checking the pageData, then the prefix, otherwise undefined
		const isNativeApp: IsNativeApp | undefined = (() => {
			if (state.pageData.isNativeApp) {
				return state.pageData.isNativeApp;
			}

			if (prefix) {
				return prefix.startsWith('a') ? 'android' : 'ios';
			}
		})();

		// attempt to determine the app name
		// first checking the pageData, then the prefix, otherwise undefined
		const appName: AppName | undefined = (() => {
			if (state.pageData.appName) {
				return state.pageData.appName;
			}

			if (prefix) {
				return getAppName(prefix);
			}
		})();

		const html = renderer(
			`${path}/:token`,
			{
				pageTitle,
				requestState: mergeRequestState(state, {
					queryParams,
					pageData: {
						browserName: getBrowserNameFromUserAgent(req.header('User-Agent')),
						email,
						fieldErrors,
						formError: error,
						token,
						isNativeApp,
						appName,
					},
				}),
			},
			{ token },
		);

		return res.type('html').send(html);
	} catch (error) {
		logger.error('Okta validate password token failure', error, {
			request_id: res.locals.requestId,
		});

		trackMetric('OktaValidatePasswordToken::Failure');

		if (path === '/welcome') {
			handleBackButtonEventOnWelcomePage(path, pageTitle, req, res);
		} else {
			const html = renderer(`${path}/resend`, {
				pageTitle: `Resend ${pageTitle} Email`,
				requestState: res.locals,
			});
			return res.type('html').send(html);
		}
	}
};

export const checkPasswordTokenController = (
	path: PasswordRoutePath,
	pageTitle: PasswordPageTitle,
) =>
	handleAsyncErrors(async (req: Request, res: ResponseWithRequestState) => {
		const { useIdapi } = res.locals.queryParams;
		if (okta.enabled && !useIdapi) {
			await checkTokenInOkta(path, pageTitle, req, res);
		} else {
			await checkTokenInIDAPI(path, pageTitle, req, res);
		}
	});
