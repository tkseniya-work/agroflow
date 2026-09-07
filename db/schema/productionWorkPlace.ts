import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const productionWorkPlaces = sqliteTable("productionWorkPlace", {
  id: text("id").notNull().unique(),
  name: text("name"),
  comapny_id: text("comapny_id"),
  code: text("code"),
  //work_place_technique: techniqueStandars;
  is_deleted: integer("is_deleted"),
  deleted_at: integer("deleted_at"),
});

export const workplaceTypes = sqliteTable("workplaceType", {
  id: text("id").notNull(),
  description: text("description"),
  productionWorkPlaceId: text().references(() => productionWorkPlaces.id),
});

export const workplaceZones = sqliteTable("workplaceZone", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  productionWorkPlaceId: text().references(() => productionWorkPlaces.id),
});

export type ProductionWorkPlace = typeof productionWorkPlaces.$inferSelect;
export type WorkplaceType = typeof workplaceTypes.$inferSelect;
export type WorkplaceZone = typeof workplaceZones.$inferSelect;
