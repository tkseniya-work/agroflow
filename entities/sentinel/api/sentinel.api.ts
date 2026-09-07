import axios from "axios";

import { API } from "./endpoints/sentinel.endpoints";
import type {
  FieldImageDatesRequest,
  SeasonFieldNdviRequest,
} from "../model/sentinel.interface";
import { getAuthHeaders } from "../../../shared/lib/apiUtils";

export const sentinelApi = {
  async getSessionId(accessToken: string | null) {
    try {
      const response = await axios.post(API.sessionLogin, null, {
        headers: getAuthHeaders(accessToken),
      });

      return response?.data ?? null;
    } catch (error) {
      console.error("Error getting Sentinel session id:", error);
      return null;
    }
  },

  async loadFieldImageDates(request: FieldImageDatesRequest) {
    try {
      const response = await axios.get(
        API.getFieldImageDates.concat(
          `${request.season}/from/${request.from}/to/${request.to}`,
        ),
        {
          headers: getAuthHeaders(request.accessToken),
        },
      );

      return response?.data ?? null;
    } catch (error) {
      console.error("Error loading field image dates:", error);
      return null;
    }
  },

  async loadSeasonFieldNdvi(request: SeasonFieldNdviRequest) {
    try {
      const response = await axios.get(
        API.getFieldNDVI.concat(
          `${request.sessionFieldId}/ndvi/from/${request.from}/to/${request.to}`,
        ),
        {
          headers: getAuthHeaders(request.accessToken),
        },
      );

      return response?.data ?? null;
    } catch (error) {
      console.error("Error loading season field NDVI:", error);
      return null;
    }
  },
};
