import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import React, { memo, useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";

import { AppIcon } from "../../shared/ui/AppIcon";
import Colors from "../../shared/styles/Colors";
import EvaIcons from "../../src/types/eva-icon-enum";

interface PendingShift {
  id?: string | number;
  shiftType: number | { id?: number; description?: string };
  scannedAt: string;
  endedAt?: string;
  workplaceName: string;
  segmentType?: string | null;
  status: "pending";
}

interface PendingShiftCardProps {
  shift: PendingShift;
}

const formatTime = (dateString: string) => {
  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) return "Время не указано";

  return date.toLocaleTimeString("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatTimeRange = (startDate: string, endDate?: string) => {
  const start = formatTime(startDate);
  const end = endDate ? formatTime(endDate) : "";

  if (!end || end === "Время не указано") return start;

  return `${start} - ${end}`;
};

const getSegmentMeta = (segmentType?: string | null) => {
  const normalizedType = String(segmentType || "").toLowerCase();

  if (
    normalizedType === "mobile" ||
    normalizedType.includes("подвиж") ||
    normalizedType.includes("мобиль")
  ) {
    return {
      icon: "car-outline",
      iconPack: "ionicons",
      title: "Подвижный отрезок",
      color: Colors.greenColor,
      backgroundColor: Colors.greenColorLight,
    };
  }

  if (
    normalizedType === "stationary" ||
    normalizedType.includes("стационар")
  ) {
    return {
      icon: "map-marker-outline",
      iconPack: "material-community",
      title: "Стационарный отрезок",
      color: Colors.blue,
      backgroundColor: Colors.blue + "14",
    };
  }

  return {
    icon: "qr-code-outline",
    iconPack: "ionicons",
    title: "Офлайн-отрезок",
    color: Colors.greenColor,
    backgroundColor: Colors.greenColorLight,
  };
};

const PendingShiftCardComponent: React.FC<PendingShiftCardProps> = ({
  shift,
}) => {
  const segmentMeta = useMemo(
    () => getSegmentMeta(shift.segmentType),
    [shift.segmentType],
  );
  const timeRange = useMemo(
    () => formatTimeRange(shift.scannedAt, shift.endedAt),
    [shift.scannedAt, shift.endedAt],
  );
  const isClosed = Boolean(shift.endedAt);
  const shouldShowStatusBadge = !isClosed;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <View
            style={[
              styles.workplaceIcon,
              { backgroundColor: segmentMeta.backgroundColor },
            ]}
          >
            {segmentMeta.iconPack === "material-community" ? (
              <MaterialCommunityIcons
                name={segmentMeta.icon as any}
                size={21}
                color={segmentMeta.color}
              />
            ) : (
              <Ionicons
                name={segmentMeta.icon as any}
                size={19}
                color={segmentMeta.color}
              />
            )}
          </View>

          <View style={styles.titleContent}>
            <Text style={styles.workplaceName} numberOfLines={2}>
              {shift.workplaceName}
            </Text>
            <Text style={styles.subtitle}>{segmentMeta.title}</Text>
          </View>
        </View>

        {shouldShowStatusBadge && (
          <View style={styles.statusBadge}>
            <AppIcon
              name={EvaIcons.ClockOutline}
              size={14}
              fill={Colors.icon.warning}
            />
            <Text style={styles.statusText}>Открыт</Text>
          </View>
        )}
      </View>

      <View style={styles.details}>
        <View style={styles.detailPill}>
          <AppIcon
            name={EvaIcons.ClockOutline}
            size={14}
            fill={Colors.grey600}
          />
          <Text style={styles.detailText}>
            {timeRange}
          </Text>
        </View>
      </View>
    </View>
  );
};

export const PendingShiftCard = memo(PendingShiftCardComponent);

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    padding: 12,
    borderRadius: 14,
    marginBottom: 10,
    borderColor: Colors.grey300,
    borderWidth: 1,
    shadowColor: Colors.grey400,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
    marginBottom: 10,
  },
  titleRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  workplaceIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  titleContent: {
    flex: 1,
    gap: 2,
  },
  workplaceName: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "700",
    color: Colors.grey900,
  },
  subtitle: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "500",
    color: Colors.grey500,
  },
  statusBadge: {
    flexShrink: 0,
    minHeight: 26,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: Colors.icon.warning + "20",
  },
  statusText: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "700",
    color: Colors.icon.warning,
  },
  details: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  detailPill: {
    minHeight: 28,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: Colors.grey100,
  },
  detailText: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "600",
    color: Colors.grey700,
  },
});
