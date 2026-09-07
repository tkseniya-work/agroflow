import { useLocalSearchParams } from "expo-router";
import { TaskEditScreen } from "../../../../widgets/Work/Field/Edit/TaskEdit";

// This trimmed sample keeps only the "field" production task type — see
// app/production/tasks/[id].tsx for the same note on the detail screen.
export default function TaskEditPage() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return <TaskEditScreen id={id} />;
}
