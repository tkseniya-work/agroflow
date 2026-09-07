import { CalendarRange } from "@ui-kitten/components";
import { isAxiosError } from "axios";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Alert, InteractionManager } from "react-native";

import { useDatabaseBootstrap } from "../../../shared/store/databaseBootstrap";
import {
  useEmployeeInfo,
  useLocalDictionaries,
  useOfflineShiftQueue,
  useProductionShiftData,
} from "../../../features/localData/useLocalData";
import {
  ShiftData,
  WorkType,
  type CloseProductionShiftRequest,
  type OpenProductionShiftRequest,
  type ProductionShiftResponseDto,
} from "../../../entities/productionShift";
import { useProductionShiftActions } from "../../../entities/productionShift/lib/useProductionShiftActions";
import { useProductionShiftUpdate } from "../../../entities/productionShift/lib/useProductionShiftUpdate";

import { useSyncOperations } from "../../../features/dataSync/lib/useSyncOperations";
import { useAlerts } from "../../../shared/lib/useAlerts";
import { useNetworkStatus } from "../../../shared/lib/useNetworkStatus";
import { useAuth } from "../../../entities/auth/lib/useAuth";

import {
  createStopShiftRequest,
  prepareShiftsForLocalSave,
  resolveScannedPlaceForSync,
} from "../../../src/utils/workUtils";

import {
  enrichStoredShiftReferences,
  getSortedGroupKeys,
  groupShiftsByTypeAndDate,
  minutesToTimeOptimized,
  processShiftData,
} from "../../../src/utils/shiftDataUtils";

import { getPrecedingPartCloseAt } from "./offlineShiftSync.logic";
import { ProcessedShiftData } from "../../../src/types/work.types";
import { useDataSyncService } from "../../../features/dataSync";

const getPendingShiftType = (shiftType: number | string | null | undefined) => {
  const id = Number(shiftType) === 2 ? 2 : 1;

  return {
    id,
    description: id === 1 ? "Первая смена" : "Вторая смена",
  };
};

const formatLocalDateKey = (dateString: string | null | undefined) => {
  if (!dateString) return "";

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) return "";

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const createPendingShiftData = (shift: any): ShiftData & {
  id: string;
  scannedAt: string;
  endedAt: string;
  workplaceName: string;
  segmentType: string | null;
  status: "pending";
  isPending: true;
} => {
  const scannedAt = shift.scanned_at || "";
  const endedAt = shift.ended_at || "";
  const workplaceName = shift.workplace_name || "Не указано";

  return {
    id: shift.id,
    key: `pending_${shift.id || shift.code || scannedAt}`,
    workType: WorkType.None,
    productionShiftId: shift.id || "",
    shiftType: getPendingShiftType(shift.shift_type),
    workPlaceName: workplaceName,
    workplaceName,
    workName: "Ожидает синхронизации",
    agriculturalMachineryName: "",
    taskFieldName: "",
    date: formatLocalDateKey(scannedAt),
    openAt: scannedAt,
    closeAt: "",
    startAt: scannedAt,
    endAt: endedAt,
    iconLink: "",
    tariffValue: "0",
    baseTariffPrice: "0",
    tariffPrice: "0",
    tariffUnit: "",
    unit: "",
    unitCode: "",
    tariffPriceUnit: "",
    outputValueArea: "0",
    time: 0,
    longStops: 0,
    smallStops: 0,
    timeString: minutesToTimeOptimized(0),
    longStopsString: minutesToTimeOptimized(0),
    smallStopsString: minutesToTimeOptimized(0),
    factArea: "0",
    overtimeBonus: "0",
    experienceBonus: "0",
    maxSpeed: "0",
    avgSpeed: "0",
    partIds: "",
    partInitial: false,
    taskFieldId: "",
    tariffId: "",
    workPlaceId: "",
    agriculturalMachineryId: "",
    techniqueStandardId: "",
    isArchived: false,
    scannedAt,
    endedAt,
    segmentType: shift.segment_type || null,
    status: "pending",
    isPending: true,
  };
};

const getOfflineShiftGroupKey = (shift: any) => {
  if (shift?.offline_group_key) return shift.offline_group_key;

  return [
    "legacy",
    shift?.employee_id || "employee",
    shift?.shift_type || "shift",
    formatLocalDateKey(shift?.scanned_at),
  ].join("_");
};

const groupOfflineSegments = (segments: any[]) => {
  const groups = new Map<string, any[]>();

  segments.forEach((segment) => {
    const key = getOfflineShiftGroupKey(segment);
    const current = groups.get(key) || [];

    current.push(segment);
    groups.set(key, current);
  });

  return Array.from(groups.values()).map((group) =>
    [...group].sort(
      (a, b) =>
        new Date(a?.scanned_at || 0).getTime() -
        new Date(b?.scanned_at || 0).getTime(),
    ),
  );
};

type ProductionShiftLoadResponse = Partial<ProductionShiftResponseDto> | null;
export type ShiftLoadingPhase =
  | "idle"
  | "dictionaries"
  | "shifts"
  | "offline-sync";

const getLoadedShifts = (response: ProductionShiftLoadResponse) =>
  Array.isArray(response?.shifts) ? response.shifts : [];

const isShiftConnectionError = (error: unknown) => {
  if (isAxiosError(error)) {
    return !error.response;
  }

  const message = error instanceof Error ? error.message.toLowerCase() : "";

  return (
    message.includes("network") ||
    message.includes("internet") ||
    message.includes("timeout") ||
    message.includes("timed out")
  );
};

