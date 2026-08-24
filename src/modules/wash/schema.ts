import { pgTable, text } from "drizzle-orm/pg-core";
import { farms } from "@/modules/farm/schema";

export const washRecords = pgTable("wash_records", {
  id: text("id").primaryKey(),
  farmId: text("farm_id")
    .notNull()
    .references(() => farms.id),
  date: text("date").notNull(),
  method: text("method").notNull(),
  chemicalName: text("chemical_name").notNull(),
  mixRatio: text("mix_ratio"),
  nextDue: text("next_due"),
  animalScope: text("animal_scope").notNull(),
  notes: text("notes"),
  createdAt: text("created_at").notNull(),
});
