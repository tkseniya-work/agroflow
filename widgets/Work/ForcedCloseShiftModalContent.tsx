import { Ionicons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

import Colors from "../../shared/styles/Colors";
import {
  formatCloseDateTime,
  getForcedCloseGroupTitle,
} from "../../src/utils/workShiftUtils";
import { AppDateTimePicker } from "../../shared/ui/AppDateTimePicker";
import { forcedCloseShiftModalStyles as styles } from "./ForcedCloseShiftModal.styles";
import type {
  ForcedCloseDateTimeValue,
  ForcedCloseMode,
} from "./ForcedCloseShiftModal.types";

type Props = {
  shifts: any[];
  mode: ForcedCloseMode;
  needsTime: boolean;
  pickerVisible: boolean;
  queueIndex: number;
  queueTotal: number;
  closeDate: string;
  closeTime: string;
  selectedCloseDate: Date | null;
  onTogglePicker: () => void;
  onDateTimeChange: (value: ForcedCloseDateTimeValue) => void;
};

export const ForcedCloseShiftModalContent = ({
  shifts,
  mode,
  needsTime,
  pickerVisible,
  queueIndex,
  queueTotal,
  closeDate,
  closeTime,
  selectedCloseDate,
  onTogglePicker,
  onDateTimeChange,
}: Props) => {
  const hint =
    mode === "online"
      ? "Проверьте фактические дату и время закрытия перед продолжением."
      : "Смена закрывается позже планового времени. Проверьте фактические дату и время закрытия.";
  const forcedCloseGroupTitle = useMemo(
    () => getForcedCloseGroupTitle(shifts),
    [shifts],
  );
  const selectedCloseDateTime = useMemo(
    () => formatCloseDateTime(selectedCloseDate),
    [selectedCloseDate],
  );
  const togglePickerLabel = pickerVisible
    ? "Скрыть выбор времени"
    : "Изменить дату и время";

  return (
    <ScrollView
      style={styles.content}
      contentContainerStyle={styles.contentInner}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {queueTotal > 1 && (
        <View style={styles.progressBadge}>
          <Text style={styles.progressText}>
            Смена {queueIndex} из {queueTotal}
          </Text>
        </View>
      )}

      <View style={styles.shiftSummary}>
        <Text style={styles.shiftLabel}>Закрывается</Text>
        <Text style={styles.shiftValue}>{forcedCloseGroupTitle}</Text>
      </View>

      <View style={styles.selectedTime}>
        <Text style={styles.selectedLabel}>Время закрытия</Text>
        <Text style={styles.selectedValue}>{selectedCloseDateTime}</Text>
      </View>

      {needsTime && (
        <View style={styles.fields}>
          <Text style={styles.hint}>{hint}</Text>

          <TouchableOpacity
            accessibilityLabel={togglePickerLabel}
            accessibilityRole="button"
            activeOpacity={0.8}
            onPress={onTogglePicker}
            style={styles.changeButton}
          >
            <Ionicons
              name="create-outline"
              size={18}
              color={Colors.grey700}
            />
            <Text style={styles.changeButtonText}>{togglePickerLabel}</Text>
          </TouchableOpacity>

          {pickerVisible && (
            <AppDateTimePicker
              label="Дата и время закрытия"
              date={closeDate}
              time={closeTime}
              includeSeconds
              maxDate={new Date()}
              onChange={onDateTimeChange}
            />
          )}
        </View>
      )}
    </ScrollView>
  );
};
