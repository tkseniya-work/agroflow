export type ShiftTimelinePartKind = "work" | "move";

export type ShiftTimelineEntry = {
  part: any;
  label?: string;
  kind?: ShiftTimelinePartKind;
  breakDuration?: string | number | null;
};

export type ShiftTimelineSegmentKind =
  | ShiftTimelinePartKind
  | "gap"
  | "extend";

export type ShiftTimelineSegment = {
  id: string;
  kind: ShiftTimelineSegmentKind;
  leftPct: number;
  widthPct: number;
  label: string;
  timeRange: string;
  durationLabel: string;
  breakLabel?: string;
  entryLabel?: string;
};

export type ShiftTimelineModel = {
  segments: ShiftTimelineSegment[];
  ticks: {
    leftPct: number;
    label: string;
  }[];
  breakInterval?: {
    leftPct: number;
    widthPct: number;
    timeRange: string;
    durationLabel: string;
  };
  startLabel: string;
  endLabel: string;
  totalDurationLabel: string;
  totalBreakLabel?: string;
  totalExtendLabel?: string;
};

const getValue = (source: any, snakeCase: string, camelCase: string) =>
  source?.[snakeCase] ?? source?.[camelCase];

const parseAbsoluteMinute = (value?: string | null) => {
  if (!value) return null;

  const match = String(value).match(
    /^(\d{4})-(\d{2})-(\d{2})T(\d{1,2}):(\d{2})/,
  );

  if (match) {
    const [, year, month, day, hour, minute] = match;

    return (
      Math.round(
        Date.UTC(
          Number(year),
          Number(month) - 1,
          Number(day),
        ) / 60000,
      ) +
      Number(hour) * 60 +
      Number(minute)
    );
  }

  const timestamp = new Date(value).getTime();
  return Number.isNaN(timestamp) ? null : Math.round(timestamp / 60000);
};

const durationToMinutes = (value?: string | number | null) => {
  if (value === null || value === undefined || value === "") return 0;
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;

  const source = String(value);
  if (!source.includes(":")) {
    const minutes = Number(source);
    return Number.isFinite(minutes) ? minutes : 0;
  }

  let days = 0;
  let time = source;

  if (time.includes(".") && time.indexOf(".") < time.indexOf(":")) {
    const [dayPart, timePart] = time.split(".");
    days = Number(dayPart) || 0;
    time = timePart;
  }

  const [hours, minutes, seconds] = time.split(":").map(Number);

  return (
    days * 1440 +
    (Number(hours) || 0) * 60 +
    (Number(minutes) || 0) +
    (Number(seconds) || 0) / 60
  );
};

const timeOnlyToMinutes = (value?: string | null) => {
  if (!value) return null;

  const [hours, minutes] = String(value).split(":").map(Number);
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return null;

  return hours * 60 + minutes;
};

export const formatTimelineDuration = (minutes: number) => {
  const safeMinutes = Math.max(0, Math.round(minutes));
  const hours = Math.floor(safeMinutes / 60);
  const restMinutes = safeMinutes % 60;

  if (!hours) return `${restMinutes} мин`;
  if (!restMinutes) return `${hours} ч`;
  return `${hours} ч ${restMinutes} мин`;
};

const formatAbsoluteMinute = (minutes: number) => {
  const minuteOfDay = ((minutes % 1440) + 1440) % 1440;
  const hours = Math.floor(minuteOfDay / 60);
  const restMinutes = minuteOfDay % 60;

  return `${String(hours).padStart(2, "0")}:${String(restMinutes).padStart(
    2,
    "0",
  )}`;
};

