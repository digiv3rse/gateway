import { Request } from 'express';
import { rateLimitedTypedRouter as router } from '@/server/lib/typedRoutes';
import { renderer } from '@/server/lib/renderer';
import { ResponseWithRequestState } from '@/server/models/Express';
import { read } from '../lib/idapi/user';
import { logger } from '../lib/serverSideLogger';
import { getConfiguration } from '../lib/getConfiguration';
import { trackMetric } from '../lib/trackMetric';
import deepmerge from 'deepmerge';
import { addQueryParamsToUntypedPath } from '@/shared/lib/queryParams';
import { setupJobsUserInIDAPI, setupJobsUserInOkta } from '../lib/jobs';
import { getSession } from '../lib/okta/api/sessions';
import { getUser } from '../lib/okta/api/users';

const { defaultReturnUri, signInPageUrl, okta } = getConfiguration();

const IDAPIAgreeGetController = async (
  req: Request,
  res: ResponseWithRequestState,
) => {
  const SC_GU_U = req.cookies.SC_GU_U;
  const state = res.locals;
  const { returnUrl } = state.queryParams;

  // Redirect to /signin if no session cookie.
  if (!SC_GU_U) {
    return res.redirect(
      303,
      addQueryParamsToUntypedPath(signInPageUrl, res.locals.queryParams),
    );
  }

  try {
    const {
      primaryEmailAddress,
      privateFields: { firstName, secondName },
      userGroups,
    } = await read(req.ip, SC_GU_U);

    const userBelongsToGRS = userGroups.find(
      (group) => group.packageCode === 'GRS',
    );

    const userFullNameSet = !!firstName && !!secondName;

    // The user is redirected immediately if they are already
    // part of the group and have their name set.
    if (userBelongsToGRS && userFullNameSet) {
      const redirectUrl = returnUrl || defaultReturnUri;
      return res.redirect(
        303,
        addQueryParamsToUntypedPath(redirectUrl, {
          ...res.locals.queryParams,
          returnUrl: '', // unset returnUrl so redirect won't point to itself.
        }),
      );
    }

    const html = renderer('/agree/GRS', {
      requestState: deepmerge(res.locals, {
        pageData: {
          firstName,
          secondName,
          userBelongsToGRS,
          email: primaryEmailAddress,
        },
      }),
      pageTitle: 'Jobs',
    });

    return res.type('html').send(html);
  } catch (error) {
    logger.error(`${req.method} ${req.originalUrl} Error`, error);
    // Redirect to /signin if an error occurs when fetching the users' data.
    return res.redirect(
      303,
      addQueryParamsToUntypedPath(signInPageUrl, res.locals.queryParams),
    );
  }
};

const OktaAgreeGetController = async (
  req: Request,
  res: ResponseWithRequestState,
) => {
  const oktaSessionCookieId: string | undefined = req.cookies.sid;

  const state = res.locals;
  const { returnUrl } = state.queryParams;

  // Redirect to /signin if no session cookie.
  if (!oktaSessionCookieId) {
    return res.redirect(
      303,
      addQueryParamsToUntypedPath(signInPageUrl, res.locals.queryParams),
    );
  }

  try {
    const { userId } = await getSession(oktaSessionCookieId);
    const { profile } = await getUser(userId);
    const { isJobsUser, firstName, lastName, email } = profile;

    const userFullNameSet = !!firstName && !!lastName;

    // The user is redirected immediately if they are already
    // a jobs user and have they have their full name set.
    if (isJobsUser && userFullNameSet) {
      const redirectUrl = returnUrl || defaultReturnUri;
      return res.redirect(
        303,
        addQueryParamsToUntypedPath(redirectUrl, {
          ...res.locals.queryParams,
          returnUrl: '', // unset returnUrl so redirect won't point to itself.
        }),
      );
    }

    const html = renderer('/agree/GRS', {
      requestState: deepmerge(res.locals, {
        pageData: {
          firstName,
          secondName: lastName,
          userBelongsToGRS: isJobsUser,
          email,
        },
      }),
      pageTitle: 'Jobs',
    });

    return res.type('html').send(html);
  } catch (error) {
    logger.error(`${req.method} ${req.originalUrl} Error`, error);
    // Redirect to /signin if an error occurs when fetching the users' data.
    return res.redirect(
      303,
      addQueryParamsToUntypedPath(signInPageUrl, res.locals.queryParams),
    );
  }
};

router.get('/agree/GRS', (req: Request, res: ResponseWithRequestState) => {
  const { useOkta } = res.locals.queryParams;
  const oktaSessionCookieId: string | undefined = req.cookies.sid;

  if (okta.enabled && useOkta && oktaSessionCookieId) {
    return OktaAgreeGetController(req, res);
  } else {
    return IDAPIAgreeGetController(req, res);
  }
});

router.post(
  '/agree/GRS',
  async (req: Request, res: ResponseWithRequestState) => {
    const { useOkta } = res.locals.queryParams;
    const oktaSessionCookieId: string | undefined = req.cookies.sid;

    const { queryParams } = res.locals;
    const { returnUrl } = queryParams;
    const { firstName, secondName } = req.body;

    try {
      if (okta.enabled && useOkta && oktaSessionCookieId) {
        // Get the id from Okta
        const { userId } = await getSession(oktaSessionCookieId);
        await setupJobsUserInOkta(firstName, secondName, userId);
        trackMetric('JobsGRSGroupAgree::Success');
      } else {
        await setupJobsUserInIDAPI(
          firstName,
          secondName,
          req.ip,
          req.cookies.SC_GU_U,
        );
        trackMetric('JobsGRSGroupAgree::Success');
      }
    } catch (error) {
      logger.error(`${req.method} ${req.originalUrl} Error`, error);
      trackMetric('JobsGRSGroupAgree::Failure');
    } finally {
      return res.redirect(303, returnUrl);
    }
  },
);

export default router.router;
