import { useCallback, useMemo } from "react";

import { processedShiftRepository } from "../../../entities/productionShift/repo/productionShift.repository";
import { processShiftData } from "../../../src/utils/shiftDataUtils";
import {
  getExpiredOnlineShiftGroups,
  getUniqueShifts,
} from "../../../src/utils/workShiftUtils";
import type { OpenForcedCloseModal } from "./useForcedShiftCloseFlow";
import type { PromptSyncPendingShifts } from "./usePendingShiftSyncFlow";
import { getScannerLaunchAction } from "./workPageLogic";

type ExpiredShiftGroup = {
  shifts: any[];
  title: string;
};

type Params = {
  isConnected: boolean;
  forcedOffline: boolean;
  employeeId?: string | number | null;
  pendingShiftsCount: number;
  productionShifts: any[];
  currentShifts: any;
  shiftSettings: any;
  techniqueStandard: any[];
  agriculturalMachinery: any[];
  unitOfMeasure: any[];
  productionWorkPlaces: any[];
  workStandard: any[];
  reloadLocalData: () => Promise<any>;
  getValidAccessToken: () => Promise<string>;
  loadProductionShifts: (request: any) => Promise<any>;
  getExpiredPendingShifts: () => any[];
  getSyncablePendingShifts: () => any[];
  openForcedCloseModal: OpenForcedCloseModal;
  promptSyncPendingShifts: PromptSyncPendingShifts;
  openScanner: () => void;
};

export function useScannerLaunchFlow({
  isConnected,
  forcedOffline,
  employeeId,
  pendingShiftsCount,
  productionShifts,
  currentShifts,
  shiftSettings,
  techniqueStandard,
  agriculturalMachinery,
  unitOfMeasure,
  productionWorkPlaces,
  workStandard,
  reloadLocalData,
  getValidAccessToken,
  loadProductionShifts,
  getExpiredPendingShifts,
  getSyncablePendingShifts,
  openForcedCloseModal,
  promptSyncPendingShifts,
  openScanner,
}: Params) {
  const cachedExpiredOnlineGroups = useMemo(() => {
    if (!isConnected) return [];

    const sourceShifts = getUniqueShifts([
      ...(productionShifts || []),
      ...(currentShifts?.data || []),
    ]);

    return getExpiredOnlineShiftGroups({
      sourceShifts,
      current: currentShifts,
      shiftSettings,
    });
  }, [currentShifts, isConnected, productionShifts, shiftSettings]);

  const promptCloseExpiredOnlineShift = useCallback(
    (
      candidate: ExpiredShiftGroup,
      restCandidates: ExpiredShiftGroup[] = [],
    ) => {
      const shifts = candidate?.shifts || [];

      if (!shifts.length) {
        const nextCandidate = restCandidates[0];

        if (nextCandidate) {
          promptCloseExpiredOnlineShift(nextCandidate, restCandidates.slice(1));
        }
        return;
      }

      openForcedCloseModal(
        shifts,
        () => {
          const nextCandidate = restCandidates[0];

          if (nextCandidate) {
            setTimeout(() => {
              promptCloseExpiredOnlineShift(
                nextCandidate,
                restCandidates.slice(1),
              );
            }, 250);
          }
        },
        true,
        true,
        "online",
      );
    },
    [openForcedCloseModal],
  );

  const getActualExpiredOnlineShiftGroups = useCallback(async () => {
    try {
      await reloadLocalData();

      const cachedShifts = await processedShiftRepository.findAll();
      const token = await getValidAccessToken();
      const endDate = new Date();
      endDate.setHours(23, 59, 59, 999);

      const startDate = new Date(endDate);
      startDate.setDate(startDate.getDate() - 90);
      startDate.setHours(0, 0, 0, 0);

      const serverData = employeeId
        ? await loadProductionShifts({
            accessToken: token,
            userId: employeeId,
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
          })
        : null;
      const serverShifts = processShiftData(
        serverData || { shifts: [] },
        techniqueStandard,
        agriculturalMachinery,
        unitOfMeasure,
        productionWorkPlaces,
        workStandard,
      );
      const sourceShifts = getUniqueShifts([
        ...serverShifts,
        ...cachedShifts,
        ...(productionShifts || []),
        ...(currentShifts?.data || []),
      ]);

      return getExpiredOnlineShiftGroups({
        sourceShifts,
        current: currentShifts,
        shiftSettings,
      });
    } catch (error) {
      console.error("Error checking expired online shifts:", error);
      return cachedExpiredOnlineGroups;
    }
  }, [
    agriculturalMachinery,
    cachedExpiredOnlineGroups,
    currentShifts,
    employeeId,
    getValidAccessToken,
    loadProductionShifts,
    productionShifts,
    productionWorkPlaces,
    reloadLocalData,
    shiftSettings,
    techniqueStandard,
    unitOfMeasure,
    workStandard,
  ]);

  const runOnlineShiftChecks = useCallback(async () => {
    const expiredGroups = await getActualExpiredOnlineShiftGroups();

    if (expiredGroups.length) {
      promptCloseExpiredOnlineShift(expiredGroups[0], expiredGroups.slice(1));
      return;
    }

    openScanner();
  }, [
    getActualExpiredOnlineShiftGroups,
    openScanner,
    promptCloseExpiredOnlineShift,
  ]);

  return useCallback(async () => {
    const expiredPendingShifts = getExpiredPendingShifts();
    const syncablePendingShifts = getSyncablePendingShifts();
    const action = getScannerLaunchAction({
      isConnected,
      forcedOffline,
      expiredPendingCount: expiredPendingShifts.length,
      syncablePendingCount: syncablePendingShifts.length,
    });

    if (action === "close_expired_offline_then_open") {
      openForcedCloseModal(expiredPendingShifts, openScanner, true, true);
      return;
    }

    if (action === "open_scanner") {
      openScanner();
      return;
    }

    if (action === "close_expired_then_sync") {
      openForcedCloseModal(
        expiredPendingShifts,
        () => {
          promptSyncPendingShifts(
            runOnlineShiftChecks,
            pendingShiftsCount || syncablePendingShifts.length,
          );
        },
        true,
        true,
      );
      return;
    }

    if (action === "sync_then_check_online") {
      promptSyncPendingShifts(
        runOnlineShiftChecks,
        syncablePendingShifts.length,
      );
      return;
    }

    await runOnlineShiftChecks();
  }, [
    forcedOffline,
    getExpiredPendingShifts,
    getSyncablePendingShifts,
    isConnected,
    openForcedCloseModal,
    openScanner,
    pendingShiftsCount,
    promptSyncPendingShifts,
    runOnlineShiftChecks,
  ]);
}
