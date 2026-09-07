import { router, useLocalSearchParams } from "expo-router";
import { StyleSheet, View } from "react-native";
import { TaskEditScreen } from "../../../widgets/Work/Field/Edit/TaskEdit";
import {
  TaskEditLoadError,
  TaskEditLoading,
} from "../../../widgets/Work/Field/Edit/TaskEditLoadState";
import { TaskDetailScreen } from "../../../widgets/Work/Field/Detail/TaskDetail";
import { TaskDetailHeader } from "../../../widgets/Work/Field/Detail/task-detail/TaskDetailHeader";
import { useFieldTaskEditData } from "../../../widgets/Work/Field/Edit/useFieldTaskEditData";
import { useReloadOnReturn } from "../../../shared/lib/useReloadOnReturn";

// This trimmed sample keeps only the "field" production task type. The
// original app also branched here for stationary/transport/transportation
// task detail screens, which followed the same detail/edit/shift pattern
// shown by the field flow below.
export default function TaskPage() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return <FieldTaskPage id={id} />;
}

export function FieldTaskPage({ id }: { id: string }) {
  const { currentTask, isLoading, error, reload } = useFieldTaskEditData(id, {
    includeDictionaries: false,
  });
  useReloadOnReturn(reload);

  if (isLoading && !currentTask) {
    return (
      <View style={styles.stateContainer}>
        <TaskDetailHeader
          isActiveTask={false}
          isArchivedTask={false}
          showActions={false}
          onBack={() => router.back()}
        />
        <TaskEditLoading
          bottomInset={0}
          accessibilityLabel="Загрузка страницы просмотра задания"
          title="Загружаем задание"
          description="Подготавливаем информацию, карту и смены"
        />
      </View>
    );
  }

  if (error || !currentTask) {
    return (
      <View style={styles.stateContainer}>
        <TaskDetailHeader
          isActiveTask={false}
          isArchivedTask={false}
          showActions={false}
          onBack={() => router.back()}
        />
        <TaskEditLoadError
          bottomInset={0}
          onBack={() => router.back()}
          onRetry={() => void reload()}
          retryLabel="Повторить"
          description="Проверьте подключение и попробуйте загрузить данные задания ещё раз."
        />
      </View>
    );
  }

  const taskFieldsCount = currentTask?.field_task?.task_fields?.length ?? 0;

  if (taskFieldsCount === 0) {
    return <TaskEditScreen id={id} />;
  }

  return <TaskDetailScreen currentTask={currentTask} onReload={reload} />;
}

const styles = StyleSheet.create({
  stateContainer: {
    flex: 1,
    backgroundColor: "#F6F8FA",
  },
});
