import { pgTable, text } from "drizzle-orm/pg-core";

export const farms = pgTable("farms", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  location: text("location"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});
