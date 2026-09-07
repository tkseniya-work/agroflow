import { Ionicons } from "@expo/vector-icons";
import { Text } from "@ui-kitten/components";
import React from "react";
import { ActivityIndicator, Pressable, View } from "react-native";

import Colors from "../../../../shared/styles/Colors";
import { taskSelectedFieldItemStyles as styles } from "./TaskSelectedFieldItem.styles";

type Props = {
  field: any;
  expanded: boolean;
  isUpdating: boolean;
  onToggle: () => void;
  onDelete: () => void;
};

export const TaskSelectedFieldSummary = ({
  field,
  expanded,
  isUpdating,
  onToggle,
  onDelete,
}: Props) => {
  const fieldName = field.name || "Без названия";

  return (
    <Pressable
      accessibilityLabel={`${expanded ? "Свернуть" : "Развернуть"} поле ${fieldName}`}
      accessibilityRole="button"
      accessibilityState={{ expanded }}
      onPress={onToggle}
      style={styles.fieldSummary}
    >
      <Ionicons
        name="location-outline"
        size={20}
        color={expanded ? Colors.greenColor : "#667085"}
      />

      <View style={styles.fieldTextWrap}>
        <Text style={styles.fieldName} numberOfLines={1}>
          {fieldName}
        </Text>
        <Text style={styles.fieldMeta}>
          {Number(field.area ?? 0).toLocaleString("ru-RU", {
            maximumFractionDigits: 2,
          })}{" "}
          га
        </Text>
      </View>

      <Pressable
        accessibilityLabel={`Удалить поле ${fieldName}`}
        accessibilityRole="button"
        onPress={onDelete}
        style={styles.iconButton}
        hitSlop={8}
        disabled={isUpdating}
      >
        {isUpdating ? (
          <ActivityIndicator size="small" color={Colors.error} />
        ) : (
          <Ionicons name="close" size={18} color="#667085" />
        )}
      </Pressable>

      <Ionicons
        name={expanded ? "chevron-up" : "chevron-down"}
        size={18}
        color="#667085"
      />
    </Pressable>
  );
};
