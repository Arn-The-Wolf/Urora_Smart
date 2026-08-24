import { cookies } from "next/headers";
import { and, eq, gt } from "drizzle-orm";
import { sessions, users } from "@/modules/users/schema";
import { farms } from "@/modules/farm/schema";
import { getDb } from "@/lib/db";
import { nowIso } from "@/lib/dates";
import { createId } from "@/lib/id";
import type { Farm, SessionUser, User, UserRole } from "@/lib/types";
import { normalizeRole } from "@/lib/roles";

export const SESSION_COOKIE = "urora_session";
const SESSION_DAYS = 30;

function toUser(row: typeof users.$inferSelect): User {
  return {
    id: row.id,
    farmId: row.farmId,
    email: row.email,
    name: row.name,
    role: normalizeRole(row.role),
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function toFarm(row: typeof farms.$inferSelect): Farm {
  return {
    id: row.id,
    name: row.name,
    location: row.location,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export async function createSession(userId: string) {
  const db = await getDb();
  const id = createId();
  const createdAt = nowIso();
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000).toISOString();
  await db.insert(sessions).values({ id, userId, expiresAt, createdAt });
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, id, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: new Date(expiresAt),
  });
}

export async function clearSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (token) {
    const db = await getDb();
    await db.delete(sessions).where(eq(sessions.id, token));
  }
  cookieStore.set(SESSION_COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
}

export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const db = await getDb();
  const now = new Date().toISOString();
  const rows = await db
    .select({ user: users, farm: farms, session: sessions })
    .from(sessions)
    .innerJoin(users, eq(sessions.userId, users.id))
    .innerJoin(farms, eq(users.farmId, farms.id))
    .where(and(eq(sessions.id, token), gt(sessions.expiresAt, now)))
    .limit(1);
  const row = rows[0];
  if (!row) return null;
  return { user: toUser(row.user), farm: toFarm(row.farm) };
}

export async function requireSession(): Promise<SessionUser> {
  const session = await getSession();
  if (!session) {
    const error = new Error("Unauthorized");
    error.name = "UnauthorizedError";
    throw error;
  }
  return session;
}

export async function requireRole(...roles: UserRole[]): Promise<SessionUser> {
  const session = await requireSession();
  if (!roles.includes(session.user.role)) {
    const error = new Error("You do not have permission for this action");
    error.name = "ForbiddenError";
    throw error;
  }
  return session;
}
