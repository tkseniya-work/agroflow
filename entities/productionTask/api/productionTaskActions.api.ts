import axios, { isAxiosError } from "axios";

import { API } from "./endpoints/productionTask.endpoints";
import {
  CreateFieldProductionTaskRequest,
  CreateProductionTaskFieldRequest,
  CreateProductionTransportationTaskFieldRequest,
  CreateStationaryProductionTaskRequest,
  CreateTransportationProductionTaskRequest,
  CreateTransportProductionTaskRequest,
  CurrentFieldTaskAnalyticRequest,
  CurrentFieldTaskRequest,
  CurrentTransportTaskAnalyticRequest,
  CurrentTransportTaskRequest,
  CurrentTransportationTaskAnalyticRequest,
  CurrentTransportationTaskRequest,
  DeleteProductionTaskRequest,
  DeleteProductionTaskFieldRequest,
  DeleteProductionTaskConsumableRequest,
  DeleteProductionFieldTaskTechniqueRequest,
  EditPartsMaterialQuantityRequest,
  FieldTaskByIdRequest,
  MoveProductionFieldTaskTechniqueRequest,
  DeleteProductionTaskPartsRequest,
  ProductionFieldTaskGroupedPartsRequest,
  ProductionTaskEvaluationRequest,
  ProductionTransportationTaskEvaluationRequest,
  ProductionTaskPartsRequest,
  ProductionShiftPartRequest,
  ProductionShiftPartsBatchRequest,
  ProductionTaskConsumableRequest,
  ProductionTaskShiftForceLoadPreviewRequest,
  ProductionTaskPageRequest,
  ProductionTaskPageResponse,
  ProductionTaskRequest,
  ProductionFieldTaskTechniqueRequest,
  SowingUnitCodeRequest,
  SowingUnitCodeResponse,
  UpdateProductionTaskRequest,
  UpdateProductionTaskStatusRequest,
  UpdateStationaryProductionTaskRequest,
  UpdateProductionTransportationTaskFieldRequest,
  SeasonFieldWorksRequest,
} from "./productionTaskActions.types";
import type { ProductionTask } from "../model/productionTask.types";
import { UpdateProductionShiftPartRequest } from "../../productionShift/model/productionShift.interface";
import { isValidProductionTaskId } from "../lib/productionTaskId";
import { isSuccessStatus } from "../../../shared/lib/apiUtils";
import { buildConsumableRequestData } from "./productionTaskConsumables.logic";

const consumableApiByType = {
  seed: {
    save: API.productionTaskSeedNorm,
    delete: API.deleteProductionTaskSeedNorm,
  },
  pesticide: {
    save: API.productionTaskPesticideNorm,
    delete: API.deleteProductionTaskPesticideNorm,
  },
  fertilizer: {
    save: API.productionTaskFertilizerNorm,
    delete: API.deleteProductionTaskFertilizerNorm,
  },
};

const getAxiosErrorPayload = (error: unknown) => {
  if (isAxiosError(error)) {
    return error.response?.data ?? error.message;
  }

  return error;
};

const getJsonHeaders = (accessToken: string | null) => ({
  Authorization: `Bearer ${accessToken}`,
  "Content-Type": "application/json",
});

const omitUndefined = (data: Record<string, any>) =>
  Object.fromEntries(
    Object.entries(data).filter(([, value]) => value !== undefined),
  );

const normalizeDateTimeOffset = (value: any) => {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const parsed = new Date(value);

  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
};

const normalizeShiftPartPayload = (data: Record<string, any>) => {
  const payload = { ...data };
  let startAt: string | null = null;

  if ("start_at" in payload) {
    startAt = normalizeDateTimeOffset(payload.start_at);
    payload.start_at = startAt;
  }

  if ("ended_at" in payload) {
    const endedAt = normalizeDateTimeOffset(payload.ended_at);

    payload.ended_at = endedAt;
  }

  if (startAt) {
    const startDate = new Date(startAt);
    const endDate = payload.ended_at ? new Date(payload.ended_at) : null;

    if (!endDate || Number.isNaN(endDate.getTime()) || endDate <= startDate) {
      payload.ended_at = new Date(startDate.getTime() + 1000).toISOString();
    }
  } else if (payload.ended_at === null) {
    delete payload.ended_at;
  }

  return payload;
};

