import React from "react";

import { TaskConsumablesCard } from "./TaskConsumablesCard";
import { TaskConsumablesModals } from "./TaskConsumablesModals";
import type { TaskConsumablesProps } from "./TaskConsumables.types";
import { useTaskConsumablesScreen } from "./useTaskConsumablesScreen";

export const TaskConsumables = ({
  currentTask,
  cropStandardsList,
  fertilizerStandardsList,
  pesticideStandardsList,
  sowingUnitCodeList,
  isDataLoading = false,
  onSaveNorm,
  onDeleteNorm,
}: TaskConsumablesProps) => {
  const screen = useTaskConsumablesScreen({
    currentTask,
    cropStandardsList,
    fertilizerStandardsList,
    pesticideStandardsList,
    sowingUnitCodeList,
    onSaveNorm,
    onDeleteNorm,
  });

  if (!screen.fields.length) return null;

  return (
    <>
      <TaskConsumablesCard
        selectedField={screen.selectedField}
        activeTab={screen.activeTab}
        items={screen.visibleItems}
        deletingId={screen.deletingId}
        isDataLoading={isDataLoading}
        onTabChange={screen.setActiveTab}
        onOpenFieldPicker={screen.openFieldPicker}
        onAdd={screen.form.openEdit}
        onEdit={screen.form.openEdit}
        onDelete={screen.confirmDelete}
      />

      <TaskConsumablesModals
        isFieldPickerVisible={screen.isFieldPickerVisible}
        selectedField={screen.selectedField}
        fieldOptions={screen.fieldOptions}
        sourceOptions={screen.sourceOptions}
        unitOptions={screen.unitOptions}
        form={screen.form}
        onCloseFieldPicker={screen.closeFieldPicker}
        onSelectField={screen.selectField}
      />
    </>
  );
};
