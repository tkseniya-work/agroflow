import dayjs from "dayjs";

import { ShiftPartDetails } from "../../../../../src/types/task.types";

export type FormState = {
  startAt: string;
  endedAt: string;
  outputValue: string;
  factArea: string;
  threshed: string;
  numberOfBins: string;
  transportedWeight: string;
  numberOfTrips: string;
  forceLoadTrack: boolean;
};

export type MaterialItem = {
  id: string | number;
  type: "pesticide" | "fertilizer" | "seed" | "fuel";
  label: string;
  value: number;
  unit: string;
  unitCode?: number | null;
};

export const asInput = (value: any) =>
  value === null || value === undefined ? "" : String(value);

export const toNumberOrNull = (value: string) => {
  const normalized = value.trim().replace(",", ".");

  if (!normalized) return null;

  const parsed = Number(normalized);

  return Number.isFinite(parsed) ? parsed : null;
};

export const parseMaterialQuantity = (value: string) =>
  Number(value.trim().replace(",", "."));

export const getMaterialQuantityError = (value: string) => {
  if (!value.trim()) return "Укажите количество расходника";

  const quantity = parseMaterialQuantity(value);

  if (!Number.isFinite(quantity) || quantity < 0) {
    return "Введите корректное неотрицательное число";
  }

  return null;
};

export const toApiIso = (value: string) => {
  if (!value) return null;

  const parsed = dayjs(value);

  return parsed.isValid() ? parsed.toISOString() : value;
};

export const isSameApiDateTime = (
  left: string | null,
  right: string | null,
) => {
  if (!left && !right) return true;
  if (!left || !right) return false;

  return left === right;
};

export const getTaskTechniques = (task: any) => {
  const sources = [
    task?.transport_task?.aggregates,
    task?.transportTask?.aggregates,
    task?.transport_task?.techniques,
    task?.transportTask?.techniques,
    task?.transportation_task?.aggregates,
    task?.transportationTask?.aggregates,
    task?.products_transportation_task?.aggregates,
    task?.productsTransportationTask?.aggregates,
    task?.product_transportation_task?.aggregates,
    task?.productTransportationTask?.aggregates,
    task?.transportation_task?.techniques,
    task?.transportationTask?.techniques,
    task?.field_task?.techniques,
  ];

  return sources.find(Array.isArray) ?? [];
};

export const getTechniqueFromTaskItem = (item: any) =>
  item?.technique?.technique ??
  item?.technique_standard ??
  item?.techniqueStandard ??
  item?.technique ??
  item;

const getTaskTypeId = (task: any) => {
  const value = Number(task?.task_type?.id ?? task?.taskType?.id);

  return Number.isFinite(value) ? value : null;
};

export const hasTransportTask = (task: any) => {
  const taskTypeId = getTaskTypeId(task);

  return taskTypeId !== null
    ? taskTypeId === 2
    : Boolean(task?.transport_task ?? task?.transportTask);
};

export const hasTransportationTask = (task: any) => {
  const taskTypeId = getTaskTypeId(task);

  if (taskTypeId !== null) return taskTypeId === 4;

  return Boolean(
    task?.transportation_task ??
      task?.transportationTask ??
      task?.products_transportation_task ??
      task?.productsTransportationTask ??
      task?.product_transportation_task ??
      task?.productTransportationTask ??
      Number(task?.work_standard?.work_kind_id) === 13,
  );
};

const getFirstPresentValue = (values: any[]) =>
  values.find(
    (value) => value !== null && value !== undefined && value !== "",
  );

const getFirstNonZeroNumber = (values: any[]) =>
  values.find((value) => {
    if (value === null || value === undefined || value === "") return false;

    const parsed = Number(String(value).replace(",", "."));

    return Number.isFinite(parsed) && parsed !== 0;
  });

