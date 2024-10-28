import express, { type Express, type Router } from 'express';
import expressWinston from 'express-winston';
import { createServer, type Server } from 'http';
import type { Pool } from 'pg';
import winston from 'winston';
import { healthRouter } from './server/health.js';
import { taskRouter } from './server/tasks.js';

export function attachLogger(app: Express | Router) {
  app.use(
    expressWinston.logger({
      transports: [
        new winston.transports.Console({
          level: process.env.LOG_LEVEL || 'info',
        }),
      ],
      statusLevels: false, // default value
      level: function (req, res) {
        let level = '';
        if (res.statusCode >= 100) {
          level = 'info';
        }
        if (res.statusCode >= 400) {
          level = 'warn';
        }
        if (res.statusCode >= 500) {
          level = 'error';
        }
        // Ops is worried about hacking attempts so make Unauthorized and Forbidden critical
        if (res.statusCode === 401 || res.statusCode === 403) {
          level = 'critical';
        }
        // /health logging not required except when debugging application.
        // Check `docker inspect--format "{{json .State.Health }}" <container name> | jq` to  see health status instead
        if (req.path.endsWith('/health') && res.statusCode === 200) {
          level = 'debug';
        }
        return level;
      },

      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.json(),
      ),
      colorize: true,
    }),
  );
}
export function serverFactory(client: Pool): Server {
  const app = express();
  attachLogger(app);

  const v1Router = express.Router();

  const health = healthRouter();

  const tasks = taskRouter(client);

  v1Router.use('/health', health);
  v1Router.use('/tasks', tasks);

  app.use('/api/v1', v1Router);
  app.use(v1Router);

  // eslint-disable-next-line @typescript-eslint/no-misused-promises -- not sure what typescript is missing here
  return createServer(app);
}
