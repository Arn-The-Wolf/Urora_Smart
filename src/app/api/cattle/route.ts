import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api";
import { createCow, listCows } from "@/modules/cattle/service";
import type { CowStatus } from "@/lib/types";

export async function GET(request: Request) {
  const status = new URL(request.url).searchParams.get("status") as CowStatus | null;
  return withAuth(async (session) => {
    const cows = await listCows(session.farm.id, status ?? undefined);
    return NextResponse.json({ cows });
  });
}

export async function POST(request: Request) {
  const body = await request.json();
  return withAuth(async (session) => {
    const cow = await createCow(session.farm.id, body);
    return NextResponse.json({ cow }, { status: 201 });
  });
}
