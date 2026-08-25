import { doublePrecision, pgTable, text } from "drizzle-orm/pg-core";
import { farms } from "@/modules/farm/schema";

export const expenses = pgTable("expenses", {
  id: text("id").primaryKey(),
  farmId: text("farm_id")
    .notNull()
    .references(() => farms.id),
  date: text("date").notNull(),
  category: text("category").notNull(),
  amount: doublePrecision("amount").notNull(),
  vendor: text("vendor"),
  notes: text("notes"),
  recordedBy: text("recorded_by"),
  createdAt: text("created_at").notNull(),
});

export const milkSales = pgTable("milk_sales", {
  id: text("id").primaryKey(),
  farmId: text("farm_id")
    .notNull()
    .references(() => farms.id),
  date: text("date").notNull(),
  liters: doublePrecision("liters").notNull(),
  pricePerLiter: doublePrecision("price_per_liter").notNull(),
  totalAmount: doublePrecision("total_amount").notNull(),
  buyer: text("buyer"),
  notes: text("notes"),
  recordedBy: text("recorded_by"),
  createdAt: text("created_at").notNull(),
});
