import type { UnitOfMeasure, WorkStandard } from "../../db/schema";
import {
  type ProductionShiftResponseDto,
  type GroupedShiftData,
  type ShiftData,
  WorkType,
} from "../../entities/productionShift";
import { formatCurrencyPerUnit } from "../../shared/lib/formatUtils";

export const CURRENCY_SYMBOLS = {
  RUB: "\u20BD",
  USD: "$",
} as const;

const processingCache = new Map<
  string,
  { result: ShiftData[]; timestamp: number }
>();

const CACHE_TTL = 5000;

interface DataCaches {
  techniqueNameCache: Map<string, string>;
  techniqueFuelCache: Map<string, number>;
  machineryNameCache: Map<string, string>;
  workNameCache: Map<string, string>;
  workPlaceNameCache: Map<string, string>;
  unitNameCache: Map<string, string>;
  iconLinkCache: Map<string, string>;
}

const normalizeDictionaryId = (value: unknown) =>
  value === null || value === undefined
    ? ""
    : String(value).trim().toLowerCase();

const getWorkStandardId = (source: any) =>
  source?.work_standard_id ??
  source?.workStandardId ??
  source?.work_standard?.id ??
  source?.workStandard?.id ??
  null;

const getWorkStandardName = (source: any) =>
  source?.work_standard_name ??
  source?.workStandardName ??
  source?.work_standard?.name ??
  source?.workStandard?.name ??
  "";

const createCaches = (
  techniqueStandardList: any[] | undefined,
  agriculturalMachineryList: any[] | undefined,
  workStandardList: WorkStandard[] | undefined,
  productionWorkPlaces: any[] | undefined,
  unitOfMeasureList: UnitOfMeasure[] | undefined,
): DataCaches => {
  const techniqueNameCache = new Map<string, string>();
  const techniqueFuelCache = new Map<string, number>();
  const machineryNameCache = new Map<string, string>();
  const workNameCache = new Map<string, string>();
  const workPlaceNameCache = new Map<string, string>();
  const unitNameCache = new Map<string, string>();
  const iconLinkCache = new Map<string, string>();

  techniqueStandardList?.forEach((item) => {
    const id = normalizeDictionaryId(item?.techniqueStandard?.id);

    if (id) {
      techniqueNameCache.set(
        id,
        item?.techniqueStandard?.name || "Неизвестная техника",
      );

      techniqueFuelCache.set(
        id,
        item?.machineryModel?.fuel_consumption_per_distance || 0,
      );

      iconLinkCache.set(id, item?.techniqueStandard?.icon_link || "");
    }
  });

  agriculturalMachineryList?.forEach((item) => {
    const id = normalizeDictionaryId(
      item?.agriculturalMachineryStandard?.id,
    );

    if (id) {
      machineryNameCache.set(
        id,
        item?.agriculturalMachineryStandard?.name ||
          "Неизвестная сельхозтехника",
      );
    }
  });

  workStandardList?.forEach((item) => {
    const id = normalizeDictionaryId(item?.id);

    if (id) {
      workNameCache.set(id, item.name || "Неизвестная работа");
    }
  });

  productionWorkPlaces?.forEach((item) => {
    const id = normalizeDictionaryId(item?.productionWorkPlace?.id);

    if (id) {
      workPlaceNameCache.set(
        id,
        item?.productionWorkPlace?.name || "Неизвестное рабочее место",
      );
    }
  });

  unitOfMeasureList?.forEach((item) => {
    if (item?.code) {
      unitNameCache.set(item.code, item.short_name || "");
    }
  });

  return {
    techniqueNameCache,
    techniqueFuelCache,
    machineryNameCache,
    workNameCache,
    workPlaceNameCache,
    unitNameCache,
    iconLinkCache,
  };
};

export const minutesToTimeOptimized = (minutes: number): string => {
  if (typeof minutes !== "number" || isNaN(minutes) || !isFinite(minutes)) {
    return "0м";
  }

  const roundedMinutes = Math.round(Math.max(0, minutes));
  const hours = Math.floor(roundedMinutes / 60);
  const remainingMinutes = roundedMinutes % 60;

  if (hours > 0) {
    return remainingMinutes === 0
      ? `${hours}ч`
      : `${hours}ч ${remainingMinutes}м`;
  }

  return `${remainingMinutes}м`;
};

export const formatCurrency = (value: string | number): string => {
  if (value == null) return "0";

  const numericValue = typeof value === "string" ? parseFloat(value) : value;

  if (isNaN(numericValue) || !isFinite(numericValue)) {
    return typeof value === "string" ? value : "0";
  }

  return numericValue.toLocaleString("ru-RU", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
    useGrouping: true,
  });
};

