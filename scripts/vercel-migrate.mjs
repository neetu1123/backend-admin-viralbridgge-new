/**
 * Run prisma migrate deploy on Vercel using Neon's direct (non-pooler) connection.
 * P1002 advisory-lock timeouts occur when migrate uses the pooler hostname.
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
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Neon pooler host: ep-xxx-pooler.region.aws.neon.tech → ep-xxx.region.aws.neon.tech */
function toDirectUrl(url) {
  if (!url) return url;
  return url.replace(/-pooler(?=\.[a-z0-9-]+\.)/i, '');
}

function resolveDirectUrl() {
  const explicit = process.env.DIRECT_DATABASE_URL?.trim();
  if (explicit) return explicit;
  return toDirectUrl(process.env.DATABASE_URL?.trim());
}

async function main() {
  if (process.env.SKIP_MIGRATE_ON_BUILD === '1' || process.env.SKIP_MIGRATE_ON_BUILD === 'true') {
    console.log('[vercel-migrate] SKIP_MIGRATE_ON_BUILD — skipping migrations');
    return;
  }

  const directUrl = resolveDirectUrl();
  if (!directUrl) {
    console.warn('[vercel-migrate] No DATABASE_URL — skipping migrations');
    return;
  }

  const pooler = process.env.DATABASE_URL || '';
  if (pooler.includes('-pooler') && !process.env.DIRECT_DATABASE_URL) {
    console.log('[vercel-migrate] Derived direct Neon URL from pooler DATABASE_URL');
  }

  const env = { ...process.env, DATABASE_URL: directUrl };
  const maxAttempts = 3;
  const retryDelayMs = 8000;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      console.log(`[vercel-migrate] prisma migrate deploy (attempt ${attempt}/${maxAttempts})`);
      execSync('npx prisma migrate deploy', {
        stdio: 'inherit',
        env,
        timeout: 120_000,
      });
      console.log('[vercel-migrate] Migrations OK');
      return;
    } catch (error) {
      if (attempt < maxAttempts) {
        console.warn(`[vercel-migrate] migrate deploy failed — retrying in ${retryDelayMs}ms`);
        await sleep(retryDelayMs);
        continue;
      }
      throw error;
    }
  }
}

main().catch((error) => {
  console.error('[vercel-migrate] Failed:', error?.message || error);
  console.error(
    '[vercel-migrate] Tip: set DIRECT_DATABASE_URL on Vercel (non-pooler Neon host) or SKIP_MIGRATE_ON_BUILD=1 and run migrations locally.',
  );
  process.exit(1);
});
