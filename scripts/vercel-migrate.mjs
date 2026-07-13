/**
 * Optional: run `prisma migrate deploy` before a build.
 *
 * NOT run during normal Vercel deploys — Neon + Vercel builds often hit P1002
 * (advisory lock timeout) when multiple builds or connections compete for the lock.
 *
 * Run migrations locally or in CI instead:
 *   npm run prisma:migrate
 *
 * To force migrate during a Vercel build (not recommended):
 *   set RUN_MIGRATE_ON_VERCEL=1 on Vercel
 */
import { execSync } from 'child_process';
import { existsSync, readFileSync } from 'fs';
import { resolve } from 'path';

function loadDotEnv() {
  const envPath = resolve(process.cwd(), '.env');
  if (!existsSync(envPath)) return;
  for (const line of readFileSync(envPath, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = val;
  }
}

loadDotEnv();

function sleep(ms) {
  return new Promise((resolveSleep) => setTimeout(resolveSleep, ms));
}

/** Neon pooler host → direct host (no -pooler) */
function toDirectUrl(url) {
  if (!url) return url;
  return url.replace(/-pooler(?=\.[a-z0-9-]+\.)/i, '');
}

function resolveDirectUrl() {
  const explicit = process.env.DIRECT_DATABASE_URL?.trim();
  if (explicit) return explicit;
  return toDirectUrl(process.env.DATABASE_URL?.trim());
}

function shouldSkip() {
  if (process.env.SKIP_MIGRATE_ON_BUILD === '1' || process.env.SKIP_MIGRATE_ON_BUILD === 'true') {
    return 'SKIP_MIGRATE_ON_BUILD';
  }
  if (process.env.VERCEL === '1' && process.env.RUN_MIGRATE_ON_VERCEL !== '1') {
    return 'VERCEL (set RUN_MIGRATE_ON_VERCEL=1 to override — not recommended on Neon)';
  }
  return null;
}

function runMigrateDeploy(env) {
  const result = execSync('npx prisma migrate deploy', {
    encoding: 'utf8',
    env,
    timeout: 120_000,
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  if (result) process.stdout.write(result);
}

function isAdvisoryLockError(error) {
  const msg = [
    error?.stderr,
    error?.stdout,
    error?.message,
    String(error),
  ]
    .filter(Boolean)
    .join('\n');
  return (
    msg.includes('P1002') ||
    msg.includes('advisory lock') ||
    msg.includes('pg_advisory_lock')
  );
}

async function main() {
  const skipReason = shouldSkip();
  if (skipReason) {
    console.log(`[vercel-migrate] Skipping migrations (${skipReason})`);
    console.log('[vercel-migrate] Apply pending migrations locally: npm run prisma:migrate');
    return;
  }

  const directUrl = resolveDirectUrl();
  if (!directUrl) {
    console.warn('[vercel-migrate] No DATABASE_URL — skipping migrations');
    return;
  }

  const env = { ...process.env, DATABASE_URL: directUrl };
  const maxAttempts = 3;
  const retryDelayMs = 8000;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      console.log(`[vercel-migrate] prisma migrate deploy (attempt ${attempt}/${maxAttempts})`);
      runMigrateDeploy(env);
      console.log('[vercel-migrate] Migrations OK');
      return;
    } catch (error) {
      const stderr = String(error?.stderr || '');
      const stdout = String(error?.stdout || '');
      if (stderr) process.stderr.write(stderr);
      if (stdout) process.stdout.write(stdout);

      if (isAdvisoryLockError(error)) {
        console.warn(
          '[vercel-migrate] P1002 advisory lock timeout — another process holds the migration lock.',
        );
        console.warn(
          '[vercel-migrate] Run migrations separately: npm run prisma:migrate (do not run during Vercel build).',
        );
        return;
      }

      if (attempt < maxAttempts) {
        console.warn(`[vercel-migrate] Failed — retrying in ${retryDelayMs}ms`);
        await sleep(retryDelayMs);
        continue;
      }
      throw error;
    }
  }
}

main().catch((error) => {
  console.error('[vercel-migrate] Failed:', error?.message || error);
  process.exit(1);
});
