# Urora Smart

Mobile-first farm workspace for cattle, milk, sick animals, vet stock, chemically treated washes, and the daily schedule.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Demo farm:

- Email: `farmer@urora.farm`
- Password: `farm1234`

## What is live

- Herd and milking records (offline queue + sync)
- Health and isolation for sick animals
- Store: medicines, salt, minerals, acaricide, disinfectant
- Tick wash / dip in treated water, with the next due date
- Daily schedule (milking, spray, sick checks, restock)

Production uses `DATABASE_URL` (Postgres / Neon). Locally it uses PGlite in `data/`.
