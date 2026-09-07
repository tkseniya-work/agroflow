import axios, { AxiosRequestConfig, isAxiosError } from "axios";

export const isSuccessStatus = (status: number) => status >= 200 && status < 300;

export const getAuthHeaders = (accessToken: string | null) => ({
  Authorization: `Bearer ${accessToken}`,
  "Content-Type": "application/json",
});

export const logApiWarning = (label: string, error: unknown) => {
  if (isAxiosError(error)) {
    console.warn(`${label} request failed:`, {
      status: error.response?.status,
      url: error.config?.url,
    });
    return;
  }

  console.warn(`${label} request failed:`, error);
};

export const safeGetData = async <T>(
  url: string,
  accessToken: string | null,
  label: string,
  fallback: T,
  config?: AxiosRequestConfig,
): Promise<T> => {
  try {
    const response = await axios.get(url, {
      ...config,
      headers: {
        ...getAuthHeaders(accessToken),
        ...config?.headers,
      },
    });

    return response.data ?? fallback;
  } catch (error) {
    logApiWarning(label, error);
    return fallback;
  }
};

export const safeGetArray = async <T>(
  url: string,
  accessToken: string | null,
  label: string,
  config?: AxiosRequestConfig,
): Promise<T[]> => {
  const data = await safeGetData<unknown>(url, accessToken, label, [], config);

  return Array.isArray(data) ? (data as T[]) : [];
};
