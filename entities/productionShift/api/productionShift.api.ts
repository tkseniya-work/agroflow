import axios from "axios";

import { API } from "./endpoints/productionShift.endpoints";
import type {
  ProductionShiftRequest,
  ProductionShiftResponseDto,
  ProductionShiftSettingsDto,
} from "../model/productionShift.interface";
import {
  getAuthHeaders,
  logApiWarning,
  safeGetData,
} from "../../../shared/lib/apiUtils";

const PRODUCTION_SHIFTS_REQUEST_TIMEOUT_MS = 10000;

export const productionShiftApi = {
  async loadByEmployee(request: ProductionShiftRequest) {
    const url = API.productionShiftsByEmployee.concat(
      `${request.userId}/${request.startDate}/${request.endDate}`,
    );

    try {
      const response = await axios.get<ProductionShiftResponseDto>(url, {
        headers: getAuthHeaders(request.accessToken),
        timeout: PRODUCTION_SHIFTS_REQUEST_TIMEOUT_MS,
      });

      return response.data ?? null;
    } catch (error) {
      logApiWarning("Production shifts by employee", error);
      throw error;
    }
  },

  loadSettings(accessToken: string | null) {
    return safeGetData<ProductionShiftSettingsDto | null>(
      API.settingsProductionShift,
      accessToken,
      "Production shift settings",
      null,
    );
  },
};
