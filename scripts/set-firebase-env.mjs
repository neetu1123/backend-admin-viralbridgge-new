import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const jsonPath =
  process.argv[2] ||
  path.join(process.env.USERPROFILE || '', 'Downloads', 'viralbridgge-firebase-adminsdk-fbsvc-522ed2f6db.json');
const envPath = path.join(__dirname, '..', '.env');

if (!fs.existsSync(jsonPath)) {
  console.error(`Service account file not found: ${jsonPath}`);
  process.exit(1);
}

const minified = JSON.stringify(JSON.parse(fs.readFileSync(jsonPath, 'utf8')));
let env = fs
  .readFileSync(envPath, 'utf8')
  .split(/\r?\n/)
  .filter((line) => !line.startsWith('FIREBASE_') && !line.startsWith('# Firebase'))
  .join('\n')
  .trimEnd();

env += `\n\n# Firebase (password reset + 2FA)\nFIREBASE_SERVICE_ACCOUNT='${minified}'\nFIREBASE_WEB_API_KEY=""\n`;
fs.writeFileSync(envPath, env);
console.log('Updated .env with FIREBASE_SERVICE_ACCOUNT');