const keyCounter = new Map<string, number>();

export const generateUniqueKey = (
  id: string | null | undefined,
  prefix?: string,
): string => {
  const keyPrefix = prefix || "default";
  const count = keyCounter.get(keyPrefix) || 0;

  keyCounter.set(keyPrefix, count + 1);

  return prefix
    ? `${prefix}_${id || "empty"}_${count}`
    : `${id || "empty"}_${count}`;
};

const cleanupCache = () => {
  const now = Date.now();

  for (const [key, value] of processingCache.entries()) {
    if (now - value.timestamp > CACHE_TTL) {
      processingCache.delete(key);
    }
  }
};

const getShiftPartsRevision = (value: unknown) => {
  const revision: unknown[] = [];

  const visit = (node: unknown) => {
    if (Array.isArray(node)) {
      node.forEach(visit);
      return;
    }

    if (!node || typeof node !== "object") return;

    Object.entries(node).forEach(([key, child]) => {
      if (key === "parts" && Array.isArray(child)) {
        child.forEach((part: any) => {
          revision.push([
            part?.id,
            part?.start_at,
            part?.end_at,
            part?.is_initial,
          ]);
        });
        return;
      }

      visit(child);
    });
  };

  visit(value);
  return revision;
};

const TASK_PROCESSORS = [
  {
    type: "field_tasks",
    workType: WorkType.Field,
    hasAggregates: true,
    hasTariffs: true,
    requiresTechnique: true,
    requiresMachinery: true,
  },
  {
    type: "transport_tasks",
    workType: WorkType.Transport,
    hasAggregates: true,
    hasTariffs: true,
    requiresTechnique: true,
    requiresMachinery: true,
  },
  {
    type: "stationary_tasks",
    workType: WorkType.Stationary,
    hasAggregates: false,
    hasTariffs: true,
    requiresTechnique: false,
    requiresMachinery: false,
    requiresWorkPlace: true,
  },
  {
    type: "products_transportation_tasks",
    workType: WorkType.ProductsTransportation,
    hasAggregates: true,
    hasTariffs: true,
    requiresTechnique: true,
    requiresMachinery: true,
    requiresWorkPlace: true,
  },
] as const;

type TaskProcessor = (typeof TASK_PROCESSORS)[number];

const parseDate = (dateStr: string): Date => {
  if (!dateStr) return new Date(0);
  return new Date(dateStr);
};

const safeToFixed = (
  value: any,
  digits: number = 2,
  defaultValue: string = "0",
): string => {
  if (value === null || value === undefined) return defaultValue;

  const num = typeof value === "string" ? parseFloat(value) : value;

  if (typeof num !== "number" || isNaN(num) || !isFinite(num)) {
    return defaultValue;
  }

  return num.toFixed(digits);
};

const safeNumber = (value: any, defaultValue: number = 0): number => {
  if (value === null || value === undefined) return defaultValue;

  const num = typeof value === "string" ? parseFloat(value) : value;

  if (typeof num !== "number" || isNaN(num) || !isFinite(num)) {
    return defaultValue;
  }

  return num;
};

/**
 * ВАЖНО:
 * - Для field / transport / products_transportation / transfers строка строится из tariff.
 * - parts раскрываем только для stationary_tasks.
 */
const shouldUseParts = (taskType: TaskProcessor): boolean => {
  return taskType.type === "stationary_tasks";
};

const getActiveInitialPart = (tariff: any) => {
  if (!Array.isArray(tariff?.parts)) return null;

  return (
    tariff.parts.find((part: any) => {
      const isInitial = part?.is_initial === true || part?.isInitial === true;
      if (!isInitial) return false;

      const startTime = new Date(
        part?.start_at ?? part?.startAt ?? 0,
      ).getTime();
      const endTime = new Date(part?.end_at ?? part?.endAt ?? 0).getTime();

      return (
        Number.isFinite(startTime) &&
        Number.isFinite(endTime) &&
        Math.abs(endTime - startTime) <= 1000
      );
    }) ?? null
  );
};

