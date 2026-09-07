import React from "react";
import { TouchableOpacity, StyleSheet, View, Text } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Colors from "../../shared/styles/Colors";

type MapFloatingControlsProps = {
  onPressCompany: () => void;
  onPressMyLocation: () => void;
  onToggleLabels: () => void;
  onToggleMeasurement: () => void;
  showTechniqueLabels: boolean;
  isMeasurementActive: boolean;
};

export const MapFloatingControls: React.FC<MapFloatingControlsProps> = ({
  onPressCompany,
  onPressMyLocation,
  onToggleLabels,
  onToggleMeasurement,
  showTechniqueLabels,
  isMeasurementActive,
}) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { top: insets.top + 6 }]}>
      <View style={styles.group}>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Перейти к расположению организации"
          activeOpacity={0.85}
          onPress={onPressCompany}
          style={styles.button}
        >
          <MaterialCommunityIcons
            name="office-building-marker-outline"
            size={18}
            color={Colors.grey700}
          />
        </TouchableOpacity>

        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Показать моё местоположение"
          activeOpacity={0.85}
          onPress={onPressMyLocation}
          style={styles.button}
        >
          <MaterialCommunityIcons
            name="crosshairs-gps"
            size={18}
            color={Colors.grey700}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.group}>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Измерить площадь или расстояние"
          activeOpacity={0.85}
          onPress={onToggleMeasurement}
          style={[
            styles.button,
            isMeasurementActive && styles.measurementButtonActive,
          ]}
        >
          <MaterialCommunityIcons
            name="ruler-square-compass"
            size={20}
            color={isMeasurementActive ? "#fff" : Colors.grey700}
          />
        </TouchableOpacity>

        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel={
            showTechniqueLabels
              ? "Скрыть подписи техники"
              : "Показать подписи техники"
          }
          accessibilityState={{ selected: showTechniqueLabels }}
          activeOpacity={0.85}
          onPress={onToggleLabels}
          style={[styles.button, showTechniqueLabels && styles.buttonActive]}
        >
          <Text
            style={[styles.aaText, showTechniqueLabels && styles.aaTextActive]}
          >
            Aa
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    right: 16,
    zIndex: 1000,
    gap: 14,
  },
  group: {
    gap: 6,
  },
  button: {
    minWidth: 44,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.96)",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  buttonActive: {
    backgroundColor: Colors.greenColor,
    borderColor: Colors.greenColor,
  },
  measurementButtonActive: {
    backgroundColor: "#FF6B00",
    borderColor: "#FF6B00",
  },
  aaText: {
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: -0.4,
    color: Colors.grey700,
  },
  aaTextActive: { color: "#fff" },
});
