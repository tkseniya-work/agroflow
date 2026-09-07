export type WorkUserRole = "admin" | "erp-admin" | "checkman" | string | null;

export const canRoleManageTasks = (role: WorkUserRole) =>
  role === "admin" || role === "erp-admin" || role === "checkman";

export const getWorkSectionState = (
  canManageTasks: boolean,
  activeSection: number,
) => ({
  isTasksSection: canManageTasks && activeSection === 0,
  isShiftsSection: !canManageTasks || activeSection === 1,
});

export const getShiftLoadingStatus = (
  loadingPhase: "idle" | "dictionaries" | "shifts" | "offline-sync",
) => {
  if (loadingPhase === "offline-sync") {
    return "Синхронизируем офлайн-смены…";
  }

  return null;
};

type GroupedPendingShifts = {
  keys?: string[];
  grouped?: Record<string, any[]>;
} | null;

export const flattenPendingShifts = (pendingShifts: GroupedPendingShifts) => {
  if (!pendingShifts?.grouped || !pendingShifts.keys?.length) return [];

  return pendingShifts.keys.flatMap(
    (groupKey) => pendingShifts.grouped?.[groupKey] || [],
  );
};

export type ScannerLaunchAction =
  | "open_scanner"
  | "close_expired_offline_then_open"
  | "close_expired_then_sync"
  | "sync_then_check_online"
  | "check_online";

type ScannerLaunchParams = {
  isConnected: boolean;
  forcedOffline: boolean;
  expiredPendingCount: number;
  syncablePendingCount: number;
};

export const getScannerLaunchAction = ({
  isConnected,
  forcedOffline,
  expiredPendingCount,
  syncablePendingCount,
}: ScannerLaunchParams): ScannerLaunchAction => {
  if (forcedOffline || !isConnected) {
    return expiredPendingCount > 0
      ? "close_expired_offline_then_open"
      : "open_scanner";
  }

  if (expiredPendingCount > 0) return "close_expired_then_sync";
  if (syncablePendingCount > 0) return "sync_then_check_online";

  return "check_online";
};
