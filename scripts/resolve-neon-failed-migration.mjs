/**
 * One-time fix for P3009 on Neon after a failed Vercel deploy.
 * Prisma Option 2: schema already matches → mark migration as applied.
 *
 * 1. Set DATABASE_URL in .env to your Neon connection string (not localhost)
 * 2. npm run neon:fix-migration
 * 3. Redeploy on Vercel
 */
import { execSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const FAILED_MIGRATION = '20260603200000_add_deliverables_and_message_fields';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const envPath = resolve(root, '.env');

function loadDatabaseUrl() {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;
  if (!existsSync(envPath)) return null;
  const env = readFileSync(envPath, 'utf8');
  const match = env.match(/^DATABASE_URL\s*=\s*["']?([^"'\r\n]+)/m);
  return match?.[1] ?? null;
}

const databaseUrl = loadDatabaseUrl();

if (!databaseUrl) {
  console.error('DATABASE_URL is missing. Add your Neon URL to backend-admin-viralbridgge/.env');
  process.exit(1);
}

if (/localhost|127\.0\.0\.1/i.test(databaseUrl)) {
  console.error(
    'DATABASE_URL still points to localhost. Paste your Neon connection string into .env first.\n' +
      'Neon Console → Connection string → use the host WITHOUT "-pooler" for migrations.',
  );
  process.exit(1);
}

const env = { ...process.env, DATABASE_URL: databaseUrl };
const run = (cmd) => execSync(cmd, { cwd: root, env, stdio: 'inherit' });

console.log('→ Marking failed migration as applied (Prisma migrate resolve)...');
run(`npx prisma migrate resolve --applied "${FAILED_MIGRATION}"`);

console.log('→ Verifying migration history...');
run('npx prisma migrate deploy');

console.log('Done. Commit any migration file changes, push, and redeploy on Vercel.');
