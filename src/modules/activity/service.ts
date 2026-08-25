import { desc, eq } from "drizzle-orm";
import { activityLog } from "@/modules/activity/schema";
import { getDb } from "@/lib/db";
import { nowIso } from "@/lib/dates";
import { createId } from "@/lib/id";
import type { ActivityLogEntry } from "@/lib/types";

function toEntry(row: typeof activityLog.$inferSelect): ActivityLogEntry {
  return {
    id: row.id,
    farmId: row.farmId,
    userId: row.userId,
    userName: row.userName,
    action: row.action,
    entity: row.entity,
    entityId: row.entityId,
    detail: row.detail,
    createdAt: row.createdAt,
  };
}

export async function logActivity(
  farmId: string,
  input: {
    userId?: string | null;
    userName?: string | null;
    action: string;
    entity: string;
    entityId?: string | null;
    detail?: string | null;
  },
) {
  const db = await getDb();
  const row = {
    id: createId(),
    farmId,
    userId: input.userId ?? null,
    userName: input.userName ?? null,
    action: input.action,
    entity: input.entity,
    entityId: input.entityId ?? null,
    detail: input.detail ?? null,
    createdAt: nowIso(),
  };
  await db.insert(activityLog).values(row);
  return toEntry(row);
}

export async function listActivity(farmId: string, limit = 80) {
  const db = await getDb();
  const rows = await db
    .select()
    .from(activityLog)
    .where(eq(activityLog.farmId, farmId))
    .orderBy(desc(activityLog.createdAt))
    .limit(limit);
  return rows.map(toEntry);
}
