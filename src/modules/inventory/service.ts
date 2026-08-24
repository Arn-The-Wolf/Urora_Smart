import { and, eq } from "drizzle-orm";
import { stockItems, stockMovements } from "@/modules/inventory/schema";
import { getDb } from "@/lib/db";
import { addDays, nowIso, todayInKigali } from "@/lib/dates";
import { createId } from "@/lib/id";
import type { StockCategory, StockItem } from "@/lib/types";
import { stockInputSchema, stockMoveSchema } from "@/modules/ops/validators";

function toItem(row: typeof stockItems.$inferSelect): StockItem {
  return {
    id: row.id,
    farmId: row.farmId,
    name: row.name,
    category: row.category as StockCategory,
    unit: row.unit,
    quantity: Number(row.quantity),
    reorderLevel: Number(row.reorderLevel),
    batchCode: row.batchCode ?? null,
    expiresOn: row.expiresOn ?? null,
    notes: row.notes,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export async function listStock(farmId: string) {
  const db = await getDb();
  const rows = await db.select().from(stockItems).where(eq(stockItems.farmId, farmId));
  return rows.map(toItem).sort((a, b) => a.name.localeCompare(b.name));
}

export async function listLowStock(farmId: string) {
  const items = await listStock(farmId);
  return items.filter((item) => item.quantity <= item.reorderLevel);
}

export async function listExpiringStock(farmId: string, withinDays = 30) {
  const today = todayInKigali();
  const until = addDays(today, withinDays);
  const items = await listStock(farmId);
  return items.filter((item) => item.expiresOn && item.expiresOn <= until && item.quantity > 0);
}

export async function listExpiredStock(farmId: string) {
  const today = todayInKigali();
  const items = await listStock(farmId);
  return items.filter((item) => item.expiresOn && item.expiresOn < today && item.quantity > 0);
}

export async function createStock(farmId: string, input: unknown) {
  const parsed = stockInputSchema.parse(input);
  const db = await getDb();
  const now = nowIso();
  const row = {
    id: createId(),
    farmId,
    name: parsed.name,
    category: parsed.category,
    unit: parsed.unit,
    quantity: parsed.quantity,
    reorderLevel: parsed.reorderLevel,
    batchCode: parsed.batchCode ?? null,
    expiresOn: parsed.expiresOn ?? null,
    notes: parsed.notes ?? null,
    createdAt: now,
    updatedAt: now,
  };
  await db.insert(stockItems).values(row);
  return toItem(row);
}

export async function moveStock(farmId: string, input: unknown) {
  const parsed = stockMoveSchema.parse(input);
  const db = await getDb();
  const items = await db
    .select()
    .from(stockItems)
    .where(and(eq(stockItems.id, parsed.itemId), eq(stockItems.farmId, farmId)))
    .limit(1);
  const item = items[0];
  if (!item) throw new Error("Stock item not found");
  const nextQty = parsed.kind === "in" ? Number(item.quantity) + parsed.quantity : Number(item.quantity) - parsed.quantity;
  if (nextQty < 0) throw new Error("Not enough stock for that withdrawal");
  const now = nowIso();
  await db
    .update(stockItems)
    .set({ quantity: nextQty, updatedAt: now })
    .where(eq(stockItems.id, item.id));
  await db.insert(stockMovements).values({
    id: createId(),
    farmId,
    itemId: item.id,
    kind: parsed.kind,
    quantity: parsed.quantity,
    reason: parsed.reason ?? null,
    date: parsed.date,
    createdAt: now,
  });
  return { ...toItem(item), quantity: nextQty, updatedAt: now };
}

export async function useNamedStock(farmId: string, name: string, quantity: number, reason: string) {
  const items = await listStock(farmId);
  const match = items.find((item) => item.name.toLowerCase() === name.toLowerCase());
  if (!match) return;
  try {
    await moveStock(farmId, { itemId: match.id, kind: "out", quantity, reason, date: todayInKigali() });
  } catch {
    /* keep the health/wash record even if stock is already empty */
  }
}

export async function countStockMovementsOut(farmId: string, from: string, to: string) {
  const db = await getDb();
  const rows = await db.select().from(stockMovements).where(eq(stockMovements.farmId, farmId));
  return rows.filter((row) => row.kind === "out" && row.date >= from && row.date <= to).length;
}
