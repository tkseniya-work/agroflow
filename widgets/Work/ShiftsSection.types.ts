import type { ShiftData } from "../../entities/productionShift";

export type ShiftCollection<TShift = ShiftData> = {
  data?: TShift[];
  grouped: Record<string, TShift[]>;
  keys: string[];
};

export type PendingShift = ShiftData & {
  id?: string | number;
  scannedAt?: string;
  endedAt?: string;
  workplaceName?: string;
  segmentType?: string | null;
  status?: "pending";
};

export type StopShiftsHandler = (
  shifts: ShiftData[],
) => void | Promise<void>;

export type SaveShiftsLocallyHandler = (
  shifts: ShiftData[],
) => void | Promise<void>;

export type ClosePendingShiftsHandler = (
  shifts: PendingShift[],
) => void | Promise<void>;
