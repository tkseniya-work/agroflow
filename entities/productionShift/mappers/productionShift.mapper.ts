import type { processedShiftData } from "../../../db/schema";
import type { ShiftData, WorkType } from "../model/shift.types";

type ProcessedShiftDataInsert = typeof processedShiftData.$inferInsert;
type ProcessedShiftDataRow = typeof processedShiftData.$inferSelect;

const toJson = (value: unknown) => {
  if (value === undefined || value === null) return null;

  try {
    return JSON.stringify(value);
  } catch {
    return null;
  }
};

const fromJson = <T,>(value: string | null | undefined, fallback: T): T => {
  if (!value) return fallback;

  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
};

export const mapShiftDataToDb = (
  item: ShiftData,
): ProcessedShiftDataInsert => ({
  key: item.key,

  workType: String(item.workType),
  productionShiftId: item.productionShiftId,
  shiftType: toJson(item.shiftType),

  workPlaceName: item.workPlaceName ?? null,
  workName: item.workName ?? null,
  agriculturalMachineryName: item.agriculturalMachineryName ?? null,
  taskFieldName: item.taskFieldName ?? "",

  date: item.date,
  openAt: item.openAt ?? "",
  closeAt: item.closeAt ?? "",
  endAt: item.endAt ?? "",
  startAt: item.startAt ?? "",

  iconLink: item.iconLink ?? "",

  tariffValue: item.tariffValue ?? "0",
  baseTariffPrice: item.baseTariffPrice ?? "0",
  tariffPrice: item.tariffPrice ?? "0",
  tariffUnit: item.tariffUnit ?? null,
  unit: item.unit ?? null,
  unitCode: item.unitCode ?? null,
  tariffPriceUnit: item.tariffPriceUnit ?? null,

  outputValueArea: item.outputValueArea ?? "0",

  time: item.time ?? 0,
  longStops: item.longStops ?? 0,
  smallStops: item.smallStops ?? 0,

  timeString: item.timeString ?? "0м",
  longStopsString: item.longStopsString ?? "0м",
  smallStopsString: item.smallStopsString ?? "0м",

  factArea: item.factArea ?? "0",

  overtimeBonus: item.overtimeBonus ?? "0",
  experienceBonus: item.experienceBonus ?? "0",

  normValue: item.normValue ?? null,
  normValueHa: item.normValueHa ?? null,
  productionNormValue: item.productionNormValue ?? null,
  productionFactValue: item.productionFactValue ?? null,
  fuelNormValue: item.fuelNormValue ?? null,
  fuelFactValue: item.fuelFactValue ?? null,

  maxSpeed: item.maxSpeed ?? "0",
  avgSpeed: item.avgSpeed ?? "0",

  termsMaxSpeed: item.termsMaxSpeed ?? null,
  processingDepth: item.processingDepth ?? null,
  soluteFlowRate: item.soluteFlowRate ?? null,

  partIds: item.partIds,
  partInitial: item.partInitial,

  taskFieldId: item.taskFieldId ?? "",
  tariffId: item.tariffId ?? "",
  workPlaceId: item.workPlaceId ?? "",
  agriculturalMachineryId: item.agriculturalMachineryId ?? "",
  techniqueStandardId: item.techniqueStandardId ?? "",

  isArchived: Boolean(item.isArchived),
  isShiftHeader: Boolean(item.isShiftHeader),
});

const optionalString = (value: string | null) => value ?? undefined;

export const mapDbToShiftData = (row: ProcessedShiftDataRow): ShiftData => ({
  key: row.key,

  workType: row.workType as WorkType,

  productionShiftId: row.productionShiftId,
  shiftType: fromJson(row.shiftType, null),

  workPlaceName: row.workPlaceName,
  workName: row.workName,
  agriculturalMachineryName: row.agriculturalMachineryName,
  taskFieldName: row.taskFieldName,

  date: row.date,
  openAt: row.openAt,
  closeAt: row.closeAt,
  endAt: row.endAt,
  startAt: row.startAt,

  iconLink: row.iconLink,

  tariffValue: row.tariffValue,
  baseTariffPrice: row.baseTariffPrice,
  tariffPrice: row.tariffPrice,
  tariffUnit: row.tariffUnit,
  unit: row.unit,
  unitCode: row.unitCode,
  tariffPriceUnit: row.tariffPriceUnit,

  outputValueArea: row.outputValueArea,

  time: row.time,
  longStops: row.longStops,
  smallStops: row.smallStops,

  timeString: row.timeString,
  longStopsString: row.longStopsString,
  smallStopsString: row.smallStopsString,

  factArea: row.factArea,

  overtimeBonus: row.overtimeBonus,
  experienceBonus: row.experienceBonus,

  normValue: optionalString(row.normValue),
  normValueHa: optionalString(row.normValueHa),
  productionNormValue: optionalString(row.productionNormValue),
  productionFactValue: optionalString(row.productionFactValue),
  fuelNormValue: optionalString(row.fuelNormValue),
  fuelFactValue: optionalString(row.fuelFactValue),

  maxSpeed: row.maxSpeed,
  avgSpeed: row.avgSpeed,

  termsMaxSpeed: row.termsMaxSpeed,
  processingDepth: row.processingDepth,
  soluteFlowRate: row.soluteFlowRate,

  partIds: row.partIds ?? "",
  partInitial: Boolean(row.partInitial),

  taskFieldId: row.taskFieldId,
  tariffId: row.tariffId,
  workPlaceId: row.workPlaceId,
  agriculturalMachineryId: row.agriculturalMachineryId,
  techniqueStandardId: row.techniqueStandardId,

  isArchived: Boolean(row.isArchived),
  isShiftHeader: Boolean(row.isShiftHeader),
});
