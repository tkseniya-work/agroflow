import React from "react";

import type { FieldProductionTaskResponse } from "../../../../../entities/productionTask";
import type { ShiftPartDetails } from "../../../../../src/types/task.types";
import { AddShiftPartModal } from "./AddShiftPartModal";
import type { TaskShiftAddMode } from "./useTaskShiftModalState";
import { ShiftPartDetailsModal } from "./ShiftPartDetailsModal";
import { ShiftPartEditModal } from "./ShiftPartEditModal";

type Props = {
  currentTask: FieldProductionTaskResponse | any;
  selectedDetails: ShiftPartDetails | null;
  selectedEditDetails: ShiftPartDetails | null;
  editAccessToken: string | null;
  addMode: TaskShiftAddMode | null;
  addAccessToken: string | null;
  employees: any[];
  tracks: any[];
  isTrackLoading: boolean;
  onCloseDetails: () => void;
  onCloseEdit: () => void;
  onCloseAdd: () => void;
  onSaved: () => Promise<void> | void;
  AddShiftModalComponent?: typeof AddShiftPartModal;
};

export const TaskShiftsModals = ({
  currentTask,
  selectedDetails,
  selectedEditDetails,
  editAccessToken,
  addMode,
  addAccessToken,
  employees,
  tracks,
  isTrackLoading,
  onCloseDetails,
  onCloseEdit,
  onCloseAdd,
  onSaved,
  AddShiftModalComponent = AddShiftPartModal,
}: Props) => (
  <>
    <ShiftPartDetailsModal
      details={selectedDetails}
      tracks={tracks}
      isTrackLoading={isTrackLoading}
      onClose={onCloseDetails}
    />

    <ShiftPartEditModal
      visible={Boolean(selectedEditDetails)}
      currentTask={currentTask}
      details={selectedEditDetails}
      accessToken={editAccessToken}
      onClose={onCloseEdit}
      onSaved={onSaved}
    />

    <AddShiftModalComponent
      visible={Boolean(addMode)}
      mode={addMode ?? "online"}
      currentTask={currentTask}
      accessToken={addAccessToken}
      employees={employees}
      onClose={onCloseAdd}
      onSaved={onSaved}
    />
  </>
);
