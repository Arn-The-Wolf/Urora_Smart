import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api";
import { createMilking, listMilkings } from "@/modules/milk/service";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const cowId = url.searchParams.get("cowId") ?? undefined;
  const from = url.searchParams.get("from") ?? undefined;
  const to = url.searchParams.get("to") ?? undefined;
  return withAuth(async (session) => {
    const milkings = await listMilkings(session.farm.id, { cowId, from, to });
    return NextResponse.json({ milkings });
  });
}

export async function POST(request: Request) {
  const body = await request.json();
  return withAuth(async (session) => {
    const milking = await createMilking(session.farm.id, body);
    return NextResponse.json({ milking }, { status: 201 });
  });
}
