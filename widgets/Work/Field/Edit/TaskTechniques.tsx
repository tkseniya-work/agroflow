import React from "react";

import { TaskTechniqueModal } from "./TaskTechniqueModal";
import { TaskTechniquesCard } from "./TaskTechniquesCard";
import type { TaskTechniquesProps } from "./TaskTechniques.types";
import { useTaskTechniquesScreen } from "./useTaskTechniquesScreen";

export const TaskTechniques = ({
  currentTask,
  taskType = "field",
  techniqueWithAdditionalInfo = [],
  isDataLoading = false,
  onAddTechnique,
  onDeleteTechnique,
  onMoveTechnique,
}: TaskTechniquesProps) => {
  const screen = useTaskTechniquesScreen({
    currentTask,
    taskType,
    techniqueWithAdditionalInfo,
    onAddTechnique,
    onDeleteTechnique,
    onMoveTechnique,
  });
  const { form } = screen;

  return (
    <>
      <TaskTechniquesCard
        techniques={screen.taskTechniques}
        deletingId={screen.deletingId}
        isDataLoading={isDataLoading}
        onAdd={form.open}
        onDelete={screen.confirmDelete}
      />

      <TaskTechniqueModal
        visible={form.isVisible}
        workName={currentTask?.work_standard?.name}
        transferWorkName={screen.transferWork?.name}
        isTransportationTask={form.isTransportationTask}
        isTransportLikeTask={form.isTransportLikeTask}
        requiresTransferTariff={form.requiresTransferTariff}
        selectedTechnique={form.selectedTechnique}
        selectedMachinery={form.selectedMachinery}
        selectedTariff={form.selectedTariff}
        selectedTransferTariff={form.selectedTransferTariff}
        workSpeed={form.workSpeed}
        processingDepth={form.processingDepth}
        soluteFlowRate={form.soluteFlowRate}
        techniqueOptions={screen.techniquePickerOptions}
        machineryOptions={screen.machineryPickerOptions}
        tariffOptions={screen.tariffPickerOptions}
        transferTariffOptions={screen.transferTariffPickerOptions}
        generateTariffTarget={form.generateTariffTarget}
        isSubmitting={form.isSubmitting}
        isGeneratingTariff={form.isGeneratingTariff}
        onClose={form.close}
        onSelectTechnique={form.selectTechnique}
        onSelectMachinery={form.selectMachinery}
        onSelectTariff={form.selectTariff}
        onSelectTransferTariff={form.selectTransferTariff}
        onChangeWorkSpeed={form.changeWorkSpeed}
        onChangeProcessingDepth={form.changeProcessingDepth}
        onChangeSoluteFlowRate={form.changeSoluteFlowRate}
        onOpenGenerateTariff={form.openGenerateTariff}
        onCloseGenerateTariff={form.closeGenerateTariff}
        onGenerateTariff={form.generateSelectedTariff}
        onSubmit={form.submit}
      />
    </>
  );
};
