#!/usr/bin/env node
/* eslint-disable no-console */
import { pgconfig } from '@/config.js';
import { readFile } from 'fs/promises';
import pg from 'pg';
export async function runSQLFile(filePath: string) {
  const config = pgconfig(process.env);
  const client = new pg.Client(config);

  try {
    await client.connect();
    const sql = await readFile(filePath, { encoding: 'utf8' });
    await client.query(sql);
    console.log(`Executed SQL file: ${filePath}`);
  } catch (err) {
    console.error(`Error executing SQL file ${filePath}:`, err);
  } finally {
    await client.end();
  }
}

await runSQLFile(process.argv[2]);
