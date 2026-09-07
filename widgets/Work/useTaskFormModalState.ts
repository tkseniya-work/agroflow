import { useCallback, useState } from "react";

import type { ProductionTask } from "../../entities/productionTask";

// Only the field task type survives in this trimmed sample; the original
// app also supported stationary/transport/transportation variants that
// followed the same shape.
export type TaskFormType = "field";

type TaskFormState = {
  type: TaskFormType;
  currentTask: ProductionTask | null;
};

const TASK_FORM_TYPE_BY_ID: Record<number, TaskFormType> = {
  1: "field",
};

export const getTaskFormType = (task: ProductionTask) =>
  TASK_FORM_TYPE_BY_ID[task?.task_type?.id] ?? null;

export const useTaskFormModalState = () => {
  const [state, setState] = useState<TaskFormState | null>(null);

  const openCreate = useCallback((type: TaskFormType) => {
    setState({ type, currentTask: null });
  }, []);

  const openEdit = useCallback((task: ProductionTask) => {
    const type = getTaskFormType(task);

    if (type) {
      setState({ type, currentTask: task });
    }
  }, []);

  const close = useCallback(() => {
    setState(null);
  }, []);

  return {
    activeType: state?.type ?? null,
    currentTask: state?.currentTask ?? null,
    openCreate,
    openEdit,
    close,
  };
};
