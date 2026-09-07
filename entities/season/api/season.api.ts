import axios from "axios";
import { API } from "./endpoints/season.endpoints";
import type {
  SeasonFieldGrowStageEvaluationRequest,
  SeasonFieldHarvestInfoRequest,
  SeasonFieldHarvestInfoResponse,
  SeasonFieldRequest,
  SeasonFieldsRequest,
  SeasonFieldYieldForecastRequest,
  SeasonRequest,
  YieldForecast,
} from "../model/season.interface";
import {
  getAuthHeaders,
  safeGetArray,
  safeGetData,
} from "../../../shared/lib/apiUtils";

export const seasonApi = {
  loadSeasons(accessToken: string | null) {
    return safeGetArray<SeasonRequest>(API.seasons, accessToken, "Seasons");
  },

  loadSeasonFields(request: SeasonFieldsRequest) {
    return safeGetArray<SeasonFieldRequest>(
      API.seasonFields.concat(`${request.season}`),
      request.accessToken,
      "Season fields",
      {
        params: request.workKind
          ? {
              workKind: request.workKind,
              work_kind_id: request.workKind,
            }
          : undefined,
      },
    );
  },

  loadSeasonFieldHarvestInfo(request: SeasonFieldHarvestInfoRequest) {
    return safeGetData<SeasonFieldHarvestInfoResponse | null>(
      API.seasonFieldHarvestInfo(request.seasonFieldId),
      request.accessToken,
      "Season field harvest info",
      null,
    );
  },

  async loadSeasonFieldGrowStageEvaluation(
    request: SeasonFieldGrowStageEvaluationRequest,
  ) {
    const response = await axios.get(
      API.seasonFieldGrowStageEvaluation(request.seasonFieldId),
      { headers: getAuthHeaders(request.accessToken) },
    );

    return Array.isArray(response.data)
      ? (response.data as SeasonFieldRequest[])
      : [];
  },

  async loadSeasonFieldYieldForecast(request: SeasonFieldYieldForecastRequest) {
    const response = await axios.get<YieldForecast | null>(
      API.seasonFieldYieldForecast(request.seasonFieldId),
      { headers: getAuthHeaders(request.accessToken) },
    );

    return response.data;
  },

  async refreshSeasonFieldYieldForecast(
    request: SeasonFieldYieldForecastRequest,
  ) {
    await axios.get<void>(
      API.seasonFieldYieldForecastRefresh(request.seasonFieldId),
      { headers: getAuthHeaders(request.accessToken) },
    );
  },
};
