import { useCallback, useRef, useState } from "react";

import type { OpenForcedCloseModal } from "./useForcedShiftCloseFlow";

type Params = {
  pendingShifts: any[];
  isSyncing: boolean;
  getExpiredPendingShifts: () => any[];
  getSyncablePendingShifts: () => any[];
  openForcedCloseModal: OpenForcedCloseModal;
  syncPendingShifts: () => Promise<any>;
  showError: (message: string) => void;
};

export type PromptSyncPendingShifts = (
  onSynced: () => void,
  countOverride?: number,
) => void;

export function usePendingShiftSyncFlow({
  pendingShifts,
  isSyncing,
  getExpiredPendingShifts,
  getSyncablePendingShifts,
  openForcedCloseModal,
  syncPendingShifts,
  showError,
}: Params) {
  const afterSyncRef = useRef<(() => void) | null>(null);
  const [visible, setVisible] = useState(false);
  const [count, setCount] = useState(0);

  const promptSyncPendingShifts: PromptSyncPendingShifts = useCallback(
    (onSynced: () => void, countOverride?: number) => {
      const syncCount = countOverride ?? getSyncablePendingShifts().length;

      if (!syncCount) {
        onSynced();
        return;
      }

      afterSyncRef.current = onSynced;
      setCount(syncCount);
      setVisible(true);
    },
    [getSyncablePendingShifts],
  );

  const closeModal = useCallback(() => {
    setVisible(false);
    setCount(0);
    afterSyncRef.current = null;
  }, []);

  const confirmSync = useCallback(async () => {
    try {
      const synced = await syncPendingShifts();

      if (!synced) {
        showError("Не удалось синхронизировать офлайн-отрезки");
        return;
      }

      setVisible(false);
      setCount(0);

      const onSynced = afterSyncRef.current;
      afterSyncRef.current = null;
      onSynced?.();
    } catch (error) {
      console.error("Error syncing pending shifts:", error);
      showError("Не удалось синхронизировать офлайн-отрезки");
    }
  }, [showError, syncPendingShifts]);

  const handlePendingSyncRequest = useCallback(
    (onSynced?: unknown) => {
      const expiredPendingShifts = getExpiredPendingShifts();
      const syncablePendingShifts = getSyncablePendingShifts();
      const continueAfterSync: () => void =
        typeof onSynced === "function"
          ? (onSynced as () => void)
          : () => undefined;

      if (expiredPendingShifts.length) {
        openForcedCloseModal(
          expiredPendingShifts,
          () => {
            promptSyncPendingShifts(
              continueAfterSync,
              pendingShifts.length || syncablePendingShifts.length,
            );
          },
          true,
        );
        return;
      }

      promptSyncPendingShifts(
        continueAfterSync,
        syncablePendingShifts.length,
      );
    },
    [
      getExpiredPendingShifts,
      getSyncablePendingShifts,
      openForcedCloseModal,
      pendingShifts.length,
      promptSyncPendingShifts,
    ],
  );

  return {
    promptSyncPendingShifts,
    handlePendingSyncRequest,
    modalProps: {
      visible,
      isSyncing,
      count,
      onClose: closeModal,
      onSync: confirmSync,
    },
  };
}
