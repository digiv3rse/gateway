/* eslint-disable functional/no-let */
import { Request, Response } from 'express';

import { renderer } from '@/server/lib/renderer';

import { rateLimitedTypedRouter as router } from '@/server/lib/typedRoutes';
import {
	update as patchConsents,
	getUserConsentsForPage,
	getConsentValueFromRequestBody,
} from '@/server/lib/idapi/consents';
import {
	update as patchNewsletters,
	readUserNewsletters,
	read as getNewsletters,
} from '@/server/lib/idapi/newsletters';
import { PageData } from '@/shared/model/ClientState';
import {
	ALL_NEWSLETTER_IDS,
	NewsLetter,
	REGISTRATION_NEWSLETTERS,
} from '@/shared/model/Newsletter';
import {
	CONSENTS_DATA_PAGE,
	REGISTRATION_CONSENTS,
} from '@/shared/model/Consent';
import { loginMiddlewareOAuth } from '@/server/lib/middleware/login';
import {
	RequestState,
	ResponseWithRequestState,
} from '@/server/models/Express';
import { VERIFY_EMAIL } from '@/shared/model/Success';
import { trackMetric } from '@/server/lib/trackMetric';
import { consentsPageMetric } from '@/server/models/Metrics';
import { addQueryParamsToPath } from '@/shared/lib/queryParams';
import { GeoLocation } from '@/shared/model/Geolocation';
import { newslettersSubscriptionsFromFormBody } from '@/shared/lib/newsletter';
import {
	ConsentsOnNewslettersPageMap,
	NewsletterMap,
} from '@/shared/lib/newsletterConsentsPageLocalisation';
import { CONSENTS_PAGES } from '@/client/models/ConsentsPages';
import { fourZeroFourRender } from '@/server/lib/middleware/404';
import { handleAsyncErrors } from '@/server/lib/expressWrappers';
import { logger } from '@/server/lib/serverSideLogger';
import { ApiError } from '@/server/models/Error';
import { ConsentPath, RoutePaths } from '@/shared/model/Routes';
import { PageTitle } from '@/shared/model/PageTitle';
import { mergeRequestState } from '@/server/lib/requestState';
import {
	updateRegistrationLocationViaIDAPI,
	updateRegistrationLocationViaOkta,
} from '../lib/updateRegistrationLocation';

interface ConsentPage {
	page: ConsentPath;
	path: RoutePaths;
	read: ({
		ip,
		sc_gu_u,
		geo,
		request_id,
		accessToken,
	}: {
		ip?: string;
		sc_gu_u?: string;
		geo?: GeoLocation;
		request_id?: string;
		accessToken?: string;
	}) => Promise<PageData>;
	pageTitle: PageTitle;
	update?: ({
		ip,
		sc_gu_u,
		body,
		geo,
		request_id,
	}: {
		ip?: string;
		sc_gu_u?: string;
		accessToken?: string;
		body: { [key: string]: string };
		geo?: GeoLocation;
		request_id?: string;
	}) => Promise<void>;
}

const getUserNewsletterSubscriptions = async ({
	ip,
	sc_gu_u,
	newslettersOnPage,
	request_id,
	accessToken,
}: {
	newslettersOnPage: string[];
	ip?: string;
	sc_gu_u?: string;
	request_id?: string;
	accessToken?: string;
}): Promise<NewsLetter[]> => {
	const allNewsletters = await getNewsletters(request_id);
	const userNewsletterSubscriptions = await readUserNewsletters({
		ip,
		sc_gu_u,
		request_id,
		accessToken,
	});

	return newslettersOnPage
		.map((id) => allNewsletters.find((newsletter) => newsletter.id === id))
		.map((newsletter) => {
			if (newsletter) {
				let updated = newsletter;
				if (userNewsletterSubscriptions.includes(newsletter.id)) {
					updated = {
						...updated,
						subscribed: true,
					};
				}
				return updated;
			}
		})
		.filter(Boolean) as NewsLetter[];
};

