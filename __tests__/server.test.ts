import { serverFactory } from '@/server.js';
import type { Server } from 'http';
import request from 'supertest';
if (process.env.liveUrl) {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //@ts-ignore this enables connection to a live server and verify the app
  request = request.bind(request, process.env.liveUrl);
}

let app: Server;

beforeAll(() => {
  app = serverFactory();
});

describe('Server responds', () => {
  // eslint-disable-next-line jest/expect-expect
  test('Responds 200', async () => {
    await request(app).get('/health').expect(200);
  });
});
