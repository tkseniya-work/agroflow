import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, Text, TextInput, View } from "react-native";

import { modalStyles } from "./ShiftPartEditModal.styles";

type SelectorRowProps = {
  label: string;
  value?: string;
  placeholder: string;
  onPress: () => void;
};

export function SelectorRow({
  label,
  value,
  placeholder,
  onPress,
}: SelectorRowProps) {
  return (
    <Pressable style={modalStyles.selector} onPress={onPress}>
      <View style={modalStyles.selectorText}>
        <Text style={modalStyles.inputLabel}>{label}</Text>
        <Text
          style={[modalStyles.selectorValue, !value && modalStyles.placeholder]}
          numberOfLines={1}
        >
          {value || placeholder}
        </Text>
      </View>
      <Ionicons name="chevron-down" size={18} color="#667085" />
    </Pressable>
  );
}

type InputFieldProps = React.ComponentProps<typeof TextInput> & {
  label: string;
  suffix?: string;
  error?: string | null;
};

export function InputField({
  label,
  suffix,
  error,
  ...props
}: InputFieldProps) {
  return (
    <View style={modalStyles.inputWrap}>
      <Text style={modalStyles.inputLabel}>{label}</Text>
      <View
        style={[modalStyles.inputBox, error && modalStyles.inputBoxError]}
      >
        <TextInput
          {...props}
          accessibilityHint={error ?? props.accessibilityHint}
          style={modalStyles.input}
          placeholderTextColor="#98A2B3"
        />
        {!!suffix && <Text style={modalStyles.inputSuffix}>{suffix}</Text>}
      </View>
      {!!error && <Text style={modalStyles.inputErrorText}>{error}</Text>}
    </View>
  );
}
