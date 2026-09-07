import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

import { forcedCloseShiftModalStyles as styles } from "./ForcedCloseShiftModal.styles";

type Props = {
  isClosing: boolean;
  onConfirm: () => void;
};

export const ForcedCloseShiftModalActions = ({
  isClosing,
  onConfirm,
}: Props) => {
  const buttonLabel = isClosing ? "Закрываем..." : "Завершить смену";

  return (
    <View style={styles.actions}>
      <TouchableOpacity
        accessibilityLabel={buttonLabel}
        accessibilityRole="button"
        activeOpacity={0.8}
        disabled={isClosing}
        onPress={onConfirm}
        style={[styles.button, isClosing && styles.buttonDisabled]}
      >
        <Text style={styles.buttonText}>{buttonLabel}</Text>
      </TouchableOpacity>
    </View>
  );
};
