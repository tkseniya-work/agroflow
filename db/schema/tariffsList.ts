import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const tariffsList = sqliteTable("tariffsList", {
  id: text("id").notNull(),

  work_standard_tariff_id: text("work_standard_tariff_id").notNull().unique(),

  work_standard_id: text("work_standard_id"),

  tariff_type: integer("tariff_type"),
  tariff_discriminator: integer("tariff_discriminator"),

  overtime_ratio: real("overtime_ratio"),
  workload_type: integer("workload_type"),

  comment: text("comment"),

  technique_model_id: text("technique_model_id"),
  agricultural_machinery_model_id: text("agricultural_machinery_model_id"),

  unit_code: text("unit_code"),

  norm_value: real("norm_value"),
  norm_value_ha: real("norm_value_ha"),

  norm_fuel_value_per_hour: real("norm_fuel_value_per_hour"),
  norm_fuel_value_per_unit: real("norm_fuel_value_per_unit"),
  norm_fuel_per_ha: real("norm_fuel_per_ha"),

  tariff_ranked_parameters: text("tariff_ranked_parameters", {
    mode: "json",
  }).$type<{
    rank: {
      rank_id: string;
      number: number;
      ratio: number;
    };
    increasing_ratio: number | null;
  } | null>(),

  tariff_price_parameters: text("tariff_price_parameters", {
    mode: "json",
  }).$type<{
    shift: number;
    unit: number;
  } | null>(),

  is_deleted: integer("is_deleted", { mode: "boolean" }).default(false),

  deleted_at: text("deleted_at"),
});
