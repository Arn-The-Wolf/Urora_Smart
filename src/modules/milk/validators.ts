import { z } from "zod";

const emptyToNull = (value: unknown) => {
  if (typeof value !== "string") return value;
  const trimmed = value.trim();
  return trimmed.length === 0 ? null : trimmed;
};

export const milkingInputSchema = z.object({
  id: z.string().uuid().optional(),
  clientId: z.string().uuid().optional(),
  cowId: z.string().uuid(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date is required"),
  session: z.enum(["morning", "midday", "evening"]),
  liters: z.coerce.number().positive("Liters must be greater than 0").max(50),
  notes: z.preprocess(emptyToNull, z.string().trim().max(500).nullish()),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
});

export type MilkingInput = z.infer<typeof milkingInputSchema>;
