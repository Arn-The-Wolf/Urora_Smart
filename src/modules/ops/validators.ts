import { z } from "zod";

const emptyToNull = (value: unknown) => {
  if (typeof value !== "string") return value;
  const trimmed = value.trim();
  return trimmed.length === 0 ? null : trimmed;
};

export const healthInputSchema = z.object({
  cowId: z.string().min(1, "Choose an animal"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  kind: z.enum(["illness", "vaccination", "deworming", "treatment", "vet_check", "injury"]),
  status: z.enum(["open", "recovering", "resolved", "due", "completed"]).default("open"),
  diagnosis: z.preprocess(emptyToNull, z.string().trim().max(160).nullish()),
  treatment: z.preprocess(emptyToNull, z.string().trim().max(240).nullish()),
  medicineName: z.preprocess(emptyToNull, z.string().trim().max(120).nullish()),
  isolated: z.coerce.boolean().optional(),
  milkWithholdUntil: z.preprocess(emptyToNull, z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullish()),
  photoUrl: z.preprocess(emptyToNull, z.string().trim().max(700_000).nullish()),
  notes: z.preprocess(emptyToNull, z.string().trim().max(500).nullish()),
});

export const breedingInputSchema = z.object({
  cowId: z.string().min(1, "Choose an animal"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  kind: z.enum(["heat", "ai", "natural_service", "pregnancy_check", "calving", "dry_off"]),
  status: z.enum(["recorded", "confirmed", "failed", "completed"]).default("recorded"),
  sireTag: z.preprocess(emptyToNull, z.string().trim().max(40).nullish()),
  expectedCalving: z.preprocess(emptyToNull, z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullish()),
  dryOffDate: z.preprocess(emptyToNull, z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullish()),
  notes: z.preprocess(emptyToNull, z.string().trim().max(400).nullish()),
});

export const expenseInputSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  category: z.enum(["feed", "medicine", "vet", "labor", "transport", "equipment", "utilities", "other"]),
  amount: z.coerce.number().positive(),
  vendor: z.preprocess(emptyToNull, z.string().trim().max(120).nullish()),
  notes: z.preprocess(emptyToNull, z.string().trim().max(400).nullish()),
});

export const milkSaleInputSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  liters: z.coerce.number().positive().max(5000),
  pricePerLiter: z.coerce.number().positive().max(10000),
  buyer: z.preprocess(emptyToNull, z.string().trim().max(120).nullish()),
  notes: z.preprocess(emptyToNull, z.string().trim().max(400).nullish()),
});

export const stockInputSchema = z.object({
  name: z.string().trim().min(1).max(80),
  category: z.enum(["medicine", "salt", "mineral", "acaricide", "disinfectant", "feed", "feed_supplement", "other"]),
  unit: z.string().trim().min(1).max(20),
  quantity: z.coerce.number().min(0),
  reorderLevel: z.coerce.number().min(0).default(0),
  batchCode: z.preprocess(emptyToNull, z.string().trim().max(60).nullish()),
  expiresOn: z.preprocess(emptyToNull, z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullish()),
  notes: z.preprocess(emptyToNull, z.string().trim().max(240).nullish()),
});

export const stockMoveSchema = z.object({
  itemId: z.string().min(1),
  kind: z.enum(["in", "out"]),
  quantity: z.coerce.number().positive(),
  reason: z.preprocess(emptyToNull, z.string().trim().max(160).nullish()),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export const washInputSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  method: z.enum(["spray", "dip", "hand_wash", "footbath"]),
  chemicalName: z.string().trim().min(1).max(80),
  mixRatio: z.preprocess(emptyToNull, z.string().trim().max(80).nullish()),
  nextDue: z.preprocess(emptyToNull, z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullish()),
  animalScope: z.string().trim().min(1).max(200).default("herd"),
  notes: z.preprocess(emptyToNull, z.string().trim().max(400).nullish()),
});

export const taskInputSchema = z.object({
  title: z.string().trim().min(2).max(120),
  category: z.enum(["milking", "health", "wash", "feed", "stock", "routine"]),
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  dueTime: z.preprocess(emptyToNull, z.string().trim().max(8).nullish()),
  cowId: z.preprocess(emptyToNull, z.string().nullish()),
  notes: z.preprocess(emptyToNull, z.string().trim().max(240).nullish()),
});
