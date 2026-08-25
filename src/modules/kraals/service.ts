import { eq } from "drizzle-orm";
import { kraals } from "@/modules/kraals/schema";
import { getDb } from "@/lib/db";
import { nowIso } from "@/lib/dates";
import { createId } from "@/lib/id";

export type Kraal = {
  id: string;
  farmId: string;
  name: string;
  notes: string | null;
  createdAt: string;
};

export async function listKraals(farmId: string): Promise<Kraal[]> {
  const db = await getDb();
  const rows = await db.select().from(kraals).where(eq(kraals.farmId, farmId));
  return rows.map((row) => ({
    id: row.id,
    farmId: row.farmId,
    name: row.name,
    notes: row.notes,
    createdAt: row.createdAt,
  }));
}

export async function createKraal(farmId: string, name: string, notes?: string | null) {
  const db = await getDb();
  const row = {
    id: createId(),
    farmId,
    name: name.trim(),
    notes: notes ?? null,
    createdAt: nowIso(),
  };
  await db.insert(kraals).values(row);
  return row;
}
