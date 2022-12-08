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
import { ALL_NEWSLETTER_IDS, NewsLetter } from '@/shared/model/Newsletter';
import {
  CONSENTS_COMMUNICATION_PAGE,
  CONSENTS_DATA_PAGE,
  CONSENTS_NEWSLETTERS_PAGE,
} from '@/shared/model/Consent';
import { loginMiddleware } from '@/server/lib/middleware/login';
import {
  RequestState,
  ResponseWithRequestState,
} from '@/server/models/Express';
import { VERIFY_EMAIL } from '@/shared/model/Success';
import { trackMetric } from '@/server/lib/trackMetric';
import { consentsPageMetric } from '@/server/models/Metrics';
import { addQueryParamsToPath } from '@/shared/lib/queryParams';
import { GeoLocation } from '@/shared/model/Geolocation';
import {
  NewsletterMap,
  newslettersSubscriptionsFromFormBody,
} from '@/shared/lib/newsletter';
import { CONSENTS_PAGES } from '@/client/models/ConsentsPages';
import { fourZeroFourRender } from '@/server/lib/middleware/404';
import { handleAsyncErrors } from '@/server/lib/expressWrappers';
import { logger } from '@/server/lib/serverSideLogger';
import { ApiError } from '@/server/models/Error';
import { ConsentPath, RoutePaths } from '@/shared/model/Routes';
import { PageTitle } from '@/shared/model/PageTitle';
import { mergeRequestState } from '@/server/lib/requestState';
import { RegistrationLocation } from '@/server/models/okta/User';
import { isStringBoolean } from '@/server/lib/isStringBoolean';
import { getRegistrationLocation } from '@/server/lib/getRegistrationLocation';
import {
  read as readIdapiUser,
  addRegistrationLocation,
} from '@/server/lib/idapi/user';

interface ConsentPage {
  page: ConsentPath;
  path: RoutePaths;
  read: (
    ip: string,
    sc_gu_u: string,
    geo?: GeoLocation,
    request_id?: string,
  ) => Promise<PageData>;
  pageTitle: PageTitle;
  update?: (
    ip: string,
    sc_gu_u: string,
    body: { [key: string]: string },
    request_id?: string,
  ) => Promise<void>;
}

/**
 * Until Gateway/Onboarding journey is migrated to Okta sessions, we don't have access to Okta User ID, only sg_gu_u cookie,
 * so we need to add reg location via idapi (which updates Okta immediately). When Okta sessions are available, this should be refactored
 * to use okta directly (Which is the source of truth for the user's registration location field)
 */
// TODO write a test
const updateRegistrationLocationViaIDAPI = async (
  ip: string,
  sc_gu_u: string,
  req: Request,
) => {
  const { _cmpConsentedState = false } = req.body;

  const registrationLocation: RegistrationLocation | undefined =
    getRegistrationLocation(req, isStringBoolean(_cmpConsentedState));

  if (!!registrationLocation) {
    try {
      const user = await readIdapiUser(ip, sc_gu_u);
      // don't update users who already have a location set
      if (user.privateFields.registrationLocation) {
        return;
      }
      await addRegistrationLocation(registrationLocation, ip, sc_gu_u);
    } catch (error) {
      logger.error(
        `${req.method} ${req.originalUrl} Error updating registrationLocation via IDAPI`,
        error,
        {
          request_id: req.get('x-request-id'),
        },
      );
    }
  }
};

