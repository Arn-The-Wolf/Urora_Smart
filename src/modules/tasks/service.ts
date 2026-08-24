import { and, eq } from "drizzle-orm";
import { farmTasks } from "@/modules/tasks/schema";
import { getDb } from "@/lib/db";
import { nowIso, todayInKigali } from "@/lib/dates";
import { createId } from "@/lib/id";
import type { FarmTask, TaskCategory } from "@/lib/types";
import { taskInputSchema } from "@/modules/ops/validators";

function toTask(row: typeof farmTasks.$inferSelect): FarmTask {
  return {
    id: row.id,
    farmId: row.farmId,
    title: row.title,
    category: row.category as TaskCategory,
    dueDate: row.dueDate,
    dueTime: row.dueTime,
    cowId: row.cowId,
    status: row.status === "done" ? "done" : "open",
    notes: row.notes,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export async function listTasks(farmId: string) {
  const db = await getDb();
  const rows = await db.select().from(farmTasks).where(eq(farmTasks.farmId, farmId));
  return rows.map(toTask).sort((a, b) => `${a.dueDate}${a.dueTime ?? ""}`.localeCompare(`${b.dueDate}${b.dueTime ?? ""}`));
}

export async function listOpenTasks(farmId: string) {
  const rows = await listTasks(farmId);
  return rows.filter((row) => row.status === "open");
}

export async function createTask(farmId: string, input: unknown) {
  const parsed = taskInputSchema.parse(input);
  const db = await getDb();
  const now = nowIso();
  const row = {
    id: createId(),
    farmId,
    title: parsed.title,
    category: parsed.category,
    dueDate: parsed.dueDate,
    dueTime: parsed.dueTime ?? null,
    cowId: parsed.cowId ?? null,
    status: "open",
    notes: parsed.notes ?? null,
    createdAt: now,
    updatedAt: now,
  };
  await db.insert(farmTasks).values(row);
  return toTask(row);
}

export async function toggleTask(farmId: string, id: string) {
  const db = await getDb();
  const rows = await db
    .select()
    .from(farmTasks)
    .where(and(eq(farmTasks.id, id), eq(farmTasks.farmId, farmId)))
    .limit(1);
  const current = rows[0];
  if (!current) throw new Error("Task not found");
  const status = current.status === "done" ? "open" : "done";
  await db.update(farmTasks).set({ status, updatedAt: nowIso() }).where(eq(farmTasks.id, id));
  return { ...toTask(current), status };
}

export { todayInKigali };
