import { and, eq, or } from "drizzle-orm";
import { z } from "zod";
import { farms } from "@/modules/farm/schema";
import { getDb } from "@/lib/db";
import { nowIso } from "@/lib/dates";
import { createId } from "@/lib/id";
import { hashPassword } from "@/lib/auth/password";
import { users } from "@/modules/users/schema";
import type { Farm } from "@/lib/types";

export const registerSchema = z.object({
  farmName: z.string().trim().min(2, "Farm name is required").max(80),
  location: z.string().trim().max(120).optional(),
  name: z.string().trim().min(2, "Your name is required").max(80),
  email: z.string().trim().email("Enter a valid email").toLowerCase(),
  password: z.string().min(8, "Password must be at least 8 characters").max(72),
});

export const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email").toLowerCase(),
  password: z.string().min(1, "Password is required"),
});

export const farmUpdateSchema = z.object({
  name: z.string().trim().min(2).max(80),
  location: z.string().trim().max(120).nullable(),
  digestPhone: z.string().trim().max(40).nullable().optional(),
  digestChannel: z.enum(["sms", "whatsapp", "none"]).nullable().optional(),
});

export const createFarmSchema = z.object({
  name: z.string().trim().min(2, "Farm name is required").max(80),
  location: z.string().trim().max(120).nullable().optional(),
});

function toFarm(row: typeof farms.$inferSelect): Farm {
  return {
    id: row.id,
    name: row.name,
    location: row.location,
    digestPhone: row.digestPhone ?? null,
    digestChannel: row.digestChannel ?? null,
    ownerId: row.ownerId ?? null,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export async function registerFarm(input: z.infer<typeof registerSchema>) {
  const parsed = registerSchema.parse(input);
  const db = await getDb();
  const existing = await db.select({ id: users.id }).from(users).where(eq(users.email, parsed.email)).limit(1);
  if (existing[0]) throw new Error("An account with this email already exists");

  const now = nowIso();
  const farmId = createId();
  const userId = createId();
  await db.insert(farms).values({
    id: farmId,
    name: parsed.farmName,
    location: parsed.location?.trim() ? parsed.location.trim() : null,
    ownerId: userId,
    createdAt: now,
    updatedAt: now,
  });
  await db.insert(users).values({
    id: userId,
    farmId,
    email: parsed.email,
    passwordHash: await hashPassword(parsed.password),
    name: parsed.name,
    role: "owner",
    createdAt: now,
    updatedAt: now,
  });
  return { userId, farmId };
}

export async function findUserByEmail(email: string) {
  const db = await getDb();
  const rows = await db.select().from(users).where(eq(users.email, email.toLowerCase())).limit(1);
  return rows[0] ?? null;
}

export async function updateFarm(farmId: string, input: z.infer<typeof farmUpdateSchema>): Promise<Farm> {
  const parsed = farmUpdateSchema.parse(input);
  const db = await getDb();
  const updatedAt = nowIso();
  await db
    .update(farms)
    .set({
      name: parsed.name,
      location: parsed.location,
      digestPhone: parsed.digestPhone ?? null,
      digestChannel: parsed.digestChannel ?? null,
      updatedAt,
    })
    .where(eq(farms.id, farmId));
  const rows = await db.select().from(farms).where(eq(farms.id, farmId)).limit(1);
  const row = rows[0];
  if (!row) throw new Error("Farm not found");
  return toFarm(row);
}

/** Owner creates another farm and switches into it. */
export async function createAdditionalFarm(ownerUserId: string, input: z.infer<typeof createFarmSchema>) {
  const parsed = createFarmSchema.parse(input);
  const db = await getDb();
  const userRows = await db.select().from(users).where(eq(users.id, ownerUserId)).limit(1);
  const user = userRows[0];
  if (!user || user.role !== "owner") throw new Error("Only a farm owner can create another farm");

  const now = nowIso();
  const farmId = createId();
  await db.insert(farms).values({
    id: farmId,
    name: parsed.name,
    location: parsed.location?.trim() ? parsed.location.trim() : null,
    ownerId: ownerUserId,
    createdAt: now,
    updatedAt: now,
  });
  await db.update(users).set({ farmId, updatedAt: now }).where(eq(users.id, ownerUserId));
  const rows = await db.select().from(farms).where(eq(farms.id, farmId)).limit(1);
  return toFarm(rows[0]!);
}

export async function listOwnedFarms(ownerUserId: string) {
  const db = await getDb();
  const userRows = await db.select().from(users).where(eq(users.id, ownerUserId)).limit(1);
  const user = userRows[0];
  if (!user) return [];
  const rows = await db
    .select()
    .from(farms)
    .where(or(eq(farms.ownerId, ownerUserId), eq(farms.id, user.farmId)));
  const unique = new Map(rows.map((row) => [row.id, toFarm(row)]));
  return [...unique.values()].sort((a, b) => a.name.localeCompare(b.name));
}

export async function switchActiveFarm(ownerUserId: string, farmId: string) {
  const db = await getDb();
  const userRows = await db.select().from(users).where(eq(users.id, ownerUserId)).limit(1);
  const user = userRows[0];
  if (!user || user.role !== "owner") throw new Error("Only a farm owner can switch farms");

  const farmRows = await db.select().from(farms).where(eq(farms.id, farmId)).limit(1);
  const farm = farmRows[0];
  if (!farm) throw new Error("Farm not found");

  const owns = farm.ownerId === ownerUserId;
  const legacyCurrent = !farm.ownerId && farm.id === user.farmId;
  if (!owns && !legacyCurrent) throw new Error("You can only switch into farms you own");

  if (!farm.ownerId) {
    await db.update(farms).set({ ownerId: ownerUserId, updatedAt: nowIso() }).where(eq(farms.id, farmId));
  }

  await db.update(users).set({ farmId, updatedAt: nowIso() }).where(eq(users.id, ownerUserId));
  return toFarm({ ...farm, ownerId: farm.ownerId ?? ownerUserId });
}
