import type {
  PendingShift,
  ShiftCollection,
} from "./ShiftsSection.types";

export const getActivePendingShiftsByGroup = (
  pendingShifts: ShiftCollection<PendingShift>,
) =>
  pendingShifts.keys.reduce<Record<string, PendingShift[]>>(
    (groups, groupKey) => {
      groups[groupKey] = [...(pendingShifts.grouped[groupKey] ?? [])]
        .filter((shift) => !shift.endedAt)
        .sort(
          (first, second) =>
            new Date(second.scannedAt ?? second.openAt).getTime() -
            new Date(first.scannedAt ?? first.openAt).getTime(),
        );

      return groups;
    },
    {},
  );
