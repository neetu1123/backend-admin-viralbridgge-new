/**
 * Validate Firebase env vars (local .env or process env).
 * Run: npm run firebase:verify
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, '..', '.env');

function loadEnvFile() {
  if (!fs.existsSync(envPath)) return {};
  const vars = {};
  for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    vars[key] = value;
  }
  return vars;
}

function mask(value, visible = 4) {
  if (!value) return '(empty)';
  if (value.length <= visible * 2) return '*'.repeat(value.length);
  return `${value.slice(0, visible)}...${value.slice(-visible)}`;
}

const fileEnv = loadEnvFile();
const serviceAccountJson =
  process.env.FIREBASE_SERVICE_ACCOUNT?.trim() || fileEnv.FIREBASE_SERVICE_ACCOUNT?.trim() || '';
const webApiKey =
  process.env.FIREBASE_WEB_API_KEY?.trim() || fileEnv.FIREBASE_WEB_API_KEY?.trim() || '';

console.log('Firebase environment check\n');

let ok = true;

if (!serviceAccountJson) {
  console.log('FAIL  FIREBASE_SERVICE_ACCOUNT — not set');
  ok = false;
} else {
  try {
    const parsed = JSON.parse(serviceAccountJson);
    const required = ['type', 'project_id', 'private_key', 'client_email'];
    const missing = required.filter((k) => !parsed[k]);
    if (parsed.type !== 'service_account') {
      console.log('FAIL  FIREBASE_SERVICE_ACCOUNT — type must be "service_account"');
      ok = false;
    } else if (missing.length) {
      console.log(`FAIL  FIREBASE_SERVICE_ACCOUNT — missing fields: ${missing.join(', ')}`);
      ok = false;
    } else if (!parsed.private_key.includes('BEGIN PRIVATE KEY')) {
      console.log('FAIL  FIREBASE_SERVICE_ACCOUNT — private_key looks invalid');
      ok = false;
    } else {
      console.log('OK    FIREBASE_SERVICE_ACCOUNT');
      console.log(`      project_id: ${parsed.project_id}`);
      console.log(`      client_email: ${parsed.client_email}`);
      console.log(`      private_key_id: ${mask(parsed.private_key_id ?? '', 6)}`);
    }
  } catch {
    console.log('FAIL  FIREBASE_SERVICE_ACCOUNT — invalid JSON (must be one-line on Vercel)');
    ok = false;
  }
}

if (!webApiKey) {
  console.log('WARN  FIREBASE_WEB_API_KEY — not set (password reset emails will not send)');
  ok = false;
} else if (!webApiKey.startsWith('AIza')) {
  console.log('WARN  FIREBASE_WEB_API_KEY — should start with AIza');
} else {
  console.log('OK    FIREBASE_WEB_API_KEY');
  console.log(`      value: ${mask(webApiKey, 6)}`);
}

console.log('');
if (ok) {
  console.log('All required Firebase variables look good.');
  process.exit(0);
}

console.log('Fix the issues above, then add the same vars on Vercel (Production + Preview) and redeploy.');
process.exit(1);