export const productionTaskActionsApi = {
  async loadProductionTasks(request: ProductionTaskRequest) {
    try {
      const requestData: Record<string, any> = {
        season: request.season,
        status: request.status,
      };

      const response = await axios.post<ProductionTask[]>(
        API.productionTask,
        requestData,
        {
          headers: {
            Authorization: `Bearer ${request.accessToken}`,
            "Content-Type": "application/json",
          },
        },
      );

      return response.data ?? null;
    } catch (error) {
      console.error("Error load production tasks:", error);
      return null;
    }
  },

  async loadProductionTaskPage(request: ProductionTaskPageRequest) {
    try {
      const response = await axios.post<ProductionTaskPageResponse>(
        API.productionTaskPage,
        {
          page_number: request.pageNumber,
          page_size: request.pageSize,
          search_criteria: {
            status: request.status,
            season: request.season,
            task_types: request.taskTypes,
            search: request.search,
          },
          sort_criteria: {
            order_property: "date_start",
            is_ascending: false,
          },
        },
        {
          headers: getJsonHeaders(request.accessToken),
        },
      );

      return response.data ?? null;
    } catch (error) {
      console.error(
        "Error load production task page:",
        getAxiosErrorPayload(error),
      );
      throw error;
    }
  },

  async createStationaryProductionTask(request: CreateStationaryProductionTaskRequest) {
    try {
      const requestData: Record<string, any> = {
        work_standard_id: request.workStandardId,
        season_year: request.seasonYear,
        comment: request.comment,
        date_start: request.dateStart,
        tariff_id: request.tariffId,
        work_place_id: request.workPlaceId,
      };

      const response = await axios.post(
        API.createStationaryProductionTask,
        requestData,
        {
          headers: {
            Authorization: `Bearer ${request.accessToken}`,
            "Content-Type": "application/json",
          },
        },
      );

      return isSuccessStatus(response.status);
    } catch (error) {
      console.error("Error creating stationary production task:", error);
      return false;
    }
  },

  async updateStationaryProductionTask(request: UpdateStationaryProductionTaskRequest) {
    try {
      const requestData: Record<string, any> = {
        task_id: request.taskId,
        season_year: request.seasonYear,
        comment: request.comment,
        date_start: request.dateStart,
        tariff_id: request.tariffId,
      };

      const response = await axios.put(
        API.updateStationaryProductionTask,
        requestData,
        {
          headers: {
            Authorization: `Bearer ${request.accessToken}`,
            "Content-Type": "application/json",
          },
        },
      );

      return isSuccessStatus(response.status);
    } catch (error) {
      console.error("Error updating stationary production task:", error);
      return false;
    }
  },

  async createTransportProductionTask(request: CreateTransportProductionTaskRequest) {
    try {
      const requestData = {
        work_standard_id: request.workStandardId,
        season_year: request.seasonYear,
        comment: request.comment,
        date_start: request.dateStart,
      };

      const response = await axios.post(
        API.createTransportProductionTask,
        requestData,
        {
          headers: {
            Authorization: `Bearer ${request.accessToken}`,
            "Content-Type": "application/json",
          },
        },
      );

      return isSuccessStatus(response.status);
    } catch (error) {
      console.error("Error creating transport production task:", error);
      return false;
    }
  },

  async updateProductionTask(request: UpdateProductionTaskRequest) {
    try {
      const requestData: {
        task_id: string;
        season_year: number | undefined;
        comment: string;
        date_start: string;
        season_field_ids?: string[];
        field_work_ids?: {
          season_field_id: string;
          production_plan_work_id: string | null;
        }[];
      } = {
        task_id: request.taskId,
        season_year: request.seasonYear,
        comment: request.comment,
        date_start: request.dateStart,
      };

      if (request.seasonFieldIds) {
        requestData.season_field_ids = request.seasonFieldIds;
      }

      if (request.fieldWorkIds) {
        requestData.field_work_ids = request.fieldWorkIds;
      }

      const response = await axios.put(API.updateProductionTask, requestData, {
        headers: {
          Authorization: `Bearer ${request.accessToken}`,
          "Content-Type": "application/json",
        },
      });

      return isSuccessStatus(response.status);
    } catch (error) {
      console.error("Error updating transport production task:", error);
      return false;
    }
  },

  async createTransportationProductionTask(request: CreateTransportationProductionTaskRequest) {
    try {
      const requestData = {
        work_standard_id: request.workStandardId,
        season_year: request.seasonYear,
        comment: request.comment,
        date_start: request.dateStart,
      };

      const response = await axios.post(
        API.createTransportationProductionTask,
        requestData,
        {
          headers: {
            Authorization: `Bearer ${request.accessToken}`,
            "Content-Type": "application/json",
          },
        },
      );

      return isSuccessStatus(response.status);
    } catch (error) {
      console.error("Error creating transportation production task:", error);
      return false;
    }
  },

  async createFieldProductionTask(request: CreateFieldProductionTaskRequest) {
    try {
      const requestData = {
        work_standard_id: request.workStandardId,
        season_year: request.seasonYear,
        comment: request.comment,
        date_start: request.dateStart,
      };

      const response = await axios.post(
        API.createFieldProductionTask,
        requestData,
        {
          headers: {
            Authorization: `Bearer ${request.accessToken}`,
            "Content-Type": "application/json",
          },
        },
      );

      return isSuccessStatus(response.status);
    } catch (error) {
      console.error("Error creating field production task:", error);
      return false;
    }
  },

  async deleteProductionTask(request: DeleteProductionTaskRequest) {
    try {
      const response = await axios.delete(
        API.deleteProductionTask.concat(`${request.productionTaskId}`),
        {
          headers: {
            Authorization: `Bearer ${request.accessToken}`,
            "Content-Type": "application/json",
          },
        },
      );

      return isSuccessStatus(response.status);
    } catch (error) {
      console.error("Error deleting production task:", error);
      return false;
    }
  },

  async updateProductionTaskStatus(request: UpdateProductionTaskStatusRequest) {
    try {
      const requestData = {
        production_task_id: request.productionTaskId,
        status: request.status,
      };

      const response = await axios.put(
        API.updateProductionTaskStatus,
        requestData,
        {
          headers: {
            Authorization: `Bearer ${request.accessToken}`,
            "Content-Type": "application/json",
          },
        },
      );

      return isSuccessStatus(response.status);
    } catch (error) {
      console.error("Error updating production task status:", error);
      return false;
    }
  },

  async loadFieldTaskById(request: FieldTaskByIdRequest) {
    try {
      const response = await axios.get(
        API.fieldTaskById.concat(`${request.productionTaskId}`),
        {
          headers: {
            Authorization: `Bearer ${request.accessToken}`,
            "Content-Type": "application/json",
          },
        },
      );

      return response.data ?? null;
    } catch (error) {
      console.error("Error load production tasks:", error);
      return null;
    }
  },

  async createProductionTaskField(request: CreateProductionTaskFieldRequest) {
    try {
      const response = await axios.post(API.productionTaskField, request.data, {
        headers: {
          Authorization: `Bearer ${request.accessToken}`,
          "Content-Type": "application/json",
        },
      });

      return isSuccessStatus(response.status);
    } catch (error) {
      console.error(
        "Error creating production task field:",
        getAxiosErrorPayload(error),
      );
      return false;
    }
  },

  async deleteProductionTaskField(request: DeleteProductionTaskFieldRequest) {
    try {
      const response = await axios.delete(
        API.deleteProductionTaskField.concat(`${request.id}`),
        {
          headers: {
            Authorization: `Bearer ${request.accessToken}`,
            "Content-Type": "application/json",
          },
        },
      );

      return isSuccessStatus(response.status);
    } catch (error) {
      console.error(
        "Error deleting production task field:",
        getAxiosErrorPayload(error),
      );
      return false;
    }
  },

  async createProductionTransportationTaskField(
    request: CreateProductionTransportationTaskFieldRequest,
  ) {
    if (!isValidProductionTaskId(request.data.task_id)) {
      console.error(
        "Error creating production transportation task field: production task id is invalid",
      );
      return false;
    }

    try {
      const response = await axios.post(
        API.productionTransportationTaskField,
        request.data,
        {
          headers: getJsonHeaders(request.accessToken),
        },
      );

      return isSuccessStatus(response.status);
    } catch (error) {
      console.error(
        "Error creating production transportation task field:",
        getAxiosErrorPayload(error),
      );
      return false;
    }
  },

  async deleteProductionTransportationTaskField(request: DeleteProductionTaskFieldRequest) {
    try {
      const response = await axios.delete(
        API.deleteProductionTransportationTaskField.concat(`${request.id}`),
        {
          headers: getJsonHeaders(request.accessToken),
        },
      );

      return isSuccessStatus(response.status);
    } catch (error) {
      console.error(
        "Error deleting production transportation task field:",
        getAxiosErrorPayload(error),
      );
      return false;
    }
  },

  async updateProductionTransportationTaskField(
    request: UpdateProductionTransportationTaskFieldRequest,
  ) {
    try {
      const response = await axios.put(
        API.productionTransportationTaskField,
        request.data,
        {
          headers: getJsonHeaders(request.accessToken),
        },
      );

      return isSuccessStatus(response.status);
    } catch (error) {
      console.error(
        "Error updating production transportation task field:",
        getAxiosErrorPayload(error),
      );
      return false;
    }
  },

  async createProductionFieldTaskTechnique(request: ProductionFieldTaskTechniqueRequest) {
    try {
      const response = await axios.post(
        API.productionFieldTaskTechnique,
        request.data,
        {
          headers: {
            Authorization: `Bearer ${request.accessToken}`,
            "Content-Type": "application/json",
          },
        },
      );

      return isSuccessStatus(response.status);
    } catch (error) {
      console.error("Error creating production field task technique:", error);
      return false;
    }
  },

  async createProductionTransportationTaskTechnique(request: ProductionFieldTaskTechniqueRequest) {
    try {
      const response = await axios.post(
        API.productionTransportationTaskTechnique,
        request.data,
        {
          headers: getJsonHeaders(request.accessToken),
        },
      );

      return isSuccessStatus(response.status);
    } catch (error) {
      console.error(
        "Error creating production transportation task technique:",
        getAxiosErrorPayload(error),
      );
      return false;
    }
  },

  async createProductionTransportTaskTechnique(request: ProductionFieldTaskTechniqueRequest) {
    try {
      const response = await axios.post(
        API.productionTransportTaskTechnique,
        request.data,
        {
          headers: getJsonHeaders(request.accessToken),
        },
      );

      return isSuccessStatus(response.status);
    } catch (error) {
      console.error(
        "Error creating production transport task technique:",
        getAxiosErrorPayload(error),
      );
      return false;
    }
  },

  async moveTechniqueToNewTaskProductionFieldTask(request: MoveProductionFieldTaskTechniqueRequest) {
    try {
      const response = await axios.put(
        API.moveProductionFieldTaskTechnique,
        request.data,
        {
          headers: {
            Authorization: `Bearer ${request.accessToken}`,
            "Content-Type": "application/json",
          },
        },
      );

      return isSuccessStatus(response.status);
    } catch (error) {
      console.error("Error moving production field task technique:", {
        request: request.data,
        response: getAxiosErrorPayload(error),
      });
      return false;
    }
  },

  async deleteProductionFieldTaskTechnique(request: DeleteProductionFieldTaskTechniqueRequest) {
    try {
      const response = await axios.delete(
        API.deleteProductionFieldTaskTechnique.concat(`${request.id}`),
        {
          headers: {
            Authorization: `Bearer ${request.accessToken}`,
            "Content-Type": "application/json",
          },
        },
      );

      return isSuccessStatus(response.status);
    } catch (error) {
      console.error("Error deleting production field task technique:", error);
      return false;
    }
  },

  async deleteProductionTransportationTaskTechnique(request: DeleteProductionFieldTaskTechniqueRequest) {
    try {
      const response = await axios.delete(
        API.deleteProductionTransportationTaskTechnique.concat(`${request.id}`),
        {
          headers: getJsonHeaders(request.accessToken),
        },
      );

      return isSuccessStatus(response.status);
    } catch (error) {
      console.error(
        "Error deleting production transportation task technique:",
        getAxiosErrorPayload(error),
      );
      return false;
    }
  },

  async deleteProductionTransportTaskTechnique(request: DeleteProductionFieldTaskTechniqueRequest) {
    try {
      const response = await axios.delete(
        API.deleteProductionTransportTaskTechnique.concat(`${request.id}`),
        {
          headers: getJsonHeaders(request.accessToken),
        },
      );

      return isSuccessStatus(response.status);
    } catch (error) {
      console.error(
        "Error deleting production transport task technique:",
        getAxiosErrorPayload(error),
      );
      return false;
    }
  },

  async saveProductionTaskConsumable(request: ProductionTaskConsumableRequest) {
    try {
      const api = consumableApiByType[request.type].save;
      const method = request.data.id ? axios.put : axios.post;
      const requestData = buildConsumableRequestData(
        request.type,
        request.data,
      );

      const response = await method(api, requestData, {
        headers: {
          Authorization: `Bearer ${request.accessToken}`,
          "Content-Type": "application/json",
        },
      });

      return isSuccessStatus(response.status);
    } catch (error) {
      console.error(
        "Error saving production task consumable:",
        getAxiosErrorPayload(error),
      );
      return false;
    }
  },

  async deleteProductionTaskConsumable(request: DeleteProductionTaskConsumableRequest) {
    try {
      const api = consumableApiByType[request.type].delete;
      const response = await axios.delete(api.concat(`${request.id}`), {
        headers: {
          Authorization: `Bearer ${request.accessToken}`,
          "Content-Type": "application/json",
        },
      });

      return isSuccessStatus(response.status);
    } catch (error) {
      console.error("Error deleting production task consumable:", error);
      return false;
    }
  },

  async loadSeasonFieldWorks(request: SeasonFieldWorksRequest) {
    try {
      const response = await axios.get(
        `${API.seasonFieldWorks}/${request.season}/${request.workKind}`,
        {
          headers: {
            Authorization: `Bearer ${request.accessToken}`,
            "Content-Type": "application/json",
          },
        },
      );

      return response.data ?? [];
    } catch (error) {
      console.error(
        "Error loading season field works:",
        getAxiosErrorPayload(error),
      );
      return [];
    }
  },

  async loadSowingUnitCodes(request: SowingUnitCodeRequest) {
    try {
      const response = await axios.get(API.sowingUnitCode, {
        headers: {
          Authorization: `Bearer ${request.accessToken}`,
          "Content-Type": "application/json",
        },
      });

      return (response.data ?? []) as SowingUnitCodeResponse[];
    } catch (error) {
      console.error(
        "Error loading sowing unit code:",
        getAxiosErrorPayload(error),
      );
      return [];
    }
  },

  async loadCurrentFieldTask(request: CurrentFieldTaskRequest) {
    try {
      const response = await axios.get(API.fieldTaskById.concat(request.id), {
        headers: getJsonHeaders(request.accessToken),
      });

      return response.data ?? null;
    } catch (error) {
      console.error(
        "Error loading current field task:",
        getAxiosErrorPayload(error),
      );
      return null;
    }
  },

  async loadCurrentFieldTaskAnalytic(request: CurrentFieldTaskAnalyticRequest) {
    try {
      const response = await axios.get(
        API.currentFieldTaskAnalytic.concat(request.id),
        {
          headers: getJsonHeaders(request.accessToken),
        },
      );

      return response.data ?? null;
    } catch {
      return null;
    }
  },

  async loadCurrentTransportationTask(request: CurrentTransportationTaskRequest) {
    try {
      const response = await axios.get(
        API.currentTransportationTask.concat(request.id),
        {
          headers: getJsonHeaders(request.accessToken),
        },
      );

      return response.data ?? null;
    } catch (error) {
      console.error(
        "Error loading current transportation task:",
        getAxiosErrorPayload(error),
      );
      return null;
    }
  },

  async loadCurrentTransportTask(request: CurrentTransportTaskRequest) {
    try {
      const response = await axios.get(
        API.currentTransportTask.concat(request.id),
        {
          headers: getJsonHeaders(request.accessToken),
        },
      );

      return response.data ?? null;
    } catch (error) {
      console.error(
        "Error loading current transport task:",
        getAxiosErrorPayload(error),
      );
      return null;
    }
  },

  async loadCurrentTransportTaskAnalytic(request: CurrentTransportTaskAnalyticRequest) {
    try {
      const response = await axios.get(
        API.currentTransportTaskAnalytic.concat(request.id),
        {
          headers: getJsonHeaders(request.accessToken),
        },
      );

      return response.data ?? null;
    } catch (error) {
      console.error(
        "Error loading current transport task analytic:",
        getAxiosErrorPayload(error),
      );
      return null;
    }
  },

  async loadCurrentTransportationTaskAnalytic(request: CurrentTransportationTaskAnalyticRequest) {
    try {
      const response = await axios.get(
        API.currentTransportationTaskAnalytic.concat(request.id),
        {
          headers: getJsonHeaders(request.accessToken),
        },
      );

      return response.data ?? null;
    } catch (error) {
      console.error(
        "Error loading current transportation task analytic:",
        getAxiosErrorPayload(error),
      );
      return null;
    }
  },

  async loadProductionTaskEvaluation(request: ProductionTaskEvaluationRequest) {
    try {
      const response = await axios.get(
        API.productionTaskEvaluation.concat(request.taskId),
        {
          headers: getJsonHeaders(request.accessToken),
        },
      );

      return response.data ?? null;
    } catch (error) {
      console.error(
        "Error loading production task evaluation:",
        getAxiosErrorPayload(error),
      );
      return null;
    }
  },

  async loadProductionTransportationTaskEvaluation(request: ProductionTransportationTaskEvaluationRequest) {
    try {
      const response = await axios.get(
        API.productionTransportationTaskEvaluation.concat(request.taskId),
        {
          headers: getJsonHeaders(request.accessToken),
        },
      );

      return response.data ?? null;
    } catch (error) {
      console.error(
        "Error loading transportation task evaluation:",
        getAxiosErrorPayload(error),
      );
      return null;
    }
  },

  async loadProductionTaskParts(request: ProductionTaskPartsRequest) {
    try {
      const response = await axios.get(
        API.productionTaskParts.concat(request.taskId),
        {
          headers: getJsonHeaders(request.accessToken),
        },
      );

      return response.data ?? [];
    } catch (error) {
      console.error(
        "Error loading production task parts:",
        getAxiosErrorPayload(error),
      );
      return [];
    }
  },

  async loadProductionFieldTaskGroupedParts(request: ProductionFieldTaskGroupedPartsRequest) {
    try {
      const response = await axios.get(
        API.productionFieldTaskGroupedParts.concat(`${request.taskId}`),
        {
          headers: {
            Authorization: `Bearer ${request.accessToken}`,
            "Content-Type": "application/json",
          },
        },
      );

      return response.data ?? [];
    } catch (error) {
      console.error(
        "Error loading production field task grouped parts:",
        getAxiosErrorPayload(error),
      );
      return [];
    }
  },

  async loadProductionTransportationTaskGroupedParts(request: ProductionFieldTaskGroupedPartsRequest) {
    try {
      const response = await axios.get(
        API.productionTransportationTaskGroupedParts.concat(
          `${request.taskId}`,
        ),
        {
          headers: getJsonHeaders(request.accessToken),
        },
      );

      return response.data ?? [];
    } catch (error) {
      console.error(
        "Error loading production transportation task grouped parts:",
        getAxiosErrorPayload(error),
      );
      return [];
    }
  },

  async loadProductionTransportTaskGroupedParts(request: ProductionFieldTaskGroupedPartsRequest) {
    try {
      const response = await axios.get(
        API.productionTransportTaskGroupedParts.concat(`${request.taskId}`),
        {
          headers: getJsonHeaders(request.accessToken),
        },
      );

      return response.data ?? [];
    } catch (error) {
      console.error(
        "Error loading production transport task grouped parts:",
        getAxiosErrorPayload(error),
      );
      return [];
    }
  },

  async loadProductionStationaryTaskGroupedParts(request: ProductionFieldTaskGroupedPartsRequest) {
    try {
      const response = await axios.get(
        API.productionStationaryTaskGroupedParts.concat(`${request.taskId}`),
        {
          headers: getJsonHeaders(request.accessToken),
        },
      );

      return response.data ?? [];
    } catch (error) {
      console.error(
        "Error loading production stationary task grouped parts:",
        getAxiosErrorPayload(error),
      );
      return [];
    }
  },

  async createProductionShiftPart(request: ProductionShiftPartRequest) {
    try {
      const response = await axios.post(
        API.productionShiftPart,
        normalizeShiftPartPayload(request.data),
        {
          headers: {
            Authorization: `Bearer ${request.accessToken}`,
            "Content-Type": "application/json",
          },
        },
      );

      return isSuccessStatus(response.status);
    } catch (error) {
      console.error(
        "Error creating production shift part:",
        getAxiosErrorPayload(error),
      );
      return false;
    }
  },

  async editProductionShiftPart(request: UpdateProductionShiftPartRequest) {
    try {
      const requestData: Record<string, any> = {
        id: request.id,
        task_field_id: request.taskFieldId,
        production_task_id: request.productionTaskId,
        tariff_id: request.tariffId,
        work_place_id: request.workPlaceId,
        agricultural_machinery_id: request.agriculturalMachineryId,
        output_value: request.outputValue,
        shift_parts_ids: request.shiftPartsIds,
      };

      if (request.startAt !== undefined) {
        requestData.start_at = normalizeDateTimeOffset(request.startAt);
      }

      if (request.endedAt !== undefined) {
        const endedAt = normalizeDateTimeOffset(request.endedAt);

        if (endedAt !== null) {
          requestData.ended_at = endedAt;
        }
      }

      const response = await axios.put(
        API.productionShiftPart,
        omitUndefined(requestData),
        {
          headers: getJsonHeaders(request.accessToken),
        },
      );

      return isSuccessStatus(response.status);
    } catch (error) {
      console.error(
        "Error editing production shift part:",
        getAxiosErrorPayload(error),
      );
      return false;
    }
  },

  async editPartsMaterialQuantity(request: EditPartsMaterialQuantityRequest) {
    try {
      const response = await axios.put(
        API.productionPartsMaterialQuantity,
        request.data,
        {
          headers: getJsonHeaders(request.accessToken),
        },
      );

      return isSuccessStatus(response.status);
    } catch (error) {
      console.error(
        "Error editing parts material quantity:",
        getAxiosErrorPayload(error),
      );
      return false;
    }
  },

  async createProductionShiftPartsBatch(request: ProductionShiftPartsBatchRequest) {
    try {
      const response = await axios.post(
        API.productionShiftPartsBatch,
        request.data.map(normalizeShiftPartPayload),
        {
          headers: {
            Authorization: `Bearer ${request.accessToken}`,
            "Content-Type": "application/json",
          },
        },
      );

      return isSuccessStatus(response.status);
    } catch (error) {
      console.error(
        "Error creating production shift parts batch:",
        getAxiosErrorPayload(error),
      );
      return false;
    }
  },

  async loadProductionTaskShiftForceLoadPreview(request: ProductionTaskShiftForceLoadPreviewRequest) {
    try {
      const response = await axios.post(
        API.productionTaskShiftForceLoadPreview,
        request.data,
        {
          headers: {
            Authorization: `Bearer ${request.accessToken}`,
            "Content-Type": "application/json",
          },
        },
      );

      return response.data ?? [];
    } catch (error) {
      console.error(
        "Error loading production task shift force load preview:",
        getAxiosErrorPayload(error),
      );
      return [];
    }
  },

  async deleteProductionTaskParts(request: DeleteProductionTaskPartsRequest) {
    try {
      const response = await axios.delete(
        `${API.deleteProductionTaskParts}/${request.id}`,
        {
          headers: {
            Authorization: `Bearer ${request.accessToken}`,
            "Content-Type": "application/json",
          },
        },
      );

      return isSuccessStatus(response.status);
    } catch (error) {
      console.error(
        "Error deleting production task parts:",
        getAxiosErrorPayload(error),
      );
      return false;
    }
  },

};
