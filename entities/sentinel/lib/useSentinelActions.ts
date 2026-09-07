import { sentinelApi } from "../api/sentinel.api";

export const useSentinelActions = () => ({
  getSessionId: sentinelApi.getSessionId,
  loadFieldImageDates: sentinelApi.loadFieldImageDates,
  loadSeasonFieldNdvi: sentinelApi.loadSeasonFieldNdvi,
});
