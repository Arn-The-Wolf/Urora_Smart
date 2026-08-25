import { pgTable, text } from "drizzle-orm/pg-core";
import { farms } from "@/modules/farm/schema";

export const kraals = pgTable("kraals", {
  id: text("id").primaryKey(),
  farmId: text("farm_id")
    .notNull()
    .references(() => farms.id),
  name: text("name").notNull(),
  notes: text("notes"),
  createdAt: text("created_at").notNull(),
});
