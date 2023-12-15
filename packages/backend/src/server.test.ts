import type { Server } from 'http';
import request from 'supertest';
import { serverFactory } from './server.js';
if (process.env.liveUrl) {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //@ts-ignore this enables connection to a live server and verify the app
  request = request.bind(request, process.env.liveUrl);
}

let app: Server;

describe('Health', () => {
  beforeAll(() => {
    app = serverFactory({} as any);
  });

  // eslint-disable-next-line jest/expect-expect
  test('Responds 200', async () => {
    await request(app).get('/health').expect(200);
  });
  // eslint-disable-next-line jest/expect-expect
  test('Responds 200 on v1', async () => {
    await request(app).get('/api/v1/health').expect(200);
  });
});
