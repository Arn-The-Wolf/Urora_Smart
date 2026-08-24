import { NextResponse } from "next/server";
import { handleRouteError, jsonError, withAuth } from "@/lib/api";
import { deleteMilking, getMilking, updateMilking } from "@/modules/milk/service";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    return withAuth(async (session) => {
      const milking = await getMilking(session.farm.id, id);
      if (!milking) return jsonError("Milking record not found", 404);
      return NextResponse.json({ milking });
    });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PUT(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    return withAuth(async (session) => {
      const milking = await updateMilking(session.farm.id, id, body);
      return NextResponse.json({ milking });
    });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    return withAuth(async (session) => {
      await deleteMilking(session.farm.id, id);
      return NextResponse.json({ ok: true });
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
