import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { StockView } from "@/components/ops/stock-view";
import { listStock } from "@/modules/inventory/service";

export default async function StockPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  const items = await listStock(session.farm.id);
  return <StockView items={items} />;
}