export const getShiftPartOutputValue = ({
  tariffGrouped,
  fieldGrouped,
  transferGrouped,
  isTransportOutput,
}: {
  tariffGrouped: any;
  fieldGrouped: any;
  transferGrouped: any;
  isTransportOutput: boolean;
}) => {
  const explicitOutputValues = [
    tariffGrouped?.output_value_total,
    tariffGrouped?.outputValueTotal,
    tariffGrouped?.output_value,
    tariffGrouped?.outputValue,
    fieldGrouped?.output_value_total,
    fieldGrouped?.outputValueTotal,
    fieldGrouped?.output_value,
    fieldGrouped?.outputValue,
    transferGrouped?.output_value_total,
    transferGrouped?.outputValueTotal,
    transferGrouped?.output_value,
    transferGrouped?.outputValue,
  ];

  if (!isTransportOutput) {
    return getFirstPresentValue(explicitOutputValues) ?? null;
  }

  const distanceValues = [
    tariffGrouped?.production_kilometers,
    tariffGrouped?.productionKilometers,
    tariffGrouped?.kilometers,
    fieldGrouped?.production_kilometers,
    fieldGrouped?.productionKilometers,
    fieldGrouped?.kilometers,
    transferGrouped?.production_kilometers,
    transferGrouped?.productionKilometers,
    transferGrouped?.kilometers,
  ];

  return (
    getFirstNonZeroNumber(explicitOutputValues) ??
    getFirstNonZeroNumber(distanceValues) ??
    getFirstPresentValue(explicitOutputValues) ??
    getFirstPresentValue(distanceValues) ??
    null
  );
};

export const getTechniqueModelId = (techniqueOption: any) =>
  techniqueOption?.technique?.machinery_model?.id ??
  techniqueOption?.technique?.technique?.machinery_model?.id ??
  techniqueOption?.machinery_model?.id;

export const getAgriModelId = (agriOption: any) =>
  agriOption?.agriculturalMachinery?.machinery_model?.id ??
  agriOption?.machinery_model?.id;

export const getTechniqueId = (techniqueOption: any) =>
  techniqueOption?.technique_id ??
  techniqueOption?.technique?.id ??
  techniqueOption?.technique?.technique?.id ??
  techniqueOption?.id;

export const getAgriSource = (aggregate: any) =>
  aggregate?.agricultural_machine ?? aggregate?.agriculturalMachine ?? null;

export const getTechniqueSource = (aggregate: any) =>
  aggregate?.technique_standard ?? aggregate?.techniqueStandard ?? null;

type BuildSavePlanParams = {
  accessToken: string;
  currentTaskId: string;
  productionShiftId: string;
  detailsType: "field" | "transfer";
  form: FormState;
  originalStartAt: string | null;
  originalEndedAt: string | null;
  originalFieldId?: string | number | null;
  editablePartIds: string[];
  fallbackPartId?: string | number | null;
  isTransportOutput: boolean;
  selectedFieldId?: string | null;
  selectedTechnique: any;
  selectedAgriMachineId?: string | null;
  selectedTariffId?: string | null;
  oldTariffId?: string | null;
  isTransportation: boolean;
  isTransportTask: boolean;
  workPlaces: any[];
};

