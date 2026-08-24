import { NextResponse } from "next/server";
import { withAuth, jsonError } from "@/lib/api";
import { getDailyReport, getMonthlyReport } from "@/modules/reports/service";
import { todayInKigali } from "@/lib/dates";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const kind = url.searchParams.get("kind") ?? "daily";
  const date = url.searchParams.get("date") ?? todayInKigali();
  const month = url.searchParams.get("month") ?? date.slice(0, 7);

  return withAuth(async (session) => {
    if (session.user.role !== "boss") {
      return jsonError("Only the farm boss can generate reports", 403);
    }
    if (kind === "monthly") {
      const report = await getMonthlyReport(session.farm.id, month);
      return NextResponse.json({ report });
    }
    const report = await getDailyReport(session.farm.id, date);
    return NextResponse.json({ report });
  }, ["boss"]);
}
