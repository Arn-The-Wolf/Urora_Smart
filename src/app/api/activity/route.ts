import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api";
import { listActivity } from "@/modules/activity/service";

export async function GET() {
  return withAuth(async (session) => {
    const entries = await listActivity(session.farm.id);
    return NextResponse.json({ entries });
  }, ["owner"]);
}
