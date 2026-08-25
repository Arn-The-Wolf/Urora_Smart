import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api";
import { createBreeding, listBreeding, updateBreedingStatus } from "@/modules/breeding/service";
import type { BreedingStatus } from "@/lib/types";
import { logActivity } from "@/modules/activity/service";

export async function GET() {
  return withAuth(async (session) => {
    const events = await listBreeding(session.farm.id);
    return NextResponse.json({ events });
  });
}

export async function POST(request: Request) {
  const body = await request.json();
  return withAuth(async (session) => {
    const event = await createBreeding(session.farm.id, body);
    await logActivity(session.farm.id, {
      userId: session.user.id,
      userName: session.user.name,
      action: "created",
      entity: "breeding",
      entityId: event.id,
      detail: `${event.kind} for cow ${event.cowId}`,
    });
    return NextResponse.json({ event }, { status: 201 });
  });
}

export async function PATCH(request: Request) {
  const body = (await request.json()) as { id?: string; status?: BreedingStatus };
  return withAuth(async (session) => {
    if (!body.id || !body.status) return NextResponse.json({ error: "Missing id or status" }, { status: 400 });
    await updateBreedingStatus(session.farm.id, body.id, body.status);
    return NextResponse.json({ ok: true });
  });
}
