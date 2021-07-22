import { Request, Router } from 'express';
import deepmerge from 'deepmerge';
import { create as resetPassword } from '@/server/lib/idapi/resetPassword';
import { logger } from '@/server/lib/logger';
import { renderer } from '@/server/lib/renderer';
import { Routes } from '@/shared/model/Routes';
import { getEmailFromPlaySessionCookie } from '@/server/lib/playSessionCookie';
import { ResponseWithRequestState } from '@/server/models/Express';
import { trackMetric } from '@/server/lib/trackMetric';
import { Metrics } from '@/server/models/Metrics';
import { removeNoCache } from '@/server/lib/middleware/cache';
import { PageTitle } from '@/shared/model/PageTitle';
import { handleAsyncErrors } from '@/server/lib/expressWrappers';

const router = Router();

router.get(Routes.RESET, (req: Request, res: ResponseWithRequestState) => {
  let state = res.locals;
  const emailFromPlaySession = getEmailFromPlaySessionCookie(req);

  if (emailFromPlaySession) {
    state = deepmerge(state, {
      pageData: {
        email: emailFromPlaySession,
      },
    });
  }

  const html = renderer(Routes.RESET, {
    requestState: state,
    pageTitle: PageTitle.RESET,
  });
  res.type('html').send(html);
});

router.post(
  Routes.RESET,
  handleAsyncErrors(async (req: Request, res: ResponseWithRequestState) => {
    let state = res.locals;

    const { email = '' } = req.body;

    const { returnUrl } = res.locals.queryParams;

    try {
      await resetPassword(email, req.ip, returnUrl);

      // We set this cookie so that the subsequent email sent page knows which email address was used
      res.cookie('GU_email', email, {
        expires: undefined,
      });
    } catch (error) {
      logger.error(`${req.method} ${req.originalUrl}  Error`, error);
      const { message, status } = error;

      trackMetric(Metrics.SEND_PASSWORD_RESET_FAILURE);

      state = deepmerge(state, {
        globalMessage: {
          error: message,
        },
      });

      const html = renderer(Routes.RESET, {
        requestState: state,
        pageTitle: PageTitle.RESET,
      });
      return res.status(status).type('html').send(html);
    }

    trackMetric(Metrics.SEND_PASSWORD_RESET_SUCCESS);

    return res.redirect(303, Routes.RESET_SENT);
  }),
);

router.get(
  Routes.RESET_SENT,
  removeNoCache,
  (req: Request, res: ResponseWithRequestState) => {
    let state = res.locals;

    // Read the users email from the GU_email cookie that was set when they posted the previous page
    // const emailCookie = req.signedCookies['GU_email'];
    // email = JSON.parse(Buffer.from(emailCookie, 'base64').toString('utf-8'));
    const email = req.cookies['GU_email'];

    state = deepmerge(state, {
      pageData: {
        email,
        previousPage: Routes.RESET,
      },
    });

    const html = renderer(Routes.RESET_SENT, {
      pageTitle: PageTitle.RESET_SENT,
      requestState: state,
    });
    res.type('html').send(html);
  },
);

export default router;
