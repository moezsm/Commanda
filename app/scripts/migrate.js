#!/usr/bin/env node
/**
 * Auto-migration runner — executed by Vercel before `next build`.
 *
 * Connects to Supabase Postgres using DATABASE_URL, creates a
 * _migrations tracking table, then runs every *.sql file under
 * ../supabase/migrations in filename order — skipping any file that
 * was already applied.
 *
 * Required env var:
 *   DATABASE_URL  — Supabase direct (non-pooler) connection string
 *                   postgresql://postgres:[password]@db.[ref].supabase.co:5432/postgres
 */

'use strict';

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const MIGRATIONS_DIR = path.resolve(__dirname, '..', '..', 'supabase', 'migrations');

async function main() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    console.error('[migrate] ERROR: DATABASE_URL env var is not set.');
    process.exit(1);
  }

  const client = new Client({ connectionString: databaseUrl, ssl: { rejectUnauthorized: false } });
  await client.connect();
  console.log('[migrate] Connected to Postgres.');

  // Create tracking table if it doesn't exist
  await client.query(`
    CREATE TABLE IF NOT EXISTS _migrations (
      name        TEXT PRIMARY KEY,
      applied_at  TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);

  // Collect SQL files, sorted by name
  const files = fs
    .readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith('.sql'))
    .sort();

  if (files.length === 0) {
    console.log('[migrate] No migration files found.');
    await client.end();
    return;
  }

  for (const file of files) {
    // Check if already applied
    const { rows } = await client.query('SELECT 1 FROM _migrations WHERE name = $1', [file]);

    if (rows.length > 0) {
      console.log(`[migrate] SKIP  ${file} (already applied)`);
      continue;
    }

    const sqlPath = path.join(MIGRATIONS_DIR, file);
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log(`[migrate] RUN   ${file} …`);

    try {
      await client.query('BEGIN');
      await client.query(sql);
      await client.query('INSERT INTO _migrations (name) VALUES ($1)', [file]);
      await client.query('COMMIT');
      console.log(`[migrate] DONE  ${file}`);
    } catch (err) {
      await client.query('ROLLBACK');
      console.error(`[migrate] FAIL  ${file}`);
      console.error(err.message);
      await client.end();
      process.exit(1);
    }
  }

  console.log('[migrate] All migrations applied.');
  await client.end();
}

main().catch((err) => {
  console.error('[migrate] Unexpected error:', err.message);
  process.exit(1);
});