export const consentPages: ConsentPage[] = [
	{
		page: 'newsletters',
		path: '/consents/newsletters',
		pageTitle: CONSENTS_PAGES.NEWSLETTERS,
		read: async ({ ip, sc_gu_u, geo, request_id, accessToken }) => {
			return {
				page: 'newsletters',
				consents: await getUserConsentsForPage({
					pageConsents: ConsentsOnNewslettersPageMap.get(geo) as string[],
					ip,
					sc_gu_u,
					request_id,
					accessToken,
				}),
				newsletters: await getUserNewsletterSubscriptions({
					newslettersOnPage: NewsletterMap.get(geo) as string[],
					ip,
					sc_gu_u,
					request_id,
					accessToken,
				}),
			};
		},
		update: async ({ ip, sc_gu_u, accessToken, body, geo, request_id }) => {
			const userNewsletterSubscriptions = await getUserNewsletterSubscriptions({
				newslettersOnPage: ALL_NEWSLETTER_IDS,
				ip,
				sc_gu_u,
				accessToken,
				request_id,
			});

			// get a list of newsletters to update that have changed from the users current subscription
			// if they have changed then set them to subscribe/unsubscribe
			const newsletterSubscriptionsToUpdate =
				newslettersSubscriptionsFromFormBody(body).filter((newSubscription) => {
					// find current user subscription status for a newsletter
					const currentSubscription = userNewsletterSubscriptions.find(
						({ id: userNewsletterId }) =>
							userNewsletterId === newSubscription.id,
					);

					// check if a subscription exists
					if (currentSubscription) {
						if (
							// previously subscribed AND now wants to unsubscribe
							(currentSubscription.subscribed && !newSubscription.subscribed) ||
							// OR previously not subscribed AND wants to subscribe
							(!currentSubscription.subscribed && newSubscription.subscribed)
						) {
							// then include in newsletterSubscriptionsToUpdate
							return true;
						}
					}

					// otherwise don't include in the update
					return false;
				});

			await patchNewsletters({
				ip,
				sc_gu_u,
				accessToken,
				payload: newsletterSubscriptionsToUpdate,
				request_id,
			});

			const consents = (ConsentsOnNewslettersPageMap.get(geo) as string[]).map(
				(id) => ({
					id,
					consented: getConsentValueFromRequestBody(id, body),
				}),
			);

			await patchConsents({
				ip,
				sc_gu_u,
				accessToken,
				payload: consents,
				request_id,
			});
		},
	},
	{
		page: 'data',
		path: '/consents/data',
		pageTitle: CONSENTS_PAGES.YOUR_DATA,
		read: async ({ ip, sc_gu_u, request_id, accessToken }) => ({
			consents: await getUserConsentsForPage({
				pageConsents: CONSENTS_DATA_PAGE,
				ip,
				sc_gu_u,
				request_id,
				accessToken,
			}),
			page: 'data',
			previousPage: 'newsletters',
		}),
		update: async ({ ip, sc_gu_u, body, accessToken, request_id }) => {
			const consents = CONSENTS_DATA_PAGE.map((id) => ({
				id,
				consented: getConsentValueFromRequestBody(id, body),
			}));

			await patchConsents({
				ip,
				sc_gu_u,
				accessToken,
				payload: consents,
				request_id,
			});
		},
	},
	{
		page: 'review',
		path: '/consents/review',
		pageTitle: CONSENTS_PAGES.REVIEW,
		read: async ({ ip, sc_gu_u, geo, request_id, accessToken }) => {
			const ALL_CONSENT = [
				...CONSENTS_DATA_PAGE,
				...(ConsentsOnNewslettersPageMap.get(geo) as string[]),
				...REGISTRATION_CONSENTS,
			];

			return {
				page: 'review',
				consents: await getUserConsentsForPage({
					pageConsents: ALL_CONSENT,
					ip,
					sc_gu_u,
					request_id,
					accessToken,
				}),
				newsletters: await getUserNewsletterSubscriptions({
					newslettersOnPage: [
						...(NewsletterMap.get(geo) as string[]),
						...REGISTRATION_NEWSLETTERS,
					],
					ip,
					sc_gu_u,
					request_id,
					accessToken,
				}),
			};
		},
	},
];

router.get('/consents', loginMiddlewareOAuth, (_: Request, res: Response) => {
	const url = addQueryParamsToPath(
		`${consentPages[0].path}`,
		res.locals.queryParams,
	);

	res.redirect(303, url);
});

