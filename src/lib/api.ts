import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { requireSession } from "@/lib/auth/session";
import type { SessionUser } from "@/lib/types";

export function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function withAuth(
  handler: (session: SessionUser) => Promise<Response>,
) {
  try {
    const session = await requireSession();
    return await handler(session);
  } catch (error) {
    return handleRouteError(error);
  }
}

export function handleRouteError(error: unknown) {
  if (error instanceof Error && error.name === "UnauthorizedError") {
    return jsonError("Please sign in to continue", 401);
  }
  if (error instanceof ZodError) {
    const first = error.issues[0];
    return jsonError(first?.message ?? "Invalid input", 422);
  }
  if (error instanceof Error) {
    return jsonError(error.message, 400);
  }
  return jsonError("Something went wrong", 500);
}
