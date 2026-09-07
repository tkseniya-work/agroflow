import type { CloseProductionShifts, OpenProductionShifts } from "../../db/schema";
import type { ShiftData } from "../../entities/productionShift";

type ShiftLike = Partial<ShiftData> & {
  id?: string | number | null;
  production_shift_id?: string | number | null;
  shift_id?: string | number | null;
  shiftId?: string | number | null;
  close_at?: string | null;
  closed_at?: string | null;
};

const getShiftKeys = (shift: ShiftLike) =>
  [
    shift.key,
    shift.productionShiftId,
    shift.production_shift_id,
    shift.shift_id,
    shift.shiftId,
    shift.id,
  ]
    .filter((value): value is string | number => value !== null && value !== undefined)
    .map(String);

const isStoredShiftOpen = (shift: ShiftLike) => {
  const closeAt = shift.closeAt ?? shift.close_at ?? shift.closed_at;

  return closeAt === null || closeAt === undefined || closeAt === "";
};

type HasActiveShiftParams = {
  storedShifts: ShiftData[];
  pendingOpenShifts: OpenProductionShifts[];
  pendingCloseShifts: CloseProductionShifts[];
  employeeId?: string | number | null;
};

export const hasActiveShift = ({
  storedShifts,
  pendingOpenShifts,
  pendingCloseShifts,
  employeeId,
}: HasActiveShiftParams) => {
  const pendingCloseKeys = new Set(
    pendingCloseShifts.flatMap((shift) => getShiftKeys(shift)),
  );
  const hasOpenStoredShift = storedShifts.some(
    (shift) =>
      isStoredShiftOpen(shift) &&
      !getShiftKeys(shift).some((key) => pendingCloseKeys.has(key)),
  );

  if (hasOpenStoredShift) return true;

  return pendingOpenShifts.some((shift) => {
    const belongsToEmployee =
      !employeeId ||
      !shift.employee_id ||
      String(shift.employee_id) === String(employeeId);

    return belongsToEmployee && !shift.ended_at;
  });
};
