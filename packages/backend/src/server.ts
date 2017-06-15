import express from 'express';
import { createServer, type Server } from 'http';
import type { Pool } from 'pg';
import { healthRouter } from './server/health.js';
import { taskRouter } from './server/tasks.js';

export function serverFactory(client: Pool): Server {
  const app = express();

  const v1Router = express.Router();

  const health = healthRouter();

  const tasks = taskRouter(client);

  v1Router.use('/health', health);
  v1Router.use('/tasks', tasks);

  app.use('/v1', v1Router);
  app.use(v1Router);

  // eslint-disable-next-line @typescript-eslint/no-misused-promises -- not sure what typescript is missing here
  return createServer(app);
}
