import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const unitOfMeasures = sqliteTable("unitOfMeasure", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  code: text("code"),
  name: text("name"),
  short_name: text("short_name"),
});

export type UnitOfMeasure = typeof unitOfMeasures.$inferSelect;
