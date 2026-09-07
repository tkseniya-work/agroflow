import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

type MapTooltipProps = {
  pin?: {
    label?: string;
    coordinates: [number, number];
    type?: string;
  } | null;
};

const MapTooltip: React.FC<MapTooltipProps> = ({ pin }) => {
  if (!pin) return null;

  const [lng, lat] = pin.coordinates;
  const isDrain = pin.type === "drain";

  return (
    <View style={styles.container} pointerEvents="none">
      <View style={styles.card}>
        <View style={styles.topRow}>
          <View style={styles.iconWrap}>
            <MaterialCommunityIcons
              name={
                isDrain
                  ? "water"
                  : pin.type === "technique"
                    ? "tractor-variant"
                    : "map-marker"
              }
              size={16}
              color="#1F2937"
            />
          </View>

          <View style={styles.textWrap}>
            <Text numberOfLines={2} style={styles.title}>
              {pin.label || "Без названия"}
            </Text>

            <Text numberOfLines={1} style={styles.subtitle}>
              {isDrain
                ? "Точка слива"
                : pin.type === "technique"
                  ? "Техника"
                  : "Точка на карте"}
            </Text>
          </View>
        </View>

        {isDrain && (
          <View style={styles.metaBlock}>
            <Text style={styles.metaLabel}>Координаты</Text>
            <Text style={styles.metaValue}>
              {lat.toFixed(6)}, {lng.toFixed(6)}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.pointerShadow} />
      <View style={styles.pointer} />
    </View>
  );
};

export default React.memo(MapTooltip);

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    maxWidth: 260,
  },

  card: {
    minWidth: 190,
    maxWidth: 260,
    backgroundColor: "rgba(255,255,255,0.96)",
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,

    shadowColor: "#000",
    shadowOpacity: 0.16,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,

    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(0,0,0,0.08)",
  },

  topRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  textWrap: {
    flex: 1,
  },

  title: {
    fontSize: 15,
    lineHeight: 18,
    fontWeight: "700",
    color: "#111827",
  },

  subtitle: {
    marginTop: 2,
    fontSize: 12,
    lineHeight: 15,
    color: "#6B7280",
    fontWeight: "500",
  },

  metaBlock: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(0,0,0,0.08)",
  },

  metaLabel: {
    fontSize: 11,
    lineHeight: 14,
    color: "#9CA3AF",
    fontWeight: "600",
    marginBottom: 2,
    textTransform: "uppercase",
  },

  metaValue: {
    fontSize: 12,
    lineHeight: 16,
    color: "#374151",
    fontWeight: "500",
  },

  pointerShadow: {
    position: "absolute",
    bottom: -8,
    width: 16,
    height: 16,
    backgroundColor: "rgba(0,0,0,0.06)",
    transform: [{ rotate: "45deg" }],
    borderRadius: 4,
  },

  pointer: {
    marginTop: -7,
    width: 14,
    height: 14,
    backgroundColor: "rgba(255,255,255,0.96)",
    transform: [{ rotate: "45deg" }],
    borderRightWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(0,0,0,0.08)",
    borderBottomRightRadius: 4,
  },
});
