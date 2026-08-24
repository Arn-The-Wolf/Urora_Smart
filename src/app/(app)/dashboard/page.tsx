import { getSession } from "@/lib/auth/session";
import { DashboardView } from "@/components/dashboard/dashboard-view";
import { listSickAnimals } from "@/modules/health/service";
import { listLowStock } from "@/modules/inventory/service";
import { nextWashDue } from "@/modules/wash/service";
import { listOpenTasks } from "@/modules/tasks/service";
import { alertSummary, getFarmAlerts } from "@/modules/alerts/service";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) return null;
  const [sick, lowStock, washDue, openTasks, alerts] = await Promise.all([
    listSickAnimals(session.farm.id),
    listLowStock(session.farm.id),
    nextWashDue(session.farm.id),
    listOpenTasks(session.farm.id),
    getFarmAlerts(session.farm.id),
  ]);
  return (
    <DashboardView
      sick={sick}
      lowStock={lowStock}
      washDue={washDue?.nextDue ?? null}
      openTasks={openTasks}
      alertCount={alertSummary(alerts).total}
      criticalAlerts={alertSummary(alerts).critical}
    />
  );
}
