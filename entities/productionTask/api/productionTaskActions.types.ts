import type { ProductionTask } from "../model/productionTask.types";

export interface ProductionTaskRequest {
  accessToken: string | null;
  season: number;
  status: number[];
}

export interface ProductionTaskPageRequest extends ProductionTaskRequest {
  pageNumber: number;
  pageSize: number;
  taskTypes: number[];
  search: string;
}

export interface ProductionTaskPageResponse {
  total_pages: number;
  total_rows: number;
  page_number: number;
  page_size: number;
  data: ProductionTask[];
}

export interface CreateStationaryProductionTaskRequest {
  accessToken: string | null;
  workStandardId: string;
  seasonYear: number | undefined;
  comment: string;
  dateStart: string;
  tariffId: string;
  workPlaceId: string;
}

export interface UpdateStationaryProductionTaskRequest {
  accessToken: string | null;
  taskId: string;
  seasonYear: number | undefined;
  comment: string;
  dateStart: string;
  tariffId: string;
}

export interface CreateTransportProductionTaskRequest {
  accessToken: string | null;
  workStandardId: string;
  seasonYear: number | undefined;
  comment: string;
  dateStart: string;
}

export interface UpdateProductionTaskRequest {
  accessToken: string | null;
  taskId: string;
  seasonYear: number | undefined;
  comment: string;
  dateStart: string;
  seasonFieldIds?: string[];
  fieldWorkIds?: {
    season_field_id: string;
    production_plan_work_id: string | null;
  }[];
}

export interface CreateTransportationProductionTaskRequest {
  accessToken: string | null;
  workStandardId: string;
  seasonYear: number | undefined;
  comment: string;
  dateStart: string;
}

export interface CreateFieldProductionTaskRequest {
  accessToken: string | null;
  workStandardId: string;
  seasonYear: number | undefined;
  comment: string;
  dateStart: string;
}

export interface DeleteProductionTaskRequest {
  accessToken: string | null;
  productionTaskId: string;
}

export interface UpdateProductionTaskStatusRequest {
  accessToken: string | null;
  productionTaskId: string;
  status: number;
}

export interface FieldTaskByIdRequest {
  accessToken: string | null;
  productionTaskId: string;
}

export interface CreateProductionTaskFieldRequest {
  accessToken: string | null;
  data: {
    production_task_id: string;
    season_field_id: string;
    production_plan_work_id?: string | null;
  };
}

export interface CreateProductionTransportationTaskFieldRequest {
  accessToken: string | null;
  data: {
    task_id: string;
    season_field_id: string;
    id_1c?: string | null;
    production_plan_work_id?: string | null;
  };
}

export interface DeleteProductionTaskFieldRequest {
  accessToken: string | null;
  id: string;
}

export interface ProductionFieldTaskTechniqueRequest {
  accessToken: string | null;
  data:
    | {
        task_type?: "field_task";
        production_task_id: string;
        technique_standard_id: string;
        agriculture_machine_standard_id?: string | null;
        tariff_id: string;
        transfer_tariff_id: string;
        work_speed?: number | null;
        processing_depth?: number | null;
        solute_flow_rate?: number | null;
      }
    | {
        task_id: string;
        technique_id: string;
        agriculture_machine_id?: string | null;
        tariff_id: string;
        work_speed?: number | null;
      };
}

export interface MoveProductionFieldTaskTechniqueRequest {
  accessToken: string | null;
  data: {
    technique_id: string;
    tariff_id: string;
    transfer_tariff_id?: string;
    agricultural_machine_id?: string | null;
    task_id: string;
    work_speed?: number | null;
  };
}

export interface DeleteProductionFieldTaskTechniqueRequest {
  accessToken: string | null;
  id: string;
}

export type ProductionTaskConsumableType = "seed" | "pesticide" | "fertilizer";

export interface ProductionTaskConsumableRequest {
  accessToken: string | null;
  type: ProductionTaskConsumableType;
  data: {
    id?: string | null;
    production_task_field_id: string;
    crop_variety_standard_id?: string | null;
    pesticide_id?: string | null;
    fertilizer_id?: string | null;
    unit_code?: number | string | null;
    quantity: number;
    weight?: number | null;
  };
}

export interface DeleteProductionTaskConsumableRequest {
  accessToken: string | null;
  type: ProductionTaskConsumableType;
  id: string;
}

export interface ApiProblemDetails {
  type: string;
  title: string;
  status: number;
  detail: string;
  instance: string;
}

export interface SowingUnitCodeRequest {
  accessToken: string | null;
}

export interface SowingUnitCodeResponse {
  type: number | string;
  name: string;
  description?: string | null;
}

export interface SeasonFieldWorksRequest {
  accessToken: string | null;
  season: number;
  workKind: number;
}

export interface ProductionFieldTaskGroupedPartsRequest {
  accessToken: string | null;
  taskId: string;
}

export interface ProductionTaskPartsRequest {
  accessToken: string | null;
  taskId: string;
}

export interface CurrentFieldTaskRequest {
  accessToken: string | null;
  id: string;
}

export interface CurrentFieldTaskAnalyticRequest {
  accessToken: string | null;
  id: string;
}

export interface CurrentTransportationTaskRequest {
  accessToken: string | null;
  id: string;
}

export interface CurrentTransportationTaskAnalyticRequest {
  accessToken: string | null;
  id: string;
}

export interface CurrentTransportTaskRequest {
  accessToken: string | null;
  id: string;
}

export interface CurrentTransportTaskAnalyticRequest {
  accessToken: string | null;
  id: string;
}

export interface ProductionTaskEvaluationRequest {
  accessToken: string | null;
  taskId: string;
}

export interface ProductionTransportationTaskEvaluationRequest {
  accessToken: string | null;
  taskId: string;
}

export interface UpdateProductionTransportationTaskFieldRequest {
  accessToken: string | null;
  data: {
    transportation_task_field_id: string;
    plan_work_id: string | null;
  };
}

export interface ProductionShiftPartRequest {
  accessToken: string | null;
  data: Record<string, any>;
}

export interface EditPartsMaterialQuantityRequest {
  accessToken: string | null;
  data: Record<string, any>;
}

export interface ProductionShiftPartsBatchRequest {
  accessToken: string | null;
  data: Record<string, any>[];
}

export interface ProductionTaskShiftForceLoadPreviewRequest {
  accessToken: string | null;
  data: Record<string, any>;
}

export interface DeleteProductionTaskPartsRequest {
  accessToken: string | null;
  id: string;
}
