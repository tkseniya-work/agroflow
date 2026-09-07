import { ShiftData } from "../../entities/productionShift";

export const findMatchingShifts = (
  productionShiftData: any | undefined,
  shifts: ShiftData[],
) => {
  if (!productionShiftData || !shifts?.length) return [];

  const targetIds = shifts.map((shift) => shift?.productionShiftId);

  return productionShiftData.filter((item: any) =>
    targetIds.includes(item.production_shift_id),
  );
};

export const createStopShiftRequest = (
  shifts: ShiftData[],
  accessToken: string | null,
  closeAt?: string,
) => {
  if (!shifts?.length) return null;

  const firstShift = shifts[0] as any;
  const shiftId =
    firstShift?.productionShiftId ||
    firstShift?.production_shift_id ||
    firstShift?.shiftId ||
    firstShift?.shift_id ||
    firstShift?.id;
  if (!shiftId) return null;

  return {
    accessToken,
    closeAt: closeAt || new Date().toISOString(),
    shiftId,
  };
};

export const prepareShiftsForLocalSave = (
  shifts: ShiftData[],
  accessToken: string | null,
) => {
  if (!shifts?.length) return [];

  return shifts.map((shift: ShiftData) => ({
    accessToken,
    shift_id: shift.productionShiftId,
    closed_at: new Date().toISOString(),
  }));
};

export function processGeoJsonData(geoData: any): string | null {
  if (!geoData) return null;

  if (geoData.type === "Point" && Array.isArray(geoData.coordinates)) {
    return JSON.stringify(geoData);
  }

  if (typeof geoData === "string") {
    return geoData;
  }

  return String(geoData);
}

type ScannedPlace = {
  type: "Point";
  coordinates: [number, number];
};

export const OFFLINE_SCANNED_PLACE: ScannedPlace = {
  type: "Point",
  coordinates: [0, 0],
};

const normalizeScannedPlace = (value: unknown): ScannedPlace | null => {
  if (!value || typeof value !== "object") return null;

  const point = value as { type?: unknown; coordinates?: unknown };
  if (point.type !== "Point" || !Array.isArray(point.coordinates)) return null;

  const longitude = Number(point.coordinates[0]);
  const latitude = Number(point.coordinates[1]);

  if (!Number.isFinite(longitude) || !Number.isFinite(latitude)) return null;

  return {
    type: "Point",
    coordinates: [longitude, latitude],
  };
};

export const parseScannedPlace = (scannedPlace: unknown): ScannedPlace | null => {
  const normalizedObject = normalizeScannedPlace(scannedPlace);
  if (normalizedObject) return normalizedObject;
  if (typeof scannedPlace !== "string" || !scannedPlace.trim()) return null;

  const cleanString = scannedPlace.trim().replace(/^"(.*)"$/, "$1");

  try {
    const parsed = JSON.parse(cleanString);
    const normalizedJson = normalizeScannedPlace(parsed);

    if (normalizedJson) return normalizedJson;
  } catch {
    // Older local records use the Java-style GeoJSON string below.
  }

  const match = cleanString.match(
    /\{type=(\w+),\s*coordinates=\[([^\]]+)\]\}/,
  );
  if (!match || match[1] !== "Point") return null;

  return normalizeScannedPlace({
    type: match[1],
    coordinates: match[2].split(",").map((coord) => Number(coord.trim())),
  });
};

export const resolveScannedPlaceForSync = (
  scannedPlace: unknown,
): ScannedPlace => parseScannedPlace(scannedPlace) ?? OFFLINE_SCANNED_PLACE;