export const collectShiftTimelineEntries = (
  outputValueAggregateParts: any,
  transferAggregateParts: any,
): ShiftTimelineEntry[] => {
  const fields =
    outputValueAggregateParts?.fields_task_parts ||
    outputValueAggregateParts?.fieldsTaskParts ||
    outputValueAggregateParts?.fields ||
    [];
  const transferTariffs =
    transferAggregateParts?.grouped_by_tariff_parts ||
    transferAggregateParts?.groupedByTariffParts ||
    transferAggregateParts?.tariff_parts ||
    [];

  const fieldEntries = fields.flatMap((fieldPart: any) => {
    const tariffs =
      fieldPart?.grouped_by_tariff_parts ||
      fieldPart?.groupedByTariffParts ||
      fieldPart?.tariff_parts ||
      fieldPart?.tariffs ||
      [];

    return tariffs.flatMap((tariffPart: any) => {
      const parts = tariffPart?.shift_parts || tariffPart?.shiftParts || [];
      return parts.map((part: any) => ({
        part,
        label:
          tariffPart?.task_field_name ??
          tariffPart?.taskFieldName ??
          fieldPart?.task_field_name ??
          fieldPart?.taskFieldName ??
          fieldPart?.name,
        kind: Boolean(getValue(part, "is_transfer", "isTransfer"))
          ? ("move" as const)
          : ("work" as const),
        breakDuration:
          getValue(part, "break_duration", "breakDuration") ??
          getValue(tariffPart, "break_duration", "breakDuration"),
      }));
    });
  });

  const transferEntries = transferTariffs.flatMap((tariffPart: any) => {
    const parts = tariffPart?.shift_parts || tariffPart?.shiftParts || [];

    return parts.map((part: any) => ({
      part,
      kind: "move" as const,
      breakDuration: getValue(part, "break_duration", "breakDuration"),
    }));
  });

  return [...fieldEntries, ...transferEntries];
};

