import { Ionicons } from "@expo/vector-icons";
import dayjs from "dayjs";
import React, { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

export type AppDateTimeValue = {
  date: string;
  time: string;
};

type Props = {
  label: string;
  date?: string;
  time?: string;
  placeholder?: string;
  disabled?: boolean;
  minDate?: Date;
  maxDate?: Date;
  includeSeconds?: boolean;
  showTime?: boolean;
  onChange: (value: AppDateTimeValue) => void;
  onClear?: () => void;
};

const DATE_FORMAT = "YYYY-MM-DD";
const WEEKDAYS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];
const MONTHS = [
  "Январь",
  "Февраль",
  "Март",
  "Апрель",
  "Май",
  "Июнь",
  "Июль",
  "Август",
  "Сентябрь",
  "Октябрь",
  "Ноябрь",
  "Декабрь",
];

const normalizeTime = (time?: string | null) => {
  const value = time?.trim();

  if (!value) return "00:00:00";
  if (/^\d{1,2}$/.test(value)) return `${value.padStart(2, "0")}:00:00`;
  if (/^\d{1,2}:\d{1,2}$/.test(value)) {
    const [hours, minutes] = value.split(":");

    return `${hours.padStart(2, "0")}:${minutes.padStart(2, "0")}:00`;
  }
  if (/^\d{1,2}:\d{1,2}:\d{1,2}$/.test(value)) {
    const [hours, minutes, seconds] = value.split(":");

    return `${hours.padStart(2, "0")}:${minutes.padStart(2, "0")}:${seconds.padStart(2, "0")}`;
  }

  return "00:00:00";
};

const formatTime = (value?: string, includeSeconds = true) => {
  if (!value) return "";

  const normalized = normalizeTime(value);

  return includeSeconds ? normalized : normalized.slice(0, 5);
};

const formatTimeInput = (value: string, includeSeconds = true) => {
  const digits = value.replace(/\D/g, "").slice(0, includeSeconds ? 6 : 4);
  const hours = digits.slice(0, 2);
  const minutes = digits.slice(2, 4);
  const seconds = digits.slice(4, 6);

  return [hours, minutes, includeSeconds ? seconds : ""].filter(Boolean).join(":");
};

const normalizeDateInput = (value: string) => {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  const year = digits.slice(0, 4);
  const month = digits.slice(4, 6);
  const day = digits.slice(6, 8);

  return [year, month, day].filter(Boolean).join("-");
};

const getValidDate = (date?: string) => {
  const parsed = dayjs(date, DATE_FORMAT);

  return date && parsed.isValid() ? parsed : dayjs();
};

const getCalendarDays = (visibleMonth: dayjs.Dayjs) => {
  const startOfMonth = visibleMonth.startOf("month");
  const leadingDays = (startOfMonth.day() + 6) % 7;
  const daysInMonth = visibleMonth.daysInMonth();
  const cells: (dayjs.Dayjs | null)[] = [];

  for (let index = 0; index < leadingDays; index += 1) {
    cells.push(null);
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push(startOfMonth.date(day));
  }

  while (cells.length % 7 !== 0) {
    cells.push(null);
  }

  return cells;
};

