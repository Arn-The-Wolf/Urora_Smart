import { doublePrecision, pgTable, text } from "drizzle-orm/pg-core";
import { farms } from "@/modules/farm/schema";

export const stockItems = pgTable("stock_items", {
  id: text("id").primaryKey(),
  farmId: text("farm_id")
    .notNull()
    .references(() => farms.id),
  name: text("name").notNull(),
  category: text("category").notNull(),
  unit: text("unit").notNull(),
  quantity: doublePrecision("quantity").notNull(),
  reorderLevel: doublePrecision("reorder_level").notNull().default(0),
  notes: text("notes"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const stockMovements = pgTable("stock_movements", {
  id: text("id").primaryKey(),
  farmId: text("farm_id")
    .notNull()
    .references(() => farms.id),
  itemId: text("item_id")
    .notNull()
    .references(() => stockItems.id),
  kind: text("kind").notNull(),
  quantity: doublePrecision("quantity").notNull(),
  reason: text("reason"),
  date: text("date").notNull(),
  createdAt: text("created_at").notNull(),
});
