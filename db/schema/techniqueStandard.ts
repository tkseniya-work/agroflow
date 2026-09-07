import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const techniqueStandards = sqliteTable("techniqueStandard", {
  id: text("id").notNull().unique(),
  name: text("name"),
  company_id: text("company_id"),
  state_number: text("state_number"),
  id_1c: text("id_1c"),
  wianlon_id: text("wianlon_id"),
  autograph_id: text("autograph_id"),
  has_monitoring: integer("has_monitoring", { mode: "boolean" }),
  fuel_tank_capacity: integer("fuel_tank_capacity"),
  engine_power: integer("engine_power"),
  purchase_price: integer("purchase_price"),
  residual_value: integer("residual_value"),
  photo_link: text("photo_link"),
  icon_link: text("icon_link"),
  track_color: text("track_color"),
});

export const machineryModels = sqliteTable("machineryModel", {
  id: text("id").notNull().unique(),
  name: text("name"),
  power: integer("power"),
  fuel_consumption: integer("fuel_consumption"),
  external_id: text("external_id"),
  company_id: text("company_id"),
  source: text("source"),
  fuel_type: integer("fuel_type"),
  fuel_consumption_per_distance: integer("fuel_consumption_per_distance"),
  load_capacity: integer("load_capacity"),
  type: integer("type"),
  techniqueStandardId: text().references(() => techniqueStandards.id),
});

export type TechniqueStandard = typeof techniqueStandards.$inferSelect;
export type MachineryModel = typeof machineryModels.$inferSelect;
