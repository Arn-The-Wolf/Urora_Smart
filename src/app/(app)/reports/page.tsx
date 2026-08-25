import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { ReportsView } from "@/components/reports/reports-view";

export default async function ReportsPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.user.role !== "owner") redirect("/dashboard");
  return <ReportsView />;
}
