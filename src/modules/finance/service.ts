import { desc, eq } from "drizzle-orm";
import { expenses, milkSales } from "@/modules/finance/schema";
import { getDb } from "@/lib/db";
import { nowIso, todayInKigali } from "@/lib/dates";
import { createId } from "@/lib/id";
import type { Expense, ExpenseCategory, MilkSale } from "@/lib/types";
import { expenseInputSchema, milkSaleInputSchema } from "@/modules/ops/validators";

function toExpense(row: typeof expenses.$inferSelect): Expense {
  return {
    id: row.id,
    farmId: row.farmId,
    date: row.date,
    category: row.category as ExpenseCategory,
    amount: Number(row.amount),
    vendor: row.vendor,
    notes: row.notes,
    recordedBy: row.recordedBy,
    createdAt: row.createdAt,
  };
}

function toSale(row: typeof milkSales.$inferSelect): MilkSale {
  return {
    id: row.id,
    farmId: row.farmId,
    date: row.date,
    liters: Number(row.liters),
    pricePerLiter: Number(row.pricePerLiter),
    totalAmount: Number(row.totalAmount),
    buyer: row.buyer,
    notes: row.notes,
    recordedBy: row.recordedBy,
    createdAt: row.createdAt,
  };
}

export async function listExpenses(farmId: string, from?: string, to?: string) {
  const db = await getDb();
  const rows = await db.select().from(expenses).where(eq(expenses.farmId, farmId)).orderBy(desc(expenses.date));
  return rows
    .map(toExpense)
    .filter((row) => {
      if (from && row.date < from) return false;
      if (to && row.date > to) return false;
      return true;
    });
}

export async function listMilkSales(farmId: string, from?: string, to?: string) {
  const db = await getDb();
  const rows = await db.select().from(milkSales).where(eq(milkSales.farmId, farmId)).orderBy(desc(milkSales.date));
  return rows
    .map(toSale)
    .filter((row) => {
      if (from && row.date < from) return false;
      if (to && row.date > to) return false;
      return true;
    });
}

export async function createExpense(farmId: string, input: unknown, recordedBy?: string) {
  const parsed = expenseInputSchema.parse(input);
  const db = await getDb();
  const row = {
    id: createId(),
    farmId,
    date: parsed.date,
    category: parsed.category,
    amount: parsed.amount,
    vendor: parsed.vendor ?? null,
    notes: parsed.notes ?? null,
    recordedBy: recordedBy ?? null,
    createdAt: nowIso(),
  };
  await db.insert(expenses).values(row);
  return toExpense(row);
}

export async function createMilkSale(farmId: string, input: unknown, recordedBy?: string) {
  const parsed = milkSaleInputSchema.parse(input);
  const totalAmount = Math.round(parsed.liters * parsed.pricePerLiter * 100) / 100;
  const db = await getDb();
  const row = {
    id: createId(),
    farmId,
    date: parsed.date,
    liters: parsed.liters,
    pricePerLiter: parsed.pricePerLiter,
    totalAmount,
    buyer: parsed.buyer ?? null,
    notes: parsed.notes ?? null,
    recordedBy: recordedBy ?? null,
    createdAt: nowIso(),
  };
  await db.insert(milkSales).values(row);
  return toSale(row);
}

export async function getFinanceSummary(farmId: string, month = todayInKigali().slice(0, 7)) {
  const from = `${month}-01`;
  const [y, m] = month.split("-").map(Number);
  const lastDay = new Date(Date.UTC(y, m, 0)).getUTCDate();
  const to = `${month}-${String(lastDay).padStart(2, "0")}`;
  const [expenseRows, saleRows] = await Promise.all([
    listExpenses(farmId, from, to),
    listMilkSales(farmId, from, to),
  ]);
  const expenseTotal = expenseRows.reduce((sum, row) => sum + row.amount, 0);
  const salesTotal = saleRows.reduce((sum, row) => sum + row.totalAmount, 0);
  const litersSold = saleRows.reduce((sum, row) => sum + row.liters, 0);
  return {
    month,
    expenseTotal: Math.round(expenseTotal * 100) / 100,
    salesTotal: Math.round(salesTotal * 100) / 100,
    net: Math.round((salesTotal - expenseTotal) * 100) / 100,
    litersSold: Math.round(litersSold * 10) / 10,
    expenseCount: expenseRows.length,
    saleCount: saleRows.length,
  };
}
