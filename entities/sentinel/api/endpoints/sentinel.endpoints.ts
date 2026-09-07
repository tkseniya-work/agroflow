export const API = {
	sessionLogin: `${process.env.EXPO_PUBLIC_SENTINEL_API_URL}/api/session/login`,
    getWms: `${process.env.EXPO_PUBLIC_SENTINEL_API_URL}/ogc/wms/{instanceId}/{sessionId}`,
    getFieldImageDates: `${process.env.EXPO_PUBLIC_SENTINEL_API_URL}/api/season-fields/image-dates/`,
    getFieldNDVI: `${process.env.EXPO_PUBLIC_SENTINEL_API_URL}/api/season-fields/`,
    geCatalogNDVI: `${process.env.EXPO_PUBLIC_SENTINEL_API_URL}/api/season-fields/{seasonFieldId}/catalog/from/{from}/to/{to}`,
};