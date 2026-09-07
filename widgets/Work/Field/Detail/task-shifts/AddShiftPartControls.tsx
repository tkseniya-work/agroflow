import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, Text, TextInput, View } from "react-native";

import { styles } from "./AddShiftPartModal.styles";

export function SelectorRow({
  label,
  value,
  placeholder,
  icon,
  disabled,
  onPress,
}: {
  label: string;
  value?: string;
  placeholder: string;
  icon?: "sunny-outline" | "moon-outline";
  disabled?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={[styles.selector, disabled && styles.selectorDisabled]}
      onPress={onPress}
      disabled={disabled}
    >
      <View style={styles.selectorText}>
        <Text style={styles.inputLabel}>{label}</Text>
        <Text
          style={[styles.selectorValue, !value && styles.placeholder]}
          numberOfLines={1}
        >
          {value || placeholder}
        </Text>
      </View>
      {icon ? (
        <Ionicons
          name={icon}
          size={18}
          color={icon === "moon-outline" ? "#3538CD" : "#B54708"}
        />
      ) : (
        <Ionicons name="chevron-down" size={18} color="#667085" />
      )}
    </Pressable>
  );
}

export function InputField({
  label,
  suffix,
  ...props
}: React.ComponentProps<typeof TextInput> & {
  label: string;
  suffix?: string;
}) {
  return (
    <View>
      <Text style={styles.inputLabel}>{label}</Text>
      <View style={styles.inputBox}>
        <TextInput
          {...props}
          style={styles.input}
          placeholderTextColor="#98A2B3"
        />
        {!!suffix && <Text style={styles.suffix}>{suffix}</Text>}
      </View>
    </View>
  );
}
