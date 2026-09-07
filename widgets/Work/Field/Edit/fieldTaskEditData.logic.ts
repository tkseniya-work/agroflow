export type SettledRequest<T> =
  | { status: "fulfilled"; value: T }
  | { status: "rejected"; reason: unknown };

export const settleRequest = async <T>(
  request: Promise<T>,
): Promise<SettledRequest<T>> => {
  try {
    return { status: "fulfilled", value: await request };
  } catch (reason) {
    return { status: "rejected", reason };
  }
};

export const getSettledValue = <T>(
  result: SettledRequest<T>,
  fallback: T,
) => (result.status === "fulfilled" ? result.value : fallback);

export const normalizeFieldTaskListResponse = (value: any): any[] => {
  if (!value) return [];
  if (Array.isArray(value)) return value.flatMap(normalizeFieldTaskListResponse);

  if (typeof value !== "object") return [];

  const list =
    value.data ??
    value.items ??
    value.result ??
    value.results ??
    value.records ??
    value.rows ??
    value.content ??
    value.payload ??
    value.children ??
    value.crop_variety_standards ??
    value.crop_varieties ??
    value.varieties ??
    value.pesticides ??
    value.pesticide_standards ??
    value.fertilizers ??
    value.fertilizer_standards ??
    value.list;

  if (Array.isArray(list)) return normalizeFieldTaskListResponse(list);
  if (value.id || value.name) return [value];

  return Object.values(value).flatMap(normalizeFieldTaskListResponse);
};
