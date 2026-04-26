#!/usr/bin/env node
'use strict';

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const APP_DIR = path.resolve(__dirname, '..');
const ENV_LOCAL_PATH = path.join(APP_DIR, '.env.local');

function parseEnvOutput(text) {
  const result = {};

  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;

    const idx = line.indexOf('=');
    if (idx <= 0) continue;

    const key = line.slice(0, idx).trim();
    const value = line.slice(idx + 1).trim();
    result[key] = value;
  }

  return result;
}

function main() {
  let output;

  try {
    output = execSync('npx supabase status -o env --workdir ..', {
      cwd: APP_DIR,
      stdio: ['ignore', 'pipe', 'pipe'],
      encoding: 'utf8',
    });
  } catch (error) {
    const stderr = String(error.stderr || '').trim();
    console.error('[local-env] Could not read local Supabase status.');
    if (stderr) console.error(stderr);
    console.error('[local-env] Start local Supabase first: npm run supabase:local:start');
    process.exit(1);
  }

  const vars = parseEnvOutput(output);

  const required = ['API_URL', 'ANON_KEY', 'SERVICE_ROLE_KEY', 'DB_URL'];
  const missing = required.filter((k) => !vars[k]);
  if (missing.length > 0) {
    console.error(`[local-env] Missing values from supabase status: ${missing.join(', ')}`);
    process.exit(1);
  }

  const content = [
    '# Auto-generated from local Supabase status',
    '# Run: npm run supabase:local:env',
    `NEXT_PUBLIC_SUPABASE_URL=${vars.API_URL}`,
    `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=${vars.ANON_KEY}`,
    `NEXT_PUBLIC_SUPABASE_ANON_KEY=${vars.ANON_KEY}`,
    `SUPABASE_SERVICE_ROLE_KEY=${vars.SERVICE_ROLE_KEY}`,
    `DATABASE_URL=${vars.DB_URL}`,
    `MIGRATION_DATABASE_URL=${vars.DB_URL}`,
    'NEXT_PUBLIC_SITE_URL=http://localhost:3000',
    '',
  ].join('\n');

  fs.writeFileSync(ENV_LOCAL_PATH, content, 'utf8');
  console.log('[local-env] Wrote app/.env.local using local Supabase credentials.');
}

main();
