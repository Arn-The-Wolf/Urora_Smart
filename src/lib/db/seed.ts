import { eq } from "drizzle-orm";
import type { NeonHttpDatabase } from "drizzle-orm/neon-http";
import type { PgliteDatabase } from "drizzle-orm/pglite";
import { farms, users, cows, milkingRecords, healthEvents, stockItems, washRecords, farmTasks, breedingEvents, expenses, milkSales, schema } from "@/lib/db/schema";
import { hashPassword } from "@/lib/auth/password";
import { addDays, nowIso, todayInKigali } from "@/lib/dates";
import { createId } from "@/lib/id";
import type { MilkSession } from "@/lib/types";

type SeedDb = PgliteDatabase<typeof schema> | NeonHttpDatabase<typeof schema>;

const DEMO_EMAIL = "farmer@urora.farm";
const LEGACY_DEMO_EMAIL = "farmer@inka.rw";

const herd = [
  {
    tagNumber: "RW-0142",
    name: "Nyiramuhire",
    breed: "Ankole",
    gender: "female" as const,
    birthDate: "2019-03-12",
    motherTag: null,
    status: "active" as const,
    notes: "Lead milker. Calm in the morning session.",
    base: 9.4,
  },
  {
    tagNumber: "RW-0208",
    name: "Gaju",
    breed: "Friesian",
    gender: "female" as const,
    birthDate: "2020-07-04",
    motherTag: null,
    status: "active" as const,
    notes: "Steady producer. Prefers midday milking first.",
    base: 12.1,
  },
  {
    tagNumber: "RW-0311",
    name: "Inyange",
    breed: "Jersey",
    gender: "female" as const,
    birthDate: "2021-01-22",
    motherTag: "RW-0142",
    status: "active" as const,
    notes: "Daughter of Nyiramuhire. Rich cream.",
    base: 7.8,
  },
  {
    tagNumber: "RW-0404",
    name: "Kirabo",
    breed: "Ankole-Friesian",
    gender: "female" as const,
    birthDate: "2020-11-09",
    motherTag: null,
    status: "active" as const,
    notes: null,
    base: 10.2,
  },
  {
    tagNumber: "RW-0519",
    name: "Izina",
    breed: "Friesian",
    gender: "female" as const,
    birthDate: "2022-04-18",
    motherTag: "RW-0208",
    status: "active" as const,
    notes: "Young. Still climbing.",
    base: 6.4,
  },
  {
    tagNumber: "RW-0622",
    name: "Sage",
    breed: "Ankole",
    gender: "female" as const,
    birthDate: "2018-09-01",
    motherTag: null,
    status: "active" as const,
    notes: "Ate less yesterday — watch the next milking.",
    base: 8.1,
  },
  {
    tagNumber: "RW-0701",
    name: "Intwari",
    breed: "Ankole",
    gender: "male" as const,
    birthDate: "2017-05-30",
    motherTag: null,
    status: "active" as const,
    notes: "Herd bull. No milking records.",
    base: 0,
  },
  {
    tagNumber: "RW-0888",
    name: "Murenzi",
    breed: "Jersey",
    gender: "female" as const,
    birthDate: "2016-02-14",
    motherTag: null,
    status: "sold" as const,
    notes: "Sold to a neighbour in Kayonza, March 2026.",
    base: 0,
  },
];

function jitter(base: number, day: number, session: MilkSession) {
  const sessionBias = session === "morning" ? 0.35 : session === "evening" ? 0.1 : -0.45;
  const wave = Math.sin((day + session.length) * 1.7) * 0.55;
  return Math.max(1.5, Math.round((base + sessionBias + wave) * 10) / 10);
}

