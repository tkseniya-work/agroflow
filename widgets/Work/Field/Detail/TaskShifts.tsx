import React from "react";

import type { FieldProductionTaskResponse } from "../../../../entities/productionTask";
import { useAuth } from "../../../../entities/auth/lib/useAuth";
import { AddShiftPartModal } from "./task-shifts/AddShiftPartModal";
import { TaskShiftsCard } from "./task-shifts/TaskShiftsCard";
import { TaskShiftsModals } from "./task-shifts/TaskShiftsModals";
import {
  type LoadShiftSettings,
  type LoadTaskGroupedParts,
  useTaskShiftsController,
} from "./task-shifts/useTaskShiftsController";
import { useTaskShiftModalState } from "./task-shifts/useTaskShiftModalState";

type Props = {
  currentTask: FieldProductionTaskResponse | any;
  loadGroupedParts?: LoadTaskGroupedParts;
  loadShiftSettings?: LoadShiftSettings;
  onChanged?: () => Promise<void> | void;
  AddShiftModalComponent?: typeof AddShiftPartModal;
  showDateRangeSwitch?: boolean;
};

export const TaskShifts = ({
  currentTask,
  loadGroupedParts,
  loadShiftSettings,
  onChanged,
  AddShiftModalComponent = AddShiftPartModal,
  showDateRangeSwitch = true,
}: Props) => {
  const { getValidAccessToken } = useAuth();
  const modals = useTaskShiftModalState({ getValidAccessToken });
  const controller = useTaskShiftsController({
    currentTask,
    getValidAccessToken,
    selectedDetails: modals.selectedDetails,
    loadGroupedParts,
    loadShiftSettings,
    onChanged,
  });

  return (
    <>
      <TaskShiftsCard
        taskId={currentTask.id}
        groups={controller.groupedParts}
        employees={controller.employeesList}
        shiftSettings={controller.shiftSettings}
        isLoading={controller.isLoading}
        deletingPartId={controller.deletingPartId}
        showDateRangeSwitch={showDateRangeSwitch}
        addMenuOpen={modals.addMenuOpen}
        onToggleAddMenu={modals.toggleAddMenu}
        onOpenOnlineAdd={modals.openOnlineAdd}
        onOpenFactAdd={modals.openFactAdd}
        onOpenDetails={modals.setSelectedDetails}
        onEditPart={modals.openEdit}
        onDeletePart={controller.deletePart}
      />

      <TaskShiftsModals
        currentTask={currentTask}
        selectedDetails={modals.selectedDetails}
        selectedEditDetails={modals.selectedEditDetails}
        editAccessToken={modals.editAccessToken}
        addMode={modals.addMode}
        addAccessToken={modals.addAccessToken}
        employees={controller.employeesList}
        tracks={controller.productionTracks}
        isTrackLoading={controller.isTrackLoading}
        onCloseDetails={modals.closeDetails}
        onCloseEdit={modals.closeEdit}
        onCloseAdd={modals.closeAdd}
        onSaved={controller.refresh}
        AddShiftModalComponent={AddShiftModalComponent}
      />
    </>
  );
};
