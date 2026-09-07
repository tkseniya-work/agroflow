import axios from "axios";

import { API } from "../../../features/dictionarySync/api/endpoints/dictionaries.endpoints";
import type {
  GenerateTariffRequest,
  TariffsList,
  TariffsSearchRequest,
} from "../../../entities/dictionaries";
import { getAuthHeaders, safeGetArray } from "../../../shared/lib/apiUtils";

export const tariffsApi = {
  loadList(accessToken: string) {
    return safeGetArray<TariffsList>(
      API.tariffsList,
      accessToken,
      "Tariffs list",
    );
  },

  async search(request: TariffsSearchRequest) {
    try {
      const params = new URLSearchParams();

      if (request.workStandardId) {
        params.append("workStandardId", request.workStandardId);
      }

      if (request.techniqueModelId) {
        params.append("techniqueModelId", request.techniqueModelId);
      }

      if (request.agriculturalMachineryModelId) {
        params.append(
          "agriculturalMachineryModelId",
          request.agriculturalMachineryModelId,
        );
      }

      const response = await axios.get(`${API.tariffsSearch}?${params}`, {
        headers: getAuthHeaders(request.accessToken),
      });

      return (response.data ?? []) as TariffsList[];
    } catch (error) {
      console.error("Error searching tariffs:", error);
      return [];
    }
  },

  async generate(request: GenerateTariffRequest) {
    const response = await axios.post(
      API.tariffsGenerate,
      {
        work_standard_id: request.work_standard_id,
        technique_model_id: request.technique_model_id,
        agricultural_machinery_model_id:
          request.agricultural_machinery_model_id,
      },
      {
        headers: getAuthHeaders(request.accessToken),
      },
    );

    return response.data;
  },
};
