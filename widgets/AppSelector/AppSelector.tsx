import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import Colors from "../../shared/styles/Colors";

type AppSelectorProps = {
  label: string;
  value?: string | number | null;
  placeholder: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: "default" | "danger";
  badgeText?: string | null;
};

export const AppSelector: React.FC<AppSelectorProps> = ({
  label,
  value,
  placeholder,
  onPress,
  disabled = false,
  variant = "default",
  badgeText,
}) => {
  const danger = variant === "danger";

  return (
    <TouchableOpacity
      style={[
        styles.selector,
        danger && styles.selectorDanger,
        disabled && styles.selectorDisabled,
      ]}
      onPress={onPress}
      activeOpacity={0.85}
      disabled={disabled}
    >
      <View style={styles.selectorLeft}>
        <Text style={styles.selectorLabel}>{label}</Text>
        <Text
          style={[
            styles.selectorValue,
            danger && value && styles.selectorValueDanger,
            !value && styles.selectorPlaceholder,
          ]}
          numberOfLines={1}
        >
          {value || placeholder}
        </Text>
      </View>

      <View style={styles.selectorRight}>
        {!!badgeText && (
          <View style={[styles.badge, danger && styles.badgeDanger]}>
            <Text style={[styles.badgeText, danger && styles.badgeTextDanger]}>
              {badgeText}
            </Text>
          </View>
        )}

        <MaterialIcons
          name="keyboard-arrow-down"
          size={22}
          color={danger ? Colors.error : Colors.grey700}
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
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#ECECEC",
  },
  selectorDanger: {
    backgroundColor: "#FEF3F2",
    borderColor: "#FECDCA",
  },
  selectorLeft: {
    flex: 1,
    minWidth: 0,
    paddingRight: 8,
  },
  selectorRight: {
    flexShrink: 0,
    flexDirection: "row",
    alignItems: "center",
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
  selectorValueDanger: {
    color: "#B42318",
  },
  selectorPlaceholder: {
    color: Colors.grey500,
    fontWeight: "500",
  },
  badge: {
    borderRadius: 12,
    backgroundColor: "#F2F4F7",
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 8,
  },
  badgeDanger: {
    backgroundColor: "#FEE4E2",
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: Colors.grey700,
  },
  badgeTextDanger: {
    color: "#B42318",
  },
  inputBox: {
    borderRadius: 12,
    backgroundColor: "#F7F8FA",
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#ECECEC",
  },
  selectorDisabled: {
    opacity: 0.6,
    backgroundColor: "#F1F1F1",
  },
});
