import { default as express, Router, Response } from 'express';
import path from 'path';

const router = Router();

router.use('/server-error', (_, res: Response) => {
  return res.sendStatus(500);
});

router.use(
  '/gateway-static',
  express.static(path.resolve(__dirname, 'static')),
);

router.get('/healthcheck', (_, res: Response) => {
  res.status(200).send('200 OK');
});

export default router;
