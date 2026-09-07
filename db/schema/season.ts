import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { workplaceZones } from "./productionWorkPlace";

export const taskFields = sqliteTable("taskField", {
  id: text("id").notNull(),
  id_1c: text("id_1c"),
  season: integer("season"),
  number: text("number"),
  name: text("name"),
  area: integer("area"),
  map_area: integer("map_area"),
  srid: integer("srid"),
  ground_type: integer("ground_type"),
});

export const seasonFields = sqliteTable("seasonFields", {
  id: text("id").notNull(),
  company_id: text("company_id"),
  id_1c: text("id_1c"),
  number: text("number"),
  name: text("name"),
  area: integer("area"),
  map_area: integer("map_area"),
  srid: integer("srid"),
  ground_type: integer("ground_type"),
  origin_field_id: text("origin_field_id"),
  taskFieldsId: text().references(() => taskFields.id),
});

export const coordinates = sqliteTable("coordinates", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  type: text("type").notNull(),
  coordinates: text("coordinates").$type<[number, number][][]>(),
  workplaceZoneId: text().references(() => workplaceZones.id),
  seasonFieldsId: text().references(() => seasonFields.id),
  taskFieldsId: text().references(() => taskFields.id),
});

export const croprotations = sqliteTable("Croprotation", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  clean_fallow: integer("clean_fallow", { mode: "boolean" }),
  seasonFieldsId: text().references(() => seasonFields.id),
});

export const crop = sqliteTable("crop", {
  id: text("id").notNull(),
  name: text("name"),
  id_1c: text("id_1c"),
  color: text("color"),
  croprotationsId: text().references(() => croprotations.id),
});

export type TaskField = typeof taskFields.$inferSelect;
export type SeasonFields = typeof seasonFields.$inferSelect;
export type Coordinates = typeof coordinates.$inferSelect;
export type Croprotations = typeof croprotations.$inferSelect;
export type Crop = typeof crop.$inferSelect;
