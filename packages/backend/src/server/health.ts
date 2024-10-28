import { Router } from 'express';

export function healthRouter(router = Router()) {
  router.get('/', (req, res) => {
    res.status(200).send();
  });
  return router;
}
