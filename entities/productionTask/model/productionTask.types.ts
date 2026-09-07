import type { ProductionWorkPlaceDto } from "../../dictionaries/model/dictionary.interface";

export interface ProductionTask {
  id: string;

  task_type: TaskType;

  work_standard: WorkStandard;

  season_year: number;
  comment: string | null;

  date_start: string;
  calculated_date_end: string | null;

  status: Status;

  last_modified_by: User;
  created_by: User;

  zones: string[];

  total_costs: number;
  area_fact: number;
  area_plan: number;

  progress: number;
  costs_per_ha: number;

  stationary_work_place?: ProductionWorkPlaceDto;
  stationary_tariff?: StationaryTariff;
}

export interface TaskType {
  id: number;
  description: string;
}

export interface WorkStandard {
  id: string;
  name: string;
  work_kind_id: number;
  work_type_id: number;
  id_1c: string | null;
}

export interface Status {
  id: number;
  description: string;
}

export interface User {
  user_id: string;
  fullname: string;
}

export interface GeoPolygon {
  type: "Polygon";
  coordinates: number[][][];
}

interface StationaryTariff {
  id: string;
  name: string | null;
  nigth_tariff_id: string | null;
  work_standard_id: string;

  tariff_type: number;
  tariff_discriminator: number;

  overtime_ratio: number | null;
  workload_type: number;

  comment: string;

  technique_model_id: string | null;
  agricultural_machinery_model_id: string | null;

  unit_code: string;

  norm_value: number;
  norm_value_ha: number | null;

  tariff_fixed_parameters?: {
    fixed_value: number;
  } | null;

  tariff_ranked_parameters: TariffRankedParameters;
}

export interface TariffRankedParameters {
  rank: Rank;
  increasing_ratio: number | null;
}

export interface Rank {
  rank_id: string;
  number: number;
  ratio: number;
}