const createRowFromTariff = (tariff: any, fallback: any = {}) => {
  const activeInitialPart = getActiveInitialPart(tariff);

  return {
    id:
      activeInitialPart?.id ||
      tariff?.tariff?.id ||
      tariff?.id ||
      null,
    start_at:
      activeInitialPart?.start_at ||
      activeInitialPart?.startAt ||
      tariff?.open_at_parts_time ||
      fallback?.open_at_parts_time ||
      fallback?.openAt ||
      "",
    end_at:
      activeInitialPart?.end_at ||
      activeInitialPart?.endAt ||
      tariff?.closed_at_parts_time ||
      fallback?.closed_at_parts_time ||
      fallback?.closeAt ||
      "",
    payment: tariff?.payment || fallback?.payment || {},
    output_value:
      tariff?.output_value_total ||
      fallback?.output_value_total ||
      fallback?.outputValueTotal ||
      0,
    part_duration_minutes:
      tariff?.parts_duration || fallback?.parts_duration || 0,
    is_initial: Boolean(activeInitialPart),
    isTariffRow: true,
  };
};

const getRowsFromTariff = (
  tariff: any,
  fallback: any = {},
  useParts: boolean = false,
): any[] => {
  if (useParts && Array.isArray(tariff?.parts) && tariff.parts.length > 0) {
    return tariff.parts;
  }

  return [createRowFromTariff(tariff, fallback)];
};

const getPayment = (...payments: any[]) => {
  return (
    payments.find((payment) => {
      const value = safeNumber(payment?.value, NaN);
      const expBonus = safeNumber(payment?.exp_bonus_amount, NaN);
      const overtimeBonus = safeNumber(payment?.overtime_bonus_amount, NaN);

      return (
        Number.isFinite(value) ||
        Number.isFinite(expBonus) ||
        Number.isFinite(overtimeBonus)
      );
    }) || {}
  );
};

const createShiftDataFast = (
  baseData: any,
  fieldData: any,
  caches: DataCaches,
): ShiftData => {
  const {
    techniqueId,
    machineryId,
    taskFieldName = "",
    workStandardId,
    workStandardName: responseWorkStandardName,
    workPlaceId,
    workPlaceName: responseWorkPlaceName,
    outputValueTotal = 0,
    areaFact = 0,
    smallStops = 0,
    longStops = 0,
    maxSpeed = 0,
    avgSpeed = 0,
    overtimeBonus = 0,
    experienceBonus = 0,
    tariffPrice = 0,
    unitCode,
    normValue,
    normValueHa,
    productionNormValue,
    productionFactValue,
    fuelNormValue,
    fuelFactValue,
    tariffId,
  } = fieldData;

  const isFieldWork = baseData.workType === WorkType.Field;
  const isTransportWork = baseData.workType === WorkType.Transport;
  const isProductsTransportation =
    baseData.workType === WorkType.ProductsTransportation;
  const isStationaryWork = baseData.workType === WorkType.Stationary;
  const isTransfer = baseData.workType === WorkType.Transfers;

  const isMobileWork =
    isFieldWork || isTransportWork || isProductsTransportation || isTransfer;

  const unitName = unitCode ? caches.unitNameCache.get(unitCode) || "" : "";

  const workPlaceName = isMobileWork
    ? techniqueId
      ? caches.techniqueNameCache.get(normalizeDictionaryId(techniqueId)) ||
        "Техника не указана"
      : "Техника не указана"
    : isStationaryWork
      ? workPlaceId || baseData.workPlaceId
        ? caches.workPlaceNameCache.get(
            normalizeDictionaryId(workPlaceId || baseData.workPlaceId),
          ) ||
          responseWorkPlaceName ||
          "Рабочее место не указано"
        : "Рабочее место не указано"
      : "Работа не указана";

  const safePaymentValue = safeNumber(baseData.paymentValue);
  const safeOutputValueTotal = safeNumber(outputValueTotal);
  const safeTariffPrice = safeNumber(tariffPrice);
  const safeAreaFact = safeNumber(areaFact);
  const safeSmallStops = safeNumber(smallStops);
  const safeLongStops = safeNumber(longStops);
  const safeMaxSpeed = safeNumber(maxSpeed);
  const safeAvgSpeed = safeNumber(avgSpeed);
  const safeOvertimeBonus = safeNumber(overtimeBonus);
  const safeExperienceBonus = safeNumber(experienceBonus);
  const safeFuelNormValue = safeNumber(fuelNormValue);
  const safeFuelFactValue = safeNumber(fuelFactValue);
  const safeProductionNormValue = safeNumber(productionNormValue);
  const safeProductionFactValue = safeNumber(productionFactValue);
  const safeNormValue = safeNumber(normValue);
  const safeNormValueHa = safeNumber(normValueHa);

  const tariffPricePerArea =
  safePaymentValue > 0 ? safePaymentValue / safeProductionFactValue : 0;

  const isArchived = Boolean(baseData.shiftClosedAt || baseData.closeAt);

  return {
    key: baseData.key,
    workType: baseData.workType,
    productionShiftId: baseData.shiftId,
    shiftType: baseData.shiftType,
    workPlaceName,
    agriculturalMachineryName:
      isMobileWork && machineryId
        ? caches.machineryNameCache.get(normalizeDictionaryId(machineryId)) ||
          ""
        : "",
    taskFieldName,
    workName: workStandardId
      ? caches.workNameCache.get(normalizeDictionaryId(workStandardId)) ||
        responseWorkStandardName ||
        "Работа не указана"
      : responseWorkStandardName || "Работа не указана",
    date: baseData.date,
    openAt: baseData.openAt,
    closeAt: baseData.closeAt,
    startAt: baseData?.startAt,
    endAt: baseData?.endAt,
    iconLink:
      isMobileWork && techniqueId
        ? caches.iconLinkCache.get(normalizeDictionaryId(techniqueId)) || ""
        : "",
    tariffValue: safeToFixed(safePaymentValue),
    baseTariffPrice: safeToFixed(safeTariffPrice),
    tariffPrice: safeToFixed(tariffPricePerArea),
    tariffUnit: unitName,
    unit: unitName,
    unitCode,
    tariffPriceUnit: formatCurrencyPerUnit("RUB", unitName),
    outputValueArea: safeToFixed(safeOutputValueTotal),
    factArea: safeToFixed(safeAreaFact),
    normValue: safeToFixed(safeNormValue),
    normValueHa: safeToFixed(safeNormValueHa),
    productionNormValue: safeToFixed(safeProductionNormValue),
    productionFactValue: safeToFixed(safeProductionFactValue),
    fuelNormValue: safeToFixed(safeFuelNormValue),
    fuelFactValue: safeToFixed(safeFuelFactValue),
    time: baseData.partsDuration,
    smallStops: safeSmallStops,
    longStops: safeLongStops,
    timeString: minutesToTimeOptimized(baseData.partsDuration),
    smallStopsString: minutesToTimeOptimized(safeSmallStops),
    longStopsString: minutesToTimeOptimized(safeLongStops),
    overtimeBonus: safeToFixed(safeOvertimeBonus),
    experienceBonus: safeToFixed(safeExperienceBonus),
    maxSpeed: safeToFixed(safeMaxSpeed),
    avgSpeed: safeToFixed(safeAvgSpeed),
    termsMaxSpeed: null,
    processingDepth: null,
    taskFieldId: baseData.taskFieldId,
    partIds: baseData.partIds,
    partInitial: baseData.partInitial,
    tariffId,
    workPlaceId: baseData.workPlaceId,
    agriculturalMachineryId: machineryId,
    techniqueStandardId: techniqueId,
    soluteFlowRate: null,
    isArchived,
  };
};

