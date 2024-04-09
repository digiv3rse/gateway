import { checkPasswordTokenController } from '@/server/controllers/checkPasswordToken';
import { setPasswordController } from '@/server/controllers/changePassword';
import { readEmailCookie } from '@/server/lib/emailCookie';
import { handleAsyncErrors } from '@/server/lib/expressWrappers';
import { sendAccountVerificationEmail } from '@/server/lib/idapi/user';
import { logger } from '@/server/lib/serverSideLogger';
import handleRecaptcha from '@/server/lib/recaptcha';
import { renderer } from '@/server/lib/renderer';
import { ApiError } from '@/server/models/Error';
import {
	RequestState,
	ResponseWithRequestState,
} from '@/server/models/Express';
import { addQueryParamsToPath } from '@/shared/lib/queryParams';
import deepmerge from 'deepmerge';
import { Request } from 'express';
import {
	setEncryptedStateCookie,
	updateEncryptedStateCookie,
} from '@/server/lib/encryptedStateCookie';
import { register } from '@/server/lib/okta/register';
import { trackMetric } from '@/server/lib/trackMetric';
import { OktaError } from '@/server/models/okta/Error';
import { GenericErrors } from '@/shared/model/Errors';
import { getConfiguration } from '@/server/lib/getConfiguration';
import { setEncryptedStateCookieForOktaRegistration } from './register';
import { mergeRequestState } from '@/server/lib/requestState';
import { loginMiddlewareOAuth } from '@/server/lib/middleware/login';
import {
	CONSENTS_DATA_PAGE,
	RegistrationConsentsFormFields,
} from '@/shared/model/Consent';
import {
	update as patchConsents,
	getConsentValueFromRequestBody,
	getUserConsentsForPage,
	update as updateConsents,
} from '@/server/lib/idapi/consents';
import { update as updateNewsletters } from '@/server/lib/idapi/newsletters';
import { rateLimitedTypedRouter as router } from '@/server/lib/typedRoutes';
import { RegistrationConsents } from '@/shared/model/RegistrationConsents';
import { RegistrationNewslettersFormFields } from '@/shared/model/Newsletter';
import { updateRegistrationPlatform } from '@/server/lib/registrationPlatform';
import { getAppName, isAppPrefix } from '@/shared/lib/appNameUtils';
import { isStringBoolean } from '@/server/lib/isStringBoolean';
import {
	updateRegistrationLocationViaIDAPI,
	updateRegistrationLocationViaOkta,
} from '@/server/lib/updateRegistrationLocation';

const { okta } = getConfiguration();

// temp return to app page for app users who get stuck in browser
router.get(
	'/welcome/:app/complete',
	loginMiddlewareOAuth,
	(req: Request, res: ResponseWithRequestState) => {
		const { app } = req.params;

		const html = renderer('/welcome/:app/complete', {
			pageTitle: 'Welcome',
			requestState: mergeRequestState(res.locals, {
				pageData: {
					// email is type unknown, but we know it's a string
					email: res.locals.oauthState.idToken?.claims.email as string,
					appName: isAppPrefix(app) ? getAppName(app) : undefined,
				},
			}),
		});
		return res.type('html').send(html);
	},
);

// consent page for post social registration - google
router.get(
	'/welcome/google',
	loginMiddlewareOAuth,
	(_: Request, res: ResponseWithRequestState) => {
		const html = renderer('/welcome/google', {
			pageTitle: 'Welcome',
			requestState: res.locals,
		});
		res.type('html').send(html);
	},
);

// consent page for post social registration - apple
router.get(
	'/welcome/apple',
	loginMiddlewareOAuth,
	(_: Request, res: ResponseWithRequestState) => {
		const html = renderer('/welcome/apple', {
			pageTitle: 'Welcome',
			requestState: res.locals,
		});
		res.type('html').send(html);
	},
);

