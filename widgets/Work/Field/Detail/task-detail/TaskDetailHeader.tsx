import { Ionicons } from "@expo/vector-icons";
import { Text } from "@ui-kitten/components";
import React, { memo } from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  StatusBar,
  View,
} from "react-native";

import Colors from "../../../../../shared/styles/Colors";

type Props = {
  title?: string;
  isActiveTask: boolean;
  isArchivedTask: boolean;
  isUpdating?: boolean;
  showActions?: boolean;
  onBack: () => void;
  onEdit?: () => void;
  onComplete?: () => void;
  onResume?: () => void;
};

export const TaskDetailHeader = memo(function TaskDetailHeader({
  title = "Просмотр задания",
  isActiveTask,
  isArchivedTask,
  isUpdating = false,
  showActions = true,
  onBack,
  onEdit,
  onComplete,
  onResume,
}: Props) {
  return (
    <View style={styles.header}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Назад"
        onPress={onBack}
        style={styles.backButton}
      >
        <Ionicons name="chevron-back" size={21} color={Colors.black} />
      </Pressable>

      <Text style={styles.title}>{title}</Text>

      {showActions && (
        <View style={styles.actionsGroup}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Редактировать задание"
            onPress={onEdit}
            style={styles.actionButton}
          >
            <Ionicons name="create-outline" size={18} color={Colors.greenColor} />
          </Pressable>

          {isUpdating ? (
            <View style={styles.actionButton}>
              <ActivityIndicator size="small" color={Colors.greenColor} />
            </View>
          ) : isActiveTask ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Завершить задание"
              onPress={onComplete}
              style={styles.actionButton}
            >
              <Ionicons
                name="checkmark-outline"
                size={18}
                color={Colors.success}
              />
            </Pressable>
          ) : isArchivedTask ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Возобновить задание"
              onPress={onResume}
              style={styles.actionButton}
            >
              <Ionicons
                name="refresh-outline"
                size={18}
                color={Colors.greenColor}
              />
            </Pressable>
          ) : null}
        </View>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  header: {
    paddingTop:
      Platform.OS === "android" ? (StatusBar.currentHeight ?? 24) + 12 : 62,
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: Colors.white,
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    flex: 1,
    marginLeft: 12,
    fontSize: 18,
    fontWeight: "800",
    color: "#101828",
  },
  actionsGroup: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F9FB",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#EAECF0",
    padding: 2,
  },
  actionButton: {
    width: 34,
    height: 34,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
});
