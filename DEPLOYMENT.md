# ViralBridge Backend — Deployment Guide

Deploy the NestJS API to **Vercel** and connect it to your Next.js frontend.

## Architecture

| Layer | Stack |
|-------|--------|
| API | NestJS + Prisma + PostgreSQL |
| Auth | Firebase Admin (Bearer token) + JWT (email/password login) |
| Realtime | Socket.IO (local/Railway/Render only — **not on Vercel serverless**) |
| Queues | BullMQ + Redis (optional — only when `REDIS_URL` is set) |

## 1. Database (PostgreSQL)

Use any hosted Postgres:

- [Neon](https://neon.tech)
- [Supabase](https://supabase.com)
- [Railway](https://railway.app)

Copy the connection string into `DATABASE_URL`.

**Neon + Vercel:** Use the connection string whose host does **not** contain `-pooler` (direct connection) for `DATABASE_URL` on Vercel and when running migrations. The same value must be set in Vercel → Settings → Environment Variables.

Run migrations locally or let Vercel run them on deploy:

```bash
cd backend-admin-viralbridgge
npm install
npx prisma migrate deploy
npm run seed
```

## 2. Backend environment variables (Vercel)

In Vercel → Project → Settings → Environment Variables, add:

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `JWT_SECRET` | Yes | Long random string for admin JWT login |
| `FIREBASE_SERVICE_ACCOUNT` | Yes* | Full Firebase service account JSON as **single-line string** |
| `CORS_ORIGINS` | Yes | Comma-separated frontend URLs, e.g. `https://your-app.vercel.app,http://localhost:3000` |
| `REDIS_URL` | No | Redis URL for BullMQ (Upstash recommended) |
| `VERCEL` | Auto | Set by Vercel — disables Socket.IO gateway |

\*Required when frontend uses Firebase Auth. JWT email/password login works without it.

### Firebase service account on Vercel

1. Firebase Console → Project Settings → Service Accounts → Generate new private key
2. Minify JSON to one line (or escape newlines in `private_key`)
3. Paste entire JSON as `FIREBASE_SERVICE_ACCOUNT` value

## 3. Deploy backend to Vercel

```bash
cd backend-admin-viralbridgge
npx vercel
```

Or connect the repo in Vercel dashboard:

- **Root Directory:** `backend-admin-viralbridgge`
- **Build Command:** `npm run vercel-build`
- **Output:** Serverless (uses `api/index.ts` via `vercel.json`)

After deploy, your API base URL is:

```
https://your-backend.vercel.app
```

Swagger docs: `https://your-backend.vercel.app/api/docs`

## 4. Frontend environment variables (Vercel)

In the Next.js project (`admin-viralbridgge-new`), set:

| Variable | Example |
|----------|---------|
| `NEXT_PUBLIC_API_URL` | `https://your-backend.vercel.app` |
| `NEXT_PUBLIC_SOCKET_URL` | Same as API (or separate WS host if using Railway for realtime) |

## 5. Demo login accounts

After running `npm run seed`:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@gmail.com | Admin@123 |
| Brand | brand@gmail.com | brand@1234 |
| Creator | creator@gmail.com | creator@1234 |

## 6. API modules overview

### Brand (`/brand/*`)
Profile, campaigns CRUD, applicants (approve/reject/shortlist), creator discovery, deliverables review, escrow release, dashboard, wallet, analytics, messages, notifications, settings.

### Creator (`/creator/*`)
Profile, campaign discovery + apply, applications, deliverables submit (video/image URL), wallet withdraw, dashboard, messages, notifications, settings.

### Video / deliverables flow
1. Brand approves creator → deliverable tasks auto-created from campaign deliverables
2. Creator submits video URL → `POST /creator/deliverables/:id/submit` with `{ mediaUrl, thumbnailUrl, notes }`
3. Brand reviews → `POST /brand/deliverables/:id/approve` or `/revise`
4. Brand releases escrow → `POST /brand/escrows/:id/release`

## 7. Local development

```bash
# Backend
cd backend-admin-viralbridgge
cp .env.example .env
# Edit .env with your DATABASE_URL
npm install
npx prisma migrate dev
npm run seed
npm run start:dev

# Frontend (separate terminal)
cd admin-viralbridgge-new
cp .env.example .env.local
npm run dev
```

## 8. Realtime on production

Vercel serverless **does not support WebSockets**. Options:

1. **REST-only** — messages work via `/brand/messages/send` and `/creator/messages/send` (already implemented)
2. **Separate WS host** — deploy the same backend to Railway/Render with `npm run start:prod` and point `NEXT_PUBLIC_SOCKET_URL` there

## 9. Troubleshooting

| Issue | Fix |
|-------|-----|
| 401 on all routes | Check `Authorization: Bearer <token>` header |
| CORS error | Add frontend URL to `CORS_ORIGINS` |
| Prisma errors on Vercel | Ensure `DATABASE_URL` is set and migrations ran |
| P3009 failed migration on Neon | See **Fix P3009 (failed migration)** below |

### Fix P3009 (failed migration on Neon)

This happens when a deploy failed mid-migration. Your schema is already correct; Prisma only needs the history updated (**Option 2** in [Prisma docs](https://www.prisma.io/docs/guides/migrate/production-troubleshooting)).

**A — Terminal (recommended)**

```bash
cd backend-admin-viralbridgge
# Edit .env: set DATABASE_URL to your Neon string (not localhost)
npm run neon:fix-migration
```

**B — Neon SQL Editor**

Run `prisma/fix-failed-migration.sql`, then redeploy on Vercel.

After either fix: push latest code (includes the corrected second migration SQL) and **Redeploy** the Vercel project.
| Firebase token fails | Verify `FIREBASE_SERVICE_ACCOUNT` JSON is valid one-line string |
