import { pgTable, text } from "drizzle-orm/pg-core";
import { farms } from "@/modules/farm/schema";
import { cows } from "@/modules/cattle/schema";

export const breedingEvents = pgTable("breeding_events", {
  id: text("id").primaryKey(),
  farmId: text("farm_id")
    .notNull()
    .references(() => farms.id),
  cowId: text("cow_id")
    .notNull()
    .references(() => cows.id),
  date: text("date").notNull(),
  kind: text("kind").notNull(),
  status: text("status").notNull().default("recorded"),
  sireTag: text("sire_tag"),
  expectedCalving: text("expected_calving"),
  dryOffDate: text("dry_off_date"),
  notes: text("notes"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});
