import { readFile } from 'fs/promises';
import type pg from 'pg';

function pgPassword(env: Record<string, string | undefined> = process.env) {
  const password = env.PGPASSWORD;
  if (password) return password;
  const passwordFile = env.PGPASSWORDFILE;
  if (passwordFile)
    return () =>
      readFile(passwordFile, { encoding: 'utf8' }).then((s) => s.trim());

  return undefined;
}

export const pgconfig = (
  env: Record<string, string | undefined>,
): pg.PoolConfig => ({
  host: env.PGHOST || 'localhost',
  user: env.PGUSER || 'postgres',
  port: parseInt(env.PGPORT || '5432', 10),
  database: env.PGDATABASE || 'taskdb',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
  password: pgPassword(env),
});
