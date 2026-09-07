export const createOfflineShift = (
  scannedData: string,
  shiftType: number,
  employeeId: string,
  scannedAt: string,
  endedAt: string | null,
  scannedPlace: any,
  workplaceName: string,
  segmentType: string | null,
  offlineGroupKey: string,
) => ({
  code: scannedData,
  shift_type: shiftType,
  employee_id: employeeId,
  scanned_at: scannedAt,
  ended_at: endedAt,
  scanned_place: scannedPlace,
  workplace_name: workplaceName || "Не указано",
  segment_type: segmentType,
  offline_group_key: offlineGroupKey,
  sync_status: "pending",
});

export const getSegmentType = (workPlace: any) => {
  const description = String(workPlace?.workplaceType?.description || "")
    .trim()
    .toLowerCase();

  if (!description) return null;

  if (
    description.includes("стационар") ||
    description.includes("stationary")
  ) {
    return "stationary";
  }

  if (
    description.includes("подвиж") ||
    description.includes("мобиль") ||
    description.includes("mobile")
  ) {
    return "mobile";
  }

  return description;
};

export const createOfflineGroupKey = (
  employeeId: string,
  shiftType: number,
  scannedAt: Date,
) => {
  return [
    "offline",
    employeeId,
    shiftType,
    scannedAt.toISOString(),
  ].join("_");
};

const getLatestActiveOfflineShift = (
  openProductionShift: any[],
  predicate: (shift: any) => boolean,
) => {
  return [...(openProductionShift || [])]
    .filter(
      (shift) =>
        predicate(shift) &&
        !shift?.ended_at,
    )
    .sort(
      (a, b) =>
        new Date(b?.scanned_at || 0).getTime() -
        new Date(a?.scanned_at || 0).getTime(),
    )[0];
};

export const getActiveOfflineShift = (
  openProductionShift: any[],
  employeeId: string,
  shiftType: number,
) => {
  return getLatestActiveOfflineShift(
    openProductionShift,
    (shift) =>
      String(shift?.employee_id) === String(employeeId) &&
      Number(shift?.shift_type) === Number(shiftType),
  );
};

export const getActiveDifferentOfflineShift = (
  openProductionShift: any[],
  employeeId: string,
  shiftType: number,
) => {
  return getLatestActiveOfflineShift(
    openProductionShift,
    (shift) =>
      String(shift?.employee_id) === String(employeeId) &&
      Number(shift?.shift_type) !== Number(shiftType),
  );
};
