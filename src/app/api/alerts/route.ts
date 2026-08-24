import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api";
import { alertSummary, getFarmAlerts } from "@/modules/alerts/service";

export async function GET() {
  return withAuth(async (session) => {
    const alerts = await getFarmAlerts(session.farm.id);
    return NextResponse.json({ alerts, summary: alertSummary(alerts) });
  });
}
