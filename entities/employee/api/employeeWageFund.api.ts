import axios from "axios";

import type {
  EmployeeWageFundRequest,
  EmployeeWageFundResponse,
} from "../model/employeeWageFund.types";
import { getAuthHeaders, logApiWarning } from "../../../shared/lib/apiUtils";
import { API } from "./endpoints/employeeWageFund.endpoints";

export const employeeWageFundApi = {
  async loadMonthly(
    request: EmployeeWageFundRequest,
  ): Promise<EmployeeWageFundResponse[]> {
    if (!request.employeeIds.length) return [];

    try {
      const response = await axios.post<EmployeeWageFundResponse[]>(
        API.monthly,
        {
          employee_ids: request.employeeIds,
          season: request.season,
        },
        {
          headers: getAuthHeaders(request.accessToken),
        },
      );

      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      logApiWarning("Employee monthly wage fund", error);
      throw error;
    }
  },
};
