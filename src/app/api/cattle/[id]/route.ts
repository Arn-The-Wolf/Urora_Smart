import { NextResponse } from "next/server";
import { handleRouteError, jsonError, withAuth } from "@/lib/api";
import { deleteCow, getCow, updateCow } from "@/modules/cattle/service";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    return withAuth(async (session) => {
      const cow = await getCow(session.farm.id, id);
      if (!cow) return jsonError("Cow not found", 404);
      return NextResponse.json({ cow });
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
      const cow = await updateCow(session.farm.id, id, body);
      return NextResponse.json({ cow });
    });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    return withAuth(async (session) => {
      await deleteCow(session.farm.id, id);
      return NextResponse.json({ ok: true });
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
