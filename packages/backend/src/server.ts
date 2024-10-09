import express from 'express';
import { createServer, type Server } from 'http';
import { examples } from 'interface';
import { replace } from './replacer.js';

// See simple example here

const addOneToNumbers = replace(
  (p) => p + 1,
  (t: number): t is number => typeof t === 'number',
);

let start = examples;
export function serverFactory(): Server {
  const app = express();

  app.get('/health', (req, res) => {
    start = addOneToNumbers(start);
    res
      .status(200)
      .send(`Hello World\r\n${JSON.stringify(start, null, 2)}\r\n`);
  });

  // eslint-disable-next-line @typescript-eslint/no-misused-promises -- not sure what typescript is missing here
  return createServer(app);
}