const getSyncResponseCandidates = (response?: any): any[] => {
  if (!response) return [];

  if (Array.isArray(response)) {
    return response.filter((item) => item && typeof item === "object");
  }

  if (typeof response !== "object") return [];

  const nestedKeys = [
    "data",
    "result",
    "item",
    "productionShift",
    "production_shift",
    "shift",
    "shifts",
    "items",
  ];
  const candidates = [response];

  nestedKeys.forEach((key) => {
    const value = response?.[key];

    if (Array.isArray(value)) {
      candidates.push(
        ...value.filter((item) => item && typeof item === "object"),
      );
      return;
    }

    if (value && typeof value === "object") {
      candidates.push(value);
    }
  });

  return candidates;
};

const getLastItem = (items?: any[]) => {
  if (!Array.isArray(items) || items.length === 0) return null;

  return items[items.length - 1];
};

const getServerShiftId = (segment: any, response?: any) => {
  const candidates = getSyncResponseCandidates(response);
  const candidate = candidates.find((item) => {
    return (
      item?.id ||
      item?.production_shift?.id ||
      item?.productionShift?.id ||
      item?.production_shift_id ||
      item?.productionShiftId ||
      item?.shift_id ||
      item?.shiftId
    );
  });

  return (
    segment?.server_shift_id ||
    candidate?.id ||
    candidate?.production_shift?.id ||
    candidate?.productionShift?.id ||
    candidate?.production_shift_id ||
    candidate?.productionShiftId ||
    candidate?.shift_id ||
    candidate?.shiftId ||
    null
  );
};

const getServerPartId = (response?: any) => {
  const candidates = getSyncResponseCandidates(response);
  const candidate = candidates.find((item) => {
    const lastPart = getLastItem(item?.parts);

    return (
      lastPart?.id ||
      item?.production_shift_part_id ||
      item?.productionShiftPartId ||
      item?.part_id ||
      item?.partId ||
      item?.part?.id
    );
  });
  const lastPart = getLastItem(candidate?.parts);

  return (
    lastPart?.id ||
    candidate?.production_shift_part_id ||
    candidate?.productionShiftPartId ||
    candidate?.part_id ||
    candidate?.partId ||
    candidate?.part?.id ||
    null
  );
};

const getRawShiftTypeId = (shift: any) => {
  return Number(
    shift?.shift_type?.id ??
      shift?.shiftType?.id ??
      shift?.shift_type ??
      shift?.shiftType ??
      1,
  );
};

const getRawShiftParts = (shift: any) => {
  return Array.isArray(shift?.parts) ? shift.parts : [];
};

type ShiftPartMatch = {
  part: any;
  distance: number;
};

type ServerShiftMatch = {
  shift: any;
  matchingPart: ShiftPartMatch;
};

const findServerShiftByOfflineSegment = (shifts: any[], segment: any) => {
  const scannedAt = new Date(segment?.scanned_at || 0).getTime();

  if (!Number.isFinite(scannedAt)) return null;

  const candidates: ServerShiftMatch[] = (shifts || [])
    .map((shift) => {
      const parts = getRawShiftParts(shift);
      const matchingPart = parts
        .map((part: any) => {
          const startAt = new Date(
            part?.start_at ?? part?.startAt ?? 0,
          ).getTime();

          return {
            part,
            distance: Math.abs(startAt - scannedAt),
          };
        })
        .filter(
          (match: ShiftPartMatch) => Number.isFinite(match.distance),
        )
        .sort(
          (a: ShiftPartMatch, b: ShiftPartMatch) =>
            a.distance - b.distance,
        )[0];

      return { shift, matchingPart };
    })
    .filter((match): match is ServerShiftMatch => {
      const { shift, matchingPart } = match;

      return (
        String(shift?.employee_id ?? shift?.employeeId ?? segment?.employee_id) ===
          String(segment?.employee_id) &&
        getRawShiftTypeId(shift) === Number(segment?.shift_type) &&
        matchingPart &&
        matchingPart.distance <= 5 * 60 * 1000
      );
    })
    .sort((a, b) => a.matchingPart.distance - b.matchingPart.distance);

  return candidates[0] || null;
};

const getGroupCloseAt = (segments: any[]) => {
  const endedTimes = segments
    .map((segment) => new Date(segment?.ended_at || 0))
    .filter((date) => Number.isFinite(date.getTime()))
    .sort((a, b) => b.getTime() - a.getTime());

  return endedTimes[0]?.toISOString() || null;
};

const canCloseOfflinePartDirectly = (segment: any) => {
  const segmentType = String(segment?.segment_type || "").toLowerCase();

  return segmentType !== "mobile";
};

const formatOfflineSyncLocalTime = (value?: string | Date | null) => {
  if (!value) return null;

  const date = value instanceof Date ? value : new Date(value);

  if (!Number.isFinite(date.getTime())) return null;

  return date.toLocaleString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
};

const logOfflineSync = (message: string, payload?: Record<string, any>) => {
  if (!__DEV__) return;

  console.log(`[offline-sync] ${message}`, payload || "");
};

const EMPTY_SHIFT_COLLECTION: ProcessedShiftData = {
  data: [],
  grouped: {},
  keys: [],
};

