import { seasonApi } from "../api/season.api";

export const useSeasonActions = () => ({
  loadSeasonFields: seasonApi.loadSeasonFields,
  loadSeasonFieldGrowStageEvaluation:
    seasonApi.loadSeasonFieldGrowStageEvaluation,
  loadSeasonFieldHarvestInfo: seasonApi.loadSeasonFieldHarvestInfo,
  loadSeasonFieldYieldForecast: seasonApi.loadSeasonFieldYieldForecast,
  refreshSeasonFieldYieldForecast:
    seasonApi.refreshSeasonFieldYieldForecast,
  loadSeasons: seasonApi.loadSeasons,
});
