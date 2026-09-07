import type { ProductionTaskConsumableType } from "../../../../entities/productionTask";

export type ConsumablePayload = {
  id?: string | null;
  production_task_field_id: string;
  crop_variety_standard_id?: string | null;
  pesticide_id?: string | null;
  fertilizer_id?: string | null;
  unit_code?: number | string | null;
  quantity: number;
  weight?: number | null;
};

export type ConsumableListItem = {
  type: ProductionTaskConsumableType;
  item: any;
};

export type ConsumableOption = {
  id: string | number;
  title: string;
  subtitle: string | null;
  raw: any;
};

export const normTypeLabels: Record<ProductionTaskConsumableType, string> = {
  seed: "Семена",
  pesticide: "СЗР",
  fertilizer: "Удобрения",
};

export const getConsumableName = (
  item: any,
  type: ProductionTaskConsumableType,
) => {
  if (type === "seed") {
    return (
      item?.crop_variety_standard?.name ??
      item?.crop_variety?.name ??
      item?.name
    );
  }

  if (type === "pesticide") {
    return (
      item?.pesticide?.name ?? item?.pesticide_standard?.name ?? item?.name
    );
  }

  return (
    item?.fertilizer?.name ?? item?.fertilizer_standard?.name ?? item?.name
  );
};

const getPayloadIdKey = (type: ProductionTaskConsumableType) => {
  if (type === "seed") return "crop_variety_standard_id";
  if (type === "pesticide") return "pesticide_id";
  return "fertilizer_id";
};

const getConsumableSource = (
  item: any,
  type: ProductionTaskConsumableType,
) => {
  if (type === "seed") {
    return item?.crop_variety_standard ?? item?.crop_variety ?? item;
  }

  if (type === "pesticide") {
    return item?.pesticide ?? item?.pesticide_standard ?? item;
  }

  return item?.fertilizer ?? item?.fertilizer_standard ?? item;
};

const getDictionarySubtitle = (item: any) =>
  item?.producer ??
  item?.base_fertilizer_name ??
  item?.description ??
  item?.source ??
  null;

export const normalizeDictionaryItems = (value: any): any[] => {
  if (!value) return [];

  if (Array.isArray(value)) {
    return value.flatMap((item) => {
      const nestedList =
        item?.items ??
        item?.data ??
        item?.children ??
        item?.crop_variety_standards ??
        item?.crop_varieties ??
        item?.varieties ??
        item?.pesticides ??
        item?.pesticide_standards ??
        item?.fertilizers ??
        item?.fertilizer_standards ??
        item?.list;

      return Array.isArray(nestedList)
        ? normalizeDictionaryItems(nestedList)
        : item;
    });
  }

  if (typeof value !== "object") return [];

  const nestedList =
    value.items ??
    value.data ??
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

  if (Array.isArray(nestedList)) {
    return normalizeDictionaryItems(nestedList);
  }

  if (value.id || value.name) return [value];

  return Object.values(value).flatMap((nestedValue) =>
    nestedValue && typeof nestedValue === "object"
      ? normalizeDictionaryItems(nestedValue)
      : [],
  );
};

export const buildFieldOptions = (fields: any[]): ConsumableOption[] =>
  (fields || []).map((field) => ({
    id: field.id,
    title: field.name || field.number || "Поле без названия",
    subtitle: `${Number(field.area ?? 0).toLocaleString("ru-RU")} га`,
    raw: field,
  }));

export const buildConsumableItems = (
  field: any,
  mode: "norm" | "plan",
): ConsumableListItem[] => {
  if (!field) return [];

  if (mode === "norm") {
    return [
      ...(field.seed_norm_consumption
        ? [{ type: "seed" as const, item: field.seed_norm_consumption }]
        : []),
      ...(field.pesticide_norm_consumption ?? []).map((item: any) => ({
        type: "pesticide" as const,
        item,
      })),
      ...(field.fertilizer_norm_consumption ?? []).map((item: any) => ({
        type: "fertilizer" as const,
        item,
      })),
    ];
  }

  return [
    ...(field.seed_plan_consumption
      ? [{ type: "seed" as const, item: field.seed_plan_consumption }]
      : []),
    ...(field.pesticide_plan_consumptions ?? []).map((item: any) => ({
      type: "pesticide" as const,
      item,
    })),
    ...(field.fertilizer_plan_consumptions ?? []).map((item: any) => ({
      type: "fertilizer" as const,
      item,
    })),
  ];
};

export const buildSourceOptions = (
  dictionarySource: any,
  type: ProductionTaskConsumableType,
): ConsumableOption[] =>
  normalizeDictionaryItems(dictionarySource)
    .filter(Boolean)
    .map((item, index) => ({
      id: item.id ?? `${type}-${index}`,
      title:
        getConsumableName(item, type) ?? item.title ?? normTypeLabels[type],
      subtitle: getDictionarySubtitle(item),
      raw: item,
    }));

export const buildUnitOptions = (source: any): ConsumableOption[] =>
  normalizeDictionaryItems(source)
    .filter(Boolean)
    .map((item, index) => ({
      id: item.type ?? item.id ?? `${index}`,
      title: item.name ?? item.description ?? "Единица измерения",
      subtitle: item.description ?? null,
      raw: item,
    }));

export const getInitialUnit = (item: any) =>
  item?.unit_code
    ? {
        ...item.unit_code,
        type: item.unit_code.id ?? item.unit_code.type,
        name: item.unit_code.description ?? item.unit_code.name,
      }
    : null;

export const getConsumableRowMeta = (
  item: any,
  type: ProductionTaskConsumableType,
) => ({
  name: getConsumableName(item, type) ?? normTypeLabels[type],
  value: item?.quantity ?? item?.norm_value ?? 0,
  unit:
    type === "seed"
      ? (item?.unit_code?.description ?? "")
      : type === "pesticide"
        ? "л/га"
        : "кг/га",
});

type BuildPayloadResult =
  | { payload: ConsumablePayload; error: null }
  | { payload: null; error: string };

export const buildConsumablePayload = ({
  fieldId,
  type,
  editingItem,
  selectedSource,
  selectedUnit,
  quantity,
}: {
  fieldId: string;
  type: ProductionTaskConsumableType;
  editingItem: any | null;
  selectedSource: any | null;
  selectedUnit: any | null;
  quantity: string;
}): BuildPayloadResult => {
  const quantityValue = Number(quantity.replace(",", "."));
  if (!Number.isFinite(quantityValue) || quantityValue <= 0) {
    return { payload: null, error: "Укажите норму" };
  }

  const idSource = editingItem?.item ?? editingItem ?? selectedSource;
  if (!idSource) {
    return { payload: null, error: "Выберите расходник из плана" };
  }

  const source = getConsumableSource(idSource, type);
  const unitCode =
    selectedUnit?.type ??
    selectedUnit?.id ??
    idSource?.unit_code?.id ??
    idSource?.unit_code ??
    null;

  if (type === "seed" && unitCode === null) {
    return { payload: null, error: "Выберите единицу измерения" };
  }

  const idKey = getPayloadIdKey(type);

  return {
    error: null,
    payload: {
      id: editingItem ? (idSource?.id ?? null) : null,
      production_task_field_id: fieldId,
      [idKey]: source?.id ?? null,
      unit_code: unitCode,
      quantity: quantityValue,
      weight: idSource?.weight ?? null,
    },
  };
};
