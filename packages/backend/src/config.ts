import { readFile } from 'fs/promises';

const log = async <T>(p: Promise<T>) => {
  // eslint-disable-next-line @typescript-eslint/return-await
  return p.then((o) => {
    // eslint-disable-next-line no-console
    console.log(o, typeof o);
    return o;
  });
};
function pgPassword(env: Record<string, string | undefined> = process.env) {
  const password = env.PGPASSWORD;
  if (password) return password;
  const passwordFile = env.PGPASSWORDFILE;
  if (passwordFile)
    return () => log(readFile(passwordFile, { encoding: 'utf8' }));
  return undefined;
}

export const pgconfig = (env: Record<string, string | undefined>) => ({
  host: env.PGHOST || 'localhost',
  user: env.PGUSER || 'postgres',
  port: parseInt(env.PGPORT || '5432', 10),
  database: env.PGDATABASE || 'taskdb',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
  password: pgPassword(env),
});
