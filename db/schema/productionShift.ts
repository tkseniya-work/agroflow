import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const shifts = sqliteTable("shift", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  production_shift_id: text("production_shift_id"),
  employee_id: text("employee_id"),
  date: text("date"),
  open_at: text("open_at"),
  closed_at: text("closed_at"),
  qr_code_scanned_at: text("qr_code_scanned_at"),
  exp_bonus_amount: integer("exp_bonus_amount"),
  overtime_bonus_amount: integer("overtime_bonus_amount"),
  fixed_bonus_amount: integer("fixed_bonus_amount"),
  output_value_total: real("output_value_total"),
  parts_duration: real("parts_duration"),
  open_at_parts_time: text("open_at_parts_time"),
  closed_at_parts_time: text("closed_at_parts_time"),
});

export const shiftTypes = sqliteTable("shiftType", {
  id: integer("id"),
  description: text("description"),
  shift_id: text("shift_id").references(() => shifts.id),
});

export const fieldTasks = sqliteTable("fieldTask", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  production_task_id: text("production_task_id"),
  work_standard_id: text("work_standard_id"),
  comment: text("comment"),
  season_year: integer("season_year"),
  date_start: text("date_start"),
  calculated_date_end: text("calculated_date_end"),
  status_id: integer("status_id"),
  status_description: text("status_description"),
  payment_value: integer("payment_value"),
  exp_bonus_amount: integer("exp_bonus_amount"),
  overtime_bonus_amount: integer("overtime_bonus_amount"),
  output_value_total: real("output_value_total"),
  parts_duration: real("parts_duration"),
  open_at_parts_time: text("open_at_parts_time"),
  closed_at_parts_time: text("closed_at_parts_time"),
  shift_id: text("shift_id").references(() => shifts.id),
});

export const stationaryTasks = sqliteTable("stationaryTask", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  production_task_id: text("production_task_id"),
  work_standard_id: text("work_standard_id"),
  comment: text("comment"),
  season_year: integer("season_year"),
  date_start: text("date_start"),
  calculated_date_end: text("calculated_date_end"),
  work_place_id: text("work_place_id"),
  exp_bonus_amount: integer("exp_bonus_amount"),
  open_at_parts_time: text("open_at_parts_time"),
  closed_at_parts_time: text("closed_at_parts_time"),
  shift_id: text("shift_id").references(() => shifts.id),
});

export const transportTasks = sqliteTable("transportTask", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  production_task_id: text("production_task_id"),
  work_standard_id: text("work_standard_id"),
  comment: text("comment"),
  season_year: integer("season_year"),
  date_start: text("date_start"),
  calculated_date_end: text("calculated_date_end"),
  payment_value: integer("payment_value"),
  exp_bonus_amount: integer("exp_bonus_amount"),
  open_at_parts_time: text("open_at_parts_time"),
  closed_at_parts_time: text("closed_at_parts_time"),
  shift_id: text("shift_id").references(() => shifts.id),
});

export const productsTransportationTasks = sqliteTable(
  "productsTransportationTask",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    production_task_id: text("production_task_id"),
    work_standard_id: text("work_standard_id"),
    comment: text("comment"),
    season_year: integer("season_year"),
    date_start: text("date_start"),
    calculated_date_end: text("calculated_date_end"),
    payment_value: integer("payment_value"),
    exp_bonus_amount: integer("exp_bonus_amount"),
    open_at_parts_time: text("open_at_parts_time"),
    closed_at_parts_time: text("closed_at_parts_time"),
    shift_id: text("shift_id").references(() => shifts.id),
  },
);

export const payments = sqliteTable("payments", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  value: integer("value"),
  exp_bonus_amount: integer("exp_bonus_amount"),
  overtime_bonus_amount: integer("overtime_bonus_amount"),
  fixed_bonus_amount: integer("fixed_bonus_amount"),
  stationary_tasks_id: text("stationary_tasks_id").references(
    () => stationaryTasks.id,
  ),
  field_tasks_id: text("field_tasks_id").references(() => fieldTasks.id),
  transport_tasks: text("transport_tasks_id").references(
    () => transportTasks.id,
  ),
  products_transportation_tasks_id: text(
    "products_transportation_tasks_id",
  ).references(() => productsTransportationTasks.id),
});

export const aggregates = sqliteTable("aggregate", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  technique_id: text("technique_id"),
  agricultural_machinery_id: text("agricultural_machinery_id"),
  output_value_total: real("output_value_total"),
  parts_duration: real("parts_duration"),
  open_at_parts_time: text("open_at_parts_time"),
  closed_at_parts_time: text("closed_at_parts_time"),
  fuel_per_100_km: text("fuel_per_100_km"),
  field_task_id: text("field_task_id").references(() => fieldTasks.id),
  transport_tasks_id: text("transport_tasks_id").references(
    () => transportTasks.id,
  ),
  products_transportation_tasks_id: text(
    "products_transportation_tasks_id",
  ).references(() => transportTasks.id),
});

