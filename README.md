# Spring Farms

Mobile-first farm workspace for cattle, milk, sick animals, vet stock, chemically treated washes, and the daily schedule.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) locally, or production at [https://spring-farms.vercel.app](https://spring-farms.vercel.app) — boots to login.

Demo accounts (password `farm1234` for both):

| Role | Email | Can do |
| --- | --- | --- |
| Farm owner | `farmer@urora.farm` | Full ops + breeding + money + activity |
| Farm operator | `operator@urora.farm` | Day-to-day herd, milk, stock, washes |

## What is live

### Phase 1 — protect milk & money
- **Milk withhold after antibiotics** — set withdrawal days on health records; milking blocked until clear; alerts
- **Breeding / calving calendar** — heat, AI, pregnancy check, dry-off, calving with auto expected dates
- **Expenses & milk sales** — owner-only `/finance` with monthly net summary

### Phase 2 — store & offline
- **Feed inventory** — `feed` category (hay, bran, meal) with reorder alerts
- **Offline queue** — health, stock, and wash forms queue when offline (sync on reconnect)

### Phase 3 — trust & reach
- **Worker activity log** — owner `/activity` (health, breeding, finance actions)
- **Photo attachments** — health records support `photoUrl` (paste link; upload provider next)
- **SMS / WhatsApp digests** — owner phone + channel in Settings; preview at `/api/digest/preview`

### Phase 4 — polish & scale
- **PWA install banner** + clearer pending-sync bar
- **CSV export** on Reports
- **Multi-kraal** — add kraals under Settings (`/api/kraals`)

Also: two roles, system-wide alerts, batch/expiry on stock, offline cow/milk sync, scrypt auth + login rate limits.

Production uses `DATABASE_URL` (Neon Postgres). Locally it uses PGlite in `data/`.
