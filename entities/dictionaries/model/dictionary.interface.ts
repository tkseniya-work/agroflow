export interface TechniqueStandardByIdRequest {
  accessToken: string | null;
  techniqueId: string | null;
}

export interface ProductionTaskRequest {
  accessToken: string | null;
  year: string | null;
}

export interface TariffsSearchRequest {
  accessToken: string | null;
  workStandardId?: string | null;
  techniqueModelId?: string | null;
  agriculturalMachineryModelId?: string | null;
}

export interface GenerateTariffRequest {
  accessToken: string | null;
  work_standard_id: string;
  technique_model_id: string | null;
  agricultural_machinery_model_id: string | null;
}

export type DictionaryId = string;
export type DictionaryIsoDateTime = string;

export interface DictionaryLookupDto {
  id: number | string;
  description: string | null;
}

export interface GeoPolygonDto {
  type: "Polygon";
  coordinates: [number, number][][];
}

export interface ProductionWorkPlaceMachineryModelDto {
  id: DictionaryId;
  name: string | null;
  power: number | null;
  fuel_consumption: number | null;
  external_id: DictionaryId | null;
  source: string | null;
  fuel_type: number | null;
  fuel_consumption_per_distance: number | null;
  load_capacity: number | null;
  type: number | null;
}

export interface ProductionWorkPlaceTechniqueDto {
  id: DictionaryId;
  name: string | null;
  company_id: DictionaryId | null;
  state_number: string | null;
  id_1c: string | null;
  fuel_tank_capacity: number | null;
  engine_power: number | null;
  purchase_price: number | null;
  residual_value: number | null;
  photo_link: string | null;
  icon_link: string | null;
  track_color: string | null;
  machinery_model: ProductionWorkPlaceMachineryModelDto | null;
}

export interface ProductionWorkPlaceTechniqueLinkDto {
  technique: ProductionWorkPlaceTechniqueDto | null;
}

export interface ProductionWorkPlaceZoneDto {
  coordinates: GeoPolygonDto | null;
}

export interface ProductionWorkPlaceDto {
  id: DictionaryId;
  name: string | null;
  work_place_type: DictionaryLookupDto | null;
  code: string | null;
  work_place_zone: ProductionWorkPlaceZoneDto | null;
  work_place_technique: ProductionWorkPlaceTechniqueLinkDto | null;
  is_deleted: boolean;
  deleted_at: DictionaryIsoDateTime | null;

  /**
   * Older API payloads sometimes include this misspelled field, matching the
   * current SQLite column name.
   */
  comapny_id?: DictionaryId | null;
}

export interface TariffsList {
  id: string;
  work_standard_id: string;

  tariff_type: number;
  tariff_discriminator: number;
  period?: DictionaryLookupDto | null;
  nigth_tariff_id?: string | null;

  overtime_ratio: number | null;
  workload_type: number;

  comment: string | null;

  technique_model_id: string | null;
  agricultural_machinery_model_id: string | null;

  unit_code: string | null;

  norm_value: number | null;
  norm_value_ha: number | null;

  norm_fuel_value_per_hour: number | null;
  norm_fuel_value_per_unit: number | null;
  norm_fuel_per_ha: number | null;

  tariff_fixed_parameters?: {
    fixed_value: number;
  } | null;

  tariff_ranked_parameters: {
    rank: {
      rank_id: string;
      number: number;
      ratio: number;
    };
    increasing_ratio: number | null;
  } | null;

  tariff_price_parameters: {
    shift: number;
    unit: number;
  } | null;

  is_deleted: boolean;
  deleted_at: string | null;
}