export const buildShiftTimelineModel = (
  entries: ShiftTimelineEntry[],
  shiftType?: any,
  shiftSettings?: any,
): ShiftTimelineModel | null => {
  const parts = entries
    .map((entry, index) => {
      const part = entry?.part ?? entry;
      const isInitial = Boolean(
        getValue(part, "is_initial", "isInitial"),
      );
      const startAt = getValue(part, "start_at", "startAt");
      const endAt = getValue(part, "end_at", "endAt");
      const startMinute = parseAbsoluteMinute(startAt);
      let endMinute = parseAbsoluteMinute(endAt);

      if (isInitial || startMinute === null || endMinute === null) return null;
      if (endMinute < startMinute) endMinute += 1440;

      const kind =
        entry.kind ??
        (getValue(part, "is_transfer", "isTransfer") ? "move" : "work");
      const extendDue = getValue(part, "extend_due", "extendDue");
      let extendEndMinute = parseAbsoluteMinute(extendDue);

      if (extendEndMinute !== null) {
        while (extendEndMinute < endMinute) extendEndMinute += 1440;
        if (extendEndMinute <= endMinute) extendEndMinute = null;
      }

      return {
        id: String(part?.id ?? `${kind}-${index}`),
        kind,
        startMinute,
        endMinute,
        extendEndMinute,
        breakMinutes: durationToMinutes(
          entry.breakDuration ??
            getValue(part, "break_duration", "breakDuration"),
        ),
        entryLabel:
          entry.label ??
          getValue(part, "task_field_name", "taskFieldName") ??
          getValue(part, "work_place_name", "workPlaceName") ??
          part?.task_field?.name,
      };
    })
    .filter((part): part is NonNullable<typeof part> => part !== null)
    .sort((left, right) => left.startMinute - right.startMinute);

  if (!parts.length) return null;

  const startMinute = parts[0].startMinute;
  const endMinute = Math.max(
    ...parts.map((part) => part.extendEndMinute ?? part.endMinute),
  );
  const span = Math.max(endMinute - startMinute, 1);
  const position = (minute: number) =>
    Math.min(100, Math.max(0, ((minute - startMinute) / span) * 100));
  const segments: ShiftTimelineSegment[] = [];
  let cursor = startMinute;

  parts.forEach((part) => {
    if (part.startMinute - cursor > 1) {
      segments.push({
        id: `gap-${cursor}-${part.startMinute}`,
        kind: "gap",
        leftPct: position(cursor),
        widthPct: position(part.startMinute) - position(cursor),
        label: "Простой",
        timeRange: `${formatAbsoluteMinute(cursor)} – ${formatAbsoluteMinute(
          part.startMinute,
        )}`,
        durationLabel: formatTimelineDuration(part.startMinute - cursor),
      });
    }

    segments.push({
      id: `${part.kind}-${part.id}`,
      kind: part.kind,
      leftPct: position(part.startMinute),
      widthPct: position(part.endMinute) - position(part.startMinute),
      label: part.kind === "work" ? "Выработка" : "Перегон",
      timeRange: `${formatAbsoluteMinute(
        part.startMinute,
      )} – ${formatAbsoluteMinute(part.endMinute)}`,
      durationLabel: formatTimelineDuration(
        part.endMinute - part.startMinute,
      ),
      breakLabel:
        part.breakMinutes > 0
          ? formatTimelineDuration(part.breakMinutes)
          : undefined,
      entryLabel: part.entryLabel,
    });

    cursor = Math.max(cursor, part.endMinute);

    if (part.extendEndMinute !== null) {
      segments.push({
        id: `extend-${part.id}`,
        kind: "extend",
        leftPct: position(part.endMinute),
        widthPct:
          position(part.extendEndMinute) - position(part.endMinute),
        label: "Продление",
        timeRange: `${formatAbsoluteMinute(
          part.endMinute,
        )} – ${formatAbsoluteMinute(part.extendEndMinute)}`,
        durationLabel: formatTimelineDuration(
          part.extendEndMinute - part.endMinute,
        ),
        entryLabel: part.entryLabel,
      });

      cursor = Math.max(cursor, part.extendEndMinute);
    }
  });

  const totalBreakMinutes = parts.reduce(
    (total, part) => total + part.breakMinutes,
    0,
  );
  const totalExtendMinutes = parts.reduce(
    (total, part) =>
      total +
      (part.extendEndMinute === null
        ? 0
        : part.extendEndMinute - part.endMinute),
    0,
  );
  const firstTickMinute = Math.ceil(startMinute / 60) * 60;
  const lastTickMinute = Math.floor(endMinute / 60) * 60;
  const allTicks: { leftPct: number; label: string }[] = [];

  for (
    let minute = firstTickMinute;
    minute <= lastTickMinute;
    minute += 60
  ) {
    const leftPct = position(minute);
    if (leftPct > 4 && leftPct < 96) {
      allTicks.push({
        leftPct,
        label: formatAbsoluteMinute(minute),
      });
    }
  }

  const tickStep = Math.max(1, Math.ceil(allTicks.length / 5));
  const ticks = allTicks.filter((_, index) => index % tickStep === 0);
  const settingsSource =
    shiftSettings?.data ??
    shiftSettings?.list ??
    shiftSettings?.items ??
    shiftSettings;
  const settings = Array.isArray(settingsSource)
    ? settingsSource[0]
    : settingsSource;
  const shiftTypeValue =
    shiftType?.id ??
    shiftType?.value ??
    shiftType?.type ??
    shiftType;
  const isDayShift = Number(shiftTypeValue) === 1;
  const breakStartValue = isDayShift
    ? getValue(
        settings,
        "first_shift_break_start",
        "firstShiftBreakStart",
      )
    : getValue(
        settings,
        "second_shift_break_start",
        "secondShiftBreakStart",
      );
  const breakEndValue = isDayShift
    ? getValue(
        settings,
        "first_shift_break_end",
        "firstShiftBreakEnd",
      )
    : getValue(
        settings,
        "second_shift_break_end",
        "secondShiftBreakEnd",
      );
  const breakStartTime = timeOnlyToMinutes(breakStartValue);
  const breakEndTime = timeOnlyToMinutes(breakEndValue);
  let breakInterval: ShiftTimelineModel["breakInterval"];

  if (breakStartTime !== null && breakEndTime !== null) {
    const baseMidnight = Math.floor(startMinute / 1440) * 1440;
    let breakStartMinute = baseMidnight + breakStartTime;
    let breakEndMinute = baseMidnight + breakEndTime;

    if (breakStartMinute < startMinute) {
      breakStartMinute += 1440;
      breakEndMinute += 1440;
    }
    if (breakEndMinute < breakStartMinute) breakEndMinute += 1440;

    if (
      breakEndMinute > startMinute &&
      breakStartMinute < endMinute
    ) {
      const clippedStart = Math.max(breakStartMinute, startMinute);
      const clippedEnd = Math.min(breakEndMinute, endMinute);

      breakInterval = {
        leftPct: position(clippedStart),
        widthPct: Math.max(
          position(clippedEnd) - position(clippedStart),
          1,
        ),
        timeRange: `${formatAbsoluteMinute(
          breakStartMinute,
        )} – ${formatAbsoluteMinute(breakEndMinute)}`,
        durationLabel: formatTimelineDuration(
          breakEndMinute - breakStartMinute,
        ),
      };
    }
  }

  return {
    segments,
    ticks,
    breakInterval,
    startLabel: formatAbsoluteMinute(startMinute),
    endLabel: formatAbsoluteMinute(endMinute),
    totalDurationLabel: formatTimelineDuration(span),
    totalBreakLabel:
      totalBreakMinutes > 0
        ? formatTimelineDuration(totalBreakMinutes)
        : undefined,
    totalExtendLabel:
      totalExtendMinutes > 0
        ? formatTimelineDuration(totalExtendMinutes)
        : undefined,
  };
};
