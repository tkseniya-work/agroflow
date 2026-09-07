export interface ProductionShiftRequest {
  userId: string | null;
  accessToken: string | null;
  startDate: string | undefined;
  endDate: string | undefined;
}

export type ProductionShiftId = string;
export type ProductionShiftIsoDate = string;
export type ProductionShiftIsoDateTime = string;

export interface ProductionShiftLookupDto {
  id: number | string;
  description: string | null;
}

export interface ProductionShiftPointDto {
  type: "Point";
  coordinates: [number, number];
}

export interface ProductionShiftPaymentDto {
  value: number;
  exp_bonus_amount: number;
  overtime_bonus_amount: number;
}

export interface ProductionShiftTimedMetricsDto {
  output_value_total: number;
  parts_duration: number;
  open_at_parts_time: ProductionShiftIsoDateTime | null;
  fuel_per_100_km: number;
  closed_at_parts_time: ProductionShiftIsoDateTime | null;
}

export interface ProductionShiftSpeedMetricsDto {
  long_stops_duration: number;
  small_stops_duration: number;
  max_speed: number;
  avg_speed: number;
}

export interface ProductionShiftTariffPriceParametersDto {
  shift: number;
  unit: number;
}

export interface ProductionShiftTariffInfoDto {
  id: ProductionShiftId;
  work_standard_id: ProductionShiftId;
  norm_value: number | null;
  norm_value_ha: number | null;
  norm_fuel_value_per_hour: number | null;
  norm_fuel_value_per_unit: number | null;
  norm_fuel_per_ha: number | null;
  unit_code: string | null;
  tariff_price_parameters: ProductionShiftTariffPriceParametersDto | null;
}

export interface ProductionShiftPartDto {
  id: ProductionShiftId;
  start_at: ProductionShiftIsoDateTime;
  end_at: ProductionShiftIsoDateTime | null;
  payment: ProductionShiftPaymentDto | null;
  output_value: number;
  part_duration_minutes: number;
  is_initial: boolean;
  create_type: ProductionShiftLookupDto | null;
}

export interface ProductionShiftTariffDto
  extends ProductionShiftTimedMetricsDto,
    Partial<ProductionShiftSpeedMetricsDto> {
  manual_output_value: number | null;
  manual_fact_area?: number | null;
  tariff: ProductionShiftTariffInfoDto | null;
  area_fact?: number | null;
  payment: ProductionShiftPaymentDto | null;
  parts: ProductionShiftPartDto[];
}

export interface ProductionShiftFieldOutputDto
  extends ProductionShiftTimedMetricsDto,
    ProductionShiftSpeedMetricsDto {
  area_fact: number;
  transported_weight: number;
  threshed: number;
  number_of_bins: number;
  number_of_trips: number;
  fuel_per_ha: number;
  task_field_id: ProductionShiftId;
  task_field_name: string | null;
  tariffs: ProductionShiftTariffDto[];
}

export interface ProductionShiftAggregateOutputsDto
  extends ProductionShiftTimedMetricsDto {
  payment: ProductionShiftPaymentDto | null;
  fields: ProductionShiftFieldOutputDto[];
}

export interface ProductionShiftAggregateTransfersDto
  extends ProductionShiftTimedMetricsDto,
    ProductionShiftSpeedMetricsDto {
  payment: ProductionShiftPaymentDto | null;
  tariffs: ProductionShiftTariffDto[];
}

export interface ProductionShiftAggregateDto
  extends ProductionShiftTimedMetricsDto {
  technique_id: ProductionShiftId | null;
  agricultural_machinery_id: ProductionShiftId | null;
  outputs?: ProductionShiftAggregateOutputsDto | null;
  transfers?: ProductionShiftAggregateTransfersDto | null;
  tariffs?: ProductionShiftTariffDto[];
}

export interface ProductionShiftTaskBaseDto
  extends ProductionShiftTimedMetricsDto {
  production_task_id: ProductionShiftId;
  work_standard_id: ProductionShiftId;
  comment: string | null;
  season_year: number;
  date_start: ProductionShiftIsoDate;
  calculated_date_end: ProductionShiftIsoDate | null;
  status: ProductionShiftLookupDto | null;
  payment: ProductionShiftPaymentDto | null;
}

