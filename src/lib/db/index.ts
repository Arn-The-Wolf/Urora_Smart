import path from "node:path";
import { mkdirSync } from "node:fs";
import { PGlite } from "@electric-sql/pglite";
import { drizzle as drizzlePglite } from "drizzle-orm/pglite";
import { drizzle as drizzleNeon } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { schema } from "@/lib/db/schema";
import { SCHEMA_STATEMENTS } from "@/lib/db/sql";
import { seedIfEmpty } from "@/lib/db/seed";

export type AppDb = Awaited<ReturnType<typeof initDb>>;

type GlobalDb = {
  db?: AppDb;
  ready?: Promise<AppDb>;
};

const globalForDb = globalThis as unknown as { __uroraDb?: GlobalDb };

async function applySchema(exec: (sql: string) => Promise<unknown>) {
  for (const statement of SCHEMA_STATEMENTS) {
    try {
      await exec(statement);
    } catch (error) {
      // Older DBs may already have columns; ignore duplicate/alter noise.
      const message = error instanceof Error ? error.message : String(error);
      if (!/already exists|duplicate column/i.test(message)) throw error;
    }
  }
}

function readEnv(name: string) {
  // Dynamic lookup so Next.js does not inline a missing value at build time.
  return process.env[name];
}

async function initDb() {
  const databaseUrl = readEnv("DATABASE_URL") ?? readEnv("POSTGRES_URL");

  if (databaseUrl?.startsWith("postgres")) {
    const sql = neon(databaseUrl);
    await applySchema(async (statement) => {
      await sql.query(statement, []);
    });
    const db = drizzleNeon({ client: sql, schema });
    await seedIfEmpty(db);
    return db;
  }

  // Local: persist under ./data. On Vercel without DATABASE_URL: in-memory (demo resets on cold start).
  const useMemory = Boolean(readEnv("VERCEL")) && !databaseUrl;
  const client = useMemory
    ? new PGlite()
    : (() => {
        const dataDir = path.join(process.cwd(), "data");
        mkdirSync(dataDir, { recursive: true });
        return new PGlite(path.join(dataDir, "pglite"));
      })();
  await client.waitReady;
  await applySchema(async (statement) => {
    await client.exec(statement);
  });
  const db = drizzlePglite({ client, schema });
  await seedIfEmpty(db);
  return db;
}

export async function getDb() {
  const cached = globalForDb.__uroraDb;
  if (cached?.db) return cached.db;
  if (cached?.ready) return cached.ready;
  const ready = initDb();
  globalForDb.__uroraDb = { ...(cached ?? {}), ready };
  const db = await ready;
  globalForDb.__uroraDb = { db, ready };
  return db;
}
