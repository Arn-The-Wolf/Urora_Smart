import { addDays, daysAgo, nowIso, todayInKigali } from "@/lib/dates";
import type { FarmAlert } from "@/lib/types";
import { listActiveWithholds, listSickAnimals } from "@/modules/health/service";
import { listExpiredStock, listExpiringStock, listLowStock } from "@/modules/inventory/service";
import { listMilkings } from "@/modules/milk/service";
import { listCows } from "@/modules/cattle/service";
import { listOpenTasks } from "@/modules/tasks/service";
import { nextWashDue } from "@/modules/wash/service";
import { listUpcomingBreeding } from "@/modules/breeding/service";

export async function getFarmAlerts(farmId: string): Promise<FarmAlert[]> {
  const today = todayInKigali();
  const [
    sick,
    lowStock,
    expired,
    expiring,
    washDue,
    openTasks,
    cows,
    recentMilk,
    weekMilk,
    withholds,
    breedingUpcoming,
  ] = await Promise.all([
    listSickAnimals(farmId),
    listLowStock(farmId),
    listExpiredStock(farmId),
    listExpiringStock(farmId, 30),
    nextWashDue(farmId),
    listOpenTasks(farmId),
    listCows(farmId, "active"),
    listMilkings(farmId, { from: today, to: today }),
    listMilkings(farmId, { from: daysAgo(7), to: daysAgo(1) }),
    listActiveWithholds(farmId, today),
    listUpcomingBreeding(farmId, 21),
  ]);

  const alerts: FarmAlert[] = [];
  const stamp = nowIso();
  const withholdCowIds = new Set(withholds.map((row) => row.cowId));

  for (const event of withholds) {
    const cow = cows.find((item) => item.id === event.cowId);
    alerts.push({
      id: `withhold-${event.id}`,
      kind: "milk_withhold",
      severity: "critical",
      title: `Milk withhold · ${cow?.name || cow?.tagNumber || "cow"}`,
      detail: `Do not put milk in the can until ${event.milkWithholdUntil}${event.medicineName ? ` · ${event.medicineName}` : ""}`,
      href: "/health",
      createdAt: stamp,
    });
  }

  for (const event of sick) {
    alerts.push({
      id: `sick-${event.id}`,
      kind: "sick_cow",
      severity: event.isolated ? "critical" : "warning",
      title: event.isolated ? "Isolated sick animal" : "Sick animal needs follow-up",
      detail: `${event.diagnosis || event.kind} · status ${event.status}`,
      href: "/health",
      createdAt: stamp,
    });
  }

  for (const item of expired) {
    alerts.push({
      id: `expired-${item.id}`,
      kind: "stock_expired",
      severity: "critical",
      title: `${item.name} has expired`,
      detail: `Batch ${item.batchCode || "—"} expired ${item.expiresOn}. Do not use on animals.`,
      href: "/stock",
      createdAt: stamp,
    });
  }

  for (const item of expiring) {
    if (item.expiresOn && item.expiresOn < today) continue;
    alerts.push({
      id: `expiring-${item.id}`,
      kind: "stock_expiring",
      severity: "warning",
      title: `${item.name} expires soon`,
      detail: `Use or replace before ${item.expiresOn}${item.batchCode ? ` · batch ${item.batchCode}` : ""}.`,
      href: "/stock",
      createdAt: stamp,
    });
  }

  for (const item of lowStock) {
    alerts.push({
      id: `low-${item.id}`,
      kind: "stock_low",
      severity: item.quantity <= 0 ? "critical" : "warning",
      title: item.quantity <= 0 ? `${item.name} is finished` : `${item.name} is running low`,
      detail: `${item.quantity} ${item.unit} left · reorder at ${item.reorderLevel} ${item.unit}`,
      href: "/stock",
      createdAt: stamp,
    });
  }

  if (washDue?.nextDue && washDue.nextDue <= today) {
    alerts.push({
      id: `wash-${washDue.id}`,
      kind: "wash_due",
      severity: washDue.nextDue < today ? "critical" : "warning",
      title: washDue.nextDue < today ? "Tick wash is overdue" : "Tick wash due today",
      detail: `Last ${washDue.chemicalName} on ${washDue.date}. Next due ${washDue.nextDue}.`,
      href: "/wash",
      createdAt: stamp,
    });
  }

  for (const task of openTasks) {
    if (task.dueDate >= today) continue;
    alerts.push({
      id: `task-${task.id}`,
      kind: "task_overdue",
      severity: "warning",
      title: `Overdue: ${task.title}`,
      detail: `Due ${task.dueDate}${task.dueTime ? ` at ${task.dueTime}` : ""}`,
      href: "/schedule",
      createdAt: stamp,
    });
  }

  for (const event of breedingUpcoming) {
    const cow = cows.find((item) => item.id === event.cowId);
    const label = cow?.name || cow?.tagNumber || "cow";
    if (event.dryOffDate && event.dryOffDate >= today && event.dryOffDate <= addDays(today, 14)) {
      alerts.push({
        id: `dryoff-${event.id}`,
        kind: "dry_off_due",
        severity: event.dryOffDate <= today ? "critical" : "warning",
        title: `Dry-off for ${label}`,
        detail: `Dry off by ${event.dryOffDate} · expected calving ${event.expectedCalving || "—"}`,
        href: "/breeding",
        createdAt: stamp,
      });
    }
    if (event.expectedCalving && event.expectedCalving >= today && event.expectedCalving <= addDays(today, 21)) {
      alerts.push({
        id: `calving-${event.id}`,
        kind: "calving_due",
        severity: event.expectedCalving <= addDays(today, 7) ? "critical" : "warning",
        title: `Calving window · ${label}`,
        detail: `Expected around ${event.expectedCalving}`,
        href: "/breeding",
        createdAt: stamp,
      });
    }
  }

  const milkers = cows.filter((cow) => cow.gender === "female");
  const milkedIds = new Set(recentMilk.map((row) => row.cowId));
  for (const cow of milkers) {
    if (milkedIds.has(cow.id) || withholdCowIds.has(cow.id)) continue;
    alerts.push({
      id: `milk-missing-${cow.id}`,
      kind: "milk_missing",
      severity: "info",
      title: `No milk logged today for ${cow.name || cow.tagNumber}`,
      detail: `Tag ${cow.tagNumber} · check morning / midday / evening sessions`,
      href: "/milk/new",
      createdAt: stamp,
    });
  }

  const weekByCow = new Map<string, number[]>();
  for (const row of weekMilk) {
    const list = weekByCow.get(row.cowId) ?? [];
    list.push(row.liters);
    weekByCow.set(row.cowId, list);
  }
  const todayByCow = new Map<string, number>();
  for (const row of recentMilk) {
    todayByCow.set(row.cowId, (todayByCow.get(row.cowId) ?? 0) + row.liters);
  }
  for (const [cowId, litersList] of weekByCow) {
    if (litersList.length < 3) continue;
    const avg = litersList.reduce((a, b) => a + b, 0) / litersList.length;
    const todayLiters = todayByCow.get(cowId);
    if (todayLiters == null) continue;
    if (todayLiters < avg * 0.7) {
      const cow = cows.find((item) => item.id === cowId);
      alerts.push({
        id: `milk-drop-${cowId}`,
        kind: "milk_drop",
        severity: "warning",
        title: `Milk drop for ${cow?.name || cow?.tagNumber || "cow"}`,
        detail: `Today ${todayLiters.toFixed(1)} L vs ~${avg.toFixed(1)} L average this week`,
        href: cow ? `/cattle/${cow.id}` : "/milk",
        createdAt: stamp,
      });
    }
  }

  const severityRank = { critical: 0, warning: 1, info: 2 };
  return alerts.sort((a, b) => severityRank[a.severity] - severityRank[b.severity] || a.title.localeCompare(b.title));
}

export function alertSummary(alerts: FarmAlert[]) {
  return {
    total: alerts.length,
    critical: alerts.filter((a) => a.severity === "critical").length,
    warning: alerts.filter((a) => a.severity === "warning").length,
    info: alerts.filter((a) => a.severity === "info").length,
  };
}
