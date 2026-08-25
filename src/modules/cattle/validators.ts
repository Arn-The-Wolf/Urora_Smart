import { z } from "zod";

const emptyToNull = (value: unknown) => {
  if (typeof value !== "string") return value;
  const trimmed = value.trim();
  return trimmed.length === 0 ? null : trimmed;
};

const photoUrlField = z.preprocess(emptyToNull, z.string().trim().max(700_000).nullish());
const photoUrlsField = z
  .array(z.string().trim().min(1).max(700_000))
  .max(6)
  .optional()
  .default([]);

export const cowInputSchema = z.object({
  id: z.string().uuid().optional(),
  clientId: z.string().uuid().optional(),
  tagNumber: z.string().trim().min(1, "Tag number is required").max(40),
  name: z.preprocess(emptyToNull, z.string().trim().max(80).nullish()),
  breed: z.preprocess(emptyToNull, z.string().trim().max(80).nullish()),
  gender: z.enum(["female", "male"]),
  birthDate: z.preprocess(emptyToNull, z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullish()),
  motherTag: z.preprocess(emptyToNull, z.string().trim().max(40).nullish()),
  status: z.enum(["active", "sold", "dead"]).default("active"),
  photoUrl: photoUrlField,
  photoUrls: photoUrlsField,
  notes: z.preprocess(emptyToNull, z.string().trim().max(500).nullish()),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
});

export type CowInput = z.infer<typeof cowInputSchema>;
