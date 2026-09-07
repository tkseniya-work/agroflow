import React from "react";

import { FieldProductionTaskResponse } from "../../../../entities/productionTask";
import {
  TaskInfoCardLayout,
  TaskInfoComment,
  TaskInfoErrorCard,
  TaskInfoGrid,
  TaskInfoItem,
  TaskInfoLoadingCard,
  TaskInfoPeople,
  TaskInfoProgress,
} from "../../shared/TaskInfoCardPrimitives";
import {
  formatTaskInfoDate,
  formatTaskInfoNumber,
} from "../../shared/TaskInfoCard.logic";

type Props = {
  currentTask: FieldProductionTaskResponse | null;
  error?: unknown;
  isLoading?: boolean;
};

export const TaskInfoCard = ({
  currentTask,
  error,
  isLoading,
}: Props) => {
  if (isLoading) return <TaskInfoLoadingCard />;
  if (error) return <TaskInfoErrorCard />;
  if (!currentTask) return null;

  const taskFields = currentTask.field_task?.task_fields ?? [];
  const techniques = currentTask.field_task?.techniques ?? [];
  const totalArea = taskFields.reduce(
    (sum, field) => sum + (field?.area ?? 0),
    0,
  );
  const progress = Number((currentTask as any)?.progress ?? 0);

  return (
    <TaskInfoCardLayout
      icon="clipboard-outline"
      title={currentTask.work_standard?.name ?? "Производственное задание"}
      subtitle={currentTask.task_type?.description ?? "Полевое задание"}
      statusId={currentTask.status?.id}
      statusLabel={currentTask.status?.description}
    >
      <TaskInfoGrid>
        <TaskInfoItem
          icon="calendar-outline"
          label="Дата начала"
          value={formatTaskInfoDate(currentTask.date_start)}
        />
        <TaskInfoItem
          icon="leaf-outline"
          label="Сезон"
          value={String(currentTask.season_year ?? "Не указан")}
        />
        <TaskInfoItem
          icon="map-outline"
          label="Поля"
          value={`${taskFields.length} / ${formatTaskInfoNumber(totalArea, " га")}`}
        />
        <TaskInfoItem
          icon="construct-outline"
          label="Техника"
          value={String(techniques.length)}
        />
      </TaskInfoGrid>

      <TaskInfoProgress progress={progress} />
      <TaskInfoPeople
        authorName={currentTask.created_by?.fullname}
        editorName={currentTask.last_modified_by?.fullname}
      />
      <TaskInfoComment comment={currentTask.comment} />
    </TaskInfoCardLayout>
  );
};
