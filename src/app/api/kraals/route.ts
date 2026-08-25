import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api";
import { createKraal, listKraals } from "@/modules/kraals/service";

export async function GET() {
  return withAuth(async (session) => {
    const kraals = await listKraals(session.farm.id);
    return NextResponse.json({ kraals });
  });
}

export async function POST(request: Request) {
  const body = (await request.json()) as { name?: string; notes?: string };
  return withAuth(async (session) => {
    if (!body.name?.trim()) return NextResponse.json({ error: "Name required" }, { status: 400 });
    const kraal = await createKraal(session.farm.id, body.name, body.notes);
    return NextResponse.json({ kraal }, { status: 201 });
  });
}
