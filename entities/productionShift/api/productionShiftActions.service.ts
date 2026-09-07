import axios, { isAxiosError } from "axios";

import { API } from "./endpoints/productionShift.endpoints";
import type {
  CloseInitialPartRequest,
  CloseProductionShiftRequest,
  OpenProductionShiftRequest,
  UpdateProductionShiftPartRequest,
  UpdateProductionShiftPartTariff,
  UpdateProductionShiftTotalsV2,
} from "../model/productionShift.interface";
import { getAuthHeaders, isSuccessStatus } from "../../../shared/lib/apiUtils";

type ApiErrorResponse = {
  detail?: unknown;
  title?: unknown;
  message?: unknown;
};

export const getProductionShiftApiErrorMessage = (response: unknown) => {
  if (!response || typeof response !== "object") return null;

  const { detail, title, message } = response as ApiErrorResponse;
  const candidate = [detail, title, message].find(
    (value): value is string =>
      typeof value === "string" && value.trim().length > 0,
  );

  return candidate?.trim() ?? null;
};

const normalizeDateTimeOffset = (value: string | null | undefined) => {
  if (value === null || value === undefined || value === "") return null;

  const parsed = new Date(value);

  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
};

export const buildProductionShiftTotalsV2Payload = (
  request: UpdateProductionShiftTotalsV2,
) => ({
  task_id: request.taskId,
  shift_id: request.shiftId,
  tariff_id: request.tariffId,
  old_tariff_id: request.oldTariffId,
  work_place_id: request.workPlaceId,
  ...("updateFieldTaskParts" in request
    ? {
        update_field_task_parts: {
          task_field_id: request.updateFieldTaskParts.taskFieldId,
          agricultural_machinery_id:
            request.updateFieldTaskParts.agriculturalMachineryId,
          output_value: request.updateFieldTaskParts.outputValue,
          fact_area: request.updateFieldTaskParts.factArea,
          threshed: request.updateFieldTaskParts.threshed,
          number_of_bins: request.updateFieldTaskParts.numberOfBins,
        },
      }
    : "updateTransportTaskParts" in request
      ? {
          update_transport_task_parts: {
            agricultural_machinery_id:
              request.updateTransportTaskParts.agriculturalMachineryId,
            output_value: request.updateTransportTaskParts.outputValue,
          },
        }
      : "updateStationaryTaskParts" in request
        ? {
            update_stationary_task_parts: {
              output_value: request.updateStationaryTaskParts.outputValue,
            },
          }
        : {
            update_transportation_task_parts: {
              agricultural_machinery_id:
                request.updateTransportationTaskParts
                  .agriculturalMachineryId,
              output_value:
                request.updateTransportationTaskParts.outputValue,
              transported_weight:
                request.updateTransportationTaskParts.transportedWeight,
              number_of_trips:
                request.updateTransportationTaskParts.numberOfTrips,
            },
          }),
});

export const productionShiftActionsService = {
  async openShift(request: OpenProductionShiftRequest) {
    const requestData = {
      code: request.code,
      shift_type: request.shiftType,
      employee_id: request.employeeId,
      scanned_at: request.scannedAt,
      scanned_place: request.scannedPlace,
    };

    try {
      const response = await axios.post(API.openProductionShift, requestData, {
        headers: getAuthHeaders(request.accessToken),
      });

      return response?.data ?? null;
    } catch (error) {
      if (isAxiosError(error)) {
        const responseMessage = getProductionShiftApiErrorMessage(
          error.response?.data,
        );

        console.error("Error open production shift:", {
          status: error.response?.status,
          response: error.response?.data,
          method: error.config?.method,
          url: error.config?.url,
          request: requestData,
        });

        throw new Error(responseMessage || "Не удалось открыть смену");
      } else {
        console.error("Error open production shift:", error);
      }

      throw error instanceof Error
        ? error
        : new Error("Не удалось открыть смену");
    }
  },

  async closeShift(request: CloseProductionShiftRequest) {
    try {
      const requestData = {
        closed_at: request.closeAt,
        shift_id: request.shiftId,
      };

      const response = await axios.post(API.closeProductionShift, requestData, {
        headers: getAuthHeaders(request.accessToken),
      });

      return isSuccessStatus(response.status);
    } catch (error) {
      console.error("Error closing production shift:", error);
      return false;
    }
  },

  async updatePart(request: UpdateProductionShiftPartRequest) {
    try {
      const requestData = {
        id: request.id,
        ended_at: normalizeDateTimeOffset(request.endedAt),
        start_at: normalizeDateTimeOffset(request.startAt),
        task_field_id: request.taskFieldId,
        production_task_id: request.productionTaskId,
        tariff_id: request.tariffId,
        work_place_id: request.workPlaceId,
        agricultural_machinery_id: request.agriculturalMachineryId,
      };

      const response = await axios.put(
        API.updateProductionShiftPart,
        requestData,
        { headers: getAuthHeaders(request.accessToken) },
      );

      return isSuccessStatus(response.status);
    } catch (error) {
      console.error("Error update production shift part:", error);
      return false;
    }
  },

  async updatePartTariff(request: UpdateProductionShiftPartTariff) {
    try {
      const requestData = Object.fromEntries(
        Object.entries({
          tariff_id: request.tariffId,
          work_place_id: request.workPlaceId,
          agricultural_machinery_standard_id:
            request.agriculturalMachineryStandardId,
          shift_parts_ids: request.shiftPartsIds,
          output_value: request.outputValue,
          fact_area: request.factArea,
          transported_weight: request.transportedWeight,
          number_of_trips: request.numberOfTrips,
        }).filter(([, value]) => value !== undefined),
      );

      const response = await axios.put(
        API.updateProductionShiftPartTariff,
        requestData,
        { headers: getAuthHeaders(request.accessToken) },
      );

      return isSuccessStatus(response.status);
    } catch (error) {
      console.error("Error update production shift tariff:", error);
      return false;
    }
  },

  async updateTotalsV2(request: UpdateProductionShiftTotalsV2) {
    try {
      const response = await axios.put(
        API.updateProductionShiftTotalsV2,
        buildProductionShiftTotalsV2Payload(request),
        { headers: getAuthHeaders(request.accessToken) },
      );

      return isSuccessStatus(response.status);
    } catch (error) {
      console.error("Error update production shift totals:", error);
      return false;
    }
  },

  async closeInitialPart(request: CloseInitialPartRequest) {
    try {
      const requestData = {
        production_shift_part_id: request.productionShiftPartId,
        closed_at: request.closedAt,
      };

      const response = await axios.post(API.closeInitialPart, requestData, {
        headers: getAuthHeaders(request.accessToken),
      });

      return response?.data;
    } catch (error) {
      console.error("Error close production shift part:", error);
      return false;
    }
  },
};