export const outputs = sqliteTable("output", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  output_value_total: real("output_value_total"),
  parts_duration: real("parts_duration"),
  open_at_parts_time: text("open_at_parts_time"),
  closed_at_parts_time: text("closed_at_parts_time"),
  aggregate_id: text("aggregate_id").references(() => aggregates.id),
});

export const fields = sqliteTable("field", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  task_field_id: text("task_field_id"),
  task_field_name: text("task_field_name"),
  area_fact: real("area_fact"),
  transported_weight: real("transported_weight"),
  threshed: real("threshed"),
  number_of_bins: integer("number_of_bins"),
  number_of_trips: integer("number_of_trips"),
  long_stops_duration: real("long_stops_duration"),
  small_stops_duration: real("small_stops_duration"),
  max_speed: real("max_speed"),
  avg_speed: real("avg_speed"),
  output_value_total: real("output_value_total"),
  parts_duration: real("parts_duration"),
  open_at_parts_time: text("open_at_parts_time"),
  closed_at_parts_time: text("closed_at_parts_time"),
  fuel_per_ha: text("fuel_per_ha"),
  output_id: text("output_id").references(() => outputs.id),
});

export const tariffPriceParameters = sqliteTable("tariffPriceParameter", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  shift: integer("shift"),
  unit: real("unit"),
  tariff_id: text("tariff_id").references(() => tariff.id),
});

export const tariffs = sqliteTable("tariffs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  area_fact: real("area_fact"),
  exp_bonus_amount_total: integer("exp_bonus_amount_total"),
  overtime_bonus_amount_total: integer("overtime_bonus_amount_total"),
  long_stops_duration: real("long_stops_duration"),
  small_stops_duration: real("small_stops_duration"),
  max_speed: real("max_speed"),
  avg_speed: real("avg_speed"),
  output_value_total: real("output_value_total"),
  parts_duration: real("parts_duration"),
  open_at_parts_time: text("open_at_parts_time"),
  closed_at_parts_time: text("closed_at_parts_time"),
  field_id: text("field_id").references(() => fields.id),
  aggregate_id: text("aggregate_id").references(() => aggregates.id),
  stationary_tasks_id: text("stationary_tasks_id").references(
    () => stationaryTasks.id,
  ),
});

export const tariff = sqliteTable("tariff", {
  id: text("id").notNull(),
  work_standard_id: text("work_standard_id"),
  unit_code: text("unit_code"),
  norm_value: text("norm_value"),
  norm_value_ha: text("norm_value_ha"),
  norm_fuel_value_per_hour: text("norm_fuel_value_per_hour"),
  norm_fuel_per_ha: text("norm_fuel_per_ha"),
  tariffs_id: text("tariffs_id").references(() => tariffs.id),
});

export const transfers = sqliteTable("transfer", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  long_stops_duration: real("long_stops_duration"),
  small_stops_duration: real("small_stops_duration"),
  max_speed: real("max_speed"),
  avg_speed: real("avg_speed"),
  output_value_total: real("output_value_total"),
  parts_duration: real("parts_duration"),
  open_at_parts_time: text("open_at_parts_time"),
  closed_at_parts_time: text("closed_at_parts_time"),
  aggregate_id: text("aggregate_id").references(() => aggregates.id),
});

export const settingsProductionShifts = sqliteTable(
  "settingsProductionShifts",
  {
    id: text("id").notNull(),
    time_offset: text("time_offset"),
    first_shift_start: text("first_shift_start"),
    first_shift_end: text("first_shift_end"),
    first_shift_break_start: text("first_shift_break_start"),
    first_shift_break_end: text("first_shift_break_end"),
    second_shift_start: text("second_shift_start"),
    second_shift_end: text("second_shift_end"),
    second_shift_break_start: text("second_shift_break_start"),
    second_shift_break_end: text("second_shift_break_end"),
  },
);

export const parts = sqliteTable("part", {
  id: text("id").notNull(),
  is_initial: integer("is_initial", { mode: "boolean" }),
  stationary_tasks_id: text("stationary_tasks_id").references(
    () => stationaryTasks.id,
  ),
  field_tasks_id: text("field_tasks_id").references(() => fieldTasks.id),
  transport_tasks: text("transport_tasks_id").references(
    () => transportTasks.id,
  ),
  products_transportation_tasks_id: text(
    "products_transportation_tasks_id",
  ).references(() => productsTransportationTasks.id),
});

