import axios from "axios";
import * as Application from "expo-application";
import Constants from "expo-constants";

export const APP_VERSION_HEADER = "X-App-Version";

const INTERNAL_API_BASE_URLS = [
  process.env.EXPO_PUBLIC_STS_URL,
  process.env.EXPO_PUBLIC_STAFF_API_URL,
  process.env.EXPO_PUBLIC_PROFILE_API_URL,
  process.env.EXPO_PUBLIC_AGRO_API_URL,
  process.env.EXPO_PUBLIC_WEATHER_API_URL,
  process.env.EXPO_PUBLIC_PRICEINSIGHT_API_URL,
  process.env.EXPO_PUBLIC_ASSISTANTS_API_URL,
  process.env.EXPO_PUBLIC_SENTINEL_API_URL,
  process.env.EXPO_PUBLIC_TECHMONITOR_API_URL,
  process.env.EXPO_PUBLIC_NOTIFICATIONS_API_URL,
]
  .filter((url): url is string => Boolean(url))
  .map((url) => url.replace(/\/+$/, ""));

const STORE_VERSION_SUFFIX = /-(?:play|rustore|appgallery)$/i;

type ConfiguredGlobal = typeof globalThis & {
  __appRequestHeadersConfigured?: boolean;
};

function getAppVersion(): string {
  const version =
    Application.nativeApplicationVersion?.trim() ||
    Constants.expoConfig?.version?.trim();

  return version?.replace(STORE_VERSION_SUFFIX, "") || "unknown";
}

function getAbsoluteRequestUrl(url?: string, baseURL?: string): string {
  if (!url) {
    return "";
  }

  if (/^https?:\/\//i.test(url) || !baseURL) {
    return url;
  }

  return `${baseURL.replace(/\/+$/, "")}/${url.replace(/^\/+/, "")}`;
}

export function isInternalApiUrl(url?: string, baseURL?: string): boolean {
  const requestUrl = getAbsoluteRequestUrl(url, baseURL);

  return INTERNAL_API_BASE_URLS.some(
    (apiBaseUrl) =>
      requestUrl === apiBaseUrl ||
      requestUrl.startsWith(`${apiBaseUrl}/`) ||
      requestUrl.startsWith(`${apiBaseUrl}?`),
  );
}

function getFetchRequestUrl(input: RequestInfo | URL): string {
  if (typeof input === "string") {
    return input;
  }

  if ("url" in input) {
    return input.url;
  }

  return input.toString();
}

function configureAxiosHeaders(appVersion: string) {
  axios.interceptors.request.use((config) => {
    if (isInternalApiUrl(config.url, config.baseURL)) {
      config.headers.set(APP_VERSION_HEADER, appVersion);
    }

    return config;
  });
}

function configureFetchHeaders(appVersion: string) {
  const originalFetch = globalThis.fetch.bind(globalThis);

  globalThis.fetch = async (input, init) => {
    if (!isInternalApiUrl(getFetchRequestUrl(input))) {
      return originalFetch(input, init);
    }

    const inputHeaders =
      typeof input === "object" && "headers" in input
        ? input.headers
        : undefined;
    const headers = new Headers(inputHeaders);

    if (init?.headers) {
      new Headers(init.headers).forEach((value, key) => {
        headers.set(key, value);
      });
    }

    headers.set(APP_VERSION_HEADER, appVersion);

    return originalFetch(input, {
      ...init,
      headers,
    });
  };
}

export function configureAppRequestHeaders() {
  const configuredGlobal = globalThis as ConfiguredGlobal;

  if (configuredGlobal.__appRequestHeadersConfigured) {
    return;
  }

  configuredGlobal.__appRequestHeadersConfigured = true;

  const appVersion = getAppVersion();
  configureAxiosHeaders(appVersion);
  configureFetchHeaders(appVersion);
}
