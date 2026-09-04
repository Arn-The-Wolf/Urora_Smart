import { NextResponse } from "next/server";
import { handleRouteError, withAuth, jsonError } from "@/lib/api";
import { createAdditionalFarm, createFarmSchema, listOwnedFarms, switchActiveFarm } from "@/modules/users/service";
import { canManageFarm } from "@/lib/roles";

export async function GET() {
  return withAuth(async (session) => {
    if (!canManageFarm(session.user.role)) {
      return jsonError("Only the farm owner can list owned farms", 403);
    }
    const farms = await listOwnedFarms(session.user.id);
    return NextResponse.json({ farms, activeFarmId: session.farm.id });
  }, ["owner"]);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    return withAuth(async (session) => {
      if (!canManageFarm(session.user.role)) {
        return jsonError("Only the farm owner can create another farm", 403);
      }
      if (body?.action === "switch") {
        if (!body.farmId) return jsonError("Farm id required", 400);
        const farm = await switchActiveFarm(session.user.id, String(body.farmId));
        return NextResponse.json({ farm });
      }
      const parsed = createFarmSchema.parse(body);
      const farm = await createAdditionalFarm(session.user.id, parsed);
      return NextResponse.json({ farm }, { status: 201 });
    }, ["owner"]);
  } catch (error) {
    return handleRouteError(error);
  }
}
