import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { ScheduleView } from "@/components/ops/schedule-view";
import { listTasks } from "@/modules/tasks/service";

export default async function SchedulePage() {
  const session = await getSession();
  if (!session) redirect("/login");
  const tasks = await listTasks(session.farm.id);
  return <ScheduleView tasks={tasks} />;
}
