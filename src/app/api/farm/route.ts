import { NextResponse } from "next/server";
import { handleRouteError, withAuth } from "@/lib/api";
import { farmUpdateSchema, updateFarm } from "@/modules/users/service";

export async function GET() {
  return withAuth(async (session) => NextResponse.json({ farm: session.farm }));
}

export async function PUT(request: Request) {
  try {
    const body = farmUpdateSchema.parse(await request.json());
    return withAuth(async (session) => {
      const farm = await updateFarm(session.farm.id, body);
      return NextResponse.json({ farm });
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
