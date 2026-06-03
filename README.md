# Real Estate, Construction & Investment Platform

A full-stack Next.js 16 app serving property buyers, investors, and admins for a real estate / construction / investment company. Covers marketing site, land + housing listings, customer dashboard, investor portal, admin panel, offline bank-transfer payment workflow, Sanity-backed blog, and automation via Vercel Cron.

## Tech stack

- Next.js 16 (App Router, RSC, Server Actions) + TypeScript
- Tailwind CSS v4 + shadcn-style UI primitives
- Prisma + PostgreSQL (Vercel Postgres / Neon / Supabase)
- NextAuth v5 (Credentials provider, JWT sessions, role-based gating)
- Cloudflare R2 (S3 API) for image / PDF / proof uploads
- Nodemailer + React Email templates
- Sanity.io embedded at `/studio` for blog content
- `@react-pdf/renderer` for receipts, invoices, allocation letters
- Recharts for ROI projections
- Vercel Cron for reminders and overdue sweeps

## Prerequisites

- Node.js 20+
- npm 10+
- A Postgres database (local or hosted)
- Cloudflare R2 bucket + API token
- SMTP credentials (any provider, or Mailpit/Ethereal for dev)
- Sanity.io project (optional — blog pages no-op if missing)

## Setup

1. **Install deps**
   ```bash
   npm install
   ```

2. **Configure env**
   ```bash
   cp .env.example .env
   ```
   Fill every value. `AUTH_SECRET` / `NEXTAUTH_SECRET` can be generated with `openssl rand -base64 32`.

3. **Create schema**
   ```bash
   npx prisma migrate dev --name init
   ```

4. **Seed an admin + sample data**
   ```bash
   npx prisma db seed
   ```
   The seed reads `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` from `.env`.

5. **Run dev server**
   ```bash
   npm run dev
   ```
   Visit http://localhost:3000.

## Common scripts

| Script | Purpose |
|---|---|
| `npm run dev` | Dev server with Turbopack |
| `npm run build` | Production build |
| `npm start` | Start production server |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | Lint |
| `npx prisma studio` | Inspect DB |

## Route groups

- `(marketing)` — home, about, services, land/housing listings + detail, projects, investments, blog, contact. Mostly force-dynamic to tolerate empty DB during build.
- `(landing)` — buy-land, invest, construction campaign pages with lead capture.
- `(auth)` — login, register, forgot, reset, verify.
- `(customer)/dashboard` — properties, payments, upload proof, documents, notifications.
- `(investor)/investor` — projects, invest flow, my-investments, KYC, documents, notifications.
- `(admin)/admin` — listings, projects, customers, investors, invoices, investments, documents, notifications broadcast, reports (CSV export), leads, bookings, blog handoff.
- `/studio/[[...tool]]` — embedded Sanity Studio, gated by `role=ADMIN`.

## Offline payment flow

1. Admin (or system) issues an `Invoice` for a purchase or investment.
2. User sees invoice + bank details rendered from env (`NEXT_PUBLIC_BANK_*`).
3. User transfers offline and uploads proof — R2 presign → PUT → `/api/...` → `AWAITING_REVIEW`.
4. Admin opens the proof, clicks **Mark paid** — this generates a PDF receipt, emails the customer, and emits an in-app notification.

## Cron jobs

`vercel.json` schedules three crons (Bearer-authorized via `CRON_SECRET`):

- `/api/cron/installment-reminders` — daily at 08:00 UTC. Emails/in-app-notifies installments due in 7/3/1 days. Also flips PENDING → DUE at T-1.
- `/api/cron/maturity-reminders` — daily at 09:00. Notifies investors 30/7 days before project maturity.
- `/api/cron/overdue-sweep` — daily at 02:00. Flags past-due installments as OVERDUE.

To test locally:
```bash
curl -H "Authorization: Bearer $CRON_SECRET" http://localhost:3000/api/cron/installment-reminders
```

## Deployment (Vercel)

1. Import repo into Vercel.
2. Set every env var from `.env.example` in the project settings.
3. On first deploy, run one of:
   - `npx prisma migrate deploy` via a Vercel deploy hook / local CLI
   - `npx prisma db push` for non-production
4. Seed once: `npx prisma db seed` with production DB URL.
5. Verify cron schedules appear under **Settings → Cron Jobs**.

## Notes

- All currency defaults to NGN (`formatNGN`). USD display is opt-in.
- WhatsApp integration uses `https://wa.me/<number>` deep links via `NEXT_PUBLIC_WHATSAPP_NUMBER`.
- Uploads go through presigned PUT URLs — the bucket itself is private; public reads are served via `R2_PUBLIC_BASE_URL`.
- SEO: `src/app/sitemap.ts` unions static routes + listing / investment / project slugs + Sanity posts. `src/app/robots.ts` disallows `/admin`, `/dashboard`, `/investor`, `/studio`, `/api`. Dynamic OG images at `/opengraph-image?title=...&subtitle=...`.
