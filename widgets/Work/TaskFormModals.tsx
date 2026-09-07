import React, { useCallback } from "react";

import type { ProductionTask } from "../../entities/productionTask";
import { FieldTaskFormModal } from "./Field/AddEditTask/AddEditFieldTask";
import type { TaskFormType } from "./useTaskFormModalState";

type TaskAction = (data: any) => Promise<boolean>;

type Props = {
  activeType: TaskFormType | null;
  currentTask: ProductionTask | null;
  isSubmitting: boolean;
  isActionLoading: boolean;
  onClose: () => void;
  onCreateFieldTask?: TaskAction;
  onUpdateAllProductionTask?: TaskAction;
};

export const TaskFormModals = ({
  activeType,
  currentTask,
  isSubmitting,
  onClose,
  onCreateFieldTask,
  onUpdateAllProductionTask,
}: Props) => {
  const submit = useCallback(
    async (
      data: any,
      createAction?: TaskAction,
      updateAction?: TaskAction,
    ) => {
      const action = currentTask ? updateAction : createAction;
      const success = Boolean(await action?.(data));

      if (success) {
        onClose();
      }
    },
    [currentTask, onClose],
  );

  return (
    <FieldTaskFormModal
      visible={activeType === "field"}
      currentTask={activeType === "field" ? currentTask : null}
      isSubmitting={isSubmitting}
      onClose={onClose}
      onSubmit={(data) =>
        submit(data, onCreateFieldTask, onUpdateAllProductionTask)
      }
    />
  );
};
