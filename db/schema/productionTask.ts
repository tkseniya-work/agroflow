import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const productionTasks = sqliteTable("productionTask", {
  id: text("id").notNull(),
  season_year: integer("season_year"),
  comment: text("comment"),
  date_start: text("date_start"),
  calculated_date_end: text("calculated_date_end"),
});

export const lastModifiedBys = sqliteTable("lastModifiedBy", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  user_id: text("user_id"),
  fullname: text("fullname"),
  productionTaskId: text().references(() => productionTasks.id),
});

export const lastCreatedBys = sqliteTable("lastCreatedBy", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  user_id: text("user_id"),
  fullname: text("fullname"),
  productionTaskId: text().references(() => productionTasks.id),
});

export const status = sqliteTable("status", {
  id: text("id"),
  description: text("description"),
  productionTaskId: text().references(() => productionTasks.id),
});

export type ProductionTask = typeof productionTasks.$inferSelect;
export type LastModifiedBys = typeof lastModifiedBys.$inferSelect;
export type LastCreatedBys = typeof lastCreatedBys.$inferSelect;
export type Status = typeof status.$inferSelect;
