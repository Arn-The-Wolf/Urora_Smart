import { doublePrecision, pgTable, text, uniqueIndex } from "drizzle-orm/pg-core";
import { farms } from "@/modules/farm/schema";
import { cows } from "@/modules/cattle/schema";

export const milkingRecords = pgTable(
  "milking_records",
  {
    id: text("id").primaryKey(),
    farmId: text("farm_id")
      .notNull()
      .references(() => farms.id),
    clientId: text("client_id").notNull(),
    cowId: text("cow_id")
      .notNull()
      .references(() => cows.id),
    date: text("date").notNull(),
    session: text("session").notNull(),
    liters: doublePrecision("liters").notNull(),
    notes: text("notes"),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
    deletedAt: text("deleted_at"),
  },
  (table) => [
    uniqueIndex("milk_client_id_idx").on(table.clientId),
    uniqueIndex("milk_cow_date_session_idx").on(table.cowId, table.date, table.session),
  ],
);