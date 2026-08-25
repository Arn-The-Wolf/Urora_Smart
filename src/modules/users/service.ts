import { eq } from "drizzle-orm";
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

function toFarm(row: typeof farms.$inferSelect): Farm {
  return {
    id: row.id,
    name: row.name,
    location: row.location,
    digestPhone: row.digestPhone ?? null,
    digestChannel: row.digestChannel ?? null,
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