export const processedShiftData = sqliteTable("processedShiftData", {
  id: integer("id").primaryKey({ autoIncrement: true }),

  key: text("key").notNull(),

  workType: text("work_type").notNull(),
  productionShiftId: text("production_shift_id").notNull(),
  shiftType: text("shift_type"),

  workPlaceName: text("work_place_name"),
  workName: text("work_name"),
  agriculturalMachineryName: text("agricultural_machinery_name"),
  taskFieldName: text("task_field_name").notNull().default(""),

  date: text("date").notNull(),
  openAt: text("open_at").notNull().default(""),
  closeAt: text("close_at").notNull().default(""),
  startAt: text("start_at").notNull().default(""),
  endAt: text("end_at").notNull().default(""),

  iconLink: text("icon_link").notNull().default(""),

  tariffValue: text("tariff_value").notNull().default("0"),
  baseTariffPrice: text("base_tariff_price").notNull().default("0"),
  tariffPrice: text("tariff_price").notNull().default("0"),
  tariffUnit: text("tariff_unit"),
  unit: text("unit"),
  unitCode: text("unit_code"),
  tariffPriceUnit: text("tariff_price_unit"),

  outputValueArea: text("output_value_area").notNull().default("0"),

  time: real("time").notNull().default(0),
  longStops: real("long_stops").notNull().default(0),
  smallStops: real("small_stops").notNull().default(0),

  timeString: text("time_string").notNull().default("0м"),
  longStopsString: text("long_stops_string").notNull().default("0м"),
  smallStopsString: text("small_stops_string").notNull().default("0м"),

  factArea: text("fact_area").notNull().default("0"),

  overtimeBonus: text("overtime_bonus").notNull().default("0"),
  experienceBonus: text("experience_bonus").notNull().default("0"),

  normValue: text("norm_value"),
  normValueHa: text("norm_value_ha"),
  productionNormValue: text("production_norm_value"),
  productionFactValue: text("production_fact_value"),
  fuelNormValue: text("fuel_norm_value"),
  fuelFactValue: text("fuel_fact_value"),

  maxSpeed: text("max_speed").notNull().default("0"),
  avgSpeed: text("avg_speed").notNull().default("0"),

  termsMaxSpeed: text("terms_max_speed"),
  processingDepth: text("processing_depth"),
  soluteFlowRate: text("solute_flow_rate"),

  partIds: text("part_ids"),
  partInitial: integer("part_initial", { mode: "boolean" }),

  taskFieldId: text("task_field_id").notNull().default(""),
  tariffId: text("tariff_id").notNull().default(""),
  workPlaceId: text("work_place_id").notNull().default(""),
  agriculturalMachineryId: text("agricultural_machinery_id")
    .notNull()
    .default(""),
  techniqueStandardId: text("technique_standard_id").notNull().default(""),

  isArchived: integer("is_archived", { mode: "boolean" })
    .notNull()
    .default(false),
  isShiftHeader: integer("is_shift_header", { mode: "boolean" })
    .notNull()
    .default(false),
});

export const openProductionShifts = sqliteTable("openProductionShift", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  code: text("code"),
  shift_type: integer("shift_type"),
  employee_id: text("employee_id"),
  scanned_at: text("scanned_at"),
  ended_at: text("ended_at"),
  scanned_place: text("scanned_place"),
  workplace_name: text("workplace_name"),
  segment_type: text("segment_type"),
  offline_group_key: text("offline_group_key"),
  server_shift_id: text("server_shift_id"),
  server_part_id: text("server_part_id"),
  sync_status: text("sync_status"),
  sync_error: text("sync_error"),
});

export const closeProductionShifts = sqliteTable("closeProductionShift", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  closed_at: text("closed_at"),
  shift_id: text("shift_id"),
});

export type Shift = typeof shifts.$inferSelect;
export type ShiftType = typeof shiftTypes.$inferSelect;
export type FieldTasks = typeof fieldTasks.$inferSelect;
export type StationaryTasks = typeof stationaryTasks.$inferSelect;
export type TransportTasks = typeof transportTasks.$inferSelect;
export type ProductsTransportationTasks =
  typeof productsTransportationTasks.$inferSelect;
export type Aggregates = typeof aggregates.$inferSelect;
export type Outputs = typeof outputs.$inferSelect;
export type Fields = typeof fields.$inferSelect;
export type TariffPriceParameters = typeof tariffPriceParameters.$inferSelect;
export type Tariffs = typeof tariffs.$inferSelect;
export type Tariff = typeof tariff.$inferSelect;
export type SettingsProductionShift =
  typeof settingsProductionShifts.$inferSelect;
export type OpenProductionShifts = typeof openProductionShifts.$inferSelect;
export type CloseProductionShifts = typeof closeProductionShifts.$inferSelect;