export async function seedIfEmpty(db: SeedDb) {
  const existing = await db.select().from(users).where(eq(users.email, DEMO_EMAIL)).limit(1);
  if (!existing[0]) {
    const legacy = await db.select().from(users).where(eq(users.email, LEGACY_DEMO_EMAIL)).limit(1);
    if (legacy[0]) {
      await db.update(users).set({ email: DEMO_EMAIL, updatedAt: nowIso() }).where(eq(users.id, legacy[0].id));
    }
  }
  const demoUser = await db.select().from(users).where(eq(users.email, DEMO_EMAIL)).limit(1);
  if (demoUser[0] && (demoUser[0].role === "boss" || demoUser[0].role === "herder")) {
    await db
      .update(users)
      .set({ role: demoUser[0].role === "herder" ? "operator" : "owner", updatedAt: nowIso() })
      .where(eq(users.id, demoUser[0].id));
  }
  let farmId = demoUser[0]?.farmId;
  let cowIds: { id: string; gender: string; status: string; tagNumber: string }[] = [];

  if (!farmId) {
    const now = nowIso();
    farmId = createId();
    const userId = createId();
    const passwordHash = await hashPassword("farm1234");

    await db.insert(farms).values({
      id: farmId,
      name: "Nyagatare Hills Dairy",
      location: "Nyagatare, Eastern Province, Rwanda",
      createdAt: now,
      updatedAt: now,
    });

    await db.insert(users).values({
      id: userId,
      farmId,
      email: DEMO_EMAIL,
      passwordHash,
      name: "Jean Uwase",
      role: "owner",
      createdAt: now,
      updatedAt: now,
    });

    await db.insert(users).values({
      id: createId(),
      farmId,
      email: "operator@urora.farm",
      passwordHash,
      name: "Claudine Mukamana",
      role: "operator",
      createdAt: now,
      updatedAt: now,
    });

    const created: { id: string; gender: string; status: string; tagNumber: string; base: number }[] = [];
    for (const cow of herd) {
      const id = createId();
      created.push({ id, gender: cow.gender, status: cow.status, tagNumber: cow.tagNumber, base: cow.base });
      await db.insert(cows).values({
        id,
        farmId,
        clientId: createId(),
        tagNumber: cow.tagNumber,
        name: cow.name,
        breed: cow.breed,
        gender: cow.gender,
        birthDate: cow.birthDate,
        motherTag: cow.motherTag,
        status: cow.status,
        kraalId: null,
        photoUrl: null,
        photoUrls: null,
        notes: cow.notes,
        createdAt: now,
        updatedAt: now,
        deletedAt: null,
      });
    }

    const today = todayInKigali();
    const sessions: MilkSession[] = ["morning", "midday", "evening"];
    for (let dayOffset = 9; dayOffset >= 0; dayOffset -= 1) {
      const date = addDays(today, -dayOffset);
      for (const [index, cow] of created.entries()) {
        if (cow.gender !== "female" || cow.status !== "active") continue;
        for (const session of sessions) {
          if (session === "midday" && index % 3 === 0) continue;
          const liters = jitter(cow.base / (session === "morning" ? 1.7 : session === "evening" ? 2.1 : 3.2), dayOffset, session);
          await db.insert(milkingRecords).values({
            id: createId(),
            farmId,
            clientId: createId(),
            cowId: cow.id,
            date,
            session,
            liters,
            notes: dayOffset === 1 && index === 5 && session === "morning" ? "Less than usual, seemed unwell" : null,
            createdAt: now,
            updatedAt: now,
            deletedAt: null,
          });
        }
      }
    }
    cowIds = created;
  } else {
    const existingCows = await db.select().from(cows).where(eq(cows.farmId, farmId));
    cowIds = existingCows.map((cow) => ({ id: cow.id, gender: cow.gender, status: cow.status, tagNumber: cow.tagNumber }));
  }

  await seedOperations(db, farmId, cowIds);
  await ensureOperatorUser(db, farmId);
}

async function ensureOperatorUser(db: SeedDb, farmId: string) {
  const existing = await db.select().from(users).where(eq(users.email, "operator@urora.farm")).limit(1);
  if (existing[0]) return;
  const now = nowIso();
  await db.insert(users).values({
    id: createId(),
    farmId,
    email: "operator@urora.farm",
    passwordHash: await hashPassword("farm1234"),
    name: "Claudine Mukamana",
    role: "operator",
    createdAt: now,
    updatedAt: now,
  });
}

