import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api";
import { getMilkSummary, listRecentMilkings } from "@/modules/milk/service";

export async function GET() {
  return withAuth(async (session) => {
    const [summary, recent] = await Promise.all([
      getMilkSummary(session.farm.id),
      listRecentMilkings(session.farm.id, 8),
    ]);
    return NextResponse.json({ summary, recent });
  });
}
