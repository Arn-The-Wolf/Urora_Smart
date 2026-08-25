import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { canViewOwnerInsights } from "@/lib/roles";
import { ReportsView } from "@/components/reports/reports-view";

export default async function ReportsPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!canViewOwnerInsights(session.user.role)) redirect("/dashboard");
  return <ReportsView />;
}
