import dayjs from "dayjs";

export const normalizeShiftTime = (time?: string | null) => {
  if (!time) return "";
  if (/^\d{1,2}$/.test(time)) return `${time.padStart(2, "0")}:00:00`;
  if (/^\d{2}:\d{2}$/.test(time)) return `${time}:00`;
  if (/^\d{2}:\d{2}:\d{2}$/.test(time)) return time;

  return time;
};

export const buildShiftDateTime = (date: string, time: string) => {
  const value = dayjs(`${date}T${normalizeShiftTime(time)}`);

  return value.isValid() ? value : null;
};

export const getDefaultShiftEndDate = (
  date: string,
  startAt?: string | null,
  endedAt?: string | null,
) => {
  const startDateTime = startAt ? buildShiftDateTime(date, startAt) : null;
  const endDateTime = endedAt ? buildShiftDateTime(date, endedAt) : null;

  if (startDateTime && endDateTime && !endDateTime.isAfter(startDateTime)) {
    return dayjs(date).add(1, "day").format("YYYY-MM-DD");
  }

  return date;
};

export const isShiftDateInputValid = (date: string) =>
  /^\d{4}-\d{2}-\d{2}$/.test(date) && dayjs(date).isValid();

export const isShiftTimeInputValid = (time: string) =>
  /^([01]\d|2[0-3]):[0-5]\d:[0-5]\d$/.test(normalizeShiftTime(time));
