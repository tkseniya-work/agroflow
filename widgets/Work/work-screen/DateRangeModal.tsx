import { Ionicons } from "@expo/vector-icons";
import { Modal, Text } from "@ui-kitten/components";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";

import { AppDateTimePicker } from "../../../shared/ui/AppDateTimePicker";
import Colors from "../../../shared/styles/Colors";

type Props = {
  visible: boolean;
  startDate: string;
  endDate: string;
  parsedStartDate: Date | null;
  parsedEndDate: Date | null;
  isRangeValid: boolean;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  onClose: () => void;
  onApply: () => void;
};

export function DateRangeModal({
  visible,
  startDate,
  endDate,
  parsedStartDate,
  parsedEndDate,
  isRangeValid,
  onStartDateChange,
  onEndDateChange,
  onClose,
  onApply,
}: Props) {
  return (
    <Modal
      visible={visible}
      backdropStyle={styles.backdrop}
      onBackdropPress={onClose}
    >
      <View style={styles.modal}>
        <View style={styles.header}>
          <Text style={styles.title}>Выберите интервал</Text>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={22} color="#667085" />
          </TouchableOpacity>
        </View>

        <View style={styles.fields}>
          <AppDateTimePicker
            label="Начало периода"
            date={startDate}
            time=""
            showTime={false}
            minDate={new Date(2000, 0, 1)}
            maxDate={parsedEndDate ?? undefined}
            placeholder="ГГГГ-ММ-ДД"
            onChange={({ date }) => onStartDateChange(date)}
          />

          <AppDateTimePicker
            label="Конец периода"
            date={endDate}
            time=""
            showTime={false}
            minDate={parsedStartDate ?? new Date(2000, 0, 1)}
            placeholder="ГГГГ-ММ-ДД"
            onChange={({ date }) => onEndDateChange(date)}
          />
        </View>

        {!isRangeValid && startDate && endDate ? (
          <Text style={styles.error}>
            Дата окончания должна быть не раньше даты начала
          </Text>
        ) : null}

        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={onClose}
          >
            <Text style={styles.cancelText}>Отмена</Text>
          </TouchableOpacity>
          <TouchableOpacity
            disabled={!isRangeValid}
            style={[
              styles.button,
              styles.applyButton,
              !isRangeValid && styles.buttonDisabled,
            ]}
            onPress={onApply}
          >
            <Text style={styles.applyText}>Применить</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    backgroundColor: Colors.black + "80",
  },
  modal: {
    width: 360,
    maxWidth: "94%",
    borderRadius: 16,
    backgroundColor: Colors.white,
    padding: 16,
    gap: 16,
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
  fields: {
    gap: 14,
  },
  error: {
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
  applyButton: {
    backgroundColor: Colors.greenColor,
  },
  buttonDisabled: {
    opacity: 0.45,
  },
  cancelText: {
    fontSize: 14,
    fontWeight: "800",
    color: Colors.grey500,
  },
  applyText: {
    fontSize: 14,
    fontWeight: "800",
    color: Colors.white,
  },
});
