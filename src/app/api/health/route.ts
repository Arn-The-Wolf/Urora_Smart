import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api";
import { createHealth, listHealth, updateHealthStatus } from "@/modules/health/service";
import type { HealthStatus } from "@/lib/types";

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
    return NextResponse.json({ event }, { status: 201 });
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
