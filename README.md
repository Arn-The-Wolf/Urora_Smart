# Urora Smart

Mobile-first farm workspace for cattle, milk, sick animals, vet stock, chemically treated washes, and the daily schedule.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Demo accounts (password `farm1234` for both):

| Role | Email | Can do |
| --- | --- | --- |
| Farm boss | `farmer@urora.farm` | Full ops + daily/monthly reports |
| Farm operator | `operator@urora.farm` | Day-to-day herd, milk, stock, washes |

## What is live

- Two roles: **Farm operator** (field work) and **Farm boss** (oversight + reports)
- System-wide **alerts**: reorder thresholds (before zero), expired/expiring medicines, sick cows, milk drop / missing sessions, overdue washes & tasks
- Store with **batch code + expiry** on medicines and supplies
- Herd and milking records with **offline queue + sync** (same cow/date/session merges; newer server wins; conflicts surfaced on sync)
- Health and isolation for sick animals
- Tick wash / dip in treated water, with the next due date
- Daily schedule (milking, spray, sick checks, restock)
- Auth: **scrypt** password hashing, login **rate limiting** (5 failed attempts / 15 min per IP+email)

Production uses `DATABASE_URL` (Postgres / Neon). Locally it uses PGlite in `data/`. Without `DATABASE_URL` on Vercel, data is in-memory and resets on cold start.
