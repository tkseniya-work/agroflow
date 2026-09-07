import { Ionicons } from "@expo/vector-icons";
import { CalendarRange } from "@ui-kitten/components";
import React, { useMemo, useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { AppDateTimePicker } from "../../../../shared/ui/AppDateTimePicker";
import Colors from "../../../../shared/styles/Colors";

interface IModalSelectDateTimeProps {
  range: CalendarRange<Date>;
  close(): void;
  setRange: React.Dispatch<React.SetStateAction<CalendarRange<Date>>>;
}

const formatDate = (date?: Date) => {
  if (!date) return "";

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const formatTime = (date?: Date, fallback = "") => {
  if (!date) return fallback;

  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${hours}:${minutes}`;
};

const buildDateTime = (dateValue: string, timeValue: string) => {
  const [year, month, day] = dateValue.split("-").map(Number);
  const [hours, minutes] = timeValue.split(":").map(Number);

  if (
    !year ||
    !month ||
    !day ||
    !Number.isInteger(hours) ||
    !Number.isInteger(minutes) ||
    hours < 0 ||
    hours > 23 ||
    minutes < 0 ||
    minutes > 59
  ) {
    return null;
  }

  const result = new Date(year, month - 1, day, hours, minutes, 0, 0);

  if (
    result.getFullYear() !== year ||
    result.getMonth() !== month - 1 ||
    result.getDate() !== day
  ) {
    return null;
  }

  return result;
};

const ModalSelectDateTime = React.memo(
  function ModalSelectDateTime({
    range,
    close,
    setRange,
  }: IModalSelectDateTimeProps) {
    const [startDate, setStartDate] = useState(
      formatDate(range.startDate ?? new Date()),
    );
    const [startTime, setStartTime] = useState(
      formatTime(range.startDate, "00:00"),
    );
    const [endDate, setEndDate] = useState(
      formatDate(range.endDate ?? new Date()),
    );
    const [endTime, setEndTime] = useState(
      formatTime(range.endDate, "23:59"),
    );

    const startDateTime = useMemo(
      () => buildDateTime(startDate, startTime),
      [startDate, startTime],
    );
    const endDateTime = useMemo(
      () => buildDateTime(endDate, endTime),
      [endDate, endTime],
    );
    const isRangeValid = Boolean(
      startDateTime && endDateTime && startDateTime <= endDateTime,
    );

    const handleConfirm = () => {
      if (!startDateTime || !endDateTime || !isRangeValid) return;

      setRange({
        startDate: startDateTime,
        endDate: endDateTime,
      });
      close();
    };

    return (
      <View style={styles.modalContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>Выберите дату и время</Text>
          <Pressable style={styles.closeButton} onPress={close}>
            <Ionicons name="close" size={22} color="#667085" />
          </Pressable>
        </View>

        <View style={styles.content}>
          <AppDateTimePicker
            label="Начало периода"
            date={startDate}
            time={startTime}
            includeSeconds={false}
            minDate={new Date(2000, 0, 1)}
            maxDate={endDateTime ?? undefined}
            placeholder="Дата начала"
            onChange={(value) => {
              setStartDate(value.date);
              setStartTime(value.time.slice(0, 5));
            }}
          />

          <AppDateTimePicker
            label="Окончание периода"
            date={endDate}
            time={endTime}
            includeSeconds={false}
            minDate={startDateTime ?? new Date(2000, 0, 1)}
            placeholder="Дата окончания"
            onChange={(value) => {
              setEndDate(value.date);
              setEndTime(value.time.slice(0, 5));
            }}
          />

          {!isRangeValid && startDate && startTime && endDate && endTime && (
            <Text style={styles.errorText}>
              Окончание периода должно быть позже его начала
            </Text>
          )}
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={close}
          >
            <Text style={styles.cancelButtonText}>Отмена</Text>
          </TouchableOpacity>

          <TouchableOpacity
            disabled={!isRangeValid}
            style={[
              styles.button,
              styles.confirmButton,
              !isRangeValid && styles.buttonDisabled,
            ]}
            onPress={handleConfirm}
          >
            <Text style={styles.confirmButtonText}>Применить</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  },
);

export default ModalSelectDateTime;

const styles = StyleSheet.create({
  modalContainer: {
    width: 360,
    maxWidth: "94%",
    alignSelf: "center",
    borderRadius: 16,
    padding: 16,
    gap: 16,
    backgroundColor: Colors.white,
  },
  header: {
    minHeight: 32,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  title: {
    flex: 1,
    fontSize: 18,
    fontWeight: "800",
    color: Colors.black,
  },
  closeButton: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    gap: 14,
  },
  errorText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#D92D20",
  },
  actions: {
    flexDirection: "row",
    gap: 10,
  },
  button: {
    flex: 1,
    minHeight: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
  },
  cancelButton: {
    backgroundColor: "#F2F4F7",
  },
  confirmButton: {
    backgroundColor: Colors.greenColor,
  },
  buttonDisabled: {
    opacity: 0.45,
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: "800",
    color: Colors.grey500,
  },
  confirmButtonText: {
    fontSize: 14,
    fontWeight: "800",
    color: Colors.white,
  },
});
