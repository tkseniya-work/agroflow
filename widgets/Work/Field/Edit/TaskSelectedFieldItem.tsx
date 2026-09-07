import React, { memo } from "react";
import { View } from "react-native";

import { TaskFieldWorks } from "./TaskFieldWorks";
import { taskSelectedFieldItemStyles as styles } from "./TaskSelectedFieldItem.styles";
import { TaskSelectedFieldSummary } from "./TaskSelectedFieldSummary";

export { TaskFieldWorks };

type Props = {
  currentTask: any;
  field: any;
  expanded: boolean;
  selectedWorkId: string | null;
  isUpdating: boolean;
  onToggle: () => void;
  onDelete: () => void;
  onToggleWork: (field: any, work: any) => void;
};

export const TaskSelectedFieldItem = memo(function TaskSelectedFieldItem({
  currentTask,
  field,
  expanded,
  selectedWorkId,
  isUpdating,
  onToggle,
  onDelete,
  onToggleWork,
}: Props) {
  return (
    <View style={[styles.fieldCard, expanded && styles.fieldCardExpanded]}>
      <TaskSelectedFieldSummary
        field={field}
        expanded={expanded}
        isUpdating={isUpdating}
        onToggle={onToggle}
        onDelete={onDelete}
      />

      {expanded && (
        <TaskFieldWorks
          currentTask={currentTask}
          field={field}
          selectedWorkId={selectedWorkId}
          isUpdating={isUpdating}
          onToggleWork={onToggleWork}
        />
      )}
    </View>
  );
});
