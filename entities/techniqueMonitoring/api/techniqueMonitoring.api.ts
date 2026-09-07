import axios, { isAxiosError } from "axios";

import { API } from "./endpoints/techniqueMonitoring.endpoints";
import type {
  ProductionTaskTrackRequest,
  TechniqueMonitoringMapping,
  TechniqueMonitoringRequest,
} from "../model/model.interface";
import { getAuthHeaders } from "../../../shared/lib/apiUtils";

const REQUEST_TIMEOUT_MS = 8000;

export const techniqueMonitoringApi = {
  async loadAllTechniques(accessToken: string | null) {
    try {
      const response = await axios.get(API.techniquesAll, {
        headers: getAuthHeaders(accessToken),
        timeout: REQUEST_TIMEOUT_MS,
      });

      return response?.data ?? null;
    } catch (error) {
      console.error("Failed to load all techniques:", error);
      return null;
    }
  },

  async loadMonitoringMapping(accessToken: string | null) {
    try {
      const response = await axios.get(API.techniquesForMonitoringMapping, {
        headers: getAuthHeaders(accessToken),
        timeout: REQUEST_TIMEOUT_MS,
      });

      return response.data as TechniqueMonitoringMapping[];
    } catch (error) {
      console.error("Failed to load techniques for monitoring mapping:", error);
      return null;
    }
  },

  async loadTechniqueTrack(request: TechniqueMonitoringRequest) {
    try {
      const response = await axios.get(
        API.techniqueTrack.concat(
          `${request.techniqueId}/from/${request.from}/to/${request.to}`,
        ),
        {
          headers: getAuthHeaders(request.accessToken),
          timeout: REQUEST_TIMEOUT_MS,
        },
      );

      return response?.data ?? null;
    } catch (error) {
      if (isAxiosError(error) && error.response?.status === 404) {
        return null;
      }

      throw error;
    }
  },

  async loadProductionTaskTrack(request: ProductionTaskTrackRequest) {
    try {
      const response = await axios.get(
        API.productionTaskTrack.concat(`${request.taskId}`),
        {
          headers: getAuthHeaders(request.accessToken),
          timeout: REQUEST_TIMEOUT_MS,
        },
      );

      return response?.data ?? null;
    } catch (error) {
      console.error("Failed to load production task track:", error);
      throw error;
    }
  },
};
