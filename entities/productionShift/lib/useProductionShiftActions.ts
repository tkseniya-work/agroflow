import { useSetAtom } from "jotai";

import {
  deleteOpenProductionShiftsByIdsAtom,
  updateOpenProductionShiftEndedAtAtom,
  updateOpenProductionShiftSyncStateAtom,
} from "../store";
import { productionShiftApi } from "../api/productionShift.api";
import { productionShiftActionsService } from "../api/productionShiftActions.service";

export const useProductionShiftActions = () => {
  const updateOpenShiftEndedAt = useSetAtom(
    updateOpenProductionShiftEndedAtAtom,
  );
  const updateOpenShiftSyncState = useSetAtom(
    updateOpenProductionShiftSyncStateAtom,
  );
  const deleteOpenShiftsByIds = useSetAtom(deleteOpenProductionShiftsByIdsAtom);

  return {
    closeInitialPart: productionShiftActionsService.closeInitialPart,
    closeProductionShift: productionShiftActionsService.closeShift,
    updateOpenShiftEndedAt,
    updateOpenShiftSyncState,
    loadProductionShifts: productionShiftApi.loadByEmployee,
    loadShiftSettings: productionShiftApi.loadSettings,
    openProductionShift: productionShiftActionsService.openShift,
    deleteOpenShiftsByIds,
    updateShiftPart: productionShiftActionsService.updatePart,
    updateShiftPartTariff: productionShiftActionsService.updatePartTariff,
    updateShiftTotalsV2: productionShiftActionsService.updateTotalsV2,
  };
};