export const useWorkData = (
  range: CalendarRange<Date>,
  isPageFocused = true,
) => {
  const { isConnected } = useNetworkStatus();
  const { getValidAccessToken } = useAuth();

  const { clearOperations, syncOperations, push } = useSyncOperations();

  const { showError, showSuccess } = useAlerts();

  const {
    findLatestShift,
    closeInitialPartShift,
    closeInitialPartShiftByPart,
  } = useProductionShiftUpdate();

  const { smartSyncAllDictionaries } = useDataSyncService();

  const {
    closeProductionShift: closeProductionShiftRequest,
    deleteOpenShiftsByIds,
    loadProductionShifts: productionShiftLoader,
    updateOpenShiftEndedAt,
    updateOpenShiftSyncState,
  } = useProductionShiftActions();

  const { reloadLocalData } = useDatabaseBootstrap();
  const employeeInfo = useEmployeeInfo();
  const productionShift = useProductionShiftData();
  const { openProductionShift, closeProductionShift } = useOfflineShiftQueue();
  const {
    techniqueStandard,
    agriculturalMachinery,
    unitOfMeasure,
    productionWorkPlaces,
    tariffsList,
    workStandard,
  } = useLocalDictionaries();

  const [currentShifts, setCurrentShifts] = useState<any[]>([]);
  const [archiveShifts, setArchiveShifts] = useState<any[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [loadingPhase, setLoadingPhase] =
    useState<ShiftLoadingPhase>("idle");

  const syncInProgress = useRef(false);
  const pendingOpenProductionShift = useMemo(
    () => (Array.isArray(openProductionShift) ? openProductionShift : []),
    [openProductionShift],
  );

  const hiddenShiftKeysRef = useRef<Set<string>>(new Set());
  const closeShiftKeysRef = useRef<Set<string>>(new Set());
  const lastShiftLoadKeyRef = useRef("");

  const lastCurrentProcessedRef = useRef<any[]>([]);
  const lastArchiveProcessedRef = useRef<any[]>([]);

  const cachedLists = useMemo(
    () => ({
      techniqueStandard,
      agriculturalMachinery,
      unitOfMeasure,
      productionWorkPlaces,
      tariffsList,
      workStandard,
    }),
    [
      techniqueStandard,
      agriculturalMachinery,
      unitOfMeasure,
      productionWorkPlaces,
      tariffsList,
      workStandard,
    ],
  );

  const dictionariesRevision = useMemo(
    () =>
      [
        cachedLists.techniqueStandard.length,
        cachedLists.agriculturalMachinery.length,
        cachedLists.unitOfMeasure.length,
        cachedLists.productionWorkPlaces.length,
        cachedLists.workStandard.length,
        cachedLists.tariffsList.length,
      ].join("_"),
    [cachedLists],
  );

  const fetchAccessToken = useCallback(() => {
    return getValidAccessToken();
  }, [getValidAccessToken]);

  const getShiftCloseAt = (shift: any) => {
    return shift?.closeAt ?? shift?.closed_at ?? shift?.close_at ?? null;
  };

  const isCurrentShift = useCallback((shift: any) => {
    const closeAt = getShiftCloseAt(shift);
    return closeAt === null || closeAt === undefined || closeAt === "";
  }, []);

  const isArchiveShift = useCallback((shift: any) => {
    const closeAt = getShiftCloseAt(shift);
    return closeAt !== null && closeAt !== undefined && closeAt !== "";
  }, []);

  const getShiftKeys = useCallback((shift: any) => {
    return [
      shift?.key,
      shift?.production_shift_id,
      shift?.productionShiftId,
      shift?.shift_id,
      shift?.shiftId,
      shift?.id,
      ...(shift?.partIds || []),
      ...(shift?.parts || []).map((part: any) => part?.id),
    ]
      .filter(Boolean)
      .map(String);
  }, []);

  useEffect(() => {
    closeShiftKeysRef.current = new Set(
      (closeProductionShift || []).flatMap(getShiftKeys),
    );
  }, [closeProductionShift, getShiftKeys]);

  const isShiftHidden = useCallback(
    (shift: any) => {
      const keys = getShiftKeys(shift);

      return keys.some(
        (key) =>
          hiddenShiftKeysRef.current.has(key) ||
          closeShiftKeysRef.current.has(key),
      );
    },
    [getShiftKeys],
  );

  const updateShifts = useCallback(
    (shifts: any[]) => {
      const visibleShifts = (shifts || []).filter(
        (shift) => !isShiftHidden(shift),
      );

      const current = visibleShifts.filter(isCurrentShift);
      const archive = visibleShifts.filter(isArchiveShift);

      setCurrentShifts(current);
      setArchiveShifts(archive);
    },
    [isCurrentShift, isArchiveShift, isShiftHidden],
  );

  const showStoredShifts = useCallback(() => {
    updateShifts(
      enrichStoredShiftReferences(
        productionShift,
        cachedLists.techniqueStandard,
        cachedLists.agriculturalMachinery,
        cachedLists.productionWorkPlaces,
        cachedLists.workStandard,
        cachedLists.tariffsList,
      ),
    );
  }, [cachedLists, productionShift, updateShifts]);

  const loadProductionShifts = useCallback(
    async (
      dateRange: { startDate?: Date; endDate?: Date },
      showRefreshIndicator = true,
    ) => {
      if (!dateRange.startDate || !dateRange.endDate || !employeeInfo) {
        return false;
      }

      try {
        if (showRefreshIndicator) {
          setRefreshing(true);
        }

        if (!isConnected) {
          await reloadLocalData();
          showStoredShifts();
          return true;
        }

        const token = await fetchAccessToken();

        const startDate = new Date(dateRange.startDate);
        startDate.setHours(0, 0, 0, 0);

        const endDate = new Date(dateRange.endDate);
        endDate.setHours(23, 59, 59, 999);

        const data = (await productionShiftLoader({
          accessToken: token,
          userId: employeeInfo.employees.id,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        })) as ProductionShiftLoadResponse;

        if (!data) {
          throw new Error("Production shifts API returned no data");
        }

        const shifts = getLoadedShifts(data);

        const currentOnly = shifts.filter(isCurrentShift);
        const archiveOnly = shifts.filter(isArchiveShift);

        const currentResult = processShiftData(
          { shifts: currentOnly },
          cachedLists.techniqueStandard,
          cachedLists.agriculturalMachinery,
          cachedLists.unitOfMeasure,
          cachedLists.productionWorkPlaces,
          cachedLists.workStandard,
        );

        const archiveResult = processShiftData(
          { shifts: archiveOnly },
          cachedLists.techniqueStandard,
          cachedLists.agriculturalMachinery,
          cachedLists.unitOfMeasure,
          cachedLists.productionWorkPlaces,
          cachedLists.workStandard,
        );

        const processedShifts = [...currentResult, ...archiveResult];

        await clearOperations.allProductionShift();

        if (currentResult.length) {
          await syncOperations.productionShift(currentResult);
        }

        await reloadLocalData();

        updateShifts(processedShifts);
        return true;
      } catch (err) {
        const isConnectionError = !isConnected || isShiftConnectionError(err);

        if (isConnectionError) {
          console.warn(
            "Production shifts request failed, using stored shifts:",
            err,
          );
          await reloadLocalData();
          showStoredShifts();

          // При устаревшем статусе сети оставляем один автоматический повтор.
          return !isConnected;
        }

        console.error("Failed to load production shifts:", err);
        showError("Не удалось загрузить смены");
        return false;
      } finally {
        if (showRefreshIndicator) {
          setRefreshing(false);
        }
      }
    },
    [
      employeeInfo,
      isConnected,
      fetchAccessToken,
      productionShiftLoader,
      clearOperations,
      syncOperations,
      reloadLocalData,
      updateShifts,
      isCurrentShift,
      isArchiveShift,
      cachedLists,
      showError,
      showStoredShifts,
    ],
  );

  const allCurrentProcessedForSync = useMemo(() => {
    if (!productionShift?.length) return [];

    return productionShift
      .filter(isCurrentShift)
      .filter((shift: any) => !isShiftHidden(shift));
  }, [productionShift, isCurrentShift, isShiftHidden]);

  const loadFreshCurrentShiftsForSync = useCallback(
    async (token: string, referenceAt: string | Date) => {
      if (!productionShiftLoader || !employeeInfo?.employees?.id) return null;

      const referenceDate = new Date(referenceAt);
      if (!Number.isFinite(referenceDate.getTime())) return null;

      const startDate = new Date(referenceDate);
      startDate.setDate(startDate.getDate() - 1);
      startDate.setHours(0, 0, 0, 0);

      const endDate = new Date(referenceDate);
      endDate.setHours(23, 59, 59, 999);

      const serverData = (await productionShiftLoader({
        accessToken: token,
        userId: employeeInfo.employees.id,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      })) as ProductionShiftLoadResponse;

      if (!serverData) return null;

      return processShiftData(
        {
          ...serverData,
          shifts: getLoadedShifts(serverData).filter(isCurrentShift),
        },
        cachedLists.techniqueStandard,
        cachedLists.agriculturalMachinery,
        cachedLists.unitOfMeasure,
        cachedLists.productionWorkPlaces,
        cachedLists.workStandard,
      );
    },
    [
      cachedLists,
      employeeInfo?.employees?.id,
      isCurrentShift,
      productionShiftLoader,
    ],
  );

  const syncOpenShifts = useCallback(
    async (token: string) => {
      if (!pendingOpenProductionShift.length) return false;

      const groups = groupOfflineSegments(pendingOpenProductionShift);
      const syncedIds: (number | string)[] = [];
      const recalculatedPartIds = new Set<string>();
      let allGroupsSynced = true;

      for (const group of groups) {
        let serverShiftId =
          group.find((segment) => segment?.server_shift_id)?.server_shift_id ||
          null;
        const isGroupClosed = group.every((segment) =>
          Boolean(segment.ended_at),
        );
        const precedingPartCloseAt = getPrecedingPartCloseAt(group);

        if (precedingPartCloseAt) {
          let candidateShifts = allCurrentProcessedForSync;
          const firstOfflineScannedAt = new Date(
            precedingPartCloseAt.getTime() + 1000,
          );
          const freshCurrentShifts = await loadFreshCurrentShiftsForSync(
            token,
            firstOfflineScannedAt,
          );

          if (freshCurrentShifts) candidateShifts = freshCurrentShifts;

          logOfflineSync("find preceding active part", {
            candidateCount: candidateShifts.length,
            firstOfflineScannedAt: firstOfflineScannedAt.toISOString(),
            usedFreshServerData: candidateShifts !== allCurrentProcessedForSync,
          });

          const precedingCandidateShifts = candidateShifts.filter((shift) => {
            const shiftStartedAt = new Date(
              shift.startAt || shift.openAt || 0,
            ).getTime();

            return (
              Number.isFinite(shiftStartedAt) &&
              shiftStartedAt <= precedingPartCloseAt.getTime()
            );
          });
          const latestShift = (await findLatestShift(
            precedingCandidateShifts,
            token,
          )) as ShiftData | undefined;
          const latestPartId = String(latestShift?.partIds || "");

          if (
            latestShift &&
            latestPartId &&
            !recalculatedPartIds.has(latestPartId)
          ) {
            logOfflineSync("close preceding active part request", {
              partId: latestPartId,
              closeAt: precedingPartCloseAt.toISOString(),
              closeAtLocal: formatOfflineSyncLocalTime(precedingPartCloseAt),
              firstOfflineSegmentId: group[0]?.id,
            });

            const isPrecedingPartClosed = await closeInitialPartShift(
              token,
              latestShift,
              precedingPartCloseAt,
            );

            logOfflineSync("close preceding active part response", {
              partId: latestPartId,
              isClosed: Boolean(isPrecedingPartClosed),
            });

            if (!isPrecedingPartClosed) {
              throw new Error("Previous server shift part was not closed");
            }

            recalculatedPartIds.add(latestPartId);
          }
        }

        const closeServerPart = async (partId: string, closeAt: Date) => {
          const result = await closeInitialPartShiftByPart(
            token,
            partId,
            closeAt,
          );

          return Boolean(result);
        };

        const closeRequiredServerPart = async (
          partId: string,
          closeAt: Date,
        ) => {
          logOfflineSync("close part request", {
            partId,
            closeAt: closeAt.toISOString(),
            closeAtLocal: formatOfflineSyncLocalTime(closeAt),
          });

          const isClosed = await closeServerPart(partId, closeAt);

          logOfflineSync("close part response", {
            partId,
            isClosed,
          });

          if (!isClosed) {
            throw new Error("Server shift part was not closed");
          }
        };

        for (const [index, shift] of group.entries()) {
          const isLastGroupSegment = index === group.length - 1;
          const shouldClosePart =
            Boolean(shift.ended_at) &&
            canCloseOfflinePartDirectly(shift) &&
            !(isGroupClosed && isLastGroupSegment);

          if (shift.sync_status === "close_pending") {
            continue;
          }

          if (
            (shift.sync_status === "synced" ||
              shift.sync_status === "error") &&
            shift.server_shift_id
          ) {
            try {
              serverShiftId = shift.server_shift_id || serverShiftId;

              if (shift.server_part_id && shouldClosePart) {
                await closeRequiredServerPart(
                  shift.server_part_id,
                  new Date(shift.ended_at),
                );
                await updateOpenShiftSyncState({
                  id: shift.id,
                  serverShiftId,
                  serverPartId: null,
                  syncStatus: "synced",
                  syncError: null,
                });
                shift.server_part_id = null;
                shift.sync_status = "synced";
              } else if (shift.sync_status === "error") {
                await updateOpenShiftSyncState({
                  id: shift.id,
                  serverShiftId,
                  serverPartId: shift.server_part_id,
                  syncStatus: "synced",
                  syncError: null,
                });
                shift.sync_status = "synced";
              }
            } catch (error) {
              await updateOpenShiftSyncState({
                id: shift.id,
                serverShiftId,
                serverPartId: shift.server_part_id,
                syncStatus: "error",
                syncError:
                  error instanceof Error ? error.message : "Sync failed",
              });
              throw error;
            }

            continue;
          }

          const openShift: OpenProductionShiftRequest = {
            accessToken: token,
            code: shift.code,
            shiftType: shift.shift_type,
            employeeId: shift.employee_id,
            scannedAt: shift.scanned_at,
            scannedPlace: resolveScannedPlaceForSync(shift.scanned_place),
          };

          try {
            await updateOpenShiftSyncState({
              id: shift.id,
              serverShiftId,
              serverPartId: shift.server_part_id,
              syncStatus: "syncing",
              syncError: null,
            });

            let addedServerShiftId = shift.server_shift_id || null;
            let addedPartId = shift.server_part_id || null;

            if (!addedServerShiftId) {
              logOfflineSync("open shift request", {
                localId: shift.id,
                groupKey: shift.offline_group_key,
                shiftType: openShift.shiftType,
                employeeId: openShift.employeeId,
                scannedAt: openShift.scannedAt,
                scannedAtLocal: formatOfflineSyncLocalTime(
                  openShift.scannedAt,
                ),
                endedAt: shift.ended_at,
                endedAtLocal: formatOfflineSyncLocalTime(shift.ended_at),
                segmentType: shift.segment_type,
                scannedPlace: openShift.scannedPlace,
                codePreview: String(openShift.code || "").slice(0, 18),
              });

              const added = await push.openProductionShift(openShift);
              addedServerShiftId = getServerShiftId(shift, added);
              addedPartId = getServerPartId(added);

              logOfflineSync("open shift response", {
                localId: shift.id,
                serverShiftId: addedServerShiftId,
                serverPartId: addedPartId,
              });
            }

            if (!addedServerShiftId && productionShiftLoader) {
              const scannedAt = new Date(shift.scanned_at);

              if (Number.isFinite(scannedAt.getTime())) {
                const startDate = new Date(scannedAt);
                startDate.setHours(0, 0, 0, 0);

                const endDate = new Date(scannedAt);
                endDate.setHours(23, 59, 59, 999);

                const serverData = (await productionShiftLoader({
                  accessToken: token,
                  userId: shift.employee_id || employeeInfo?.employees?.id,
                  startDate: startDate.toISOString(),
                  endDate: endDate.toISOString(),
                })) as ProductionShiftLoadResponse;
                const serverMatch = findServerShiftByOfflineSegment(
                  getLoadedShifts(serverData),
                  shift,
                );

                if (serverMatch) {
                  addedServerShiftId = getServerShiftId(
                    shift,
                    serverMatch.shift,
                  );
                  addedPartId =
                    serverMatch.matchingPart?.part?.id || addedPartId;
                }
              }
            }

            if (!addedServerShiftId) {
              throw new Error("Server shift id was not returned");
            }

            serverShiftId = addedServerShiftId;

            let storedPartId = addedPartId;

            await updateOpenShiftSyncState({
              id: shift.id,
              serverShiftId,
              serverPartId: storedPartId,
              syncStatus: "syncing",
              syncError: null,
            });
            shift.server_shift_id = serverShiftId;
            shift.server_part_id = storedPartId;

            if (addedPartId && shouldClosePart) {
              await closeRequiredServerPart(
                addedPartId,
                new Date(shift.ended_at),
              );
              storedPartId = null;
            }

            await updateOpenShiftSyncState({
              id: shift.id,
              serverShiftId,
              serverPartId: storedPartId,
              syncStatus: "synced",
              syncError: null,
            });
            shift.server_shift_id = serverShiftId;
            shift.server_part_id = storedPartId;
            shift.sync_status = "synced";
          } catch (error) {
            await updateOpenShiftSyncState({
              id: shift.id,
              serverShiftId,
              serverPartId: shift.server_part_id,
              syncStatus: "error",
              syncError:
                error instanceof Error ? error.message : "Sync failed",
            });
            throw error;
          }
        }

        if (!isGroupClosed) {
          syncedIds.push(
            ...group
              .filter((segment) => segment.sync_status === "synced")
              .map((segment) => segment.id),
          );
          continue;
        }

        const closeAt = getGroupCloseAt(group);

        if (!serverShiftId || !closeAt) {
          allGroupsSynced = false;
          continue;
        }

        const lastOpenPart = [...group]
          .reverse()
          .find(
            (segment) =>
              segment.server_part_id && canCloseOfflinePartDirectly(segment),
          );
        const closePartAt = new Date(closeAt);

        if (
          lastOpenPart?.server_part_id &&
          Number.isFinite(closePartAt.getTime())
        ) {
          const isLastPartClosed = await closeServerPart(
            lastOpenPart.server_part_id,
            closePartAt,
          );

          logOfflineSync("last part close response", {
            localId: lastOpenPart.id,
            partId: lastOpenPart.server_part_id,
            closeAt: closePartAt.toISOString(),
            closeAtLocal: formatOfflineSyncLocalTime(closePartAt),
            isClosed: isLastPartClosed,
          });

          if (isLastPartClosed) {
            await updateOpenShiftSyncState({
              id: lastOpenPart.id,
              serverShiftId,
              serverPartId: null,
              syncStatus: "synced",
              syncError: null,
            });
            lastOpenPart.server_part_id = null;
            lastOpenPart.sync_status = "synced";
          }
        }

        logOfflineSync("close shift request", {
          serverShiftId,
          closeAt,
          closeAtLocal: formatOfflineSyncLocalTime(closeAt),
          groupSize: group.length,
          localIds: group.map((segment) => segment.id),
        });

        const closeResult = await closeProductionShiftRequest({
          accessToken: token,
          closeAt,
          shiftId: serverShiftId,
        });

        logOfflineSync("close shift response", {
          serverShiftId,
          closeAt,
          closeAtLocal: formatOfflineSyncLocalTime(closeAt),
          closeResult: Boolean(closeResult),
        });

        if (!closeResult) {
          allGroupsSynced = false;

          for (const segment of group) {
            await updateOpenShiftSyncState({
              id: segment.id,
              serverShiftId,
              serverPartId: segment.server_part_id,
              syncStatus: "close_pending",
              syncError: "Failed to close server shift",
            });
          }

          continue;
        }

        syncedIds.push(...group.map((segment) => segment.id));
      }

      if (syncedIds.length) {
        logOfflineSync("delete local synced rows", { ids: syncedIds });
        await deleteOpenShiftsByIds(syncedIds);
      }

      return allGroupsSynced;
    },
    [
      pendingOpenProductionShift,
      employeeInfo,
      productionShiftLoader,
      push,
      allCurrentProcessedForSync,
      loadFreshCurrentShiftsForSync,
      findLatestShift,
      closeInitialPartShift,
      closeProductionShiftRequest,
      updateOpenShiftSyncState,
      deleteOpenShiftsByIds,
      closeInitialPartShiftByPart,
    ],
  );

  const syncCloseShifts = useCallback(
    async (token: string) => {
      if (!closeProductionShift?.length) return false;

      const requests: CloseProductionShiftRequest[] = [];

      for (const s of closeProductionShift) {
        requests.push({
          accessToken: token,
          shiftId: s.shift_id,
          closeAt: s.closed_at,
        });

        const freshCurrentShifts = s.closed_at
          ? await loadFreshCurrentShiftsForSync(token, s.closed_at)
          : null;
        const candidateShifts =
          freshCurrentShifts ?? allCurrentProcessedForSync;
        const shiftsFromClosingProductionShift = s.shift_id
          ? candidateShifts.filter(
              (shift) =>
                String(shift.productionShiftId) === String(s.shift_id),
            )
          : candidateShifts;

        const latestShift = (await findLatestShift(
          shiftsFromClosingProductionShift,
          token,
        )) as ShiftData;

        if (s.closed_at && latestShift) {
          const dateMinusOneSecond = new Date(
            new Date(s.closed_at).getTime() - 1000,
          );

          logOfflineSync("close latest part before shift", {
            shiftId: s.shift_id,
            partId: latestShift.partIds,
            closeAt: dateMinusOneSecond.toISOString(),
            usedFreshServerData: Boolean(freshCurrentShifts),
          });

          const isLatestPartClosed = await closeInitialPartShift(
            token,
            latestShift,
            dateMinusOneSecond,
          );

          if (!isLatestPartClosed) {
            throw new Error("Latest server shift part was not closed");
          }
        }
      }

      const result = await push.closeProductionShift(requests);

      if (result) {
        await clearOperations.closeProductionShift();

        hiddenShiftKeysRef.current.clear();
        closeShiftKeysRef.current.clear();

        await reloadLocalData();

        return true;
      }

      return false;
    },
    [
      closeProductionShift,
      allCurrentProcessedForSync,
      loadFreshCurrentShiftsForSync,
      push,
      clearOperations,
      findLatestShift,
      closeInitialPartShift,
      reloadLocalData,
    ],
  );

  const syncPendingData = useCallback(async () => {
    if (!isConnected) {
      showError("Нет интернета");
      return false;
    }

    if (syncInProgress.current) return false;

    try {
      syncInProgress.current = true;
      setIsSyncing(true);
      setLoadingPhase("offline-sync");

      const token = await fetchAccessToken();

      if (!token) return false;

      const hasOpenQueue = pendingOpenProductionShift.length > 0;
      const hasCloseQueue = Boolean(closeProductionShift?.length);
      const openSynced = hasOpenQueue ? await syncOpenShifts(token) : true;
      const closeSynced = hasCloseQueue ? await syncCloseShifts(token) : true;
      const hasSynced =
        (hasOpenQueue || hasCloseQueue) && openSynced && closeSynced;

      if (hasSynced) {
        hiddenShiftKeysRef.current.clear();
        closeShiftKeysRef.current.clear();

        const serverShiftsReloaded = await loadProductionShifts(range, false);

        if (!serverShiftsReloaded) {
          await reloadLocalData();
        }

        showSuccess("Синхронизация завершена");
      }

      return hasSynced;
    } catch (e) {
      console.error(e);
      showError("Ошибка синхронизации");
      return false;
    } finally {
      syncInProgress.current = false;
      setIsSyncing(false);
      setLoadingPhase("idle");
    }
  }, [
    isConnected,
    closeProductionShift?.length,
    fetchAccessToken,
    pendingOpenProductionShift.length,
    syncOpenShifts,
    syncCloseShifts,
    loadProductionShifts,
    range,
    reloadLocalData,
    showError,
    showSuccess,
  ]);

  const currentProcessed = useMemo(() => {
    const visibleProcessed = currentShifts.filter(
      (shift: any) => !isShiftHidden(shift),
    );

    lastCurrentProcessedRef.current = visibleProcessed;
    return visibleProcessed;
  }, [currentShifts, isShiftHidden]);

  const archiveProcessed = useMemo(() => {
    const visibleProcessed = archiveShifts.filter(
      (shift: any) => !isShiftHidden(shift),
    );

    lastArchiveProcessedRef.current = visibleProcessed;
    return visibleProcessed;
  }, [archiveShifts, isShiftHidden]);

  const processShifts = useCallback((shifts: ShiftData[]): ProcessedShiftData => {
    if (!shifts?.length) return EMPTY_SHIFT_COLLECTION;

    const grouped = groupShiftsByTypeAndDate(shifts);

    return {
      data: shifts,
      grouped,
      keys: getSortedGroupKeys(grouped),
    };
  }, []);

  const onSaveToLocal = useCallback(
    async (shifts: ShiftData[]) => {
      if (!shifts?.length) return;

      try {
        const token = await fetchAccessToken();

        const closeShifts = prepareShiftsForLocalSave(shifts, token);

        await syncOperations.closeProductionShift(closeShifts);

        await reloadLocalData();

        showSuccess("Изменения сохранены локально");
      } catch (err) {
        console.error(err);
        showError("Не удалось сохранить данные локально");
        throw err;
      }
    },
    [
      syncOperations,
      reloadLocalData,
      fetchAccessToken,
      showSuccess,
      showError,
    ],
  );

  const handleStopGroupShifts = useCallback(
    async (shifts: ShiftData[], closeAtOverride?: string) => {
      try {
        if (!isConnected) {
          Alert.alert(
            "Нет подключения к интернету",
            "Хотите сохранить данные локально для отправки позже?",
            [
              { text: "Отмена", style: "cancel" },
              {
                text: "Сохранить локально",
                onPress: () => onSaveToLocal(shifts),
              },
            ],
          );
          return;
        }

        const token = await fetchAccessToken();
        const request = createStopShiftRequest(shifts, token, closeAtOverride);

        if (request) {
          const latestShift = (await findLatestShift(
            shifts,
            token,
          )) as ShiftData;

          const closePartAt = closeAtOverride
            ? new Date(closeAtOverride)
            : new Date(Date.now() - 1000);

          if (latestShift) {
            await closeInitialPartShift(token, latestShift, closePartAt);
          }

          const result = await closeProductionShiftRequest(request);

          if (result) {
            if (range?.startDate && range?.endDate) {
              await loadProductionShifts(range);
            }

            showSuccess("Смена завершена");
          } else {
            showError("Не удалось завершить смену");
          }
        }
      } catch (error) {
        console.error("Error stopping shifts:", error);
        showError("Не удалось завершить смену");
        throw error;
      }
    },
    [
      isConnected,
      fetchAccessToken,
      closeProductionShiftRequest,
      onSaveToLocal,
      loadProductionShifts,
      range,
      showSuccess,
      showError,
      findLatestShift,
      closeInitialPartShift,
    ],
  );

  const handleClosePendingShift = useCallback(
    async (shiftOrShifts: any | any[], endedAtOverride?: string) => {
      const shifts = Array.isArray(shiftOrShifts)
        ? shiftOrShifts
        : [shiftOrShifts];
      const shiftsToClose = shifts.filter((shift) => shift?.id);

      if (!shiftsToClose.length) return;

      try {
        const endedAt = endedAtOverride || new Date().toISOString();

        for (const shift of shiftsToClose) {
          await updateOpenShiftEndedAt({
            id: shift.id,
            endedAt,
          });
        }

        await reloadLocalData();
        showSuccess("Офлайн-смена закрыта");
      } catch (error) {
        console.error("Error closing pending shift:", error);
        showError("Не удалось закрыть офлайн-отрезки");
        throw error;
      }
    },
    [reloadLocalData, showError, showSuccess, updateOpenShiftEndedAt],
  );

  const handleRefresh = useCallback(async () => {
    if (refreshing) return;

    try {
      setRefreshing(true);
      setLoadingPhase(isConnected ? "dictionaries" : "shifts");

      if (isConnected) {
        const token = await getValidAccessToken();

        await smartSyncAllDictionaries(token);
        await reloadLocalData();
      }

      setLoadingPhase("shifts");

      if (employeeInfo?.employees?.id && range.startDate && range.endDate) {
        lastShiftLoadKeyRef.current = [
          employeeInfo.employees.id,
          range.startDate.getTime(),
          range.endDate.getTime(),
          isConnected ? "online" : "offline",
          dictionariesRevision,
        ].join("_");
      }

      await loadProductionShifts(range);
    } catch (e) {
      console.error("Refresh error:", e);
      showError("Ошибка обновления");
    } finally {
      setRefreshing(false);
      setLoadingPhase("idle");
    }
  }, [
    refreshing,
    isConnected,
    getValidAccessToken,
    smartSyncAllDictionaries,
    loadProductionShifts,
    range,
    employeeInfo?.employees?.id,
    dictionariesRevision,
    reloadLocalData,
    showError,
  ]);

  const current = useMemo(
    () => processShifts(currentProcessed),
    [currentProcessed, processShifts],
  );

  const archive = useMemo(
    () => processShifts(archiveProcessed),
    [archiveProcessed, processShifts],
  );

  const pendingOpenShifts = useMemo(() => {
    if (!pendingOpenProductionShift.length) {
      return EMPTY_SHIFT_COLLECTION;
    }

    const pending = pendingOpenProductionShift
      .map(createPendingShiftData)
      .filter((shift) => Boolean(shift.date))
      .sort(
        (a, b) =>
          new Date(b.scannedAt).getTime() - new Date(a.scannedAt).getTime(),
      );

    if (!pending.length) {
      return EMPTY_SHIFT_COLLECTION;
    }

    return processShifts(pending);
  }, [pendingOpenProductionShift, processShifts]);

  useEffect(() => {
    if (isConnected || !productionShift?.length) {
      return;
    }

    updateShifts(
      enrichStoredShiftReferences(
        productionShift,
        cachedLists.techniqueStandard,
        cachedLists.agriculturalMachinery,
        cachedLists.productionWorkPlaces,
        cachedLists.workStandard,
        cachedLists.tariffsList,
      ),
    );
  }, [
    cachedLists,
    isConnected,
    productionShift,
    updateShifts,
  ]);

  useEffect(() => {
    let isMounted = true;
    let retryTimer: ReturnType<typeof setTimeout> | undefined;

    if (!isPageFocused) {
      setIsLoading(false);
      setLoadingPhase("idle");
      return;
    }

    if (!range.startDate || !range.endDate) {
      setIsLoading(false);
      setLoadingPhase("idle");
      return;
    }

    const employeeId = employeeInfo?.employees?.id;

    if (!employeeId) {
      setIsLoading(false);
      setLoadingPhase("idle");
      return;
    }

    const loadKey = [
      employeeId,
      range.startDate.getTime(),
      range.endDate.getTime(),
      isConnected ? "online" : "offline",
      dictionariesRevision,
    ].join("_");

    if (lastShiftLoadKeyRef.current === loadKey) {
      setIsLoading(false);
      setLoadingPhase("idle");
      return;
    }

    setIsLoading(true);
    setLoadingPhase("shifts");

    const finishLoad = (isLoaded: boolean) => {
      if (isLoaded) {
        lastShiftLoadKeyRef.current = loadKey;
      }

      if (isMounted) {
        setIsLoading(false);
        setLoadingPhase("idle");
      }
    };

    const interactionTask = InteractionManager.runAfterInteractions(() => {
      void loadProductionShifts(range, false).then((isLoaded) => {
        if (isLoaded || !isConnected || !isMounted) {
          finishLoad(isLoaded);
          return;
        }

        retryTimer = setTimeout(() => {
          void loadProductionShifts(range, false).then(finishLoad);
        }, 1500);
      });
    });

    return () => {
      isMounted = false;
      interactionTask.cancel();
      if (retryTimer) clearTimeout(retryTimer);
    };
  }, [
    employeeInfo?.employees?.id,
    dictionariesRevision,
    isConnected,
    isPageFocused,
    loadProductionShifts,
    range.endDate,
    range.startDate,
  ]);

  // useEffect(() => {
  //   const initialize = async () => {
  //     setIsLoading(true);

  //     try {
  //       if (range.startDate && range.endDate) {
  //         await loadProductionShifts(range);
  //       }
  //     } catch (error) {
  //       console.error("Initialization error:", error);
  //     } finally {
  //       setIsLoading(false);
  //     }
  //   };

  //   initialize();
  // }, []);

  return {
    pendingOpenShifts,
    current,
    archive,
    isLoading,
    refreshing,
    isSyncing,
    loadingPhase,
    handleRefresh,
    handleStopGroupShifts,
    handleClosePendingShift,
    handleSyncPress: syncPendingData,
    onSaveToLocal,
  };
};
