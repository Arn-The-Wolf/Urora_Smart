import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { listActivity } from "@/modules/activity/service";
import { ActivityView } from "@/components/activity/activity-view";

export default async function ActivityPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.user.role !== "owner") redirect("/dashboard");
  const entries = await listActivity(session.farm.id);
  return <ActivityView entries={entries} />;
}