router.get(
	'/consents/:page',
	loginMiddlewareOAuth,
	handleAsyncErrors(async (req: Request, res: ResponseWithRequestState) => {
		let state = res.locals;
		const sc_gu_u = req.cookies.SC_GU_U;

		const { emailVerified } = state.queryParams;

		if (emailVerified) {
			state = mergeRequestState(state, {
				globalMessage: {
					success: VERIFY_EMAIL.SUCCESS,
				},
			});
		}

		const { page } = req.params;
		let status = 200;

		const pageIndex = consentPages.findIndex((elem) => elem.page === page);
		if (pageIndex === -1) {
			const html = fourZeroFourRender(res);
			return res.type('html').status(404).send(html);
		}

		let pageTitle = PageTitle('Onboarding');

		try {
			const { read, pageTitle: _pageTitle } = consentPages[pageIndex];
			pageTitle = _pageTitle;

			const geolocation = state.pageData.geolocation;

			state = mergeRequestState(state, {
				pageData: {
					...(await read({
						ip: req.ip,
						sc_gu_u,
						geo: geolocation,
						request_id: res.locals.requestId,
						accessToken: res.locals.oauthState.accessToken?.toString(),
					})),
				},
			} as RequestState);
		} catch (error) {
			logger.error(`${req.method} ${req.originalUrl}  Error`, error, {
				request_id: res.locals.requestId,
			});

			const { message, status: errorStatus } =
				error instanceof ApiError ? error : new ApiError();

			status = errorStatus;
			state = mergeRequestState(state, {
				globalMessage: {
					error: message,
				},
			});
		}

		const html = renderer(
			'/consents/:page',
			{
				requestState: state,
				pageTitle,
			},
			{ page },
		);

		trackMetric(
			consentsPageMetric(page, 'Get', status === 200 ? 'Success' : 'Failure'),
		);

		res
			.type('html')
			.status(status ?? 500)
			.send(html);
	}),
);

// On the first page ("Stay in touch") this POST will also post a registration_location update
router.post(
	'/consents/:page',
	loginMiddlewareOAuth,
	handleAsyncErrors(async (req: Request, res: ResponseWithRequestState) => {
		let state = res.locals;

		const sc_gu_u = req.cookies.SC_GU_U;

		const { page } = req.params;
		let status = 200;

		const pageIndex = consentPages.findIndex((elem) => elem.page === page);
		if (pageIndex === -1) {
			const html = fourZeroFourRender(res);
			return res.type('html').status(404).send(html);
		}

		let pageTitle = PageTitle('Onboarding');

		try {
			const { update, pageTitle: _pageTitle } = consentPages[pageIndex];
			pageTitle = _pageTitle;

			// If on the first page, attempt to update location for consented users.
			if (pageIndex === 0) {
				if (res.locals.oauthState.accessToken) {
					await updateRegistrationLocationViaOkta(
						req,
						res.locals.oauthState.accessToken,
					);
				} else {
					await updateRegistrationLocationViaIDAPI(req.ip, sc_gu_u, req);
				}
			}

			// we need this in the Post update so consents are not unintentionally unsubscribed in Permissioned views without consents
			const geolocation = state.pageData.geolocation;

			if (update) {
				await update({
					ip: req.ip,
					sc_gu_u,
					accessToken: res.locals.oauthState.accessToken?.toString(),
					body: req.body,
					geo: geolocation,
					request_id: res.locals.requestId,
				});
			}

			trackMetric(consentsPageMetric(page, 'Post', 'Success'));

			const url = addQueryParamsToPath(
				`${consentPages[pageIndex + 1].path}`,
				state.queryParams,
			);

			return res.redirect(303, url);
		} catch (error) {
			logger.error(`${req.method} ${req.originalUrl}  Error`, error, {
				request_id: res.locals.requestId,
			});

			const { message, status: errorStatus } =
				error instanceof ApiError ? error : new ApiError();

			status = errorStatus;
			state = mergeRequestState(state, {
				globalMessage: {
					error: message,
				},
			});
		}

		trackMetric(consentsPageMetric(page, 'Post', 'Failure'));

		const html = renderer(
			'/consents/:page',
			{
				pageTitle,
				requestState: state,
			},
			{ page },
		);
		res
			.type('html')
			.status(status ?? 500)
			.send(html);
	}),
);

export default router.router;
