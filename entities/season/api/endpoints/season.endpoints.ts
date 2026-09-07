export const API = {
	seasons: `${process.env.EXPO_PUBLIC_AGRO_API_URL}/api/seasons`,
    seasonFields: `${process.env.EXPO_PUBLIC_AGRO_API_URL}/api/season-fields/`,
    seasonFieldHarvestInfo: (seasonFieldId: string) =>
      `${process.env.EXPO_PUBLIC_AGRO_API_URL}/api/season-fields/harvest-info/${encodeURIComponent(seasonFieldId)}`,
    seasonFieldGrowStageEvaluation: (seasonFieldId: string) =>
      `${process.env.EXPO_PUBLIC_AGRO_API_URL}/api/season-fields/season-field-grow-stage-evaluation/${encodeURIComponent(seasonFieldId)}`,
    seasonFieldYieldForecast: (seasonFieldId: string) =>
      `${process.env.EXPO_PUBLIC_AGRO_API_URL}/api/season-fields/season-field-yield-forecast/${encodeURIComponent(seasonFieldId)}`,
    seasonFieldYieldForecastRefresh: (seasonFieldId: string) =>
      `${process.env.EXPO_PUBLIC_AGRO_API_URL}/api/season-fields/season-field-yield-forecast/refresh/${encodeURIComponent(seasonFieldId)}`,
};
