import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Colors from "../../../../shared/styles/Colors";

type TaskCardProps = {
  task: any;
  isActive?: boolean;
  onToggleTrack?: (task: any) => void;
};

type InfoItemProps = {
  label: string;
  value: string;
  strong?: boolean;
  icon: keyof typeof Ionicons.glyphMap;
};

const InfoItem: React.FC<InfoItemProps> = ({ label, value, strong, icon }) => {
  return (
    <View style={styles.infoItem}>
      <View style={styles.infoLabelRow}>
        <Ionicons name={icon} size={14} color="#7B8491" />
        <Text style={styles.infoLabel}>{label}</Text>
      </View>
      <Text
        style={[styles.infoValue, strong && styles.infoValueStrong]}
        numberOfLines={2}
      >
        {value}
      </Text>
    </View>
  );
};

const TaskCardComponent: React.FC<TaskCardProps> = ({
  task,
  isActive = false,
  onToggleTrack,
}) => {
  const [zonesExpanded, setZonesExpanded] = React.useState(false);

  const formatDate = (date?: string) => {
    if (!date) return "—";
    const d = new Date(date);
    if (Number.isNaN(d.getTime())) return "—";
    return d.toLocaleDateString("ru-RU");
  };

  const formatNumber = (value: any) => {
    if (value == null || value === "" || Number.isNaN(Number(value)))
      return "—";
    return Number(value).toLocaleString("ru-RU");
  };

  const progressValue = Number(task?.progress ?? 0);
  const progress = Number.isFinite(progressValue)
    ? Math.max(0, Math.min(progressValue, 100))
    : 0;

  const areaPlan = task?.area_plan != null ? formatNumber(task.area_plan) : "—";
  const areaFact = task?.area_fact != null ? formatNumber(task.area_fact) : "—";

  const areaSummary =
    task?.area_plan != null || task?.area_fact != null
      ? `${areaFact} / ${areaPlan} га`
      : "—";

  const costsPerHa =
    task?.costs_per_ha != null
      ? `${formatNumber(task.costs_per_ha)} ₽/га`
      : "—";

  const zones = Array.isArray(task?.zones)
    ? task.zones.filter((zone: any) => zone != null).map(String)
    : [];
  const zonesCount = zones.length;
  const hasHiddenZones = zonesCount > 3;
  const visibleZones = zonesExpanded ? zones : zones.slice(0, 3);
  const extraZones = hasHiddenZones ? zonesCount - 3 : 0;

  return (
    <View style={[styles.card, isActive && styles.cardActive]}>
      <View style={styles.header}>
        <View style={styles.titleBlock}>
          <Text style={styles.title} numberOfLines={2}>
            {task?.work_standard?.name || "Без названия"}
          </Text>

          <View style={styles.badgesRow}>
            <View style={styles.statusChip}>
              <Text style={styles.statusText} numberOfLines={1}>
                {task?.status?.description || "Без статуса"}
              </Text>
            </View>

            {zonesCount > 0 && (
              <View style={styles.metaChip}>
                <Text style={styles.metaChipText}>{zonesCount} зон</Text>
              </View>
            )}

            {isActive && (
              <View style={styles.activeChip}>
                <Text style={styles.activeChipText}>Трек активен</Text>
              </View>
            )}
          </View>
        </View>
      </View>

      <View style={styles.infoGrid}>
        <InfoItem
          icon="calendar-outline"
          label="Старт"
          value={formatDate(task?.date_start)}
        />
        <InfoItem
          icon="resize-outline"
          label="Факт / план"
          value={areaSummary}
          strong
        />
        <InfoItem icon="cash-outline" label="Затраты" value={costsPerHa} />
      </View>

      {visibleZones.length > 0 && (
        <View style={styles.zoneList}>
          {visibleZones.map((zone: string, index: number) => (
            <View key={`${zone}-${index}`} style={styles.zoneChip}>
              <Text style={styles.zoneChipText} numberOfLines={1}>
                {zone}
              </Text>
            </View>
          ))}

          {hasHiddenZones && (
            <Pressable
              onPress={() => setZonesExpanded((prev) => !prev)}
              style={({ pressed }) => [
                styles.zoneChipMore,
                pressed && styles.zoneChipMorePressed,
              ]}
            >
              <Text style={styles.zoneChipMoreText}>
                {zonesExpanded ? "Свернуть" : `+${extraZones}`}
              </Text>
            </Pressable>
          )}
        </View>
      )}

      <View style={styles.progressSection}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressLabel}>Прогресс</Text>
          <Text style={styles.progressValue}>{progress}%</Text>
        </View>

        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              { width: `${progress}%` },
              isActive && styles.progressFillActive,
            ]}
          />
        </View>
      </View>

      <View style={styles.footer}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={isActive ? "Скрыть трек задания" : "Показать трек задания"}
          onPress={() => onToggleTrack?.(task)}
          style={({ pressed }) => [
            styles.trackButton,
            isActive && styles.trackButtonActive,
            pressed && styles.trackButtonPressed,
          ]}
        >
          <Ionicons
            name={isActive ? "eye-off-outline" : "map-outline"}
            size={18}
            color={isActive ? Colors.greenColor : Colors.grey700}
          />
          <Text
            style={[
              styles.trackButtonText,
              isActive && styles.trackButtonTextActive,
            ]}
          >
            {isActive ? "Скрыть трек" : "Показать трек"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
};

