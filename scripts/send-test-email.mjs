/**
 * Send a Resend "Hello World" test email.
 * Run: npm run email:test
 *
 * Set RESEND_API_KEY in .env (replace re_xxxxxxxxx with your real key from resend.com).
 */
import { Resend } from 'resend';

const apiKey = process.env.RESEND_API_KEY?.trim();
if (!apiKey || apiKey === 're_xxxxxxxx') {
  console.error(
    'RESEND_API_KEY is missing or still a placeholder. Add your real key to .env (re_xxxxxxxxx → your key from Resend).',
  );
  process.exit(1);
}

const resend = new Resend(apiKey);
const from = process.env.RESEND_FROM_EMAIL?.trim() || 'James <James@getstrsites.com>';
const to = process.env.RESEND_TEST_TO?.trim() || 'neetuchaurasiya5041@gmail.com';

const { data, error } = await resend.emails.send({
  from,
  to,
  subject: 'Hello World',
  html: '<p>Congrats on sending your <strong>first email</strong>!</p>',
});

if (error) {
  console.error('Failed to send email:', error);
  process.exit(1);
}

console.log(`Test email sent to ${to} (id: ${data?.id})`);
