import { integer, pgTable, text } from "drizzle-orm/pg-core";
import { farms } from "@/modules/farm/schema";
import { cows } from "@/modules/cattle/schema";

export const healthEvents = pgTable("health_events", {
  id: text("id").primaryKey(),
  farmId: text("farm_id")
    .notNull()
    .references(() => farms.id),
  cowId: text("cow_id")
    .notNull()
    .references(() => cows.id),
  date: text("date").notNull(),
  kind: text("kind").notNull(),
  status: text("status").notNull(),
  diagnosis: text("diagnosis"),
  treatment: text("treatment"),
  medicineName: text("medicine_name"),
  isolated: integer("isolated").notNull().default(0),
  milkWithholdUntil: text("milk_withhold_until"),
  photoUrl: text("photo_url"),
  notes: text("notes"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});
