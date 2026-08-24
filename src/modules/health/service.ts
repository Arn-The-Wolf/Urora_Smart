import { and, desc, eq } from "drizzle-orm";
import { healthEvents } from "@/modules/health/schema";
import { getDb } from "@/lib/db";
import { nowIso } from "@/lib/dates";
import { createId } from "@/lib/id";
import type { HealthEvent, HealthKind, HealthStatus } from "@/lib/types";
import { healthInputSchema } from "@/modules/ops/validators";
import { useNamedStock } from "@/modules/inventory/service";

function toEvent(row: typeof healthEvents.$inferSelect): HealthEvent {
  return {
    id: row.id,
    farmId: row.farmId,
    cowId: row.cowId,
    date: row.date,
    kind: row.kind as HealthKind,
    status: row.status as HealthStatus,
    diagnosis: row.diagnosis,
    treatment: row.treatment,
    medicineName: row.medicineName,
    isolated: row.isolated === 1,
    notes: row.notes,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export async function listHealth(farmId: string) {
  const db = await getDb();
  const rows = await db.select().from(healthEvents).where(eq(healthEvents.farmId, farmId)).orderBy(desc(healthEvents.date));
  return rows.map(toEvent);
}

export async function listSickAnimals(farmId: string) {
  const rows = await listHealth(farmId);
  return rows.filter((row) => row.kind === "illness" && (row.status === "open" || row.status === "recovering"));
}

export async function createHealth(farmId: string, input: unknown) {
  const parsed = healthInputSchema.parse(input);
  const db = await getDb();
  const now = nowIso();
  const row = {
    id: createId(),
    farmId,
    cowId: parsed.cowId,
    date: parsed.date,
    kind: parsed.kind,
    status: parsed.status,
    diagnosis: parsed.diagnosis ?? null,
    treatment: parsed.treatment ?? null,
    medicineName: parsed.medicineName ?? null,
    isolated: parsed.isolated ? 1 : 0,
    notes: parsed.notes ?? null,
    createdAt: now,
    updatedAt: now,
  };
  await db.insert(healthEvents).values(row);
  if (parsed.medicineName && (parsed.kind === "illness" || parsed.kind === "treatment" || parsed.kind === "deworming")) {
    await useNamedStock(farmId, parsed.medicineName, 1, `${parsed.kind} · treatment`);
  }
  return toEvent(row);
}

export async function updateHealthStatus(farmId: string, id: string, status: HealthStatus) {
  const db = await getDb();
  await db
    .update(healthEvents)
    .set({ status, updatedAt: nowIso() })
    .where(and(eq(healthEvents.id, id), eq(healthEvents.farmId, farmId)));
}
