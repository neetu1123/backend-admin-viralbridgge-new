/**
 * One-time fix for P3009 on Neon (run locally with Neon DATABASE_URL in .env).
 */
import { execSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

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
  console.error('Set DATABASE_URL in .env to your Neon PostgreSQL connection string.');
  process.exit(1);
}

if (/localhost|127\.0\.0\.1/i.test(databaseUrl)) {
  console.error(
    'Your .env still uses localhost. Replace DATABASE_URL with Neon’s postgresql:// URL\n' +
      '(Connection string tab — NOT the Data API https://...apirest... URL).',
  );
  process.exit(1);
}

if (/apirest|\/rest\/v1/i.test(databaseUrl)) {
  console.error('DATABASE_URL must be postgresql://... not the Neon Data API REST URL.');
  process.exit(1);
}

const env = { ...process.env, DATABASE_URL: databaseUrl };
const run = (cmd) => execSync(cmd, { cwd: root, env, stdio: 'inherit' });

console.log('→ Applying fix SQL to _prisma_migrations...');
run('npx prisma db execute --file prisma/fix-failed-migration.sql --schema prisma/schema.prisma');

console.log('→ Marking migration as applied (Prisma resolve)...');
run(
  'npx prisma migrate resolve --applied "20260603200000_add_deliverables_and_message_fields"',
);

console.log('→ Verifying deploy...');
run('npx prisma migrate deploy');

console.log('\nSuccess. Redeploy on Vercel (no cache optional).');
