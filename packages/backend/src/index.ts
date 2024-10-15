/* eslint-disable @typescript-eslint/require-await */
import pg from 'pg';
import { pgconfig } from './config.js';
import { serverFactory } from './server.js';

export { serverFactory };

if (process.argv[2] === 'serve') {
  await import('dotenv').then((d) => d.config());
  await serve();
}

async function serve() {
  const PORT = process.env.PORT || process.env.port || 3000;
  const pool = new pg.Pool(pgconfig(process.env));

  const server = serverFactory(pool);
  server.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`Server running: http://localhost:${PORT}/`);
    pool
      .query('SELECT NOW()')
      .then((res) => {
        // eslint-disable-next-line no-console
        console.log('Connected to database at', res.rows[0].now);
      })
      .catch((err) => {
        // eslint-disable-next-line no-console
        console.error(err);
      });
  });
  server.on('close', () => {
    pool.end().catch((err) => {
      // eslint-disable-next-line no-console
      console.error(err);
    });
  });
}