const processTasksFast = (
  shift: any,
  taskType: TaskProcessor,
  caches: DataCaches,
  result: ShiftData[],
): void => {
  const tasks = shift[taskType.type];

  if (!tasks?.length) return;

  tasks.forEach((task: any) => {
    if (taskType.hasAggregates && task.aggregates) {
      task.aggregates.forEach((aggregate: any) => {
        if (taskType.type === "field_tasks" && aggregate.outputs?.fields) {
          aggregate.outputs.fields.forEach((field: any) => {
            if (!field.tariffs?.length) return;

            field.tariffs.forEach((tariff: any) => {
              const rows = getRowsFromTariff(tariff, field, false);

              rows.forEach((row: any) => {
                const payment = getPayment(
                  row?.payment,
                  tariff?.payment,
                  field?.payment,
                  task?.payment,
                );

                const shiftData = createShiftDataFast(
                  {
                    key: generateUniqueKey(
                      tariff?.tariff?.id || row?.id,
                      "field",
                    ),
                    workType: taskType.workType,
                    shiftId: shift.production_shift_id,
                    shiftType: shift.shift_type,
                    date: shift.date,
                    openAt: shift.open_at || "",
                    closeAt: shift.closed_at || "",
                    shiftClosedAt: shift.closed_at || "",
                    paymentValue: payment.value || 0,
                    partsDuration:
                      row?.part_duration_minutes ||
                      tariff.parts_duration ||
                      field.parts_duration ||
                      aggregate.parts_duration ||
                      0,
                    taskFieldId: task.production_task_id,
                    workPlaceId: task.work_place_id,
                    partIds: row.id,
                    partInitial: row.is_initial,
                    startAt: row?.start_at,
                    endAt: row?.end_at,
                  },
                  {
                    techniqueId: aggregate.technique_id,
                    machineryId: aggregate.agricultural_machinery_id,
                    taskFieldName: field.task_field_name,
                    workStandardId: getWorkStandardId(task),
                    workStandardName: getWorkStandardName(task),
                    outputValueTotal:
                      row?.output_value ||
                      tariff.output_value_total ||
                      field.output_value_total ||
                      0,
                    areaFact: field.area_fact,
                    smallStops: field.small_stops_duration,
                    longStops: field.long_stops_duration,
                    maxSpeed: field.max_speed,
                    avgSpeed: field.avg_speed,
                    overtimeBonus:
                      payment.overtime_bonus_amount ||
                      task.payment?.overtime_bonus_amount,
                    experienceBonus:
                      payment.exp_bonus_amount ||
                      task.payment?.exp_bonus_amount,
                    tariffPrice: tariff.tariff?.tariff_price_parameters?.unit,
                    unitCode: tariff.tariff?.unit_code,
                    normValue: tariff.norm_value,
                    normValueHa: tariff.norm_value_ha,
                    fuelNormValue: aggregate.technique_id
                      ? caches.techniqueFuelCache.get(
                          normalizeDictionaryId(aggregate.technique_id),
                        ) ||
                        0
                      : 0,
                    fuelFactValue: field.fuel_per_ha,
                    productionNormValue: tariff.tariff?.norm_value,
                    productionFactValue:
                      row?.output_value ||
                      tariff.output_value_total ||
                      field.output_value_total ||
                      0,
                    tariffId: tariff.tariff?.id,
                  },
                  caches,
                );

                result.push(shiftData);
              });
            });
          });
        }

        if (aggregate.transfers?.tariffs) {
          aggregate.transfers.tariffs.forEach((transferTariff: any) => {
            const rows = getRowsFromTariff(
              transferTariff,
              aggregate.transfers,
              false,
            );

            rows.forEach((row: any) => {
              const payment = getPayment(
                row?.payment,
                transferTariff?.payment,
                aggregate.transfers?.payment,
                task?.payment,
              );

              const shiftData = createShiftDataFast(
                {
                  key: generateUniqueKey(
                    transferTariff?.tariff?.id || row?.id,
                    "transfer",
                  ),
                  workType: WorkType.Transfers,
                  shiftId: shift.production_shift_id,
                  shiftType: shift.shift_type,
                  date: shift.date,
                  openAt: shift.open_at || "",
                  closeAt: shift.closed_at || "",
                  shiftClosedAt: shift.closed_at || "",
                  paymentValue: payment.value || 0,
                  partsDuration:
                    row?.part_duration_minutes ||
                    transferTariff.parts_duration ||
                    aggregate.transfers.parts_duration ||
                    aggregate.parts_duration ||
                    0,
                  taskFieldId: task.production_task_id,
                  workPlaceId: task.work_place_id,
                  partIds: row.id,
                  partInitial: row.is_initial,
                  startAt: row?.start_at,
                  endAt: row?.end_at,
                },
                {
                  techniqueId: aggregate.technique_id,
                  machineryId: aggregate.agricultural_machinery_id,
                  workStandardId:
                    getWorkStandardId(transferTariff.tariff) ??
                    getWorkStandardId(transferTariff),
                  workStandardName:
                    getWorkStandardName(transferTariff.tariff) ||
                    getWorkStandardName(transferTariff),
                  outputValueTotal:
                    row?.output_value ||
                    transferTariff.output_value_total ||
                    aggregate.transfers?.output_value_total ||
                    0,
                  areaFact: transferTariff.area_fact,
                  smallStops:
                    transferTariff.small_stops_duration ||
                    aggregate.transfers.small_stops_duration,
                  longStops:
                    transferTariff.long_stops_duration ||
                    aggregate.transfers.long_stops_duration,
                  maxSpeed:
                    transferTariff.max_speed || aggregate.transfers.max_speed,
                  avgSpeed:
                    transferTariff.avg_speed || aggregate.transfers.avg_speed,
                  overtimeBonus:
                    payment.overtime_bonus_amount ||
                    transferTariff.payment?.overtime_bonus_amount,
                  experienceBonus:
                    payment.exp_bonus_amount ||
                    transferTariff.payment?.exp_bonus_amount,
                  tariffPrice:
                    transferTariff.tariff?.tariff_price_parameters?.unit,
                  unitCode: transferTariff.tariff?.unit_code,
                  normValue: transferTariff.norm_value,
                  normValueHa: transferTariff.norm_value_ha,
                  fuelNormValue: aggregate.technique_id
                    ? caches.techniqueFuelCache.get(
                        normalizeDictionaryId(aggregate.technique_id),
                      ) || 0
                    : 0,
                  fuelFactValue:
                    transferTariff.fuel_per_100_km ||
                    aggregate.transfers.fuel_per_100_km ||
                    aggregate.fuel_per_100_km,
                  productionNormValue: transferTariff.tariff?.norm_value,
                  productionFactValue:
                    row?.output_value ||
                    transferTariff.output_value_total ||
                    aggregate.transfers.output_value_total ||
                    0,
                  tariffId: transferTariff.tariff?.id,
                },
                caches,
              );

              result.push(shiftData);
            });
          });
        }

        if (aggregate.tariffs && !aggregate.outputs && !aggregate.transfers) {
          aggregate.tariffs.forEach((tariff: any) => {
            const rows = getRowsFromTariff(tariff, aggregate, false);

            rows.forEach((row: any) => {
              const payment =
                row?.payment || tariff?.payment || task.payment || {};

              const shiftData = createShiftDataFast(
                {
                  key: generateUniqueKey(
                    tariff?.tariff?.id || row?.id,
                    taskType.type,
                  ),
                  workType: taskType.workType,
                  shiftId: shift.production_shift_id,
                  shiftType: shift.shift_type,
                  date: shift.date,
                  openAt: shift.open_at || "",
                  closeAt: shift.closed_at || "",
                  shiftClosedAt: shift.closed_at || "",
                  paymentValue: payment.value || 0,
                  partsDuration:
                    row?.part_duration_minutes ||
                    tariff.parts_duration ||
                    aggregate.parts_duration ||
                    0,
                  taskFieldId: task.production_task_id,
                  workPlaceId: task.work_place_id,
                  partIds: row.id,
                  partInitial: row.is_initial,
                  startAt: row?.start_at,
                  endAt: row?.end_at,
                },
                {
                  techniqueId: taskType.requiresTechnique
                    ? aggregate.technique_id
                    : undefined,
                  machineryId: taskType.requiresMachinery
                    ? aggregate.agricultural_machinery_id
                    : undefined,
                  workPlaceId: task.work_place_id,
                  workStandardId: getWorkStandardId(task),
                  workStandardName: getWorkStandardName(task),
                  outputValueTotal:
                    row?.output_value ||
                    tariff.output_value_total ||
                    aggregate.output_value_total ||
                    0,
                  areaFact: tariff.area_fact,
                  smallStops: tariff.small_stops_duration,
                  longStops: tariff.long_stops_duration,
                  maxSpeed: tariff.max_speed,
                  avgSpeed: tariff.avg_speed,
                  overtimeBonus:
                    payment.overtime_bonus_amount ||
                    tariff.payment?.overtime_bonus_amount ||
                    task.payment?.overtime_bonus_amount,
                  experienceBonus:
                    payment.exp_bonus_amount ||
                    tariff.payment?.exp_bonus_amount ||
                    task.payment?.exp_bonus_amount,
                  tariffPrice: tariff.tariff?.tariff_price_parameters?.unit,
                  unitCode: tariff.tariff?.unit_code,
                  normValue: tariff.norm_value,
                  normValueHa: tariff.norm_value_ha,
                  fuelNormValue:
                    taskType.requiresTechnique && aggregate.technique_id
                      ? caches.techniqueFuelCache.get(
                          normalizeDictionaryId(aggregate.technique_id),
                        ) ||
                        0
                      : 0,
                  fuelFactValue:
                    tariff.fuel_per_100_km || aggregate.fuel_per_100_km,
                  productionNormValue: tariff.tariff?.norm_value,
                  productionFactValue:
                    row?.output_value ||
                    tariff.output_value_total ||
                    aggregate.output_value_total ||
                    0,
                  tariffId: tariff.tariff?.id,
                },
                caches,
              );

              result.push(shiftData);
            });
          });
        }
      });
    } else if (taskType.hasTariffs && task.tariffs) {
      task.tariffs.forEach((tariff: any) => {
        const rows = getRowsFromTariff(tariff, task, shouldUseParts(taskType));

        rows.forEach((row: any) => {
          const payment = getPayment(
            row?.payment,
            tariff?.payment,
            task?.payment,
          );

          const shiftData = createShiftDataFast(
            {
              key: generateUniqueKey(
                shouldUseParts(taskType)
                  ? row?.id
                  : tariff?.tariff?.id || row?.id,
                taskType.type,
              ),
              workType: taskType.workType,
              shiftId: shift.production_shift_id,
              shiftType: shift.shift_type,
              date: shift.date,
              openAt: shift.open_at || "",
              closeAt: shift.closed_at || "",
              shiftClosedAt: shift.closed_at || "",
              paymentValue: payment.value || 0,
              partsDuration:
                row?.part_duration_minutes ||
                tariff.parts_duration ||
                task.parts_duration ||
                0,
              taskFieldId: task.production_task_id,
              workPlaceId: task.work_place_id,
              partIds: row.id,
              partInitial: row.is_initial,
              startAt: row?.start_at,
              endAt: row?.end_at,
            },
            {
              workPlaceId: task.work_place_id,
              workPlaceName: task.work_place_name,
              workStandardId: getWorkStandardId(task),
              workStandardName: getWorkStandardName(task),
              outputValueTotal:
                row?.output_value ||
                tariff.output_value_total ||
                task.output_value_total ||
                0,
              overtimeBonus:
                payment.overtime_bonus_amount ||
                tariff.payment?.overtime_bonus_amount ||
                task.payment?.overtime_bonus_amount,
              experienceBonus:
                payment.exp_bonus_amount ||
                tariff.payment?.exp_bonus_amount ||
                task.payment?.exp_bonus_amount,
              tariffPrice: tariff.tariff?.tariff_price_parameters?.unit,
              unitCode: tariff.tariff?.unit_code,
              normValue: tariff.norm_value,
              normValueHa: tariff.norm_value_ha,
              productionNormValue: tariff.tariff?.norm_value,
              productionFactValue:
                row?.output_value ||
                tariff.output_value_total ||
                task.output_value_total ||
                0,
              tariffId: tariff.tariff?.id,
            },
            caches,
          );

          result.push(shiftData);
        });
      });
    }
  });
};

