import { NextResponse } from "next/server";
import { registerFarm, registerSchema } from "@/modules/users/service";
import { createSession } from "@/lib/auth/session";
import { handleRouteError } from "@/lib/api";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = registerSchema.parse(body);
    const { userId } = await registerFarm(parsed);
    await createSession(userId);
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}