// form handler for consent page for social registration
router.post(
	'/welcome/social',
	loginMiddlewareOAuth,
	handleAsyncErrors(async (req: Request, res: ResponseWithRequestState) => {
		const state = res.locals;
		try {
			// consents/newsletters is a string with value `'on'` if checked, or `undefined` if not checked
			// https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/checkbox#value
			// so we can check the truthiness of the value to determine if the user has consented
			// and we filter out any consents that are not consented
			const registrationConsents: RegistrationConsents = {
				consents: Object.values(RegistrationConsentsFormFields)
					.map((field) => ({
						id: field.id,
						consented: !!req.body[field.id],
					}))
					.filter((newsletter) => newsletter.consented),
				newsletters: Object.values(RegistrationNewslettersFormFields)
					.map((field) => ({
						id: field.id,
						subscribed: !!req.body[field.id],
					}))
					.filter((newsletter) => newsletter.subscribed),
			};

			// update the registration platform for social users, as we're not able to do this
			// at the time of registration, as that happens in Okta
			await updateRegistrationPlatform(
				state.oauthState.accessToken!,
				state.queryParams.appClientId,
				state.requestId,
			);

			const runningInCypress = process.env.RUNNING_IN_CYPRESS === 'true';

			// update the consents and go to the finally block
			if (registrationConsents.consents?.length) {
				try {
					await updateConsents({
						ip: req.ip,
						accessToken: state.oauthState.accessToken?.toString(),
						payload: registrationConsents.consents,
						request_id: res.locals.requestId,
					});

					// since the CODE newsletters API isn't up to date with PROD newsletters API the
					// review page will not show the correct newsletters on CODE.
					// so when running in cypress we set a cookie to return the decrypted consents to cypress
					// so we can check we at least got to the correct code path
					if (runningInCypress) {
						res.cookie(
							'cypress-consent-response',
							JSON.stringify(registrationConsents.consents),
						);
					}
				} catch (error) {
					logger.error(
						'Error updating registration consents on welcome social',
						{
							error,
						},
						{
							request_id: res.locals.requestId,
						},
					);
				}
			}

			if (registrationConsents.newsletters?.length) {
				try {
					await updateNewsletters({
						ip: req.ip,
						accessToken: state.oauthState.accessToken?.toString(),
						payload: registrationConsents.newsletters,
						request_id: res.locals.requestId,
					});
					// since the CODE newsletters API isn't up to date with PROD newsletters API the
					// review page will not show the correct newsletters on CODE.
					// so when running in cypress we set a cookie to return the decrypted consents to cypress
					// so we can check we at least got to the correct code path
					if (runningInCypress) {
						res.cookie(
							'cypress-newsletter-response',
							JSON.stringify(registrationConsents.newsletters),
						);
					}
				} catch (error) {
					logger.error(
						'Error updating registration newsletters on welcome social',
						{
							error,
						},
						{
							request_id: res.locals.requestId,
						},
					);
				}
			}
		} catch (error) {
			// we don't want to block the user at this point, so we'll just log the error, and go to the finally block
			logger.error(`${req.method} ${req.originalUrl}  Error`, error, {
				request_id: res.locals.requestId,
			});
		} finally {
			// otherwise redirect the user to the review page
			return res.redirect(
				303,
				addQueryParamsToPath('/welcome/review', state.queryParams),
			);
		}
	}),
);

// resend account verification page
router.get('/welcome/resend', (_: Request, res: ResponseWithRequestState) => {
	const html = renderer('/welcome/resend', {
		pageTitle: 'Resend Welcome Email',
		requestState: res.locals,
	});
	res.type('html').send(html);
});

// resend account verification page, session expired
router.get('/welcome/expired', (_: Request, res: ResponseWithRequestState) => {
	const html = renderer('/welcome/expired', {
		pageTitle: 'Resend Welcome Email',
		requestState: res.locals,
	});
	res.type('html').send(html);
});

// POST form handler to resend account verification email
router.post(
	'/welcome/resend',
	handleRecaptcha,
	handleAsyncErrors(async (req: Request, res: ResponseWithRequestState) => {
		const { useIdapi } = res.locals.queryParams;
		if (okta.enabled && !useIdapi) {
			await OktaResendEmail(req, res);
		} else {
			const { email } = req.body;
			const state = res.locals;
			const { emailSentSuccess } = state.queryParams;

			try {
				await sendAccountVerificationEmail(
					email,
					req.ip,
					state.queryParams,
					state.ophanConfig,
					state.requestId,
				);

				setEncryptedStateCookie(res, { email });

				return res.redirect(
					303,
					addQueryParamsToPath('/welcome/email-sent', res.locals.queryParams, {
						emailSentSuccess,
					}),
				);
			} catch (error) {
				const { message, status } =
					error instanceof ApiError ? error : new ApiError();

				logger.error(`${req.method} ${req.originalUrl}  Error`, error, {
					request_id: state.requestId,
				});

				const html = renderer('/welcome/resend', {
					pageTitle: 'Resend Welcome Email',
					requestState: mergeRequestState(res.locals, {
						globalMessage: {
							error: message,
						},
					}),
				});
				return res.status(status).type('html').send(html);
			}
		}
	}),
);

// email sent page
router.get(
	'/welcome/email-sent',
	(req: Request, res: ResponseWithRequestState) => {
		const state = res.locals;

		const email = readEmailCookie(req);

		const html = renderer('/welcome/email-sent', {
			pageTitle: 'Check Your Inbox',
			requestState: mergeRequestState(state, {
				pageData: {
					email,
					resendEmailAction: '/welcome/resend',
					changeEmailPage: '/welcome/resend',
				},
			}),
		});
		res.type('html').send(html);
	},
);

