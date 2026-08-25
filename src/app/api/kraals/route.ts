import { NextResponse } from "next/server";
import { withAuth, jsonError } from "@/lib/api";
import { createKraal, listKraals } from "@/modules/kraals/service";
import { canManageFarm } from "@/lib/roles";

export async function GET() {
  return withAuth(async (session) => {
    const kraals = await listKraals(session.farm.id);
    return NextResponse.json({ kraals });
  });
}

export async function POST(request: Request) {
  const body = (await request.json()) as { name?: string; notes?: string };
  return withAuth(async (session) => {
    if (!canManageFarm(session.user.role)) {
      return jsonError("Only the farm owner can add kraals", 403);
    }
    if (!body.name?.trim()) return NextResponse.json({ error: "Name required" }, { status: 400 });
    const kraal = await createKraal(session.farm.id, body.name, body.notes);
    return NextResponse.json({ kraal }, { status: 201 });
  }, ["owner"]);
}
