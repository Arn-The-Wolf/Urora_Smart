import { NextResponse } from "next/server";
import { loginSchema, findUserByEmail } from "@/modules/users/service";
import { verifyPassword } from "@/lib/auth/password";
import { createSession } from "@/lib/auth/session";
import { handleRouteError, jsonError } from "@/lib/api";
import {
  assertLoginAllowed,
  getClientIp,
  recordLoginFailure,
  recordLoginSuccess,
} from "@/lib/auth/rate-limit";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = loginSchema.parse(body);
    const ip = getClientIp(request);
    const allowed = assertLoginAllowed(ip, parsed.email);
    if (!allowed.ok) {
      return NextResponse.json(
        { error: `Too many failed sign-in attempts. Try again in ${allowed.retryAfterSec} seconds.` },
        { status: 429, headers: { "Retry-After": String(allowed.retryAfterSec) } },
      );
    }

    const user = await findUserByEmail(parsed.email);
    if (!user || !(await verifyPassword(parsed.password, user.passwordHash))) {
      recordLoginFailure(ip, parsed.email);
      return jsonError("Email or password is incorrect", 401);
    }

    recordLoginSuccess(ip, parsed.email);
    await createSession(user.id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleRouteError(error);
  }
}