export const buildShiftPartSavePlan = ({
  accessToken,
  currentTaskId,
  productionShiftId,
  detailsType,
  form,
  originalStartAt,
  originalEndedAt,
  originalFieldId,
  editablePartIds,
  fallbackPartId,
  isTransportOutput,
  selectedFieldId,
  selectedTechnique,
  selectedAgriMachineId,
  selectedTariffId,
  oldTariffId,
  isTransportation,
  isTransportTask,
  workPlaces,
}: BuildSavePlanParams) => {
  const selectedTechniqueId =
    selectedTechnique?.technique?.id ??
    selectedTechnique?.technique?.technique?.id ??
    selectedTechnique?.technique_id ??
    selectedTechnique?.id;
  const workPlaceId =
    selectedTechnique?.work_place_id ??
    selectedTechnique?.workPlace?.id ??
    workPlaces.find(
      (item: any) =>
        item.work_place_technique?.technique.id === selectedTechniqueId,
    )?.id ??
    null;
  const partIds = editablePartIds.length
    ? editablePartIds
    : [fallbackPartId].filter(Boolean).map(String);
  const nextStartAt = toApiIso(form.startAt);
  const nextEndedAt = toApiIso(form.endedAt);
  const timeChanged =
    !isSameApiDateTime(nextStartAt, originalStartAt) ||
    !isSameApiDateTime(nextEndedAt, originalEndedAt);
  const fieldChanged =
    !isTransportOutput &&
    String(selectedFieldId ?? "") !== String(originalFieldId ?? "");
  const safeEndedAt = nextStartAt
    ? nextEndedAt && dayjs(nextEndedAt).isAfter(dayjs(nextStartAt))
      ? nextEndedAt
      : dayjs(nextStartAt).add(1, "second").toISOString()
    : nextEndedAt;
  const shouldUpdatePart = timeChanged || fieldChanged;
  const tariffChanged =
    String(selectedTariffId ?? "") !== String(oldTariffId ?? "");
  const outputValue = toNumberOrNull(form.outputValue);
  const agriculturalMachineryId = selectedAgriMachineId ?? null;
  const totalsBase = {
    accessToken,
    taskId: currentTaskId,
    shiftId: productionShiftId,
    tariffId: selectedTariffId ?? null,
    oldTariffId: tariffChanged ? (oldTariffId ?? null) : null,
    workPlaceId,
  };
  const totalsRequest =
    isTransportation
      ? {
          ...totalsBase,
          updateTransportationTaskParts: {
            agriculturalMachineryId,
            outputValue,
            transportedWeight: toNumberOrNull(form.transportedWeight),
            numberOfTrips: toNumberOrNull(form.numberOfTrips),
          },
        }
      : isTransportTask
        ? {
            ...totalsBase,
            updateTransportTaskParts: {
              agriculturalMachineryId,
              outputValue,
            },
          }
        : {
            ...totalsBase,
            updateFieldTaskParts: {
              taskFieldId:
                detailsType === "field" && !isTransportOutput
                  ? (selectedFieldId ?? null)
                  : null,
              agriculturalMachineryId,
              outputValue,
              factArea:
                detailsType === "field" && !isTransportOutput
                  ? toNumberOrNull(form.factArea)
                  : null,
              threshed:
                detailsType === "field" && !isTransportOutput
                  ? toNumberOrNull(form.threshed)
                  : null,
              numberOfBins:
                detailsType === "field" && !isTransportOutput
                  ? toNumberOrNull(form.numberOfBins)
                  : null,
            },
          };

  return {
    partIds,
    hasInvalidTimes: shouldUpdatePart && (!nextStartAt || !safeEndedAt),
    partRequests: shouldUpdatePart
      ? partIds.map((partId) => ({
          accessToken,
          id: String(partId),
          endedAt: safeEndedAt,
          startAt: nextStartAt,
          taskFieldId: isTransportOutput ? null : (selectedFieldId ?? null),
          productionTaskId: currentTaskId,
          tariffId: selectedTariffId ?? null,
          workPlaceId,
          agriculturalMachineryId: selectedAgriMachineId ?? null,
        }))
      : [],
    totalsRequest,
  };
};

export const buildMaterialQuantityRequest = ({
  accessToken,
  materialPartIds,
  selectedMaterial,
  materialQuantity,
}: {
  accessToken: string;
  materialPartIds: string[];
  selectedMaterial: MaterialItem;
  materialQuantity: string;
}) => ({
  accessToken,
  data: {
    parts_ids: materialPartIds,
    material_id: selectedMaterial.id,
    material_type: selectedMaterial.type,
    parts_quantity: parseMaterialQuantity(materialQuantity),
    unit_code:
      selectedMaterial.type === "seed"
        ? (selectedMaterial.unitCode ?? null)
        : null,
  },
});

const getMaterialQuantity = (item: any) =>
  Number(
    item?.quantity ??
      item?.parts_quantity ??
      item?.partsQuantity ??
      item?.fuel_total ??
      item?.fuelTotal ??
      item?.total_fuel_quantity ??
      item?.totalFuelQuantity ??
      item?.fuel_quantity ??
      item?.fuelQuantity ??
      item?.total_quantity ??
      item?.totalQuantity ??
      item?.total ??
      item?.amount ??
      item?.value ??
      0,
  );

const toArray = (value: any) => {
  if (Array.isArray(value)) return value;
  return value ? [value] : [];
};

const firstNumber = (...values: any[]) => {
  const value = values.find((item) => {
    const numeric = Number(item);
    return (
      item !== null &&
      item !== undefined &&
      item !== "" &&
      Number.isFinite(numeric)
    );
  });

  return value === undefined ? 0 : Number(value);
};

const getFuelTypeId = (item: any, aggregate: any) =>
  item?.type?.id ??
  item?.type ??
  item?.fuel_type?.id ??
  item?.fuelType?.id ??
  item?.fuel_type ??
  item?.fuelType ??
  aggregate?.technique_standard?.machinery_model?.fuel_type ??
  aggregate?.techniqueStandard?.machinery_model?.fuel_type ??
  aggregate?.technique?.machinery_model?.fuel_type ??
  aggregate?.technique?.technique?.machinery_model?.fuel_type;