export const TaskCard = React.memo(TaskCardComponent);

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E6EAF0",
    padding: 14,
    marginBottom: 12,
  },

  cardActive: {
    borderColor: Colors.greenColor,
    backgroundColor: "#F7FCF8",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },

  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },

  titleBlock: {
    flex: 1,
  },

  title: {
    fontSize: 15,
    lineHeight: 21,
    fontWeight: "700",
    color: "#111827",
  },

  badgesRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 8,
  },

  statusChip: {
    minHeight: 26,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: "#F3F5F7",
    justifyContent: "center",
  },

  statusText: {
    fontSize: 11,
    color: "#4B5563",
    fontWeight: "500",
  },

  metaChip: {
    minHeight: 26,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: "#F3F5F7",
    justifyContent: "center",
  },

  metaChipText: {
    fontSize: 11,
    color: "#4B5563",
    fontWeight: "500",
  },

  activeChip: {
    minHeight: 26,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: "#E8F6EC",
    justifyContent: "center",
  },

  activeChipText: {
    fontSize: 11,
    color: Colors.greenColor,
    fontWeight: "700",
  },

  infoGrid: {
    flexDirection: "row",
    gap: 6,
    marginTop: 14,
    padding: 5,
    borderRadius: 14,
    backgroundColor: "#F7F8FA",
  },

  infoItem: {
    flex: 1,
    minWidth: 0,
    borderRadius: 10,
    paddingHorizontal: 7,
    paddingVertical: 8,
  },

  infoLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 5,
  },

  infoLabel: {
    fontSize: 11,
    color: "#6B7280",
  },

  infoValue: {
    fontSize: 13,
    lineHeight: 17,
    color: "#111827",
    fontWeight: "500",
  },

  infoValueStrong: {
    fontWeight: "700",
  },

  zoneList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 12,
  },

  zoneChip: {
    maxWidth: "100%",
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 9,
    backgroundColor: "#F3F4F6",
  },

  zoneChipText: {
    fontSize: 11,
    color: "#374151",
  },

  zoneChipMore: {
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 9,
    backgroundColor: "#EEF7F0",
  },

  zoneChipMoreText: {
    fontSize: 11,
    color: Colors.greenColor,
    fontWeight: "700",
  },

  progressSection: {
    marginTop: 14,
  },

  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 7,
  },

  progressLabel: {
    fontSize: 12,
    color: "#6B7280",
  },

  progressValue: {
    fontSize: 12,
    color: "#111827",
    fontWeight: "700",
  },

  progressTrack: {
    height: 7,
    borderRadius: 999,
    backgroundColor: "#E5E7EB",
    overflow: "hidden",
  },

  progressFill: {
    height: "100%",
    borderRadius: 999,
    backgroundColor: Colors.greenColor,
  },

  progressFillActive: {
    backgroundColor: Colors.greenColor,
  },

  footer: {
    marginTop: 14,
    flexDirection: "row",
  },

  trackButton: {
    flex: 1,
    minHeight: 44,
    borderRadius: 12,
    paddingHorizontal: 14,
    flexDirection: "row",
    gap: 7,
    backgroundColor: "#F2F4F3",
    borderWidth: 1,
    borderColor: "#DDE2DF",
    alignItems: "center",
    justifyContent: "center",
  },

  trackButtonActive: {
    backgroundColor: Colors.white,
    borderColor: "#B8DEC4",
  },

  trackButtonPressed: {
    opacity: 0.86,
  },

  trackButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.grey800,
  },

  trackButtonTextActive: {
    color: Colors.greenColor,
  },

  zoneChipMorePressed: {
    opacity: 0.75,
  },
});
