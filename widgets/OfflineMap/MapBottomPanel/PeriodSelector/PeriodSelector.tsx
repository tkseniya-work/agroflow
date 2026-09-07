import React, { useState } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Alert,
  Modal,
} from "react-native";
import Colors from "../../../../shared/styles/Colors";
import { CalendarRange } from "@ui-kitten/components";
import ModalSelectDateTime from "./ModalSelectDateTime";
import { Period, PeriodSelectorProps } from "../../../../src/types/map.types";
import { useShiftSettings } from "../../../../features/localData/useLocalData";
import { useShifts } from "../../../Work/shared/useShifts";

type PeriodType =
  | "today"
  | "yesterday"
  | "7days"
  | "dayShift"
  | "nightShift"
  | "custom";

export const PeriodSelector: React.FC<PeriodSelectorProps> = ({
  isTrackActionDisabled = false,
  onChangeDraftPeriod,
  onCreateTechniqueTracks,
  collapsePanel,
  clearTrack
}) => {
  const [selectedType, setSelectedType] = useState<PeriodType | null>(null);
  const [showDateModal, setShowDateModal] = useState(false);
  const [draftPeriod, setDraftPeriod] = useState<Period | null>(null);

  const [calendarRange, setCalendarRange] = useState<CalendarRange<Date>>({
    startDate: new Date(),
    endDate: new Date(),
  });

  const settingsProductionShift = useShiftSettings();

  const shifts = useShifts(settingsProductionShift?.[0]);
  const settings = shifts?.settings;
  const canApply =
    !isTrackActionDisabled &&
    selectedType !== null &&
    (selectedType !== "custom" || draftPeriod !== null);

const buildPeriod = (type: PeriodType): Period => {
  const now = new Date();
  let start = new Date();
  let end = new Date();

  switch (type) {
    case "today":
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      break;

    case "yesterday":
      start.setDate(now.getDate() - 1);
      start.setHours(0, 0, 0, 0);
      end.setDate(now.getDate() - 1);
      end.setHours(23, 59, 59, 999);
      break;

    case "7days":
      start.setDate(now.getDate() - 7);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      break;

    case "dayShift": {
      const startHour = Number(settings?.first_shift_start ?? 8);
      const endHour = Number(settings?.first_shift_end ?? 20);

      start.setHours(startHour, 0, 0, 0);
      end.setHours(endHour, 0, 0, 0);
      break;
    }

    case "nightShift": {
      const startHour = Number(settings?.second_shift_start ?? 20);
      const endHour = Number(settings?.second_shift_end ?? 8);

      start.setHours(startHour, 0, 0, 0);

      if (endHour <= startHour) {
        end.setDate(now.getDate() + 1);
      }

      end.setHours(endHour, 0, 0, 0);
      break;
    }

    default:
      return draftPeriod as Period;
  }

  return { startDate: start, endDate: end };
};

  const handleSelect = (type: PeriodType) => {
    setSelectedType(type);

    if (type === "custom") {
      setCalendarRange({
        startDate: new Date(),
        endDate: new Date(),
      });
      setShowDateModal(true);
      return;
    }

    const period = buildPeriod(type);
    setDraftPeriod(period);
    onChangeDraftPeriod?.(period);
  };

  const applyPeriod = () => {
    let period: Period;

    if (selectedType === "custom") {
      if (!draftPeriod) {
        Alert.alert("Ошибка", "Сначала выберите период в календаре");
        return;
      }
      period = draftPeriod;
    } else if (selectedType) {
      period = buildPeriod(selectedType);
    } else {
      Alert.alert("Ошибка", "Сначала выберите период");
      return;
    }

    onChangeDraftPeriod?.(period);
    collapsePanel();
    onCreateTechniqueTracks(period);
  };

  const resetPeriod = () => {
    setSelectedType(null);
    setDraftPeriod(null);
    onChangeDraftPeriod?.(null);
    clearTrack();
  };

  const handleModalConfirm = (range: CalendarRange<Date>) => {
    if (range.startDate && range.endDate) {
      const period = {
        startDate: range.startDate,
        endDate: range.endDate,
      };
      setDraftPeriod(period);
      onChangeDraftPeriod?.(period);
    }
    setShowDateModal(false);
  };

  const formatDate = (date: Date | undefined) => {
    return date?.toLocaleString("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <View>
      {/* Быстрые кнопки */}
      <View style={styles.quickButtons}>
        {[
          ["Сегодня", "today"],
          ["Вчера", "yesterday"],
          ["7 дней", "7days"],
          ["Дневная", "dayShift"],
          ["Ночная", "nightShift"],
          ["Произвольный", "custom"],
        ].map(([title, type]) => (
          <TouchableOpacity
            key={type}
            accessibilityRole="button"
            accessibilityState={{ selected: selectedType === type }}
            style={[
              styles.button,
              selectedType === type && styles.activeButton,
            ]}
            onPress={() => handleSelect(type as PeriodType)}
          >
            <Text
              style={[
                styles.buttonText,
                selectedType === type && styles.activeText,
              ]}
            >
              {title}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Отображение выбранного периода */}
      {selectedType === "custom" && draftPeriod && (
        <View style={styles.selectedPeriodContainer}>
          <Text style={styles.selectedPeriodText}>
            Выбран период: {formatDate(draftPeriod.startDate)} -{" "}
            {formatDate(draftPeriod.endDate)}
          </Text>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => {
              setCalendarRange({
                startDate: draftPeriod.startDate,
                endDate: draftPeriod.endDate,
              });
              setShowDateModal(true);
            }}
          >
            <Text style={styles.editButtonText}>Изменить</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Модальное окно с календарем и временем */}
      <Modal
        visible={showDateModal}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowDateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ModalSelectDateTime
              range={calendarRange}
              close={() => setShowDateModal(false)}
              setRange={(range: any) => {
                if (range.startDate && range.endDate) {
                  handleModalConfirm(range);
                }
              }}
            />
          </View>
        </View>
      </Modal>

      <View style={styles.actions}>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityState={{ disabled: !canApply }}
          disabled={!canApply}
          style={[styles.applyBtn, !canApply && styles.applyBtnDisabled]}
          onPress={applyPeriod}
        >
          <Text style={styles.applyText} numberOfLines={1}>
            {isTrackActionDisabled
              ? "Сначала выберите технику"
              : "Построить трек"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          accessibilityRole="button"
          accessibilityState={{ disabled: !selectedType }}
          disabled={!selectedType}
          style={[styles.resetBtn, !selectedType && styles.resetBtnDisabled]}
          onPress={resetPeriod}
        >
          <Text style={styles.resetText}>Сбросить</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  quickButtons: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 10,
    gap: 8,
  },
  button: {
    flexBasis: "30%",
    flexGrow: 1,
    minHeight: 40,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: Colors.grey100,
    borderWidth: 1,
    borderColor: "transparent",
    borderRadius: 10,
  },
  activeButton: {
    backgroundColor: Colors.greenColorLight,
    borderColor: "#B8DEC4",
  },
  buttonText: {
    fontSize: 12,
    color: Colors.grey900,
  },
  activeText: {
    color: Colors.greenColor,
    fontWeight: "700",
  },
  selectedPeriodContainer: {
    marginTop: 16,
    padding: 14,
    backgroundColor: Colors.greenColorLight,
    borderRadius: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  selectedPeriodText: {
    fontSize: 13,
    color: Colors.grey900,
    flex: 1,
  },
  editButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: Colors.greenColor,
    borderRadius: 6,
    marginLeft: 8,
  },
  editButtonText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: "600",
  },
  actions: {
    flexDirection: "row",
    marginTop: 12,
    gap: 10,
  },
  applyBtn: {
    flex: 2,
    minHeight: 48,
    paddingHorizontal: 16,
    backgroundColor: "#202722",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  applyBtnDisabled: {
    opacity: 0.45,
  },
  applyText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: "600",
  },
  resetBtn: {
    flex: 1,
    minHeight: 48,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#D5D9DD",
    alignItems: "center",
    justifyContent: "center",
  },
  resetBtnDisabled: {
    opacity: 0.45,
  },
  resetText: {
    color: "gray",
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "96%",
  },
});
