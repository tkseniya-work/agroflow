import React from "react";

import type { ProductionTask } from "../../../../entities/productionTask";
import { ProductionTaskFormModalBase } from "../../shared/ProductionTaskFormModalBase";

type Props = {
  visible: boolean;
  currentTask?: ProductionTask | null;
  onClose: () => void;
  onSubmit: (data: any) => void | Promise<void>;
  isSubmitting?: boolean;
};

export const FieldTaskFormModal = ({
  visible,
  currentTask,
  onClose,
  onSubmit,
  isSubmitting = false,
}: Props) => (
  <ProductionTaskFormModalBase
    visible={visible}
    currentTask={currentTask}
    subtitle="Полевое задание"
    requireWorkStandardOnCreate
    keepOpenOnFalse={false}
    onClose={onClose}
    onSubmit={onSubmit}
    isSubmitting={isSubmitting}
  />
);
