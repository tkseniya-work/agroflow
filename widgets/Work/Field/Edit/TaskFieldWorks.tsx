import { Ionicons } from "@expo/vector-icons";
import { Text } from "@ui-kitten/components";
import React from "react";
import { Pressable, View } from "react-native";

import Colors from "../../../../shared/styles/Colors";
import { taskSelectedFieldItemStyles as styles } from "./TaskSelectedFieldItem.styles";
import {
  getTaskFieldWorkDateLabel,
  getTaskFieldWorkState,
} from "./taskFieldWorks.logic";
import { useTaskFieldWorkSelection } from "./useTaskFieldWorkSelection";

type Props = {
  currentTask: any;
  field: any;
  selectedWorkId: string | null;
  isUpdating: boolean;
  onToggleWork: (field: any, work: any) => void;
};

export function TaskFieldWorks({
  currentTask,
  field,
  selectedWorkId,
  isUpdating,
  onToggleWork,
}: Props) {
  const {
    handleWorkChange,
    locallyReleasedWorkIds,
    selectedWorkIdValue,
    serverSelectedWorkId,
    works,
  } = useTaskFieldWorkSelection({
    currentTask,
    field,
    selectedWorkId,
    onToggleWork,
  });

  if (works.length === 0) {
    return (
      <View style={styles.emptyWorksBox}>
        <Text style={styles.emptyWorksText}>Нет плановых работ</Text>
      </View>
    );
  }

  return (
    <View style={styles.worksList}>
      {works.map((work: any) => {
        const { workId, isSelected, isUsedByAnotherTask, isDisabled } =
          getTaskFieldWorkState({
            work,
            selectedWorkId: selectedWorkIdValue,
            locallyReleasedWorkIds,
            serverSelectedWorkId,
          });
        const workName = work.work_standard?.name || "Без названия";
        const dateLabel = getTaskFieldWorkDateLabel(work);
        const isInteractionDisabled = isDisabled || isUpdating;

        return (
          <Pressable
            key={workId}
            accessibilityLabel={`Плановая работа ${workName}`}
            accessibilityRole="checkbox"
            accessibilityState={{
              checked: isSelected,
              disabled: isInteractionDisabled,
            }}
            disabled={isInteractionDisabled}
            onPress={() => handleWorkChange(work)}
            style={[
              styles.workRow,
              isSelected && styles.workRowSelected,
              isUsedByAnotherTask && styles.workRowDisabled,
              isUpdating && styles.workRowUpdating,
            ]}
          >
            <View
              style={[
                styles.checkbox,
                (isSelected || isUsedByAnotherTask) && styles.checkboxChecked,
                isUsedByAnotherTask && styles.checkboxUsed,
              ]}
            >
              {(isSelected || isUsedByAnotherTask) && (
                <Ionicons name="checkmark" size={15} color={Colors.white} />
              )}
            </View>

            <View style={styles.workTextWrap}>
              <Text style={styles.workName} numberOfLines={1}>
                {workName}
              </Text>
              <Text style={styles.workMeta} numberOfLines={1}>
                {dateLabel}
                {work.comment ? ` · ${work.comment}` : ""}
              </Text>
            </View>

            {isSelected && (
              <View style={styles.selectedBadge}>
                <Text style={styles.selectedBadgeText}>Выбрано</Text>
              </View>
            )}
            {isUsedByAnotherTask && (
              <View style={styles.usedBadge}>
                <Text style={styles.usedBadgeText}>Использовано</Text>
              </View>
            )}
          </Pressable>
        );
      })}
    </View>
  );
}
