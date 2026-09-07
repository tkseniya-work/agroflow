import { useCallback, useEffect, useRef, useState } from "react";
import { Alert } from "react-native";

import type { FieldProductionTaskResponse } from "../../../../../entities/productionTask/model/fieldProductionTask.interface";
import { productionShiftApi } from "../../../../../entities/productionShift";
import { useEmployeeActions } from "../../../../../entities/employee";
import {
  useCompanyInfo,
  useShiftSettings,
} from "../../../../../features/localData/useLocalData";
import { useTechniqueMonitoring } from "../../../../../entities/techniqueMonitoring";
import { useNetworkStatus } from "../../../../../shared/lib/useNetworkStatus";
import { useProductionTasks } from "../../../../../entities/productionTask/lib/useProductionTasks";
import type { ShiftPartDetails } from "../../../../../src/types/task.types";
import {
  getCompanyId,
  normalizeGroupedPartsResponse,
} from "../../../../../src/utils/taskUtils";

export type LoadTaskGroupedParts = (request: {
  accessToken: string | null;
  taskId: string;
}) => Promise<any>;

export type LoadShiftSettings = (
  accessToken: string | null,
) => Promise<any>;

const getShiftSettingsItem = (value: any) => {
  const source = value?.data ?? value?.list ?? value?.items ?? value;
  return Array.isArray(source) ? source[0] : source;
};

const hasBreakSettings = (value: any) => {
  const settings = getShiftSettingsItem(value);
  const firstStart =
    settings?.first_shift_break_start ?? settings?.firstShiftBreakStart;
  const firstEnd =
    settings?.first_shift_break_end ?? settings?.firstShiftBreakEnd;
  const secondStart =
    settings?.second_shift_break_start ?? settings?.secondShiftBreakStart;
  const secondEnd =
    settings?.second_shift_break_end ?? settings?.secondShiftBreakEnd;

  return Boolean((firstStart && firstEnd) || (secondStart && secondEnd));
};

type Params = {
  currentTask: FieldProductionTaskResponse | any;
  getValidAccessToken: () => Promise<string | null>;
  selectedDetails: ShiftPartDetails | null;
  loadGroupedParts?: LoadTaskGroupedParts;
  loadShiftSettings?: LoadShiftSettings;
  onChanged?: () => Promise<void> | void;
};