export const processShiftData = (
  data: Partial<ProductionShiftResponseDto> | null | undefined,
  techniqueStandardList: any[] | undefined,
  agriculturalMachineryList: any[] | undefined,
  unitOfMeasureList: UnitOfMeasure[] | undefined,
  productionWorkPlaces: any[] | undefined,
  workStandardList: WorkStandard[] | undefined,
): ShiftData[] => {
  if (!data?.shifts?.length) {
    return [];
  }

  keyCounter.clear();

  const cacheKey = JSON.stringify({
    shifts: data.shifts.map((shift) => [
      shift.production_shift_id,
      shift.closed_at,
      shift.field_tasks?.length ?? 0,
      shift.transport_tasks?.length ?? 0,
      shift.stationary_tasks?.length ?? 0,
      shift.products_transportation_tasks?.length ?? 0,
      getShiftPartsRevision(shift),
    ]),
    techCount: techniqueStandardList?.length ?? 0,
    agricCount: agriculturalMachineryList?.length ?? 0,
    workCount: workStandardList?.length ?? 0,
    unitCount: unitOfMeasureList?.length ?? 0,
    workPlacesCount: productionWorkPlaces?.length ?? 0,
  });

  const cached = processingCache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.result;
  }

  const caches = createCaches(
    techniqueStandardList,
    agriculturalMachineryList,
    workStandardList,
    productionWorkPlaces,
    unitOfMeasureList,
  );

  const result: ShiftData[] = [];

  data.shifts.forEach((shift: any) => {
    if (!shift.production_shift_id || !shift.date) {
      return;
    }

    let hasAnyTasks = false;

    TASK_PROCESSORS.forEach((processor) => {
      if (shift[processor.type]?.length) {
        hasAnyTasks = true;
        processTasksFast(shift, processor, caches, result);
      }
    });

    if (!hasAnyTasks) {
      const shiftData = createShiftDataFast(
        {
          key: generateUniqueKey(shift.production_shift_id, "header"),
          workType: WorkType.None,
          shiftId: shift.production_shift_id,
          shiftType: shift.shift_type,
          date: shift.date,
          openAt: shift.open_at || "",
          closeAt: shift.closed_at || "",
          shiftClosedAt: shift.closed_at || "",
          startAt: shift.open_at || "",
          endAt: shift.closed_at || "",
          paymentValue: shift.payment?.value || 0,
          partsDuration: shift.parts_duration || 0,
          partIds: "",
          partInitial: false,
        },
        {},
        caches,
      );

      result.push({
        ...shiftData,
        isShiftHeader: true,
      });
    }
  });

  processingCache.set(cacheKey, {
    result,
    timestamp: Date.now(),
  });

  cleanupCache();

  return result;
};

