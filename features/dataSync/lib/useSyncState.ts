import { useCallback, useState } from "react";
import { SyncState, SyncStatus } from "../model/dataSync.types";

export const useSyncState = (): SyncState & {
  startSync: () => void;
  completeSync: (success?: boolean) => void;
  updateProgress: (current: number, total: number) => void;
  setSyncError: (err: unknown, context: string) => void;
  resetState: () => void;
} => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);
  const [lastSyncDate, setLastSyncDate] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>("idle");

  const resetState = useCallback(() => {
    setError(null);
    setSyncProgress(0);
  }, []);

  const startSync = useCallback(() => {
    setIsSyncing(true);
    setSyncStatus("syncing");
    resetState();
  }, [resetState]);

  const completeSync = useCallback((success: boolean = true) => {
    setIsSyncing(false);
    setSyncStatus(success ? "success" : "error");
    if (success) {
      setLastSyncDate(new Date());
      setSyncProgress(100);
    }
  }, []);

  const updateProgress = useCallback((current: number, total: number) => {
    setSyncProgress(Math.round((current / total) * 100));
  }, []);

  const setSyncError = useCallback((err: unknown, context: string) => {
    const errorMessage = err instanceof Error ? err.message : `Unknown error in ${context}`;
    setError(errorMessage);
    setSyncStatus("error");
    console.error(`Error in ${context}:`, err);
  }, []);

  return {
    isSyncing,
    syncProgress,
    lastSyncDate,
    error,
    syncStatus,
    startSync,
    completeSync,
    updateProgress,
    setSyncError,
    resetState,
  };
};