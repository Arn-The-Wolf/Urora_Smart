import { pgTable, text } from "drizzle-orm/pg-core";
import { farms } from "@/modules/farm/schema";

export const farmTasks = pgTable("farm_tasks", {
  id: text("id").primaryKey(),
  farmId: text("farm_id")
    .notNull()
    .references(() => farms.id),
  title: text("title").notNull(),
  category: text("category").notNull(),
  dueDate: text("due_date").notNull(),
  dueTime: text("due_time"),
  cowId: text("cow_id"),
  status: text("status").notNull().default("open"),
  notes: text("notes"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});