async function seedOperations(
  db: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    select: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    insert: any;
  },
  farmId: string,
  cowIds: { id: string; tagNumber: string }[],
) {
  const existingStock = await db.select({ id: stockItems.id }).from(stockItems).where(eq(stockItems.farmId, farmId)).limit(1);
  if (existingStock[0]) return;

  const now = nowIso();
  const today = todayInKigali();
  const sage = cowIds.find((cow) => cow.tagNumber === "RW-0622");
  const imena = cowIds.find((cow) => cow.tagNumber === "RW-0208");

  const catalog = [
    { name: "Amitraz 12.5%", category: "acaricide", unit: "L", quantity: 4, reorderLevel: 1, batchCode: "AM-0826", expiresOn: addDays(today, 120), notes: "Tick control. Mix 1:500 in spray water." },
    { name: "Oxytetracycline 20%", category: "medicine", unit: "vials", quantity: 12, reorderLevel: 4, batchCode: "OXY-441", expiresOn: addDays(today, 18), notes: "Injectable antibiotic. Milk withhold usually 3–7 days." },
    { name: "Ivermectin", category: "medicine", unit: "bottles", quantity: 6, reorderLevel: 2, batchCode: "IVM-119", expiresOn: addDays(today, -5), notes: "Dewormer / parasite control." },
    { name: "Salt blocks", category: "salt", unit: "blocks", quantity: 8, reorderLevel: 3, batchCode: null, expiresOn: null, notes: "Lick blocks at the water trough." },
    { name: "Mineral lick", category: "mineral", unit: "kg", quantity: 25, reorderLevel: 8, batchCode: null, expiresOn: null, notes: "Phosphorus and calcium mix." },
    { name: "Dairy meal", category: "feed", unit: "kg", quantity: 120, reorderLevel: 40, batchCode: null, expiresOn: null, notes: "Morning concentrate for milkers." },
    { name: "Bran", category: "feed", unit: "kg", quantity: 80, reorderLevel: 25, batchCode: null, expiresOn: null, notes: "Wheat bran for mixing." },
    { name: "Hay bales", category: "feed", unit: "bales", quantity: 18, reorderLevel: 6, batchCode: null, expiresOn: null, notes: "Dry-season fodder." },
    { name: "Milking disinfectant", category: "disinfectant", unit: "L", quantity: 5, reorderLevel: 2, batchCode: "DIP-77", expiresOn: addDays(today, 60), notes: "Teat dip after milking." },
    { name: "Wound spray", category: "medicine", unit: "cans", quantity: 3, reorderLevel: 1, batchCode: "WS-09", expiresOn: addDays(today, 200), notes: "Cuts and tick wounds." },
  ] as const;

  for (const item of catalog) {
    await db.insert(stockItems).values({
      id: createId(),
      farmId,
      name: item.name,
      category: item.category,
      unit: item.unit,
      quantity: item.quantity,
      reorderLevel: item.reorderLevel,
      batchCode: item.batchCode,
      expiresOn: item.expiresOn,
      notes: item.notes,
      createdAt: now,
      updatedAt: now,
    });
  }

  if (sage) {
    await db.insert(healthEvents).values({
      id: createId(),
      farmId,
      cowId: sage.id,
      date: addDays(today, -1),
      kind: "illness",
      status: "open",
      diagnosis: "Off-feed, low milk, likely early mastitis",
      treatment: "Isolate from the milking line until the evening check. Strip the quarter.",
      medicineName: "Oxytetracycline 20%",
      isolated: 1,
      milkWithholdUntil: addDays(today, 4),
      photoUrl: null,
      photoUrls: null,
      notes: "Watched after yesterday's weak morning milking. Milk withhold set after antibiotic.",
      createdAt: now,
      updatedAt: now,
    });
  }

  if (imena) {
    await db.insert(healthEvents).values({
      id: createId(),
      farmId,
      cowId: imena.id,
      date: addDays(today, 1),
      kind: "vaccination",
      status: "due",
      diagnosis: null,
      treatment: "LSD booster",
      medicineName: null,
      isolated: 0,
      milkWithholdUntil: null,
      photoUrl: null,
      photoUrls: null,
      notes: "Annual lumpy skin disease booster.",
      createdAt: now,
      updatedAt: now,
    });

    await db.insert(breedingEvents).values({
      id: createId(),
      farmId,
      cowId: imena.id,
      date: addDays(today, -90),
      kind: "ai",
      status: "confirmed",
      sireTag: "BULL-FRIES-12",
      expectedCalving: addDays(today, 190),
      dryOffDate: addDays(today, 130),
      notes: "Second AI — confirmed pregnant at 60-day check.",
      createdAt: now,
      updatedAt: now,
    });
  }

  await db.insert(expenses).values({
    id: createId(),
    farmId,
    date: addDays(today, -2),
    category: "feed",
    amount: 85000,
    vendor: "Nyagatare agro store",
    notes: "Dairy meal 2 sacks",
    recordedBy: "Jean Uwase",
    createdAt: now,
  });

  await db.insert(milkSales).values({
    id: createId(),
    farmId,
    date: addDays(today, -1),
    liters: 62,
    pricePerLiter: 420,
    totalAmount: 26040,
    buyer: "Nyagatare dairy co-op",
    notes: "Morning collection",
    recordedBy: "Jean Uwase",
    createdAt: now,
  });

  await db.insert(washRecords).values({
    id: createId(),
    farmId,
    date: addDays(today, -6),
    method: "spray",
    chemicalName: "Amitraz 12.5%",
    mixRatio: "1:500 in treated spray water",
    nextDue: today,
    animalScope: "herd",
    notes: "Whole-herd tick spray. Mix chemical in a dedicated drum, never in the drinking trough.",
    createdAt: now,
  });

  const tasks = [
    { title: "Evening milking", category: "milking", dueTime: "17:00", notes: "Log every lactating cow." },
    { title: "Tick spray (amitraz water)", category: "wash", dueTime: "09:00", notes: "Treat spray water, keep animals out of the drinking trough." },
    { title: "Check Sage in isolation", category: "health", dueTime: "07:30", notes: "Temperature, appetite, and the affected quarter." },
    { title: "Put out salt blocks", category: "feed", dueTime: "08:00", notes: "Two blocks near the water trough." },
    { title: "Count oxytetracycline vials", category: "stock", dueTime: "16:00", notes: "Reorder before the box hits 4." },
  ] as const;

  for (const task of tasks) {
    await db.insert(farmTasks).values({
      id: createId(),
      farmId,
      title: task.title,
      category: task.category,
      dueDate: today,
      dueTime: task.dueTime,
      cowId: task.category === "health" && sage ? sage.id : null,
      status: "open",
      notes: task.notes,
      createdAt: now,
      updatedAt: now,
    });
  }
}
