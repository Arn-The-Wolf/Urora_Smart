import { NextResponse } from "next/server";
import { loginSchema, findUserByEmail } from "@/modules/users/service";
import { verifyPassword } from "@/lib/auth/password";
import { createSession } from "@/lib/auth/session";
import { handleRouteError, jsonError } from "@/lib/api";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = loginSchema.parse(body);
    const user = await findUserByEmail(parsed.email);
    if (!user || !(await verifyPassword(parsed.password, user.passwordHash))) {
      return jsonError("Email or password is incorrect", 401);
    }
    await createSession(user.id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleRouteError(error);
  }
}
