import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Colors from "../../shared/styles/Colors";
import { MeasurementMode } from "../../src/types/map.types";

type MeasurementPanelProps = {
  mode: MeasurementMode;
  value: string | null;
  pointsCount: number;
  onChangeMode: (mode: MeasurementMode) => void;
  onUndo: () => void;
  onReset: () => void;
  onClose: () => void;
};

const MeasurementPanel: React.FC<MeasurementPanelProps> = ({
  mode,
  value,
  pointsCount,
  onChangeMode,
  onUndo,
  onReset,
  onClose,
}) => {
  const insets = useSafeAreaInsets();
  const isArea = mode === "area";

  return (
    <View style={[styles.container, { top: insets.top + 6 }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Измерение</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Закрыть измерение"
          hitSlop={8}
          onPress={onClose}
          style={({ pressed }) => [styles.closeButton, pressed && styles.pressed]}
        >
          <MaterialCommunityIcons name="close" size={22} color={Colors.grey600} />
        </Pressable>
      </View>

      <View style={styles.tabs}>
        {(["area", "distance"] as MeasurementMode[]).map((item) => {
          const active = mode === item;

          return (
            <Pressable
              key={item}
              accessibilityRole="tab"
              accessibilityState={{ selected: active }}
              onPress={() => onChangeMode(item)}
              style={({ pressed }) => [
                styles.tab,
                active && styles.tabActive,
                pressed && styles.pressed,
              ]}
            >
              <Text style={[styles.tabText, active && styles.tabTextActive]}>
                {item === "area" ? "Площадь" : "Линейка"}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Text style={styles.hint}>
        Касание добавляет точку. Точки можно перетаскивать.
      </Text>

      <Text style={styles.valueRow}>
        {isArea ? "Площадь: " : "Длина: "}
        <Text style={styles.valueStrong}>{value ?? "—"}</Text>
      </Text>
      <Text style={styles.valueRow}>
        Точек: <Text style={styles.valueStrong}>{pointsCount}</Text>
      </Text>

      <View style={styles.actions}>
        <Pressable
          accessibilityRole="button"
          disabled={pointsCount === 0}
          onPress={onUndo}
          style={({ pressed }) => [
            styles.undoButton,
            pointsCount === 0 && styles.disabled,
            pressed && styles.pressed,
          ]}
        >
          <MaterialCommunityIcons name="undo" size={17} color={Colors.grey700} />
          <Text style={styles.undoText}>Отменить</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          disabled={pointsCount === 0}
          onPress={onReset}
          style={({ pressed }) => [
            styles.resetButton,
            pointsCount === 0 && styles.disabled,
            pressed && styles.pressed,
          ]}
        >
          <Text style={styles.resetText}>Сбросить</Text>
        </Pressable>
      </View>
    </View>
  );
};

export default React.memo(MeasurementPanel);

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 12,
    width: 250,
    maxWidth: "90%",
    zIndex: 1000,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.96)",
    shadowColor: "#000",
    shadowOpacity: 0.16,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
    elevation: 6,
  },
  header: {
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: { color: Colors.grey900, fontSize: 14, fontWeight: "700" },
  closeButton: {
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  tabs: { marginBottom: 8, flexDirection: "row", gap: 6 },
  tab: {
    flex: 1,
    minHeight: 34,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    backgroundColor: "#F0F0F0",
  },
  tabActive: { backgroundColor: "#1976D2" },
  tabText: { color: Colors.grey800, fontSize: 13, fontWeight: "600" },
  tabTextActive: { color: Colors.white },
  hint: {
    marginBottom: 8,
    color: Colors.grey600,
    fontSize: 12,
    lineHeight: 17,
  },
  valueRow: { marginBottom: 6, color: Colors.grey800, fontSize: 14 },
  valueStrong: { color: Colors.grey900, fontWeight: "700" },
  actions: { marginTop: 6, flexDirection: "row", gap: 8 },
  undoButton: {
    flex: 1,
    minHeight: 38,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    borderRadius: 8,
    backgroundColor: Colors.grey100,
  },
  undoText: { color: Colors.grey700, fontSize: 12, fontWeight: "600" },
  resetButton: {
    flex: 1,
    minHeight: 38,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    backgroundColor: "#FF6B00",
  },
  resetText: { color: Colors.white, fontSize: 14, fontWeight: "600" },
  disabled: { opacity: 0.45 },
  pressed: { opacity: 0.75 },
});