export function AppDateTimePicker({
  label,
  date,
  time,
  placeholder = "Дата",
  disabled,
  minDate,
  maxDate,
  includeSeconds = true,
  showTime = true,
  onChange,
  onClear,
}: Props) {
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [visibleMonth, setVisibleMonth] = useState(() =>
    getValidDate(date).startOf("month"),
  );

  const calendarDays = useMemo(() => getCalendarDays(visibleMonth), [visibleMonth]);
  const dateText = date || "";
  const timeText = time || "";

  const commitDate = (nextDate: string) => {
    onChange({
      date: nextDate,
      time: time ? normalizeTime(time) : normalizeTime(undefined),
    });
  };

  const handleDateInputChange = (nextDate: string) => {
    commitDate(normalizeDateInput(nextDate));
  };

  const handleDatePress = () => {
    if (disabled) return;

    setVisibleMonth(getValidDate(date).startOf("month"));
    setCalendarOpen((prev) => !prev);
  };

  const handleDaySelect = (day: dayjs.Dayjs) => {
    commitDate(day.format(DATE_FORMAT));
    setVisibleMonth(day.startOf("month"));
    setCalendarOpen(false);
  };

  const handleTimeChange = (nextTime: string) => {
    onChange({
      date: date && dayjs(date).isValid() ? date : dayjs().format(DATE_FORMAT),
      time: formatTimeInput(nextTime, includeSeconds),
    });
  };

  const handleTimeEndEditing = () => {
    if (!time) return;

    onChange({
      date: date && dayjs(date).isValid() ? date : dayjs().format(DATE_FORMAT),
      time: formatTime(time, includeSeconds),
    });
  };

  const isDayDisabled = (day: dayjs.Dayjs) => {
    if (minDate && day.isBefore(dayjs(minDate).startOf("day"))) return true;
    if (maxDate && day.isAfter(dayjs(maxDate).startOf("day"))) return true;

    return false;
  };

  return (
    <View style={[styles.container, disabled && styles.disabled]}>
      <View style={styles.header}>
        <Text style={styles.label}>{label}</Text>
        {!!onClear && !!time && (
          <Pressable style={styles.clearButton} onPress={onClear}>
            <Ionicons name="close" size={15} color="#667085" />
          </Pressable>
        )}
      </View>

      <View style={styles.row}>
        <View style={styles.dateBox}>
          <Pressable onPress={handleDatePress} disabled={disabled} hitSlop={8}>
            <Ionicons name="calendar-outline" size={18} color="#667085" />
          </Pressable>
          <TextInput
            value={dateText}
            onChangeText={handleDateInputChange}
            editable={!disabled}
            keyboardType="number-pad"
            placeholder={placeholder}
            placeholderTextColor="#98A2B3"
            style={styles.input}
          />
        </View>

        {showTime && (
          <View style={styles.timeBox}>
            <Ionicons name="time-outline" size={18} color="#667085" />
            <TextInput
              value={timeText}
              onChangeText={handleTimeChange}
              onEndEditing={handleTimeEndEditing}
              editable={!disabled}
              keyboardType="number-pad"
              placeholder={includeSeconds ? "HH:mm:ss" : "HH:mm"}
              placeholderTextColor="#98A2B3"
              style={styles.input}
            />
          </View>
        )}
      </View>

      {calendarOpen && (
        <View style={styles.calendar}>
          <View style={styles.calendarHeader}>
            <Pressable
              style={styles.calendarNavButton}
              onPress={() => setVisibleMonth((prev) => prev.subtract(1, "month"))}
            >
              <Ionicons name="chevron-back" size={18} color="#475467" />
            </Pressable>

            <Text style={styles.calendarTitle}>
              {MONTHS[visibleMonth.month()]} {visibleMonth.year()}
            </Text>

            <Pressable
              style={styles.calendarNavButton}
              onPress={() => setVisibleMonth((prev) => prev.add(1, "month"))}
            >
              <Ionicons name="chevron-forward" size={18} color="#475467" />
            </Pressable>
          </View>

          <View style={styles.weekRow}>
            {WEEKDAYS.map((weekday) => (
              <Text key={weekday} style={styles.weekday}>
                {weekday}
              </Text>
            ))}
          </View>

          <View style={styles.daysGrid}>
            {calendarDays.map((day, index) => {
              const isSelected =
                !!day && dateText === day.format(DATE_FORMAT);
              const isToday = !!day && day.isSame(dayjs(), "day");
              const isDisabled = !day || isDayDisabled(day);

              return (
                <Pressable
                  key={day?.format(DATE_FORMAT) || `empty-${index}`}
                  style={[
                    styles.dayButton,
                    isDisabled && styles.dayButtonDisabled,
                  ]}
                  disabled={isDisabled}
                  onPress={() => day && handleDaySelect(day)}
                >
                  <View
                    style={[
                      styles.dayPill,
                      isToday && styles.todayPill,
                      isSelected && styles.selectedDayPill,
                    ]}
                  >
                    <Text
                      style={[
                        styles.dayText,
                        isToday && styles.todayText,
                        isSelected && styles.selectedDayText,
                        isDisabled && styles.dayTextDisabled,
                      ]}
                    >
                      {day?.date() || ""}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 6,
  },
  disabled: {
    opacity: 0.5,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  label: {
    fontSize: 12,
    fontWeight: "700",
    color: "#344054",
  },
  clearButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F2F4F7",
  },
  row: {
    flexDirection: "row",
    gap: 8,
  },
  dateBox: {
    flex: 1.15,
    minHeight: 48,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#EAECF0",
    backgroundColor: "#F9FAFB",
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  timeBox: {
    flex: 1,
    minHeight: 48,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#EAECF0",
    backgroundColor: "#F9FAFB",
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  input: {
    flex: 1,
    minWidth: 0,
    fontSize: 14,
    fontWeight: "700",
    color: "#101828",
    paddingVertical: 0,
  },
  calendar: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#EAECF0",
    backgroundColor: "#FFFFFF",
    padding: 10,
  },
  calendarHeader: {
    minHeight: 36,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  calendarNavButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F2F4F7",
  },
  calendarTitle: {
    flex: 1,
    minWidth: 0,
    textAlign: "center",
    fontSize: 14,
    fontWeight: "800",
    color: "#101828",
  },
  weekRow: {
    flexDirection: "row",
    marginBottom: 6,
  },
  weekday: {
    flex: 1,
    textAlign: "center",
    fontSize: 11,
    fontWeight: "800",
    color: "#667085",
  },
  daysGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  dayButton: {
    width: `${100 / 7}%`,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
  },
  dayPill: {
    minWidth: 34,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 9,
  },
  todayPill: {
    backgroundColor: "#F2F4F7",
  },
  selectedDayPill: {
    backgroundColor: "#12B76A",
  },
  dayButtonDisabled: {
    opacity: 0.35,
  },
  dayText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#344054",
  },
  todayText: {
    color: "#101828",
  },
  selectedDayText: {
    color: "#FFFFFF",
  },
  dayTextDisabled: {
    color: "#98A2B3",
  },
});
