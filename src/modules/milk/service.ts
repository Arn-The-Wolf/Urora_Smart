import { and, eq, isNull } from "drizzle-orm";
import { milkingRecords } from "@/modules/milk/schema";
import { cows } from "@/modules/cattle/schema";
import { getDb } from "@/lib/db";
import { addDays, daysAgo, nowIso, todayInKigali } from "@/lib/dates";
import { createId } from "@/lib/id";
import type { MilkSession, MilkSummary, MilkingRecord } from "@/lib/types";
import { milkingInputSchema, type MilkingInput } from "@/modules/milk/validators";
import { getCow } from "@/modules/cattle/service";

function toRecord(row: typeof milkingRecords.$inferSelect): MilkingRecord {
  return {
    id: row.id,
    farmId: row.farmId,
    clientId: row.clientId,
    cowId: row.cowId,
    date: row.date,
    session: row.session as MilkSession,
    liters: Number(row.liters),
    notes: row.notes,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    deletedAt: row.deletedAt,
  };
}

export async function listMilkings(farmId: string, filters?: { cowId?: string; from?: string; to?: string }) {
  const db = await getDb();
  const rows = await db
    .select()
    .from(milkingRecords)
    .where(and(eq(milkingRecords.farmId, farmId), isNull(milkingRecords.deletedAt)));
  return rows
    .map(toRecord)
    .filter((row) => {
      if (filters?.cowId && row.cowId !== filters.cowId) return false;
      if (filters?.from && row.date < filters.from) return false;
      if (filters?.to && row.date > filters.to) return false;
      return true;
    })
    .sort((a, b) => {
      if (a.date !== b.date) return b.date.localeCompare(a.date);
      const order = { morning: 0, midday: 1, evening: 2 };
      return order[a.session] - order[b.session];
    });
}

export async function getMilking(farmId: string, id: string) {
  const db = await getDb();
  const rows = await db
    .select()
    .from(milkingRecords)
    .where(and(eq(milkingRecords.id, id), eq(milkingRecords.farmId, farmId), isNull(milkingRecords.deletedAt)))
    .limit(1);
  return rows[0] ? toRecord(rows[0]) : null;
}

export async function createMilking(farmId: string, input: MilkingInput) {
  const parsed = milkingInputSchema.parse(input);
  const cow = await getCow(farmId, parsed.cowId);
  if (!cow) throw new Error("Cow not found");
  if (cow.gender !== "female") throw new Error("Milking records are only for female cows");
  if (cow.status !== "active") throw new Error("This cow is not active");

  const db = await getDb();
  const duplicate = await db
    .select()
    .from(milkingRecords)
    .where(
      and(
        eq(milkingRecords.cowId, parsed.cowId),
        eq(milkingRecords.date, parsed.date),
        eq(milkingRecords.session, parsed.session),
        isNull(milkingRecords.deletedAt),
      ),
    )
    .limit(1);
  if (duplicate[0]) {
    throw new Error("A milking for this cow, date, and session already exists");
  }

  const now = nowIso();
  const row = {
    id: parsed.id ?? createId(),
    farmId,
    clientId: parsed.clientId ?? createId(),
    cowId: parsed.cowId,
    date: parsed.date,
    session: parsed.session,
    liters: parsed.liters,
    notes: parsed.notes ?? null,
    createdAt: parsed.createdAt ?? now,
    updatedAt: parsed.updatedAt ?? now,
    deletedAt: null,
  };
  await db.insert(milkingRecords).values(row);
  return toRecord(row as typeof milkingRecords.$inferSelect);
}

export async function updateMilking(farmId: string, id: string, input: MilkingInput) {
  const parsed = milkingInputSchema.parse(input);
  const current = await getMilking(farmId, id);
  if (!current) throw new Error("Milking record not found");
  const db = await getDb();
  const now = nowIso();
  const next = {
    cowId: parsed.cowId,
    date: parsed.date,
    session: parsed.session,
    liters: parsed.liters,
    notes: parsed.notes ?? null,
    updatedAt: parsed.updatedAt ?? now,
  };
  await db
    .update(milkingRecords)
    .set(next)
    .where(and(eq(milkingRecords.id, id), eq(milkingRecords.farmId, farmId)));
  return { ...current, ...next };
}

