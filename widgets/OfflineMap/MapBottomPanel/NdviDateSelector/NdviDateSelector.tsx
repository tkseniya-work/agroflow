import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import Colors from "../../../../shared/styles/Colors";

interface NdviDateSelectorProps {
  selectedDate: string | null;
  onPress: () => void;
  onSelectImageDate: (date: string | null) => void;
}

const formatDisplayDate = (dateString?: string) => {
  if (!dateString) return "Выбрать дату";

  try {
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return dateString;

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    return `${day}.${month}.${year}`;
  } catch {
    return dateString;
  }
};

export const NdviDateSelector: React.FC<NdviDateSelectorProps> = ({
  selectedDate,
  onPress,
  onSelectImageDate,
}) => {
  const hasValue = !!selectedDate;

  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel={
        selectedDate
          ? `Изменить дату снимка, выбрано ${formatDisplayDate(selectedDate)}`
          : "Выбрать дату снимка"
      }
      style={styles.selector}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <View style={styles.selectorLeft}>
        <Text style={styles.selectorLabel}>Дата снимка</Text>
        <Text style={styles.selectorValue}>
          {formatDisplayDate(selectedDate || undefined)}
        </Text>
      </View>

      <View style={styles.actions}>
        {hasValue && (
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Сбросить дату снимка"
            onPress={(e) => {
              e.stopPropagation();
              onSelectImageDate(null);
            }}
            style={styles.clearButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <MaterialIcons name="close" size={16} color={Colors.grey500} />
          </TouchableOpacity>
        )}

        <MaterialIcons
          name="keyboard-arrow-down"
          size={22}
          color={Colors.grey700}
        />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  selector: {
    minHeight: 52,
    borderRadius: 12,
    backgroundColor: "#F7F8FA",
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#ECECEC",
  },
  selectorLeft: {
    flex: 1,
    paddingRight: 8,
  },
  selectorLabel: {
    fontSize: 11,
    color: Colors.grey500,
    marginBottom: 2,
  },
  selectorValue: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.grey800,
  },

  actions: {
    flexDirection: "row",
    alignItems: "center",
  },

  clearButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#EEF2F7",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 4,
  },
});