export const enrichStoredShiftReferences = (
  shifts: ShiftData[] | null | undefined,
  techniqueStandardList: any[] | undefined,
  agriculturalMachineryList: any[] | undefined,
  productionWorkPlaces: any[] | undefined,
  workStandardList: WorkStandard[] | undefined,
  tariffsList: any[] | undefined,
): ShiftData[] => {
  if (!Array.isArray(shifts) || shifts.length === 0) {
    return [];
  }

  const caches = createCaches(
    techniqueStandardList,
    agriculturalMachineryList,
    workStandardList,
    productionWorkPlaces,
    undefined,
  );
  const tariffWorkIds = new Map<string, string>();

  tariffsList?.forEach((tariff) => {
    const tariffId = normalizeDictionaryId(
      tariff?.work_standard_tariff_id ?? tariff?.id,
    );
    const workStandardId = normalizeDictionaryId(
      getWorkStandardId(tariff),
    );

    if (tariffId && workStandardId) {
      tariffWorkIds.set(tariffId, workStandardId);
    }
  });

  return shifts.map((shift) => {
    const techniqueId = normalizeDictionaryId(
      shift.techniqueStandardId,
    );
    const machineryId = normalizeDictionaryId(
      shift.agriculturalMachineryId,
    );
    const workPlaceId = normalizeDictionaryId(shift.workPlaceId);
    const tariffId = normalizeDictionaryId(shift.tariffId);
    const directWorkStandardId = normalizeDictionaryId(
      (shift as ShiftData & { workStandardId?: string }).workStandardId,
    );
    const workStandardId =
      directWorkStandardId || tariffWorkIds.get(tariffId) || "";
    const techniqueName = techniqueId
      ? caches.techniqueNameCache.get(techniqueId)
      : undefined;
    const workName = workStandardId
      ? caches.workNameCache.get(workStandardId)
      : undefined;
    const machineryName = machineryId
      ? caches.machineryNameCache.get(machineryId)
      : undefined;
    const stationaryWorkPlaceName = workPlaceId
      ? caches.workPlaceNameCache.get(workPlaceId)
      : undefined;
    const isMobileWork =
      shift.workType === WorkType.Field ||
      shift.workType === WorkType.Transport ||
      shift.workType === WorkType.ProductsTransportation ||
      shift.workType === WorkType.Transfers;

    return {
      ...shift,
      workPlaceName:
        (isMobileWork ? techniqueName : stationaryWorkPlaceName) ||
        shift.workPlaceName,
      workName: workName || shift.workName,
      agriculturalMachineryName:
        machineryName || shift.agriculturalMachineryName,
      iconLink:
        (techniqueId && caches.iconLinkCache.get(techniqueId)) ||
        shift.iconLink,
    };
  });
};

