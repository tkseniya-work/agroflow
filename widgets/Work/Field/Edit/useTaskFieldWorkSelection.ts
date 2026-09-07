import { useCallback, useEffect, useMemo, useState } from "react";

import {
  getTaskFieldId,
  getTaskFieldWorkId,
  isTaskFieldWorkUsed,
  normalizeTaskFieldWorks,
} from "./taskFieldWorks.logic";

type Params = {
  currentTask: any;
  field: any;
  selectedWorkId: string | null;
  onToggleWork: (field: any, work: any) => void;
};

export const useTaskFieldWorkSelection = ({
  currentTask,
  field,
  selectedWorkId,
  onToggleWork,
}: Params) => {
  const [optimisticSelectedWorkId, setOptimisticSelectedWorkId] = useState<
    string | null | undefined
  >(undefined);
  const [locallyReleasedWorkIds, setLocallyReleasedWorkIds] = useState<
    string[]
  >([]);
  const works = useMemo(
    () => normalizeTaskFieldWorks(field.works),
    [field.works],
  );
  const taskFields = useMemo(
    () => currentTask?.field_task?.task_fields ?? [],
    [currentTask?.field_task?.task_fields],
  );
  const taskField = useMemo(
    () =>
      taskFields.find(
        (item: any) => getTaskFieldId(item) === getTaskFieldId(field),
      ),
    [field, taskFields],
  );
  const serverSelectedWorkId = taskField?.plan_work?.id
    ? String(taskField.plan_work.id)
    : null;
  const parentSelectedWorkId = selectedWorkId ?? serverSelectedWorkId;
  const selectedWorkIdValue =
    optimisticSelectedWorkId === undefined
      ? parentSelectedWorkId
      : optimisticSelectedWorkId;

  useEffect(() => {
    setOptimisticSelectedWorkId(undefined);
  }, [parentSelectedWorkId]);

  useEffect(() => {
    if (!works.length) return;

    setLocallyReleasedWorkIds((previous) => {
      const next = previous.filter((workId) => {
        const work = works.find(
          (item: any) => getTaskFieldWorkId(item) === workId,
        );

        return isTaskFieldWorkUsed(work);
      });

      return next.length === previous.length ? previous : next;
    });
  }, [works]);

  const handleWorkChange = useCallback(
    (work: any) => {
      const workId = getTaskFieldWorkId(work);
      const isAlreadySelected = selectedWorkIdValue === workId;
      const nextSelectedWorkId = isAlreadySelected ? null : workId;

      if (serverSelectedWorkId && serverSelectedWorkId !== nextSelectedWorkId) {
        setLocallyReleasedWorkIds((previous) =>
          previous.includes(serverSelectedWorkId)
            ? previous
            : [...previous, serverSelectedWorkId],
        );
      }

      setOptimisticSelectedWorkId(nextSelectedWorkId);
      onToggleWork(field, work);
    },
    [field, onToggleWork, selectedWorkIdValue, serverSelectedWorkId],
  );

  return {
    handleWorkChange,
    locallyReleasedWorkIds,
    selectedWorkIdValue,
    serverSelectedWorkId,
    works,
  };
};