export async function deleteMilking(farmId: string, id: string) {
  const current = await getMilking(farmId, id);
  if (!current) throw new Error("Milking record not found");
  const db = await getDb();
  const now = nowIso();
  await db
    .update(milkingRecords)
    .set({ deletedAt: now, updatedAt: now })
    .where(and(eq(milkingRecords.id, id), eq(milkingRecords.farmId, farmId)));
}

export async function upsertMilkingFromSync(farmId: string, record: MilkingRecord) {
  const db = await getDb();
  const existing = await db
    .select()
    .from(milkingRecords)
    .where(and(eq(milkingRecords.id, record.id), eq(milkingRecords.farmId, farmId)))
    .limit(1);
  if (existing[0] && existing[0].updatedAt > record.updatedAt) {
    return { applied: false, current: toRecord(existing[0]) };
  }
  const row = { ...record, farmId };
  if (existing[0]) {
    await db.update(milkingRecords).set(row).where(eq(milkingRecords.id, record.id));
  } else {
    await db.insert(milkingRecords).values(row);
  }
  return { applied: true, current: row };
}

export async function listMilkingsChangedSince(farmId: string, since: string | null) {
  const db = await getDb();
  const rows = await db.select().from(milkingRecords).where(eq(milkingRecords.farmId, farmId));
  const mapped = rows.map(toRecord);
  if (!since) return mapped;
  return mapped.filter((row) => row.updatedAt > since);
}

function round1(value: number) {
  return Math.round(value * 10) / 10;
}

export async function getMilkSummary(farmId: string): Promise<MilkSummary> {
  const today = todayInKigali();
  const yesterday = daysAgo(1);
  const from = daysAgo(6);
  const [milkings, cowRows] = await Promise.all([
    listMilkings(farmId, { from, to: today }),
    (await getDb())
      .select()
      .from(cows)
      .where(and(eq(cows.farmId, farmId), isNull(cows.deletedAt))),
  ]);

  const activeCows = cowRows.filter((cow) => cow.status === "active").length;
  const todayRows = milkings.filter((row) => row.date === today);
  const todayBySession: Record<MilkSession, number> = { morning: 0, midday: 0, evening: 0 };
  let todayLiters = 0;
  for (const row of todayRows) {
    todayLiters += row.liters;
    todayBySession[row.session] += row.liters;
  }

  const yesterdayLiters = milkings
    .filter((row) => row.date === yesterday)
    .reduce((sum, row) => sum + row.liters, 0);
  const weekLiters = milkings.reduce((sum, row) => sum + row.liters, 0);

  const byCow = new Map<string, number>();
  for (const row of todayRows) {
    byCow.set(row.cowId, (byCow.get(row.cowId) ?? 0) + row.liters);
  }
  let topCow: MilkSummary["topCow"] = null;
  for (const [cowId, liters] of byCow) {
    if (!topCow || liters > topCow.liters) {
      const cow = cowRows.find((item) => item.id === cowId);
      if (cow) {
        topCow = { cowId, tagNumber: cow.tagNumber, name: cow.name, liters };
      }
    }
  }

  const last7Days = Array.from({ length: 7 }, (_, index) => {
    const date = addDays(from, index);
    const liters = milkings
      .filter((row) => row.date === date)
      .reduce((sum, row) => sum + row.liters, 0);
    return { date, liters };
  });

  return {
    todayLiters: round1(todayLiters),
    todayBySession: {
      morning: round1(todayBySession.morning),
      midday: round1(todayBySession.midday),
      evening: round1(todayBySession.evening),
    },
    weekLiters: round1(weekLiters),
    yesterdayLiters: round1(yesterdayLiters),
    activeCows,
    totalCows: cowRows.length,
    topCow: topCow ? { ...topCow, liters: round1(topCow.liters) } : null,
    last7Days: last7Days.map((day) => ({ ...day, liters: round1(day.liters) })),
  };
}

export async function listRecentMilkings(farmId: string, limit = 8) {
  const rows = await listMilkings(farmId);
  return rows.slice(0, limit);
}
