import { pgTable, text, uniqueIndex } from "drizzle-orm/pg-core";
import { farms } from "@/modules/farm/schema";

export const cows = pgTable(
  "cows",
  {
    id: text("id").primaryKey(),
    farmId: text("farm_id")
      .notNull()
      .references(() => farms.id),
    clientId: text("client_id").notNull(),
    tagNumber: text("tag_number").notNull(),
    name: text("name"),
    breed: text("breed"),
    gender: text("gender").notNull(),
    birthDate: text("birth_date"),
    motherTag: text("mother_tag"),
    status: text("status").notNull().default("active"),
    kraalId: text("kraal_id"),
    photoUrl: text("photo_url"),
    photoUrls: text("photo_urls"),
    notes: text("notes"),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
    deletedAt: text("deleted_at"),
  },
  (table) => [
    uniqueIndex("cows_client_id_idx").on(table.clientId),
    uniqueIndex("cows_farm_tag_idx").on(table.farmId, table.tagNumber),
  ],
);
