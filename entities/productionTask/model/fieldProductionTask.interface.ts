import {
  GeoPolygon,
  Status,
  TariffRankedParameters,
  TaskType,
  User,
  WorkStandard,
} from "./productionTask.types";

export interface FieldProductionTaskResponse {
  id: string;
  task_type: TaskType;
  work_standard: WorkStandard;
  comment: string | null;
  season_year: number;
  created_by: User;
  last_modified_by: User;
  date_start: string;
  calculated_date_end: string | null;
  status: Status;
  field_task: FieldProductionTask;
}

export interface FieldProductionTask {
  task_fields: ProductionTaskField[];
  techniques: FieldProductionTaskTechnique[];
}

export interface ProductionTaskField {
  id: string;
  season_field: FieldTaskSeasonField;
  origin_field_id: string;
  id_1c: string;
  season: number;
  number: string;
  name: string;
  area: number;
  map_area: number;
  coordinates: GeoPolygon;
  srid: number;
  ground_type: number;
  plan_work: ProductionPlanWork;
  seed_plan_consumption: SeedPlanConsumption;
  pesticide_plan_consumptions: PesticidePlanConsumption[];
  fertilizer_plan_consumptions: FertilizerPlanConsumption[];
  seed_norm_consumption: SeedNormConsumption;
  pesticide_norm_consumption: PesticideNormConsumption[];
  fertilizer_norm_consumption: FertilizerNormConsumption[];
}

export interface FieldTaskSeasonField {
  id: string;
  id_1c: string;
  number: string;
  name: string;
  area: number;
  map_area: number;
  ground_type: number;
  origin_field_id: string;
  year: number;
}

export interface ProductionPlanWork {
  id: string;
  parent_id: string;
  comment: string;
  grow_stages_ids: string[];
  work_standard: WorkStandard;
  technique_model: TechniqueModel;
  agricultural_machinery_model: AgriculturalMachineryModel;
  stage: number;
  number: number;
  month: number;
  year: number;
  production_plan_id: string;
  tariff: ProductionPlanWorkTariff;
  average_distance_from_the_weight_room: number;
  fertilizer_consumptions: FertilizerConsumption[];
  pesticide_consumptions: PesticideConsumption[];
  seeds_consumption: SeedsConsumption;
}

export interface TechniqueModel {
  id: string;
  name: string;
  power: number;
  fuel_consumption: number;
  external_id: string;
  source: string;
  fuel_type: number;
  fuel_consumption_per_distance: number;
  load_capacity: number;
  type: number;
}

export interface AgriculturalMachineryModel {
  id: string;
  external_id: string;
  company_id: string;
  name: string;
  source: string;
}

export interface ProductionPlanWorkTariff {
  tariff_id: string;
  season: number;
  base_value: number;
  work_type: Status;
  tariff_discriminator: Status;
  technique_model_id: string;
  agricultural_machinery_model_id: string;
  unit_code: string;
  comment: string;
  incresing_ration: number;
  work_load_type: Status;
  norm_value: number;
  norm_value_ha: number;
  tariff_shift: number;
  tariff_unit: number;
}

export interface FertilizerConsumption {
  id: string;
  fertilizer_standard: FertilizerStandard;
  norm_value: number;
  total: number;
  work_id: string;
  unit_code: number;
  amount_per_ha: number;
  amount_per_ton: number;
  total_amount: number;
}

export interface FertilizerStandard {
  id: string;
  name: string;
  groups: number[];
  info_link: string;
  image_link: string;
  instruction_link: string;
  description: string;
  producer: string;
  base_fertilizer_link: string;
  base_fertilizer_name: string;
  external_fertilizer_id: string;
  company_id: string;
  ingredients: FertilizerIngredient[];
}

export interface FertilizerIngredient {
  id: string;
  fertilizer_standard_id: string;
  content_value: number;
  nutrient_type: number;
}

export interface PesticideConsumption {
  id: string;
  pesticide_standard: PesticideStandard;
  norm_value: number;
  total: number;
  unit_code: number;
  work_id: string;
  amount_per_ha: number;
  amount_per_ton: number;
  total_amount: number;
}