const getUserNewsletterSubscriptions = async (
  newslettersOnPage: string[],
  ip: string,
  sc_gu_u: string,
  request_id?: string,
): Promise<NewsLetter[]> => {
  const allNewsletters = await getNewsletters(request_id);
  const userNewsletterSubscriptions = await readUserNewsletters(
    ip,
    sc_gu_u,
    request_id,
  );

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
    page: 'communication',
    path: '/consents/communication',
    pageTitle: CONSENTS_PAGES.CONTACT,
    read: async (ip, sc_gu_u, _, request_id) => ({
      consents: await getUserConsentsForPage(
        CONSENTS_COMMUNICATION_PAGE,
        ip,
        sc_gu_u,
        request_id,
      ),
      page: 'communication',
    }),
    update: async (ip, sc_gu_u, body, request_id) => {
      const consents = CONSENTS_COMMUNICATION_PAGE.map((id) => ({
        id,
        consented: getConsentValueFromRequestBody(id, body),
      }));

      await patchConsents(ip, sc_gu_u, consents, request_id);
    },
  },
  {
    page: 'newsletters',
    path: '/consents/newsletters',
    pageTitle: CONSENTS_PAGES.NEWSLETTERS,
    read: async (ip, sc_gu_u, geo, request_id) => ({
      page: 'newsletters',
      consents: await getUserConsentsForPage(
        CONSENTS_NEWSLETTERS_PAGE,
        ip,
        sc_gu_u,
        request_id,
      ),
      newsletters: await getUserNewsletterSubscriptions(
        NewsletterMap.get(geo) as string[],
        ip,
        sc_gu_u,
        request_id,
      ),
      previousPage: 'communication',
    }),
    update: async (ip, sc_gu_u, body, request_id) => {
      const userNewsletterSubscriptions = await getUserNewsletterSubscriptions(
        ALL_NEWSLETTER_IDS,
        ip,
        sc_gu_u,
        request_id,
      );

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

      await patchNewsletters(
        ip,
        sc_gu_u,
        newsletterSubscriptionsToUpdate,
        request_id,
      );

      const consents = CONSENTS_NEWSLETTERS_PAGE.map((id) => ({
        id,
        consented: getConsentValueFromRequestBody(id, body),
      }));

      await patchConsents(ip, sc_gu_u, consents, request_id);
    },
  },
  {
    page: 'data',
    path: '/consents/data',
    pageTitle: CONSENTS_PAGES.YOUR_DATA,
    read: async (ip, sc_gu_u, _, request_id) => ({
      consents: await getUserConsentsForPage(
        CONSENTS_DATA_PAGE,
        ip,
        sc_gu_u,
        request_id,
      ),
      page: 'data',
      previousPage: 'newsletters',
    }),
    update: async (ip, sc_gu_u, body, request_id) => {
      const consents = CONSENTS_DATA_PAGE.map((id) => ({
        id,
        consented: getConsentValueFromRequestBody(id, body),
      }));

      await patchConsents(ip, sc_gu_u, consents, request_id);
    },
  },
  {
    page: 'review',
    path: '/consents/review',
    pageTitle: CONSENTS_PAGES.REVIEW,
    read: async (ip, sc_gu_u, geo, request_id) => {
      const ALL_CONSENT = [
        ...CONSENTS_DATA_PAGE,
        ...CONSENTS_NEWSLETTERS_PAGE,
        ...CONSENTS_COMMUNICATION_PAGE,
      ];

      return {
        page: 'review',
        consents: await getUserConsentsForPage(
          ALL_CONSENT,
          ip,
          sc_gu_u,
          request_id,
        ),
        newsletters: await getUserNewsletterSubscriptions(
          NewsletterMap.get(geo) as string[],
          ip,
          sc_gu_u,
          request_id,
        ),
      };
    },
  },
];

router.get('/consents', loginMiddleware, (_: Request, res: Response) => {
  const url = addQueryParamsToPath(
    `${consentPages[0].path}`,
    res.locals.queryParams,
  );

  res.redirect(303, url);
});

router.get(
  '/consents/:page',
  loginMiddleware,
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

      state = mergeRequestState(state, {
        pageData: {
          ...(await read(
            req.ip,
            sc_gu_u,
            state.pageData.geolocation,
            res.locals.requestId,
          )),
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

router.post(
  '/consents/:page',
  loginMiddleware,
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
      pageTitle == 'Stay in touch' &&
        updateRegistrationLocationViaIDAPI(req.ip, sc_gu_u, req);

      if (update) {
        await update(req.ip, sc_gu_u, req.body, res.locals.requestId);
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
