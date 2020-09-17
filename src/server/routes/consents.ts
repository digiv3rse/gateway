import { Router, Request, Response } from 'express';
import { Routes } from '@/shared/model/Routes';
import { verifyEmail } from '@/server/lib/idapi/verifyEmail';
import { setIDAPICookies } from '@/server/lib/setIDAPICookies';
import { logger } from '@/server/lib/logger';
import { renderer } from '@/server/lib/renderer';
import { update as patchConsents } from '@/server/lib/idapi/consents';
import { read as getNewsletters } from '@/server/lib/idapi/newsletters';
import { read as getUser } from '@/server/lib/idapi/user';
import { GlobalState, PageData } from '@/shared/model/GlobalState';
import { Newsletters } from '@/shared/model/Newsletter';
import { Consents } from '@/shared/model/Consent';

const router = Router();

interface ConsentPage {
  page: string;
  read: (ip: string, sc_gu_u: string) => Promise<PageData>;
  update: (
    ip: string,
    sc_gu_u: string,
    body: { [key: string]: string | boolean },
  ) => Promise<void>;
}

const consentPages: ConsentPage[] = [
  {
    page: Routes.CONSENTS_DATA.slice(1),
    read: async (ip, sc_gu_u) => {
      try {
        const ConsentsDataPage: string[] = [Consents.PROFILING];

        const consents = (await getUser(ip, sc_gu_u)).consents.filter((c) =>
          ConsentsDataPage.includes(c.id),
        );

        return {
          consents,
          page: Routes.CONSENTS_DATA.slice(1),
        };
      } catch (error) {
        throw error;
      }
    },
    update: async (ip, sc_gu_u, body) => {
      const consents = [
        {
          id: Consents.PROFILING,
          consented: body[Consents.PROFILING] === 'true',
        },
      ];

      await patchConsents(ip, sc_gu_u, consents);
    },
  },
  {
    page: Routes.CONSENTS_COMMUNICATION.slice(1),
    read: async (ip, sc_gu_u) => {
      try {
        const ConsentsCommunicationsPage: string[] = [
          Consents.MARKET_RESEARCH,
          Consents.SUPPORTER,
          Consents.JOBS,
          Consents.HOLIDAYS,
          Consents.EVENTS,
          Consents.OFFERS,
        ];

        const consents = (await getUser(ip, sc_gu_u)).consents.filter((c) =>
          ConsentsCommunicationsPage.includes(c.id),
        );

        return {
          consents,
          page: Routes.CONSENTS_COMMUNICATION.slice(1),
        };
      } catch (error) {
        throw error;
      }
    },
    update: async (ip, sc_gu_u, body) => {
      const consents = [
        {
          id: Consents.MARKET_RESEARCH,
          consented: body[Consents.MARKET_RESEARCH] === 'true',
        },
        {
          id: Consents.SUPPORTER,
          consented: !!body[Consents.SUPPORTER],
        },
        {
          id: Consents.JOBS,
          consented: !!body[Consents.JOBS],
        },
        {
          id: Consents.HOLIDAYS,
          consented: !!body[Consents.HOLIDAYS],
        },
        {
          id: Consents.EVENTS,
          consented: !!body[Consents.EVENTS],
        },
        {
          id: Consents.OFFERS,
          consented: !!body[Consents.OFFERS],
        },
      ];

      await patchConsents(ip, sc_gu_u, consents);
    },
  },
];

router.get(
  `${Routes.VERIFY_EMAIL}${Routes.VERIFY_EMAIL_TOKEN}`,
  async (req: Request, res: Response) => {
    const { token } = req.params;

    try {
      const cookies = await verifyEmail(token, req.ip);
      setIDAPICookies(res, cookies);
    } catch (e) {
      logger.error(e);
    }

    res.redirect(303, `${Routes.CONSENTS}/${consentPages[0].page}`);
  },
);

router.get(Routes.CONSENTS, (_: Request, res: Response) => {
  res.redirect(303, `${Routes.CONSENTS}/${consentPages[0].page}`);
});

router.get(`${Routes.CONSENTS}/:page`, async (req: Request, res: Response) => {
  const sc_gu_u = req.cookies.SC_GU_U;
  const state: GlobalState = {};

  const { page } = req.params;

  const pageIndex = consentPages.findIndex((elem) => elem.page === page);
  if (pageIndex === -1) {
    return res.redirect(404, `${Routes.CONSENTS}/${page}`);
  }

  try {
    const { read } = consentPages[pageIndex];

    state.pageData = await read(req.ip, sc_gu_u);
  } catch (e) {
    state.error = e;
  }

  const html = renderer(`${Routes.CONSENTS}/${page}`, { globalState: state });

  res.type('html').send(html);
});

router.post(`${Routes.CONSENTS}/:page`, async (req, res) => {
  const sc_gu_u = req.cookies.SC_GU_U;
  const state: GlobalState = {};

  const { page } = req.params;

  const pageIndex = consentPages.findIndex((elem) => elem.page === page);
  if (pageIndex === -1) {
    return res.redirect(404, `${Routes.CONSENTS}/${page}`);
  }

  try {
    const { update } = consentPages[pageIndex];

    await update(req.ip, sc_gu_u, req.body);

    return res.redirect(
      303,
      `${Routes.CONSENTS}/${consentPages[pageIndex + 1].page}`,
    );
  } catch (e) {
    console.log(e);
    state.error = e;
  }

  const html = renderer(`${Routes.CONSENTS}/${page}`, { globalState: state });
  res.type('html').send(html);
});

router.get(Routes.CONSENTS_NEWSLETTERS, async (req: Request, res: Response) => {
  const NEWSLETTER_FILTER = [
    Newsletters.BOOKMARKS,
    Newsletters.GREENLIGHT,
    Newsletters.LABNOTES,
    Newsletters.THELONGREAD,
  ];

  const state: GlobalState = {};
  try {
    const newsletters = await getNewsletters();
    state.pageData = {
      newsletters: newsletters.filter((n) => NEWSLETTER_FILTER.includes(+n.id)),
    };
  } catch (e) {
    const { message } = e;
    logger.error(e);
    state.error = message;
  }
  const html = renderer(Routes.CONSENTS_NEWSLETTERS, {
    globalState: state,
  });
  res.type('html').send(html);
});

export default router;
