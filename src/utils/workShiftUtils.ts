import { getGroupDisplayTitle } from "./shiftDataUtils";

export const DATE_FORMAT_LENGTH = 10;
export const LATE_CLOSE_THRESHOLD_MINUTES = 30;

const DEFAULT_SHIFT_SETTINGS = {
  first_shift_start: "07:00:00",
  first_shift_end: "19:00:00",
  second_shift_start: "19:00:00",
  second_shift_end: "07:00:00",
};

export const formatPickerDate = (date?: Date) => {
  if (!date) return "";

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

export const parsePickerDate = (value: string) => {
  if (value.length !== DATE_FORMAT_LENGTH) return null;

  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return date;
};

export const formatScanTime = (date?: Date) => {
  if (!date) return "";

  return date.toLocaleTimeString("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const formatScanDate = (date?: Date) => {
  if (!date) return "";

  return date.toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

export const formatPickerTime = (date?: Date) => {
  if (!date) return "";

  return date.toLocaleTimeString("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
};

export const formatCloseDateTime = (date: Date | null) => {
  if (!date) return "Не указано";

  return date.toLocaleString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const normalizeShiftTime = (value?: string | number | null) => {
  const rawValue = String(value ?? "").trim();

  if (!rawValue) return "00:00:00";
  if (/^\d{1,2}$/.test(rawValue)) return `${rawValue.padStart(2, "0")}:00:00`;
  if (/^\d{1,2}:\d{1,2}$/.test(rawValue)) {
    const [hours, minutes] = rawValue.split(":");

    return `${hours.padStart(2, "0")}:${minutes.padStart(2, "0")}:00`;
  }
  if (/^\d{1,2}:\d{1,2}:\d{1,2}$/.test(rawValue)) {
    const [hours, minutes, seconds] = rawValue.split(":");

    return `${hours.padStart(2, "0")}:${minutes.padStart(2, "0")}:${seconds.padStart(2, "0")}`;
  }

  return "00:00:00";
};

const getShiftEndTime = (settings: any, shiftType: number) => {
  const shiftSettings = {
    ...DEFAULT_SHIFT_SETTINGS,
    ...(Array.isArray(settings) ? settings[0] : settings),
  };

  return normalizeShiftTime(
    shiftType === 2
      ? shiftSettings.second_shift_end
      : shiftSettings.first_shift_end,
  );
};

export const buildDateTimeFromParts = (dateValue: string, timeValue: string) => {
  if (!dateValue || !timeValue) return null;

  const normalizedTime = normalizeShiftTime(timeValue);
  const date = new Date(`${dateValue}T${normalizedTime}`);

  return Number.isNaN(date.getTime()) ? null : date;
};

const getShiftTypeValue = (shift: any) => {
  const value = shift?.shiftType ?? shift?.shift_type;

  if (typeof value === "string") {
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  }

  return value;
};

const getShiftTypeId = (shift: any) => {
  const shiftType = getShiftTypeValue(shift);

  return Number(shiftType?.id ?? shiftType ?? 1) === 2 ? 2 : 1;
};

export const getPlannedShiftEnd = (shift: any, settings: any) => {
  const openedAt = new Date(
    shift?.scannedAt ||
      shift?.scanned_at ||
      shift?.openAt ||
      shift?.open_at ||
      "",
  );

  if (Number.isNaN(openedAt.getTime())) return null;

  const shiftType = getShiftTypeId(shift);
  const endTime = getShiftEndTime(settings, shiftType);
  const plannedEnd = buildDateTimeFromParts(formatPickerDate(openedAt), endTime);

  if (!plannedEnd) return null;

  if (plannedEnd <= openedAt) {
    plannedEnd.setDate(plannedEnd.getDate() + 1);
  }

  return plannedEnd;
};

export const isShiftPastPlannedEnd = (
  shift: any,
  settings: any,
  now = new Date(),
) => {
  const plannedEnd = getPlannedShiftEnd(shift, settings);

  return Boolean(plannedEnd && now.getTime() > plannedEnd.getTime());
};

export const shouldRequestOnlineShiftCloseTime = (
  shifts: any[],
  settings: any,
  now = new Date(),
) =>
  (shifts || []).some((shift) =>
    isShiftPastPlannedEnd(shift, settings, now),
  );

const getForcedCloseGroupKey = (shift: any, settings: any) => {
  const plannedEnd = getPlannedShiftEnd(shift, settings);
  const fallbackDate = new Date(
    shift?.scannedAt || shift?.openAt || shift?.open_at || "",
  );
  const dateKey = formatPickerDate(
    plannedEnd ||
      (Number.isNaN(fallbackDate.getTime()) ? new Date() : fallbackDate),
  );

  return `${getShiftTypeId(shift)}_${dateKey}`;
};

export const getDefaultCloseDateFromShifts = (
  shifts: any[],
  settings: any,
) => {
  const now = new Date();
  const closeDates = shifts
    .map((shift) => {
      const plannedEnd = getPlannedShiftEnd(shift, settings);

      if (!plannedEnd) return null;

      return now.getTime() < plannedEnd.getTime() ? now : plannedEnd;
    })
    .filter((date): date is Date => Boolean(date))
    .sort((a, b) => b.getTime() - a.getTime());

  return closeDates[0] || now;
};

export const createForcedCloseGroups = (shifts: any[], settings: any) => {
  const groups = new Map<string, any[]>();

  shifts.forEach((shift) => {
    const key = getForcedCloseGroupKey(shift, settings);
    const currentGroup = groups.get(key) || [];

    currentGroup.push(shift);
    groups.set(key, currentGroup);
  });

  return Array.from(groups.values()).sort((a, b) => {
    const aDate = getDefaultCloseDateFromShifts(a, settings).getTime();
    const bDate = getDefaultCloseDateFromShifts(b, settings).getTime();

    return aDate - bDate;
  });
};

export const getForcedCloseGroupTitle = (shifts: any[]) => {
  const firstShift = shifts[0];
  const shiftTypeId = getShiftTypeId(firstShift);
  const shiftName = shiftTypeId === 2 ? "Вторая смена" : "Первая смена";

  return shiftName;
};

const formatShiftDate = (shift: any) => {
  const dateValue =
    shift?.openAt ||
    shift?.open_at ||
    shift?.startAt ||
    shift?.start_at ||
    shift?.scannedAt ||
    shift?.date ||
    "";
  let parsedDate: Date | null = null;

  if (typeof dateValue === "string") {
    if (dateValue.length === DATE_FORMAT_LENGTH) {
      parsedDate = parsePickerDate(dateValue);
    } else if (/^\d{2}\.\d{2}\.\d{2,4}$/.test(dateValue)) {
      const [day, month, year] = dateValue.split(".").map(Number);
      const fullYear = year < 100 ? 2000 + year : year;

      parsedDate = new Date(fullYear, month - 1, day);
    } else {
      parsedDate = new Date(dateValue);
    }
  } else {
    parsedDate = new Date(dateValue);
  }

  if (!parsedDate || Number.isNaN(parsedDate.getTime())) {
    return "дата не указана";
  }

  return parsedDate.toLocaleDateString("ru-RU");
};

const getShiftOpenTimestamp = (shift: any) => {
  const time = new Date(
    shift?.openAt || shift?.open_at || shift?.startAt || shift?.start_at || 0,
  ).getTime();

  return Number.isFinite(time) ? time : 0;
};

const getActiveOpenShiftTimestamp = (shift: any) => {
  const shiftId =
    shift?.productionShiftId ||
    shift?.production_shift_id ||
    shift?.shiftId ||
    shift?.shift_id ||
    shift?.id;

  if (!shift || !shiftId) return 0;

  const openTime = getShiftOpenTimestamp(shift);
  const closeValue =
    shift?.closeAt ||
    shift?.close_at ||
    shift?.shiftClosedAt ||
    shift?.shift_closed_at ||
    shift?.closedAt ||
    shift?.closed_at;
  const isActive = Number.isFinite(openTime) && !closeValue;

  return isActive ? openTime : 0;
};

const getLatestActiveOpenShift = (shifts: any[]) => {
  return shifts.reduce(
    (latest, shift) => {
      const time = getActiveOpenShiftTimestamp(shift);

      if (time <= latest.time) return latest;

      return { shift, time };
    },
    { shift: undefined, time: 0 },
  ).shift;
};

const getLatestShiftInGroup = (shifts: any[]) => {
  return shifts.reduce(
    (latest, shift) => {
      const time = getShiftOpenTimestamp(shift);

      if (time <= latest.time) return latest;

      return { shift, time };
    },
    { shift: undefined, time: 0 },
  ).shift;
};

export const getOnlineShiftCloseTitle = (shifts: any[]) => {
  const firstShift =
    getLatestActiveOpenShift(shifts) ||
    getLatestShiftInGroup(shifts) ||
    shifts[0];
  const shiftTypeId = getShiftTypeId(firstShift);
  const shiftType = getShiftTypeValue(firstShift);
  const shiftName =
    shiftType?.description ||
    shiftType?.name ||
    (shiftTypeId === 2 ? "Вторая смена" : "Первая смена");
  const shiftDate = formatShiftDate(firstShift);
  const recordsText = shifts.length > 1 ? `, ${shifts.length} записей` : "";

  return `${shiftName} - ${shiftDate}${recordsText}`;
};

const getOnlineShiftGroupKey = (shift: any) => {
  return [
    shift?.productionShiftId ||
      shift?.production_shift_id ||
      shift?.shiftId ||
      shift?.shift_id ||
      shift?.id ||
      "shift",
    getShiftTypeId(shift),
    shift?.date ||
      formatPickerDate(
        new Date(
          shift?.openAt || shift?.open_at || shift?.startAt || shift?.start_at,
        ),
      ),
  ].join("_");
};

const groupOnlineShiftsByOpenShift = (shifts: any[]) => {
  const groups = new Map<string, any[]>();

  shifts.forEach((shift) => {
    const workType = shift?.workType ?? shift?.work_type;
    const shiftId = shift?.productionShiftId || shift?.production_shift_id;

    if (!shift || (!shiftId && workType === "None")) return;

    const key = getOnlineShiftGroupKey(shift);
    const currentGroup = groups.get(key) || [];

    currentGroup.push(shift);
    groups.set(key, currentGroup);
  });

  return Array.from(groups.values());
};

const getShiftUniqueKey = (shift: any, index: number) => {
  const key = [
    shift?.key,
    shift?.id,
    shift?.productionShiftId || shift?.production_shift_id,
    shift?.partIds || shift?.part_ids,
    shift?.openAt || shift?.open_at,
    shift?.startAt || shift?.start_at,
  ]
    .filter((value) => value !== undefined && value !== null && value !== "")
    .join("_");

  return key || `shift_${index}`;
};

export const getUniqueShifts = (shifts: any[]) => {
  const seen = new Set<string>();

  return (shifts || []).filter((shift, index) => {
    const key = getShiftUniqueKey(shift, index);

    if (seen.has(key)) return false;

    seen.add(key);
    return true;
  });
};

export const getExpiredOnlineShiftGroups = ({
  sourceShifts,
  current,
  shiftSettings,
}: {
  sourceShifts: any[];
  current: any;
  shiftSettings: any;
}) => {
  const visibleTitlesByKey = new Map<string, string>();

  if (current?.keys?.length) {
    current.keys.forEach((groupKey: string) => {
      const shifts = current.grouped[groupKey] || [];
      const activeShift = getLatestActiveOpenShift(shifts);

      if (activeShift) {
        visibleTitlesByKey.set(
          getOnlineShiftGroupKey(activeShift),
          getGroupDisplayTitle(groupKey),
        );
      }
    });
  }

  return groupOnlineShiftsByOpenShift(sourceShifts)
    .map((shifts) => {
      const latestShift = getLatestActiveOpenShift(shifts);
      const plannedEnd = getPlannedShiftEnd(latestShift, shiftSettings);
      const latestOpenTime = latestShift
        ? getActiveOpenShiftTimestamp(latestShift)
        : 0;

      return {
        latestOpenTime,
        plannedEnd,
        shifts,
        latestShift,
      };
    })
    .filter(({ latestOpenTime, plannedEnd, latestShift }) => {
      if (!latestShift) return false;
      if (!latestOpenTime) return false;
      if (!plannedEnd) return false;

      return Date.now() > plannedEnd.getTime();
    })
    .sort((a, b) => b.latestOpenTime - a.latestOpenTime)
    .map(({ shifts, latestShift }) => {
      const titleKey = getOnlineShiftGroupKey(latestShift);

      return {
        shifts,
        title:
          visibleTitlesByKey.get(titleKey) || getOnlineShiftCloseTitle(shifts),
      };
    });
};

export const shouldClarifyCloseTime = (shifts: any[], settings: any) => {
  const now = new Date();

  return shifts.some((shift) => {
    const plannedEnd = getPlannedShiftEnd(shift, settings);

    if (!plannedEnd) return false;

    return (
      now.getTime() - plannedEnd.getTime() >
      LATE_CLOSE_THRESHOLD_MINUTES * 60 * 1000
    );
  });
};