export const groupShiftsByTypeAndDate = (
  shifts: ShiftData[],
): GroupedShiftData => {
  const grouped: GroupedShiftData = {};

  if (!shifts?.length) return grouped;

  const getOpenTime = (shift: any) => {
    const time = parseDate(shift.startAt).getTime();
    return Number.isFinite(time) ? time : 0;
  };

  const sortByTypeAndOpenAt = (a: any, b: any) => {
    return getOpenTime(b) - getOpenTime(a);
  };

  const sortedShifts = [...shifts].sort(sortByTypeAndOpenAt);

  sortedShifts.forEach((shift) => {
    if (!shift.date) return;

    const shiftTypeDesc = shift.shiftType?.description || "Без типа";
    const key = `${shiftTypeDesc}_${shift.date}`;

    if (!grouped[key]) {
      grouped[key] = [];
    }

    grouped[key].push(shift);
  });

  Object.keys(grouped).forEach((key) => {
    grouped[key] = [...grouped[key]].sort(sortByTypeAndOpenAt);
  });

  return grouped;
};

export const getSortedGroupKeys = (groups: GroupedShiftData): string[] => {
  if (!groups) return [];

  return Object.keys(groups).sort((a, b) => {
    const dateA = a.split("_")[1];
    const dateB = b.split("_")[1];

    return parseDate(dateB).getTime() - parseDate(dateA).getTime();
  });
};

export const getGroupDisplayTitle = (groupKey: string): string => {
  if (!groupKey) return "Неизвестная группа";

  const [shiftType, date] = groupKey.split("_");
  const dateObj = parseDate(date);

  if (isNaN(dateObj.getTime())) {
    return `${shiftType || "Без типа"} - Неверная дата`;
  }

  return `${shiftType || "Без типа"} - ${dateObj.toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })}`;
};
