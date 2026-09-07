import axios from "axios";

import { API } from "./endpoints/employee.endpoints";
import type {
  CompanyDto,
  EmployeeDto,
  UploadPictureRequest,
} from "../model/employee.interface";
import { safeGetArray, safeGetData } from "../../../shared/lib/apiUtils";

export const employeeApi = {
  loadEmployee(accessToken: string | null, userId: string | null) {
    if (!userId) return Promise.resolve(null);

    return safeGetData<EmployeeDto | null>(
      API.employeeInfo.concat(userId),
      accessToken,
      "Employee info",
      null,
    );
  },

  loadEmployeeList(accessToken: string | null, companyUuid: string | null) {
    if (!companyUuid) return Promise.resolve([]);

    return safeGetArray<EmployeeDto>(
      API.employeeList.concat(companyUuid),
      accessToken,
      "Employee list",
    );
  },

  loadCompany(accessToken: string | null, companyUuid: string | null) {
    if (!companyUuid) return Promise.resolve(null);

    return safeGetData<CompanyDto | null>(
      API.companyInfo.concat(companyUuid),
      accessToken,
      "Company info",
      null,
    );
  },

  async uploadProfilePicture(request: UploadPictureRequest) {
    const formData = new FormData();
    formData.append("profilePicture", {
      uri: request.fileUri,
      name: request.fileName,
      type: request.mimeType,
    } as unknown as Blob);

    const response = await axios.post(
      `${API.uploadPicture}/${encodeURIComponent(request.userId)}`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${request.accessToken}`,
          Accept: "application/json",
          "Content-Type": "multipart/form-data",
        },
        timeout: 30_000,
        transformRequest: (data) => data,
      },
    );

    return response.data;
  },
};