export const useTaskShiftsController = ({
  currentTask,
  getValidAccessToken,
  selectedDetails,
  loadGroupedParts,
  loadShiftSettings = productionShiftApi.loadSettings,
  onChanged,
}: Params) => {
  const companyInfo = useCompanyInfo();
  const localShiftSettings = useShiftSettings()[0];
  const { isConnected } = useNetworkStatus();
  const {
    getProductionFieldTaskGroupedParts,
    removeProductionTaskParts,
  } = useProductionTasks({
    status: [],
    autoLoad: false,
  });
  const { loadEmployeeList } = useEmployeeActions();
  const trackCameraRef = useRef<any>(null);
  const {
    tracks: productionTracks,
    loadingType,
    loadProductionTaskTrack,
    clearTrack,
  } = useTechniqueMonitoring(trackCameraRef);
  const [groupedParts, setGroupedParts] = useState<any[]>([]);
  const [employeesList, setEmployeesList] = useState<any[]>([]);
  const [remoteShiftSettings, setRemoteShiftSettings] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [deletingPartId, setDeletingPartId] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    const accessToken = await getValidAccessToken();
    if (!accessToken) return;

    try {
      setIsLoading(true);

      const response = await (
        loadGroupedParts ?? getProductionFieldTaskGroupedParts
      )({
        accessToken,
        taskId: currentTask.id,
      });

      setGroupedParts(normalizeGroupedPartsResponse(response));
    } finally {
      setIsLoading(false);
    }
  }, [
    currentTask.id,
    getProductionFieldTaskGroupedParts,
    getValidAccessToken,
    loadGroupedParts,
  ]);

  const refresh = useCallback(async () => {
    await loadData();
    await onChanged?.();
  }, [loadData, onChanged]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  useEffect(() => {
    if (!isConnected) return;

    let mounted = true;

    const loadCurrentShiftSettings = async () => {
      const accessToken = await getValidAccessToken();
      if (!accessToken) return;

      const response = await loadShiftSettings(accessToken);

      if (mounted && hasBreakSettings(response)) {
        setRemoteShiftSettings(response);
      }
    };

    void loadCurrentShiftSettings();

    return () => {
      mounted = false;
    };
  }, [getValidAccessToken, isConnected, loadShiftSettings]);

  useEffect(() => {
    let mounted = true;

    const loadEmployees = async () => {
      const accessToken = await getValidAccessToken();
      const companyUuid =
        getCompanyId(currentTask) ??
        companyInfo?.company_uuid ??
        companyInfo?.companyId ??
        companyInfo?.company_id;

      if (!accessToken || !companyUuid) return;

      const response = await loadEmployeeList(accessToken, companyUuid);

      if (mounted) {
        setEmployeesList(Array.isArray(response) ? response : []);
      }
    };

    void loadEmployees();

    return () => {
      mounted = false;
    };
  }, [companyInfo, currentTask, getValidAccessToken, loadEmployeeList]);

  useEffect(() => {
    if (!selectedDetails) {
      clearTrack();
      return;
    }

    void loadProductionTaskTrack(currentTask.id);
  }, [clearTrack, currentTask.id, loadProductionTaskTrack, selectedDetails]);

  const deletePartsByIds = useCallback(
    (
      ids: (string | null | undefined)[],
      title = "Удалить отрезок",
      message?: string,
    ) => {
      const partIds = Array.from(
        new Set(ids.filter(Boolean).map((id) => String(id))),
      );
      if (!partIds.length || deletingPartId) return;

      const deletingId = partIds[0];
      const isGroupDelete =
        partIds.length > 1 || title === "Удаление блока";

      Alert.alert(
        title,
        message ??
          (isGroupDelete
            ? `Будут удалены все отрезки смены (${partIds.length}). Продолжить?`
            : "Отрезок будет удален. Продолжить?"),
        [
          { text: "Отмена", style: "cancel" },
          {
            text: "Удалить",
            style: "destructive",
            onPress: async () => {
              if (!isConnected) {
                Alert.alert(
                  "Нет подключения к интернету",
                  isGroupDelete
                    ? "Удаление смены доступно только онлайн."
                    : "Удаление отрезка доступно только онлайн.",
                );
                return;
              }

              const accessToken = await getValidAccessToken();
              if (!accessToken) return;

              try {
                setDeletingPartId(deletingId);

                const results = await Promise.all(
                  partIds.map((id) =>
                    removeProductionTaskParts({
                      accessToken,
                      id,
                    }),
                  ),
                );
                const deletedCount = results.filter(Boolean).length;

                if (deletedCount > 0) {
                  await refresh();
                }

                if (deletedCount === 0) {
                  Alert.alert("Не удалось удалить", "Попробуйте еще раз.");
                } else if (deletedCount < partIds.length) {
                  Alert.alert(
                    "Удалено не всё",
                    `Удалено ${deletedCount} из ${partIds.length} отрезков. Обновите данные и попробуйте ещё раз.`,
                  );
                }
              } finally {
                setDeletingPartId(null);
              }
            },
          },
        ],
      );
    },
    [
      deletingPartId,
      getValidAccessToken,
      isConnected,
      refresh,
      removeProductionTaskParts,
    ],
  );

  const deletePart = useCallback(
    (details: ShiftPartDetails) => {
      deletePartsByIds(
        details.deleteIds,
        details.deleteTitle,
        details.deleteMessage,
      );
    },
    [deletePartsByIds],
  );
  const shiftSettings = hasBreakSettings(remoteShiftSettings)
    ? remoteShiftSettings
    : localShiftSettings;

  return {
    deletePart,
    deletingPartId,
    employeesList,
    groupedParts,
    isLoading,
    isTrackLoading: loadingType === "taskTrack",
    productionTracks,
    refresh,
    shiftSettings,
  };
};
