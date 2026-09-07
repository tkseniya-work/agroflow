import { Text } from "@ui-kitten/components";
import { AppIcon, LayoutCustom } from "../../shared/ui";
import React, { memo, useCallback, useMemo, useState } from "react";
import {
  Alert,
  StyleSheet,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import Colors from "../../shared/styles/Colors";
import EvaIcons from "../../src/types/eva-icon-enum";
import { ShiftData, WorkType } from "../../entities/productionShift";
import ShiftWorkItem from "../ShiftWorkItem";

interface ShiftGroupProps {
  groupKey: string;
  shifts: ShiftData[];
  getGroupDisplayTitle: (key: string) => string;
  onStopShift?: (shifts: ShiftData[]) => void;
  onSaveToLocal?: (shifts: ShiftData[]) => void;
  showStopButton?: boolean;
  isConnected?: boolean;
}

const getShiftKey = (shift: ShiftData, index: number) =>
  [
    shift.key,
    shift.productionShiftId,
    shift.partIds,
    shift.tariffId,
    index,
  ]
    .filter((value) => value !== null && value !== undefined)
    .join("_");

const ShiftGroupComponent: React.FC<ShiftGroupProps> = ({
  groupKey,
  shifts,
  getGroupDisplayTitle,
  onStopShift,
  onSaveToLocal,
  showStopButton = false,
  isConnected,
}) => {
  const [isStopping, setIsStopping] = useState(false);
  const { width: windowWidth } = useWindowDimensions();

  const isSmallScreen = windowWidth < 375;

  const groupStatus = useMemo(() => {
    if (shifts.length === 0) return "Нет данных";

    if (showStopButton) {
      return "Активна";
    } else {
      return "Завершена";
    }
  }, [shifts.length, showStopButton]);

  const statusColor = useMemo(() => {
    switch (groupStatus) {
      case "Активна":
        return Colors.success;
      case "Завершена":
        return Colors.grey500;
      default:
        return Colors.grey400;
    }
  }, [groupStatus]);

  const title = useMemo(
    () => getGroupDisplayTitle(groupKey),
    [getGroupDisplayTitle, groupKey],
  );

  const visibleShifts = useMemo(
    () => shifts.filter((shift) => shift.workType !== WorkType.None),
    [shifts],
  );

  const handleStopPress = useCallback(async () => {
    Alert.alert(
      "Завершение смены",
      `Вы уверены, что хотите завершить смену "${title}"?`,
      [
        {
          text: "Отмена",
          style: "cancel",
        },
        {
          text: "Завершить",
          style: "destructive",
          onPress: async () => {
            setIsStopping(true);
            try {
              await onStopShift?.(shifts);
            } catch (error) {
              console.error("Error stopping shifts:", error);
            } finally {
              setIsStopping(false);
            }
          },
        },
      ],
    );
  }, [onStopShift, shifts, title]);

  return (
    <View style={[styles.group, isSmallScreen && styles.groupSmall]}>
      <View style={styles.headerContainer}>
        {/* Заголовок - занимает доступное пространство */}
        <Text
          category="s1"
          style={[styles.header, isSmallScreen && styles.headerSmall]}
          numberOfLines={2}
          ellipsizeMode="tail"
        >
          {title}
        </Text>

        {/* Контейнер для статуса и кнопки */}

        <View style={styles.rightContainer}>
          {isConnected && (
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: statusColor + "20" },
                isSmallScreen && styles.statusBadgeSmall,
              ]}
            >
              <Text
                category="c2"
                style={[
                  styles.statusText,
                  { color: statusColor },
                  isSmallScreen && styles.statusTextSmall,
                ]}
              >
                {groupStatus}
              </Text>
            </View>
          )}

          {showStopButton && (
            <TouchableOpacity
              onPress={handleStopPress}
              activeOpacity={0.7}
              disabled={isStopping}
              style={styles.stopButton}
            >
              <View style={styles.stopButtonContent}>
                <AppIcon
                  name={
                    isStopping ? EvaIcons.LoaderOutline : EvaIcons.StopCircle
                  }
                  size={isSmallScreen ? 24 : 26}
                  fill={isStopping ? Colors.grey400 : Colors.status.error}
                />
              </View>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {visibleShifts.map((shift: ShiftData, index: number) => (
        <LayoutCustom
          key={getShiftKey(shift, index)}
          justify="space-between"
        >
          <ShiftWorkItem item={shift} />
        </LayoutCustom>
      ))}
    </View>
  );
};

export const ShiftGroup = memo(ShiftGroupComponent);

export const styles = StyleSheet.create({
  group: {
    marginBottom: 8,
    backgroundColor: Colors.white,
  },
  groupSmall: {
    gap: 8,
    borderRadius: 10,
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
    minHeight: 40,
    gap: 8,
  },
  header: {
    fontWeight: "bold",
    color: Colors.grey600,
    fontSize: 16,
    lineHeight: 20,
    flex: 1,
    flexShrink: 1,
  },
  headerSmall: {
    fontSize: 14,
    lineHeight: 18,
  },
  rightContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexShrink: 0,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "center",
    minHeight: 24,
    justifyContent: "center",
  },
  statusBadgeSmall: {
    paddingHorizontal: 6,
    borderRadius: 10,
    minHeight: 20,
  },
  statusText: {
    fontWeight: "500",
    fontSize: 12,
    lineHeight: 16,
  },
  statusTextSmall: {
    fontSize: 10,
    lineHeight: 14,
  },
  stopButton: {
    alignSelf: "center",
  },
  stopButtonContent: {
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
  },
});
