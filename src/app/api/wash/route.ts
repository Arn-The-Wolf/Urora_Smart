import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api";
import { createWash, listWashes } from "@/modules/wash/service";

export async function GET() {
  return withAuth(async (session) => {
    const washes = await listWashes(session.farm.id);
    return NextResponse.json({ washes });
  });
}

export async function POST(request: Request) {
  const body = await request.json();
  return withAuth(async (session) => {
    const wash = await createWash(session.farm.id, body);
    return NextResponse.json({ wash }, { status: 201 });
  });
}
