import { Text } from "@ui-kitten/components";
import React, { memo, useCallback } from "react";
import { Alert, TouchableOpacity, View } from "react-native";

import { PendingShiftCard } from "../PendingShiftCard/PendingShiftCard";
import { AppIcon } from "../../shared/ui";
import Colors from "../../shared/styles/Colors";
import EvaIcons from "../../src/types/eva-icon-enum";
import { getGroupDisplayTitle } from "../../src/utils/shiftDataUtils";
import { styles } from "./ShiftsSection.styles";
import type {
  ClosePendingShiftsHandler,
  PendingShift,
  ShiftCollection,
} from "./ShiftsSection.types";

type Props = {
  pendingShifts: ShiftCollection<PendingShift>;
  activeShiftsByGroup: Record<string, PendingShift[]>;
  onCloseShifts: ClosePendingShiftsHandler;
  onSyncPress: () => void;
};

const PendingShiftsSectionComponent = ({
  pendingShifts,
  activeShiftsByGroup,
  onCloseShifts,
  onSyncPress,
}: Props) => {
  const handleClosePress = useCallback(
    (groupKey: string, activeShifts: PendingShift[]) => {
      Alert.alert(
        "Закрытие офлайн-отрезков",
        `Закрыть все открытые отрезки смены "${getGroupDisplayTitle(groupKey)}"?`,
        [
          { text: "Отмена", style: "cancel" },
          {
            text: "Закрыть",
            style: "destructive",
            onPress: () => onCloseShifts(activeShifts),
          },
        ],
      );
    },
    [onCloseShifts],
  );

  if (!pendingShifts.keys.length) return null;

  return (
    <View style={styles.pendingSection}>
      <View style={styles.pendingSyncRow}>
        <View style={styles.pendingSyncIconWrap}>
          <AppIcon
            name={EvaIcons.CloudUploadOutline}
            size={16}
            fill={Colors.icon.warning}
          />
        </View>

        <View style={styles.pendingSyncInfo}>
          <Text style={styles.pendingSyncTitle}>Ожидают отправки</Text>
        </View>

        <TouchableOpacity
          style={styles.pendingSyncButton}
          activeOpacity={0.78}
          onPress={onSyncPress}
          accessibilityRole="button"
        >
          <Text style={styles.pendingSyncButtonText}>Отправить</Text>
        </TouchableOpacity>
      </View>

      {pendingShifts.keys.map((groupKey) => {
        const shifts = pendingShifts.grouped[groupKey] ?? [];
        const activeShifts = activeShiftsByGroup[groupKey] ?? [];
        const groupTitle = getGroupDisplayTitle(groupKey);

        return (
          <View key={groupKey} style={styles.pendingGroup}>
            <View style={styles.pendingGroupAccent} />
            <View style={styles.pendingGroupHeader}>
              <View style={styles.pendingGroupTitleWrap}>
                <Text category="s1" style={styles.pendingGroupTitle}>
                  {groupTitle}
                </Text>
              </View>

              {activeShifts.length ? (
                <TouchableOpacity
                  onPress={() => handleClosePress(groupKey, activeShifts)}
                  activeOpacity={0.75}
                  style={styles.pendingStopButton}
                  accessibilityRole="button"
                  accessibilityLabel={`Закрыть офлайн-смену ${groupTitle}`}
                >
                  <AppIcon
                    name={EvaIcons.StopCircle}
                    size={26}
                    fill={Colors.status.error}
                  />
                </TouchableOpacity>
              ) : (
                <View style={styles.pendingClosedBadge}>
                  <AppIcon
                    name={EvaIcons.CheckmarkCircle2}
                    size={14}
                    fill={Colors.success}
                  />
                  <Text style={styles.pendingClosedText}>Закрыта</Text>
                </View>
              )}
            </View>

            {shifts.map((shift) => (
              <PendingShiftCard
                key={shift.id || shift.key}
                shift={{
                  id: shift.id,
                  shiftType: shift.shiftType,
                  scannedAt: shift.scannedAt ?? shift.openAt,
                  endedAt: shift.endedAt,
                  workplaceName:
                    shift.workplaceName ?? shift.workPlaceName ?? "Не указано",
                  segmentType: shift.segmentType,
                  status: "pending",
                }}
              />
            ))}
          </View>
        );
      })}
    </View>
  );
};

export const PendingShiftsSection = memo(PendingShiftsSectionComponent);