const getFuelLabel = (fuelType?: string | number | null) =>
  fuelType === "Дизель" || Number(fuelType) !== 2 ? "Дизтопливо" : "Бензин";

const getFuelTotal = (tariffGrouped: any, fieldGrouped: any, item?: any) =>
  firstNumber(
    item?.fuel_total,
    item?.fuelTotal,
    item?.total_fuel_quantity,
    item?.totalFuelQuantity,
    item?.fuel_quantity,
    item?.fuelQuantity,
    item?.quantity,
    item?.parts_quantity,
    item?.partsQuantity,
    tariffGrouped?.fuel_total,
    tariffGrouped?.fuelTotal,
    tariffGrouped?.total_fuel_quantity,
    tariffGrouped?.totalFuelQuantity,
    fieldGrouped?.fuel_total,
    fieldGrouped?.fuelTotal,
    fieldGrouped?.total_fuel_quantity,
    fieldGrouped?.totalFuelQuantity,
  );

const isTransportationOutputDetails = (details: ShiftPartDetails | null) => {
  const fieldGrouped = details?.editContext?.fieldGrouped;
  const tariffGrouped = details?.editContext?.tariffGrouped;

  return Boolean(
    fieldGrouped?.is_transportation_output ??
      fieldGrouped?.isTransportationOutput ??
      tariffGrouped?.is_transportation_output ??
      tariffGrouped?.isTransportationOutput,
  );
};

export const getMaterialItems = (
  details: ShiftPartDetails | null,
): MaterialItem[] => {
  const tariffGrouped = details?.editContext?.tariffGrouped;
  const fieldGrouped = details?.editContext?.fieldGrouped;
  const aggregate = details?.editContext?.aggregate;
  const fuelItems = [
    ...toArray(tariffGrouped?.fuel),
    ...toArray(tariffGrouped?.fuels),
    ...toArray(tariffGrouped?.fuel_consumptions),
    ...toArray(tariffGrouped?.fuelConsumptions),
    ...toArray(fieldGrouped?.fuel),
    ...toArray(fieldGrouped?.fuels),
    ...toArray(fieldGrouped?.fuel_consumptions),
    ...toArray(fieldGrouped?.fuelConsumptions),
  ];
  const items: MaterialItem[] = [
    ...toArray(tariffGrouped?.pesticides).map((item: any) => ({
      id: item.id,
      type: "pesticide" as const,
      label: item.name || "СЗР",
      value: getMaterialQuantity(item),
      unit: "л",
    })),
    ...toArray(tariffGrouped?.fertilizers).map((item: any) => ({
      id: item.id,
      type: "fertilizer" as const,
      label: item.name || "Удобрение",
      value: getMaterialQuantity(item),
      unit: "кг",
    })),
    ...toArray(tariffGrouped?.seeds).map((item: any) => ({
      id: item.variety_id ?? item.id,
      type: "seed" as const,
      label: item.variety_name || item.name || "Семена",
      value: getMaterialQuantity(item),
      unit: item.unit_code?.description ?? "кг",
      unitCode: item.unit_code?.id ?? null,
    })),
    ...fuelItems.map((item: any) => {
      const fuelType = getFuelTypeId(item, aggregate);

      return {
        id: fuelType,
        type: "fuel" as const,
        label: getFuelLabel(
          item?.type?.name ?? item?.fuel_type?.name ?? fuelType,
        ),
        value:
          getMaterialQuantity(item) ||
          getFuelTotal(tariffGrouped, fieldGrouped, item),
        unit: "л",
      };
    }),
  ].filter((item) => item.id !== undefined && item.id !== null);
  const hasFuelItem = items.some((item) => item.type === "fuel");
  const fallbackFuelTotal = getFuelTotal(tariffGrouped, fieldGrouped);

  if (
    !hasFuelItem &&
    (details?.type === "transfer" ||
      isTransportationOutputDetails(details) ||
      fallbackFuelTotal > 0)
  ) {
    const fuelType = getFuelTypeId(null, aggregate);

    if (fuelType || fallbackFuelTotal > 0) {
      items.push({
        id: fuelType ?? 1,
        type: "fuel",
        label: getFuelLabel(fuelType),
        value: fallbackFuelTotal,
        unit: "л",
      });
    }
  }

  return items;
};
