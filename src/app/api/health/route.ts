import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api";
import { createHealth, deleteHealth, listHealth, updateHealth, updateHealthStatus } from "@/modules/health/service";
import type { HealthStatus } from "@/lib/types";
import { logActivity } from "@/modules/activity/service";

export async function GET() {
  return withAuth(async (session) => {
    const events = await listHealth(session.farm.id);
    return NextResponse.json({ events });
  });
}

export async function POST(request: Request) {
  const body = await request.json();
  return withAuth(async (session) => {
    const event = await createHealth(session.farm.id, body);
    await logActivity(session.farm.id, {
      userId: session.user.id,
      userName: session.user.name,
      action: "created",
      entity: "health",
      entityId: event.id,
      detail: `${event.kind}${event.milkWithholdUntil ? ` · withhold until ${event.milkWithholdUntil}` : ""}`,
    });
    return NextResponse.json({ event }, { status: 201 });
  });
}

export async function PUT(request: Request) {
  const body = (await request.json()) as { id?: string } & Record<string, unknown>;
  return withAuth(async (session) => {
    if (!body.id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
    const event = await updateHealth(session.farm.id, body.id, body);
    await logActivity(session.farm.id, {
      userId: session.user.id,
      userName: session.user.name,
      action: "updated",
      entity: "health",
      entityId: event.id,
      detail: event.kind,
    });
    return NextResponse.json({ event });
  });
}

export async function PATCH(request: Request) {
  const body = (await request.json()) as { id?: string; status?: HealthStatus };
  return withAuth(async (session) => {
    if (!body.id || !body.status) return NextResponse.json({ error: "Missing id or status" }, { status: 400 });
    await updateHealthStatus(session.farm.id, body.id, body.status);
    return NextResponse.json({ ok: true });
  });
}

export async function DELETE(request: Request) {
  const url = new URL(request.url);
  const id = url.searchParams.get("id");
  return withAuth(async (session) => {
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
    await deleteHealth(session.farm.id, id);
    await logActivity(session.farm.id, {
      userId: session.user.id,
      userName: session.user.name,
      action: "deleted",
      entity: "health",
      entityId: id,
      detail: null,
    });
    return NextResponse.json({ ok: true });
  });
}