export interface ProductionShiftFieldTaskDto extends ProductionShiftTaskBaseDto {
  aggregates: ProductionShiftAggregateDto[];
}

export interface ProductionShiftStationaryTaskDto
  extends ProductionShiftTaskBaseDto {
  work_place_id: ProductionShiftId;
  work_place_name: string | null;
  tariffs: ProductionShiftTariffDto[];
}

export interface ProductionShiftTransportTaskDto
  extends ProductionShiftTaskBaseDto {
  aggregates: ProductionShiftAggregateDto[];
}

export interface ProductionShiftProductsTransportationTaskDto
  extends ProductionShiftTaskBaseDto {
  aggregates: ProductionShiftAggregateDto[];
}

export interface ProductionShiftDto extends ProductionShiftTimedMetricsDto {
  date: ProductionShiftIsoDate;
  production_shift_id: ProductionShiftId;
  shift_type: ProductionShiftLookupDto | null;
  open_at: ProductionShiftIsoDateTime;
  closed_at: ProductionShiftIsoDateTime | null;
  qr_code_scanned_at: ProductionShiftPointDto | null;
  payment: ProductionShiftPaymentDto | null;
  field_tasks: ProductionShiftFieldTaskDto[];
  stationary_tasks: ProductionShiftStationaryTaskDto[];
  transport_tasks: ProductionShiftTransportTaskDto[];
  products_transportation_tasks: ProductionShiftProductsTransportationTaskDto[];
}

export interface ProductionShiftResponseDto {
  employee_id: ProductionShiftId;
  shifts: ProductionShiftDto[];
}

export interface ProductionShiftSettingsDto {
  id: ProductionShiftId;
  time_offset: string;
  first_shift_start: string;
  first_shift_end: string;
  first_shift_break_start?: string | null;
  first_shift_break_end?: string | null;
  second_shift_start: string;
  second_shift_end: string;
  second_shift_break_start?: string | null;
  second_shift_break_end?: string | null;
}

export interface CloseProductionShiftRequest {
  accessToken: string | null;
  closeAt: string | undefined;
  shiftId: string | undefined;
}

export interface OpenProductionShiftRequest {
  accessToken: string | null;
  code: string | undefined | null;
  shiftType: number | undefined;
  employeeId: string | undefined;
  scannedAt: string | undefined;
  scannedPlace: any | undefined | null;
}

export interface UpdateProductionShiftPartRequest {
  accessToken: string | null;
  id: string | null;
  endedAt: string | null | undefined;
  startAt: string | null | undefined;
  taskFieldId: string | null;
  productionTaskId: string | null;
  tariffId: string | null;
  workPlaceId: string | null;
  agriculturalMachineryId: string | null;
  outputValue?: number | null;
  shiftPartsIds?: string[] | null;
  type?: number | null;
}

export interface UpdateProductionShiftPartTariff {
  accessToken: string | null;
  tariffId: string | null;
  workPlaceId: string | null;
  agriculturalMachineryStandardId: string | null;
  shiftPartsIds: string[] | null;
  outputValue: number | undefined;
  factArea: number | null;
  transportedWeight?: number | null;
  numberOfTrips?: number | null;
}

interface UpdateProductionShiftTotalsV2Base {
  accessToken: string | null;
  taskId: string;
  shiftId: string;
  tariffId: string | null;
  oldTariffId: string | null;
  workPlaceId: string | null;
}

export type UpdateProductionShiftTotalsV2 =
  UpdateProductionShiftTotalsV2Base &
    (
      | {
          updateFieldTaskParts: {
            taskFieldId: string | null;
            agriculturalMachineryId: string | null;
            outputValue: number | null;
            factArea: number | null;
            threshed: number | null;
            numberOfBins: number | null;
          };
        }
      | {
          updateTransportTaskParts: {
            agriculturalMachineryId: string | null;
            outputValue: number | null;
          };
        }
      | {
          updateStationaryTaskParts: {
            outputValue: number | null;
          };
        }
      | {
          updateTransportationTaskParts: {
            agriculturalMachineryId: string | null;
            outputValue: number | null;
            transportedWeight: number | null;
            numberOfTrips: number | null;
          };
        }
    );

export interface CloseInitialPartRequest {
  accessToken: string | null;
  productionShiftPartId: string | null;
  closedAt: string | null;
}
