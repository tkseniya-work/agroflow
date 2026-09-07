import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { SeasonRequest } from "../../../../entities/season";
import Colors from "../../../../shared/styles/Colors";
import { MaterialIcons } from "@expo/vector-icons";

interface SeasonSelectorProps {
  selectedSeason: SeasonRequest | null;
  onPress: () => void;
}

export const SeasonSelector: React.FC<SeasonSelectorProps> = ({
  selectedSeason,
  onPress,
}) => {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityLabel={`Выбрать сезон. Текущий: ${
        selectedSeason?.year || "не выбран"
      }`}
    >
      <View style={styles.left}>
        <Text style={styles.label}>Сезон</Text>
        <Text style={styles.value} numberOfLines={1}>
          {selectedSeason?.year || "Выбрать сезон"}
        </Text>
      </View>

      <MaterialIcons
        name="keyboard-arrow-down"
        size={22}
        color={Colors.grey700}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    minHeight: 52,
    borderRadius: 12,
    backgroundColor: "#F7F8FA",
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#ECECEC",
  },
  left: {
    flex: 1,
    paddingRight: 8,
  },
  label: {
    fontSize: 11,
    color: Colors.grey500,
    marginBottom: 2,
  },
  value: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.grey800,
  },
});
