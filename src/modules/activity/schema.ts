import { pgTable, text } from "drizzle-orm/pg-core";
import { farms } from "@/modules/farm/schema";

export const activityLog = pgTable("activity_log", {
  id: text("id").primaryKey(),
  farmId: text("farm_id")
    .notNull()
    .references(() => farms.id),
  userId: text("user_id"),
  userName: text("user_name"),
  action: text("action").notNull(),
  entity: text("entity").notNull(),
  entityId: text("entity_id"),
  detail: text("detail"),
  createdAt: text("created_at").notNull(),
});
