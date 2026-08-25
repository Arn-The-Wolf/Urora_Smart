import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { getFinanceSummary, listExpenses, listMilkSales } from "@/modules/finance/service";
import { FinanceView } from "@/components/finance/finance-view";

export default async function FinancePage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.user.role !== "owner") redirect("/dashboard");
  const [expenses, sales, summary] = await Promise.all([
    listExpenses(session.farm.id),
    listMilkSales(session.farm.id),
    getFinanceSummary(session.farm.id),
  ]);
  return <FinanceView expenses={expenses} sales={sales} summary={summary} />;
}
