import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api";
import { alertSummary, getFarmAlerts } from "@/modules/alerts/service";
import { getMilkSummary } from "@/modules/milk/service";
import { getFinanceSummary } from "@/modules/finance/service";

/** Preview digest payload — wire SMS/WhatsApp provider with DIGEST_API_KEY when ready. */
export async function GET() {
  return withAuth(async (session) => {
    const [alerts, milk, finance] = await Promise.all([
      getFarmAlerts(session.farm.id),
      getMilkSummary(session.farm.id),
      getFinanceSummary(session.farm.id),
    ]);
    const summary = alertSummary(alerts);
    const message = [
      `Spring Farms · ${session.farm.name}`,
      `Milk today: ${milk.todayLiters.toFixed(1)} L`,
      `Alerts: ${summary.total} (${summary.critical} critical)`,
      `Month net: ${finance.net.toLocaleString()} RWF`,
    ].join("\n");
    return NextResponse.json({
      channel: session.farm.digestChannel,
      phone: session.farm.digestPhone,
      ready: Boolean(session.farm.digestPhone && session.farm.digestChannel),
      message,
    });
  }, ["owner"]);
}