export interface PesticideStandard {
  id: string;
  company_id: string;
  external_pesticide_id: string;
  name: string;
  pest_types: number[];
  info_link: string;
  instruction_link: string;
  can_work_with_crop_ids: string[];
  description: string;
  human_danger_class: number;
  bee_danger_class: number;
  producer: string;
  image_link: string;
  ingredients: PesticideIngredient[];
}

export interface PesticideIngredient {
  external_id: string;
  pesticide_id: string;
  dosage: number;
  name: string;
  description: string;
  formula: string;
  effect_duration_months: number;
  info_link: string;
}

export interface SeedsConsumption {
  id: string;
  add_seed_dressing: boolean;
  month: number;
  crop_variety: CropVarietyStandard;
  weight: number;
  unit_code: number;
  work_id: string;
  sowing_norm: number;
  amount_per_ha: number;
  amount_per_ton: number;
  total: number;
  total_amount: number;
}

export interface CropVarietyStandard {
  id: string;
  name: string;
  external_crop_variety_id: string;
  code: number;
  threshold_temperature: number;
  producer: string;
  url: string;
  source: string;
  crop_external_id: string;
}

export interface SeedPlanConsumption {
  crop_variety_standard: CropVarietyStandard;
  quantity: number;
  unit_code: Status;
  production_plan_work: ProductionPlanWork;
}

export interface PesticidePlanConsumption {
  pesticide: PesticideStandard;
  norm_value: number;
  work: ProductionPlanWork;
  unit_code: number;
}

export interface FertilizerPlanConsumption {
  fertilizer: FertilizerStandard;
  norm_value: number;
  work: ProductionPlanWork;
  unit_code: number;
}

export interface SeedNormConsumption {
  id: string;
  crop_variety_standard: CropVarietyStandard;
  quantity: number;
  unit_code: Status;
  production_plan_work: ProductionPlanWork;
}

export interface PesticideNormConsumption {
  id: string;
  pesticide: PesticideStandard;
  quantity: number;
  production_plan_work: ProductionPlanWork;
}

export interface FertilizerNormConsumption {
  id: string;
  fertilizer: FertilizerStandard;
  quantity: number;
  production_plan_work: ProductionPlanWork;
}

export interface FieldProductionTaskTechnique {
  id: string;
  technique: Technique;
  agriculture_machine: AgricultureMachine;
  tariff: FieldTaskTariff;
  transfer_tariff: FieldTaskTariff;
  is_created_now: boolean;
  agricultural_machinery_width: number;
  terms: FieldProductionTaskTechniqueTerm[];
}

export interface Technique {
  id: string;
  name: string;
  company_id: string;
  state_number: string;
  id_1c: string;
  fuel_tank_capacity: number;
  engine_power: number;
  purchase_price: number;
  residual_value: number;
  photo_link: string;
  icon_link: string;
  track_color: string;
  machinery_model: TechniqueModel;
}

export interface AgricultureMachine {
  id: string;
  name: string;
  width: number;
  minimal_power: number;
  company_id: string;
  type: number;
  id_1c: string;
  machinery_model: AgriculturalMachineryModel;
}

export interface FieldTaskTariff {
  id: string;
  work_standard_id: string;
  tariff_type: number;
  tariff_discriminator: number;
  overtime_ratio: number;
  workload_type: number;
  comment: string;
  technique_model_id: string;
  agricultural_machinery_model_id: string;
  unit_code: string;
  norm_value: number;
  norm_value_ha: number;
  norm_fuel_value_per_hour: number;
  norm_fuel_value_per_unit: number;
  norm_fuel_per_ha: number;
  tariff_fixed_parameters: TariffFixedParameters;
  tariff_ranked_parameters: TariffRankedParameters;
  tariff_price_parameters: TariffPriceParameters;
  is_deleted: boolean;
  deleted_at: string;
}

export interface TariffFixedParameters {
  fixed_value: number;
}

export interface TariffPriceParameters {
  shift: number;
  unit: number;
}

export interface FieldProductionTaskTechniqueTerm {
  id: string;
  work_speed: number;
  processing_depth: number;
  solute_flow_rate: number;
  task_field_id: string;
}