router.get(
	'/welcome/review',
	loginMiddlewareOAuth,
	handleAsyncErrors(async (req: Request, res: ResponseWithRequestState) => {
		// eslint-disable-next-line functional/no-let
		let state = res.locals;
		const sc_gu_u = req.cookies.SC_GU_U;

		try {
			const consentsData = {
				consents: await getUserConsentsForPage({
					pageConsents: CONSENTS_DATA_PAGE,
					ip: req.ip,
					sc_gu_u,
					request_id: res.locals.requestId,
					accessToken: res.locals.oauthState.accessToken?.toString(),
				}),
			};

			state = mergeRequestState(state, {
				pageData: {
					...consentsData,
				},
			} as RequestState);

			trackMetric('NewAccountReview::Success');
		} catch (error) {
			logger.error(`${req.method} ${req.originalUrl}  Error`, error, {
				request_id: res.locals.requestId,
			});

			const { message } = error instanceof ApiError ? error : new ApiError();

			state = mergeRequestState(state, {
				globalMessage: {
					error: message,
				},
			});

			trackMetric('NewAccountReview::Failure');
		}

		const html = renderer('/welcome/review', {
			pageTitle: 'Your data',
			requestState: state,
		});
		return res.type('html').send(html);
	}),
);

router.post(
	'/welcome/review',
	loginMiddlewareOAuth,
	handleAsyncErrors(async (req: Request, res: ResponseWithRequestState) => {
		const state = res.locals;
		const { returnUrl, fromURI } = state.queryParams;

		const sc_gu_u = req.cookies.SC_GU_U;
		const _cmpConsentedState = isStringBoolean(req.body._cmpConsentedState);

		try {
			// Attempt to update location for consented users.
			if (res.locals.oauthState.accessToken) {
				await updateRegistrationLocationViaOkta(
					req,
					res.locals.oauthState.accessToken,
				);
			} else {
				await updateRegistrationLocationViaIDAPI(req.ip, sc_gu_u, req);
			}

			const consents = CONSENTS_DATA_PAGE.map((id) => ({
				id,
				consented: getConsentValueFromRequestBody(id, req.body),
			}));

			await patchConsents({
				ip: req.ip,
				sc_gu_u,
				accessToken: res.locals.oauthState.accessToken?.toString(),
				payload: consents,
				request_id: res.locals.requestId,
			});

			trackMetric('NewAccountReviewSubmit::Success');

			updateEncryptedStateCookie(req, res, {
				isCmpConsented: _cmpConsentedState,
			});
		} catch (error) {
			// Never block the user at this point, so we'll just log the error
			logger.error(`${req.method} ${req.originalUrl}  Error`, error, {
				request_id: res.locals.requestId,
			});

			trackMetric('NewAccountReviewSubmit::Failure');
		} finally {
			// if there is a fromURI, we need to complete the oauth flow, so redirect to the fromURI
			if (fromURI) {
				return res.redirect(303, fromURI);
			}

			// In all other cases, finish the welcome flow and redirect to the returnUrl
			return res.redirect(303, returnUrl);
		}
	}),
);

// welcome page, check token and display set password page
router.get(
	'/welcome/:token',
	checkPasswordTokenController('/welcome', 'Welcome'),
);

// POST form handler to set password on welcome page
router.post(
	'/welcome/:token',
	setPasswordController('/welcome', 'Welcome', '/welcome/review'),
);

const OktaResendEmail = async (req: Request, res: ResponseWithRequestState) => {
	const { email } = req.body;
	try {
		const state = res.locals;

		if (typeof email !== 'undefined') {
			const user = await register({
				email,
				appClientId: state.queryParams.appClientId,
				request_id: state.requestId,
			});

			trackMetric('OktaWelcomeResendEmail::Success');

			setEncryptedStateCookieForOktaRegistration(res, user);

			return res.redirect(
				303,
				addQueryParamsToPath('/welcome/email-sent', res.locals.queryParams, {
					emailSentSuccess: true,
				}),
			);
		} else
			throw new OktaError({
				message: 'Could not resend welcome email as email was undefined',
			});
	} catch (error) {
		logger.error('Okta Registration resend email failure', error, {
			request_id: res.locals.requestId,
		});

		trackMetric('OktaWelcomeResendEmail::Failure');

		const html = renderer('/welcome/email-sent', {
			pageTitle: 'Check Your Inbox',
			requestState: deepmerge(res.locals, {
				globalMessage: {
					error: GenericErrors.DEFAULT,
				},
				pageData: {
					email,
					resendEmailAction: '/welcome/resend',
					changeEmailPage: '/welcome/resend',
				},
			}),
		});

		return res.type('html').send(html);
	}
};

export default router.router;
