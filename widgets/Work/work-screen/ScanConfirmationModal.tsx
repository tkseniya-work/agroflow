import { Ionicons } from "@expo/vector-icons";
import { Modal, Text } from "@ui-kitten/components";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";

import Colors from "../../../shared/styles/Colors";
import { formatScanDate, formatScanTime } from "../../../src/utils/workShiftUtils";

const SHIFT_TYPES = [1, 2];

type PendingScan = {
  workPlaceName?: string;
  scannedAt?: Date;
  shiftType?: number;
};

type Props = {
  pendingScan: PendingScan | null;
  isProcessing: boolean;
  getDisplayShift: (shiftType?: number) => { displayName: string };
  onShiftTypeChange: (shiftType: number) => void;
  onCancel: () => void;
  onConfirm: () => void;
};

export function ScanConfirmationModal({
  pendingScan,
  isProcessing,
  getDisplayShift,
  onShiftTypeChange,
  onCancel,
  onConfirm,
}: Props) {
  const scanDate = formatScanDate(pendingScan?.scannedAt);
  const scanTime = formatScanTime(pendingScan?.scannedAt);

  return (
    <Modal
      visible={Boolean(pendingScan)}
      backdropStyle={styles.backdrop}
      onBackdropPress={() => {
        if (!isProcessing) onCancel();
      }}
    >
      <View style={styles.modal}>
        <View style={styles.header}>
          <View style={styles.icon}>
            <Ionicons
              name="qr-code-outline"
              size={22}
              color={Colors.greenColor}
            />
          </View>
          <View style={styles.titleWrap}>
            <Text style={styles.title}>Создать отрезок</Text>
            <Text style={styles.subtitle}>Проверьте данные сканирования</Text>
          </View>
        </View>

        <View style={styles.infoList}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Рабочее место</Text>
            <Text style={styles.infoValue} numberOfLines={2}>
              {pendingScan?.workPlaceName || "Не указано"}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Дата</Text>
            <Text style={styles.infoValue}>{scanDate || "Не указана"}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Время</Text>
            <Text style={styles.infoValue}>{scanTime || "Не указано"}</Text>
          </View>
        </View>

        <View style={styles.shiftPicker}>
          <Text style={styles.infoLabel}>Смена</Text>
          <View style={styles.shiftOptions}>
            {SHIFT_TYPES.map((shiftType) => {
              const active = Number(pendingScan?.shiftType) === shiftType;
              const isNightShift = shiftType === 2;
              const shift = getDisplayShift(shiftType);

              return (
                <TouchableOpacity
                  key={shiftType}
                  activeOpacity={0.8}
                  disabled={isProcessing}
                  onPress={() => onShiftTypeChange(shiftType)}
                  style={[
                    styles.shiftOption,
                    active && styles.shiftOptionActive,
                    active && isNightShift && styles.shiftOptionNightActive,
                    isProcessing && styles.shiftOptionDisabled,
                  ]}
                >
                  <Ionicons
                    name={isNightShift ? "moon-outline" : "sunny-outline"}
                    size={16}
                    color={
                      active
                        ? isNightShift
                          ? "#2639A4"
                          : Colors.greenColor
                        : Colors.grey500
                    }
                  />
                  <Text
                    style={[
                      styles.shiftOptionText,
                      active && styles.shiftOptionTextActive,
                      active &&
                        isNightShift &&
                        styles.shiftOptionNightTextActive,
                    ]}
                    numberOfLines={2}
                  >
                    {shift.displayName}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            activeOpacity={0.8}
            disabled={isProcessing}
            onPress={onCancel}
            style={[
              styles.button,
              styles.cancelButton,
              isProcessing && styles.buttonDisabled,
            ]}
          >
            <Text style={styles.cancelButtonText}>Отмена</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            disabled={isProcessing}
            onPress={onConfirm}
            style={[
              styles.button,
              styles.createButton,
              isProcessing && styles.buttonDisabled,
            ]}
          >
            <Text style={styles.createButtonText}>
              {isProcessing ? "Создаем..." : "Создать"}
            </Text>
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
    width: 330,
    maxWidth: "92%",
    borderRadius: 22,
    backgroundColor: Colors.white,
    padding: 16,
    gap: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  icon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ECFDF3",
  },
  titleWrap: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    fontSize: 18,
    fontWeight: "800",
    color: Colors.black,
  },
  subtitle: {
    marginTop: 2,
    fontSize: 12,
    color: Colors.grey500,
  },
  infoList: {
    gap: 10,
  },
  infoRow: {
    gap: 4,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#EAECF0",
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.grey500,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.black,
  },
  shiftPicker: {
    gap: 8,
  },
  shiftOptions: {
    gap: 8,
  },
  shiftOption: {
    minHeight: 48,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#EAECF0",
    backgroundColor: Colors.white,
    paddingHorizontal: 12,
    paddingVertical: 9,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  shiftOptionActive: {
    borderColor: Colors.greenColor,
    backgroundColor: "#ECFDF3",
  },
  shiftOptionNightActive: {
    borderColor: "#2639A4",
    backgroundColor: "#CCD5EA",
  },
  shiftOptionDisabled: {
    opacity: 0.7,
  },
  shiftOptionText: {
    flex: 1,
    minWidth: 0,
    fontSize: 13,
    fontWeight: "700",
    color: Colors.grey500,
  },
  shiftOptionTextActive: {
    color: Colors.greenColor,
  },
  shiftOptionNightTextActive: {
    color: "#2639A4",
  },
  actions: {
    flexDirection: "row",
    gap: 10,
  },
  button: {
    flex: 1,
    minHeight: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
  },
  buttonDisabled: {
    opacity: 0.65,
  },
  cancelButton: {
    backgroundColor: "#F2F4F7",
  },
  createButton: {
    backgroundColor: Colors.greenColor,
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: "800",
    color: Colors.grey500,
  },
  createButtonText: {
    fontSize: 14,
    fontWeight: "800",
    color: Colors.white,
  },
});
