import { Request } from 'express';

import { rateLimitedTypedRouter as router } from '@/server/lib/typedRoutes';
import { renderer } from '@/server/lib/renderer';
import { ResponseWithRequestState } from '@/server/models/Express';

router.get('/agree/GRS', (req: Request, res: ResponseWithRequestState) => {
  const html = renderer('/agree/GRS', {
    requestState: res.locals,
    pageTitle: 'Jobs',
  });
  res.type('html').send(html);
});

export default router.router;
