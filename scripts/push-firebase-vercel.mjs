/**
 * Push FIREBASE_SERVICE_ACCOUNT from .env to Vercel (Production + Preview).
 * Run: npm run firebase:push-vercel
 *
 * Requires: vercel CLI logged in, FIREBASE_SERVICE_ACCOUNT in .env
 */
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, '..', '.env');

function parseServiceAccountFromEnv() {
  const content = fs.readFileSync(envPath, 'utf8');
  const match = content.match(/^FIREBASE_SERVICE_ACCOUNT=(.+)$/m);
  if (!match) throw new Error('FIREBASE_SERVICE_ACCOUNT not found in .env');

  let value = match[1].trim();
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    value = value.slice(1, -1);
  }

  JSON.parse(value);
  return value;
}

function pushEnv(name, value, environment) {
  try {
    execSync(`npx vercel env rm ${name} ${environment} --yes`, { stdio: 'ignore' });
  } catch {
    // variable may not exist yet
  }

  const addCmd =
    environment === 'preview'
      ? `npx vercel env add ${name} preview --value "${value.replace(/"/g, '\\"')}" --yes`
      : `npx vercel env add ${name} ${environment}`;

  if (environment === 'production') {
    execSync(addCmd, { input: value, stdio: ['pipe', 'inherit', 'inherit'] });
  } else {
    execSync(addCmd, { stdio: 'inherit' });
  }
}

const serviceAccount = parseServiceAccountFromEnv();

console.log('Pushing FIREBASE_SERVICE_ACCOUNT to Vercel (Production + Preview)...');
for (const env of ['production', 'preview']) {
  pushEnv('FIREBASE_SERVICE_ACCOUNT', serviceAccount, env);
  console.log(`  added to ${env}`);
}

console.log('\nDone. Redeploy the backend on Vercel for changes to take effect.');
console.log('If FIREBASE_WEB_API_KEY is set locally, add it manually in Vercel dashboard.');
