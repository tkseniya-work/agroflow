import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Text } from "@ui-kitten/components";
import React from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import type { ProductionTaskConsumableType } from "../../../../entities/productionTask";
import Colors from "../../../../shared/styles/Colors";
import { getConsumableRowMeta } from "./TaskConsumables.logic";

const iconMeta = {
  seed: {
    color: Colors.greenColor,
    backgroundColor: "#ECFDF3",
  },
  pesticide: {
    color: "#7A5AF8",
    backgroundColor: "#F4F3FF",
  },
  fertilizer: {
    color: "#D97706",
    backgroundColor: "#FFFAEB",
  },
} as const;

type Props = {
  type: ProductionTaskConsumableType;
  item: any;
  editable: boolean;
  isDeleting: boolean;
  onEdit: () => void;
  onDelete: () => void;
};

export function TaskConsumableRow({
  type,
  item,
  editable,
  isDeleting,
  onEdit,
  onDelete,
}: Props) {
  const { name, value, unit } = getConsumableRowMeta(item, type);
  const meta = iconMeta[type];

  return (
    <View style={styles.row}>
      <View
        style={[styles.icon, { backgroundColor: meta.backgroundColor }]}
      >
        {type === "seed" ? (
          <MaterialCommunityIcons
            name="seed-outline"
            size={18}
            color={meta.color}
          />
        ) : (
          <Ionicons
            name={type === "pesticide" ? "bug-outline" : "sparkles-outline"}
            size={18}
            color={meta.color}
          />
        )}
      </View>

      <View style={styles.textWrap}>
        <Text style={styles.name} numberOfLines={1}>
          {name}
        </Text>
        <Text style={styles.meta}>
          {value} {unit}
        </Text>
      </View>

      {editable && (
        <View style={styles.actions}>
          <Pressable
            accessibilityLabel={`Редактировать расходник ${name}`}
            style={styles.actionButton}
            onPress={onEdit}
            disabled={isDeleting}
          >
            <Ionicons name="create-outline" size={18} color="#667085" />
          </Pressable>

          <Pressable
            accessibilityLabel={`Удалить расходник ${name}`}
            style={styles.actionButton}
            onPress={onDelete}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <ActivityIndicator size="small" color={Colors.error} />
            ) : (
              <Ionicons name="close" size={18} color="#667085" />
            )}
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: 58,
    borderRadius: 16,
    backgroundColor: "#F9FAFB",
    padding: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  icon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  textWrap: {
    flex: 1,
    minWidth: 0,
  },
  name: {
    fontSize: 14,
    fontWeight: "800",
    color: "#101828",
  },
  meta: {
    marginTop: 2,
    fontSize: 12,
    color: "#667085",
  },
  actions: {
    flexDirection: "row",
    gap: 6,
  },
  actionButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: Colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
});
