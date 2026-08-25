import { and, desc, eq } from "drizzle-orm";
import { breedingEvents } from "@/modules/breeding/schema";
import { getDb } from "@/lib/db";
import { addDays, nowIso, todayInKigali } from "@/lib/dates";
import { createId } from "@/lib/id";
import type { BreedingEvent, BreedingKind, BreedingStatus } from "@/lib/types";
import { breedingInputSchema } from "@/modules/ops/validators";

function toEvent(row: typeof breedingEvents.$inferSelect): BreedingEvent {
  return {
    id: row.id,
    farmId: row.farmId,
    cowId: row.cowId,
    date: row.date,
    kind: row.kind as BreedingKind,
    status: row.status as BreedingStatus,
    sireTag: row.sireTag,
    expectedCalving: row.expectedCalving,
    dryOffDate: row.dryOffDate,
    notes: row.notes,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

/** Gestation ~280 days; dry-off typically ~60 days before calving. */
export function suggestDatesFromService(serviceDate: string) {
  const expectedCalving = addDays(serviceDate, 280);
  const dryOffDate = addDays(serviceDate, 220);
  return { expectedCalving, dryOffDate };
}

export async function listBreeding(farmId: string) {
  const db = await getDb();
  const rows = await db
    .select()
    .from(breedingEvents)
    .where(eq(breedingEvents.farmId, farmId))
    .orderBy(desc(breedingEvents.date));
  return rows.map(toEvent);
}

export async function listUpcomingBreeding(farmId: string, withinDays = 30) {
  const today = todayInKigali();
  const until = addDays(today, withinDays);
  const rows = await listBreeding(farmId);
  return rows.filter((row) => {
    if (row.status === "failed" || row.status === "completed") return false;
    if (row.kind === "calving") return false;
    if (row.expectedCalving && row.expectedCalving >= today && row.expectedCalving <= until) return true;
    if (row.dryOffDate && row.dryOffDate >= today && row.dryOffDate <= until) return true;
    return false;
  });
}

export async function createBreeding(farmId: string, input: unknown) {
  const parsed = breedingInputSchema.parse(input);
  let expectedCalving = parsed.expectedCalving ?? null;
  let dryOffDate = parsed.dryOffDate ?? null;

  if ((parsed.kind === "ai" || parsed.kind === "natural_service") && !expectedCalving) {
    const suggested = suggestDatesFromService(parsed.date);
    expectedCalving = suggested.expectedCalving;
    dryOffDate = dryOffDate ?? suggested.dryOffDate;
  }
  if (parsed.kind === "dry_off" && !dryOffDate) {
    dryOffDate = parsed.date;
  }

  const db = await getDb();
  const now = nowIso();
  const row = {
    id: createId(),
    farmId,
    cowId: parsed.cowId,
    date: parsed.date,
    kind: parsed.kind,
    status: parsed.status,
    sireTag: parsed.sireTag ?? null,
    expectedCalving,
    dryOffDate,
    notes: parsed.notes ?? null,
    createdAt: now,
    updatedAt: now,
  };
  await db.insert(breedingEvents).values(row);
  return toEvent(row);
}

export async function updateBreedingStatus(farmId: string, id: string, status: BreedingStatus) {
  const db = await getDb();
  await db
    .update(breedingEvents)
    .set({ status, updatedAt: nowIso() })
    .where(and(eq(breedingEvents.id, id), eq(breedingEvents.farmId, farmId)));
}
