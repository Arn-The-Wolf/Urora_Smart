import { NextResponse } from "next/server";
import { handleRouteError, withAuth, jsonError } from "@/lib/api";
import { farmUpdateSchema, updateFarm } from "@/modules/users/service";
import { canManageFarm } from "@/lib/roles";

export async function GET() {
  return withAuth(async (session) => NextResponse.json({ farm: session.farm }));
}

export async function PUT(request: Request) {
  try {
    const body = farmUpdateSchema.parse(await request.json());
    return withAuth(async (session) => {
      if (!canManageFarm(session.user.role)) {
        return jsonError("Only the farm owner can update farm settings", 403);
      }
      const farm = await updateFarm(session.farm.id, body);
      return NextResponse.json({ farm });
    }, ["owner"]);
  } catch (error) {
    return handleRouteError(error);
  }
}
