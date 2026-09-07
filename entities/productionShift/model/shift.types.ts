export enum WorkType {
  Field = "Field",
  Stationary = "Stationary",
  Transport = "Transport",
  ProductsTransportation = "ProductsTransportation",
  Transfers = "Transfers",
  None = "None",
}

export interface ShiftData {
  key: string;
  workType: WorkType;
  productionShiftId: string;
  shiftType: any;
  workPlaceName: string | null | undefined;
  workName: string | null | undefined;
  agriculturalMachineryName: string | null | undefined;
  taskFieldName: string;
  date: string;
  openAt: string;
  closeAt: string;
  startAt: string;
  endAt: string;
  iconLink: string;
  tariffValue: string;
  baseTariffPrice: string;
  tariffPrice: string;
  tariffUnit: string | null;
  unit: string | null;
  unitCode: string | null;
  tariffPriceUnit: string | null;
  outputValueArea: string;
  time: number;
  longStops: number;
  smallStops: number;
  timeString: string;
  longStopsString: string;
  smallStopsString: string;
  factArea: string;
  overtimeBonus: string;
  experienceBonus: string;
  normValue?: string;
  normValueHa?: string;
  productionNormValue?: string;
  productionFactValue?: string;
  fuelNormValue?: string;
  fuelFactValue?: string;
  maxSpeed: string;
  avgSpeed: string;
  termsMaxSpeed?: string | null;
  processingDepth?: string | null;
  soluteFlowRate?: string | null;
  partIds: string;
  partInitial: boolean;
  taskFieldId: string;
  tariffId: string;
  workPlaceId: string;
  agriculturalMachineryId: string;
  techniqueStandardId: string;
  isArchived: boolean;
  isShiftHeader?: boolean;
}

export interface ShiftSettings {
  first_shift_start: string;
  first_shift_end: string;
  first_shift_break_start?: string | null;
  first_shift_break_end?: string | null;
  second_shift_start: string;
  second_shift_end: string;
  second_shift_break_start?: string | null;
  second_shift_break_end?: string | null;
  id?: string;
}

export interface ShiftInfo {
  type: number;
  name: string;
  timeRange: string;
  isActive: boolean;
}

export interface ShiftValidationResult {
  isValid: boolean;
  message?: string;
  shiftType?: number;
}

export interface GroupedShiftData {
  [key: string]: ShiftData[];
}
