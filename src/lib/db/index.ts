import path from "node:path";
import { mkdirSync } from "node:fs";
import { PGlite } from "@electric-sql/pglite";
import { drizzle as drizzlePglite } from "drizzle-orm/pglite";
import { drizzle as drizzleNeon } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { schema } from "@/lib/db/schema";
import { SCHEMA_STATEMENTS } from "@/lib/db/sql";
import { seedIfEmpty } from "@/lib/db/seed";

export type AppDb = Awaited<ReturnType<typeof initDb>>["db"];

/** Bump when columns/tables must be re-applied on an existing local DB / HMR cache. */
const SCHEMA_VERSION = 4;

type GlobalDb = {
  db?: AppDb;
  ready?: Promise<AppDb>;
  schemaVersion?: number;
};

const globalForDb = globalThis as unknown as { __uroraDb?: GlobalDb };

/**
 * PGlite often rejects `ADD COLUMN IF NOT EXISTS`.
 * Use plain ADD COLUMN and ignore duplicate-column errors.
 */
const CRITICAL_COLUMNS = [
  `ALTER TABLE farms ADD COLUMN digest_phone TEXT`,
  `ALTER TABLE farms ADD COLUMN digest_channel TEXT`,
  `ALTER TABLE farms ADD COLUMN owner_id TEXT`,
  `ALTER TABLE cows ADD COLUMN kraal_id TEXT`,
  `ALTER TABLE cows ADD COLUMN photo_url TEXT`,
  `ALTER TABLE cows ADD COLUMN photo_urls TEXT`,
  `ALTER TABLE health_events ADD COLUMN milk_withhold_until TEXT`,
  `ALTER TABLE health_events ADD COLUMN photo_url TEXT`,
  `ALTER TABLE health_events ADD COLUMN photo_urls TEXT`,
  `ALTER TABLE stock_items ADD COLUMN batch_code TEXT`,
  `ALTER TABLE stock_items ADD COLUMN expires_on TEXT`,
];

function isIgnorableSchemaError(message: string) {
  return /already exists|duplicate column|column .+ of relation .+ already exists|does not exist|undefined_table/i.test(
    message,
  );
}

async function applySchema(exec: (sql: string) => Promise<unknown>) {
  for (const statement of SCHEMA_STATEMENTS) {
    try {
      await exec(statement);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (!isIgnorableSchemaError(message)) throw error;
    }
  }
  for (const statement of CRITICAL_COLUMNS) {
    try {
      await exec(statement);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (!isIgnorableSchemaError(message)) throw error;
    }
  }
}

function readEnv(name: string) {
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
    return { db };
  }

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
  return { db };
}

export async function getDb() {
  const cached = globalForDb.__uroraDb;

  // Stale HMR cache from before owner_id existed — force re-init.
  if (cached && cached.schemaVersion !== SCHEMA_VERSION) {
    globalForDb.__uroraDb = undefined;
  }

  const current = globalForDb.__uroraDb;
  if (current?.db && current.schemaVersion === SCHEMA_VERSION) {
    return current.db;
  }
  if (current?.ready && current.schemaVersion === SCHEMA_VERSION) {
    return current.ready;
  }

  const ready = initDb().then(({ db }) => {
    globalForDb.__uroraDb = { db, ready: Promise.resolve(db), schemaVersion: SCHEMA_VERSION };
    return db;
  });
  globalForDb.__uroraDb = { ready, schemaVersion: SCHEMA_VERSION };
  return ready;
}
