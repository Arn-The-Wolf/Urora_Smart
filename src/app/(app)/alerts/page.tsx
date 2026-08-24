import { getSession } from "@/lib/auth/session";
import { getFarmAlerts } from "@/modules/alerts/service";
import { AlertsView } from "@/components/alerts/alerts-view";

export default async function AlertsPage() {
  const session = await getSession();
  if (!session) return null;
  const alerts = await getFarmAlerts(session.farm.id);
  return <AlertsView alerts={alerts} />;
}
