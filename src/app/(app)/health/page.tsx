import { getSession } from "@/lib/auth/session";
import { HealthView } from "@/components/ops/health-view";
import { listHealth } from "@/modules/health/service";
import { listCows } from "@/modules/cattle/service";
import { redirect } from "next/navigation";

export default async function HealthPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  const [events, cows] = await Promise.all([listHealth(session.farm.id), listCows(session.farm.id)]);
  return <HealthView events={events} cows={cows} />;
}
