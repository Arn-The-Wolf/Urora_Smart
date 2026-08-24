import { daysAgo, todayInKigali } from "@/lib/dates";
import type { DailyReport, MonthlyReport } from "@/lib/types";
import { listCows } from "@/modules/cattle/service";
import { listSickAnimals, listHealth } from "@/modules/health/service";
import { listExpiredStock, listLowStock, countStockMovementsOut } from "@/modules/inventory/service";
import { getMilkSummary, listMilkings } from "@/modules/milk/service";
import { listOpenTasks } from "@/modules/tasks/service";
import { listWashes, nextWashDue } from "@/modules/wash/service";

export async function getDailyReport(farmId: string, date = todayInKigali()): Promise<DailyReport> {
  const [milkings, cows, sick, lowStock, expired, openTasks, washDue, summary] = await Promise.all([
    listMilkings(farmId, { from: date, to: date }),
    listCows(farmId, "active"),
    listSickAnimals(farmId),
    listLowStock(farmId),
    listExpiredStock(farmId),
    listOpenTasks(farmId),
    nextWashDue(farmId),
    getMilkSummary(farmId),
  ]);

  const byCow = new Map<string, number>();
  for (const row of milkings) byCow.set(row.cowId, (byCow.get(row.cowId) ?? 0) + row.liters);
  let topCow: DailyReport["topCow"] = null;
  for (const [cowId, liters] of byCow) {
    if (!topCow || liters > topCow.liters) {
      const cow = cows.find((item) => item.id === cowId);
      if (cow) topCow = { tagNumber: cow.tagNumber, name: cow.name, liters };
    }
  }

  return {
    date,
    milkLiters: milkings.reduce((sum, row) => sum + row.liters, 0),
    sessionsLogged: milkings.length,
    activeCows: cows.length,
    sickCows: sick.length,
    lowStockCount: lowStock.length,
    expiredStockCount: expired.length,
    openTasks: openTasks.filter((task) => task.dueDate <= date).length,
    washDue: washDue?.nextDue ?? null,
    topCow: date === todayInKigali() ? summary.topCow && {
      tagNumber: summary.topCow.tagNumber,
      name: summary.topCow.name,
      liters: summary.topCow.liters,
    } : topCow,
  };
}

export async function getMonthlyReport(farmId: string, month?: string): Promise<MonthlyReport> {
  const today = todayInKigali();
  const monthKey = month ?? today.slice(0, 7);
  const from = `${monthKey}-01`;
  const to = monthKey === today.slice(0, 7) ? today : `${monthKey}-31`;

  const [milkings, cows, health, washes, stockOut] = await Promise.all([
    listMilkings(farmId, { from, to }),
    listCows(farmId, "active"),
    listHealth(farmId),
    listWashes(farmId),
    countStockMovementsOut(farmId, from, to),
  ]);

  const byDay = new Map<string, number>();
  for (const row of milkings) {
    byDay.set(row.date, (byDay.get(row.date) ?? 0) + row.liters);
  }
  const days = [...byDay.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([date, liters]) => ({ date, liters: Math.round(liters * 10) / 10 }));
  const milkLiters = Math.round(milkings.reduce((sum, row) => sum + row.liters, 0) * 10) / 10;

  return {
    month: monthKey,
    milkLiters,
    milkingDays: days.length,
    averageDailyLiters: days.length ? Math.round((milkLiters / days.length) * 10) / 10 : 0,
    activeCows: cows.length,
    healthEvents: health.filter((event) => event.date >= from && event.date <= to).length,
    washesDone: washes.filter((wash) => wash.date >= from && wash.date <= to).length,
    stockMovementsOut: stockOut,
    byDay: days,
  };
}

void daysAgo;
