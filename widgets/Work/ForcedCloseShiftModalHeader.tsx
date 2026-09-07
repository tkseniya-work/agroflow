import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

import Colors from "../../shared/styles/Colors";
import { forcedCloseShiftModalStyles as styles } from "./ForcedCloseShiftModal.styles";
import type { ForcedCloseMode } from "./ForcedCloseShiftModal.types";

type Props = {
  mode: ForcedCloseMode;
  onClose: () => void;
};

export const ForcedCloseShiftModalHeader = ({ mode, onClose }: Props) => {
  const subtitle =
    mode === "online"
      ? "Перед сканированием нужно закрыть предыдущую онлайн-смену."
      : "Есть незавершенные офлайн-отрезки. Перед продолжением их нужно закрыть.";

  return (
    <View style={styles.header}>
      <TouchableOpacity
        accessibilityLabel="Закрыть окно завершения смены"
        accessibilityRole="button"
        activeOpacity={0.75}
        onPress={onClose}
        style={styles.closeButton}
      >
        <Ionicons name="close" size={22} color={Colors.grey500} />
      </TouchableOpacity>

      <View style={styles.titleRow}>
        <View style={styles.iconWrap}>
          <Ionicons
            name="time-outline"
            size={22}
            color={Colors.icon.warning}
          />
        </View>
        <View style={styles.titleWrap}>
          <Text style={styles.title}>Завершите смену</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>
      </View>
    </View>
  );
};
