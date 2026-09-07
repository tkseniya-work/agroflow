import { useCallback, useEffect, useRef, useState } from "react";
import { useDatabaseBootstrap } from "../../../shared/store/databaseBootstrap";
import {
  useEmployeeInfo,
  useOfflineShiftQueue,
  useProductionWorkPlaces,
  useShiftSettings,
} from "../../localData/useLocalData";
import { ShiftData } from "../../../entities/productionShift";
import { useProductionShiftActions } from "../../../entities/productionShift/lib/useProductionShiftActions";
import { useProductionShiftUpdate } from "../../../entities/productionShift/lib/useProductionShiftUpdate";
import { useAuth } from "../../../entities/auth/lib/useAuth";
import { useSyncOperations } from "../../dataSync/lib/useSyncOperations";
import { useCurrentLocation } from "../../../shared/lib/geolocation/useCurrentLocation";
import { useLocationPermissions } from "../../../shared/lib/geolocation/useLocationPermissions";
import { useAlerts } from "../../../shared/lib/useAlerts";
import { useNetworkStatus } from "../../../shared/lib/useNetworkStatus";
import { useShifts } from "../../../widgets/Work/shared/useShifts";
import { useDictionaryGuard } from "../../dictionarySync/lib/useDictionaryGuard";
import {
  createOfflineGroupKey,
  createOfflineShift,
  getActiveDifferentOfflineShift,
  getActiveOfflineShift,
  getSegmentType,
} from "./useScanner.helpers";
import { hasRequiredScannerDictionaries } from "../../dictionarySync/lib/dictionariesReadiness.logic";
import { OFFLINE_SCANNED_PLACE } from "../../../src/utils/workUtils";

interface UseScannerProps {
  onDataUpdated?: () => Promise<void>;
  productionShiftsCurrentData?: ShiftData[];
}

type PendingScanConfirmation = {
  data: string;
  workPlace: any;
  workPlaceName: string;
  scannedAt: Date;
  shiftType: number;
};

// Вспомогательные функции
const getWorkPlaceFromData = (data: string, productionWorkPlaces: any[]) => {
  const workPlaceId = data ? data.split("_")[0] : -1;
  return productionWorkPlaces?.find(
    (item) => item.productionWorkPlace?.id === workPlaceId,
  );
};

const createSegmentData = (
  accessToken: string | null,
  scannedData: string,
  shiftType: number,
  employeeId: string,
  scannedAt: string,
  scannedPlace: any,
) => ({
  accessToken,
  code: scannedData,
  shiftType,
  employeeId,
  scannedAt: scannedAt,
  scannedPlace,
});

export const useScanner = ({
  onDataUpdated,
  productionShiftsCurrentData,
}: UseScannerProps) => {
  const pendingOpenScannerRef = useRef(false);
  const [isScannerVisible, setIsScannerVisible] = useState(false);
  const [isOpeningScanner, setIsOpeningScanner] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [pendingScanConfirmation, setPendingScanConfirmation] =
    useState<PendingScanConfirmation | null>(null);

  // Атомы и контексты
  const { getValidAccessToken } = useAuth();
  const { isConnected } = useNetworkStatus();
  const { reloadLocalData } = useDatabaseBootstrap();
  const productionWorkPlaces = useProductionWorkPlaces();
  const employeeInfo = useEmployeeInfo();
  const settingsProductionShift = useShiftSettings();
  const { openProductionShift } = useOfflineShiftQueue();

  const { syncOperations, push } = useSyncOperations();
  const { getCurrentLocation } = useCurrentLocation();
  const { requestLocationPermission } = useLocationPermissions();
  const { findLatestShift, closeInitialPartShift } = useProductionShiftUpdate();

  const { getShiftType, getDisplayShift, currentShift } = useShifts(
    settingsProductionShift?.[0],
  );
  const { showError, showSuccess, showOfflineWarning } = useAlerts();
  const { updateOpenShiftEndedAt } = useProductionShiftActions();

  const { ensureScannerDictionariesReady, isCheckingDictionaries } =
    useDictionaryGuard();

  const showLocationRequiredError = useCallback(() => {
    showError("Для сканирования нужен доступ к геолокации");
  }, [showError]);

  const showLocationUnavailableError = useCallback(() => {
    showError("Не удалось определить геопозицию. Проверьте сигнал GPS и попробуйте снова");
  }, [showError]);

  // Получение геолокации с состоянием загрузки
  const getScannedPlace = useCallback(async () => {
    setIsGettingLocation(true);
    try {
      return await getCurrentLocation();
    } catch (error) {
      console.warn("Не удалось получить геоданные:", error);
      return null;
    } finally {
      setIsGettingLocation(false);
    }
  }, [getCurrentLocation]);

  const refreshData = useCallback(async () => {
    try {
      if (isConnected && onDataUpdated) {
        await onDataUpdated();
      } else if (!isConnected) {
        await reloadLocalData();
      }
    } catch (error) {
      console.error("Error refreshing data:", error);
    }
  }, [reloadLocalData, onDataUpdated, isConnected]);

  // Создание сегмента смены
  const createSegment = useCallback(
    async (
      scannedData: string,
      workPlace: any,
      shiftType: number,
      scannedAt: Date,
    ) => {
      if (isProcessing) {
        return;
      }

      setIsProcessing(true);

      try {
        const accessToken = await getValidAccessToken();
        const scannedPlace = isConnected
          ? await getScannedPlace()
          : OFFLINE_SCANNED_PLACE;
        const shiftDisplay = getDisplayShift(shiftType);

        if (isConnected && !scannedPlace) {
          showLocationUnavailableError();
          setIsProcessing(false);
          return;
        }

        if (isConnected && productionShiftsCurrentData) {
          const latestShift = (await findLatestShift(
            productionShiftsCurrentData,
            accessToken,
          )) as ShiftData;

          if (latestShift) {
            const dateMinusOneSecond = new Date(scannedAt.getTime() - 1000);

            await closeInitialPartShift(
              accessToken,
              latestShift,
              dateMinusOneSecond,
            );
          }
        }

        const segmentData = [
          createSegmentData(
            accessToken,
            scannedData,
            shiftType,
            employeeInfo ? employeeInfo.employees.id : "-1",
            scannedAt.toISOString(),
            scannedPlace,
          ),
        ];

        if (isConnected) {
          const result = await push.openProductionShifts(segmentData);

          if (result) {
            setIsScannerVisible(false);
            setIsProcessing(false);

            showSuccess(
              `Новый отрезок создан\nСмена: ${shiftDisplay.displayName}`,
            );

            refreshData();
          } else {
            showError("Не удалось создать отрезок");
            setIsProcessing(false);
          }
        } else {
          const employeeId = employeeInfo ? employeeInfo.employees.id : "-1";
          const activeOfflineShift = getActiveOfflineShift(
            openProductionShift,
            employeeId,
            shiftType,
          );
          const offlineGroupKey =
            activeOfflineShift?.offline_group_key ||
            createOfflineGroupKey(employeeId, shiftType, scannedAt);

          if (activeOfflineShift?.id) {
            await updateOpenShiftEndedAt({
              id: activeOfflineShift.id,
              endedAt: new Date(scannedAt.getTime() - 1000).toISOString(),
            });
          }

          const openShift = createOfflineShift(
            scannedData,
            shiftType,
            employeeId,
            scannedAt.toISOString(),
            null,
            scannedPlace,
            workPlace?.productionWorkPlace?.name,
            getSegmentType(workPlace),
            offlineGroupKey,
          );

          await syncOperations.openProductionShift(openShift);

          setIsScannerVisible(false);
          setIsProcessing(false);

          showSuccess(
            `Отрезок сохранен и будет отправлен при появлении интернета\nСмена: ${shiftDisplay.displayName}`,
            [{ text: "OK" }],
          );

          refreshData();
        }
      } catch (error) {
        console.error("Error of creating shift: ", error);

        const fallbackMessage = isConnected
          ? "Не удалось создать отрезок"
          : "Не удалось сохранить отрезок оффлайн";
        const errorMessage =
          error instanceof Error && error.message.trim()
            ? error.message
            : fallbackMessage;

        showError(errorMessage);

        setIsScannerVisible(false);
        setIsProcessing(false);
      }
    },
    [
      getValidAccessToken,
      employeeInfo,
      isConnected,
      productionShiftsCurrentData,
      openProductionShift,
      syncOperations,
      push,
      getScannedPlace,
      getDisplayShift,
      updateOpenShiftEndedAt,
      showSuccess,
      showError,
      showLocationRequiredError,
      showLocationUnavailableError,
      closeInitialPartShift,
      findLatestShift,
      refreshData,
      isProcessing,
    ],
  );

  const confirmPendingScan = useCallback(async () => {
    if (!pendingScanConfirmation) {
      return;
    }

    const { data, workPlace, shiftType, scannedAt } = pendingScanConfirmation;
    const employeeId = employeeInfo ? employeeInfo.employees.id : "-1";
    const activeDifferentOfflineShift = getActiveDifferentOfflineShift(
      openProductionShift,
      employeeId,
      shiftType,
    );

    if (activeDifferentOfflineShift) {
      const activeShift = getDisplayShift(
        Number(activeDifferentOfflineShift.shift_type),
      );
      const selectedShift = getDisplayShift(shiftType);

      showError(
        `Нельзя открыть ${selectedShift.displayName}, пока не закрыта ${activeShift.displayName}. Закройте предыдущую смену и повторите сканирование.`,
      );
      return;
    }

    setPendingScanConfirmation(null);

    await createSegment(data, workPlace, shiftType, scannedAt);
  }, [
    createSegment,
    employeeInfo,
    getDisplayShift,
    openProductionShift,
    pendingScanConfirmation,
    showError,
  ]);

  const cancelPendingScan = useCallback(() => {
    setPendingScanConfirmation(null);
  }, []);

  const setPendingScanShiftType = useCallback((shiftType: number) => {
    setPendingScanConfirmation((prev) =>
      prev ? { ...prev, shiftType } : prev,
    );
  }, []);

  // Обработчик сканирования кода
  const handleCodeScanned = useCallback(
    async ({ data }: { data: string }) => {
      if (!data) {
        showError("Не удалось распознать код");
        setIsScannerVisible(false);
        return;
      }

      if (isProcessing) {
        return;
      }

      try {
        if (!productionWorkPlaces?.length) {
          showError(
            "Справочники ещё загружаются. Попробуйте открыть сканер ещё раз.",
          );
          setIsScannerVisible(false);
          return;
        }

        const workPlace = getWorkPlaceFromData(
          data,
          productionWorkPlaces || [],
        );

        setIsScannerVisible(false);

        if (!workPlace) {
          showError("Рабочее место не найдено");
          return;
        }

        const scannedAt = new Date();

        setPendingScanConfirmation({
          data,
          workPlace,
          workPlaceName: workPlace.productionWorkPlace.name || "Не указано",
          scannedAt,
          shiftType: getShiftType(scannedAt),
        });
      } catch {
        showError("Произошла ошибка при обработке кода");
        setIsScannerVisible(false);
      }
    },
    [
      productionWorkPlaces,
      getShiftType,
      showError,
      isProcessing,
    ],
  );

  // Логика открытия сканера
  const showScannerWithShiftInfo = useCallback(() => {
    setIsOpeningScanner(false);
    setIsProcessing(false);

    if (!isConnected) {
      showOfflineWarning(() => {
        setIsScannerVisible(true);
      });
    } else {
      setIsScannerVisible(true);
    }
  }, [isConnected, showOfflineWarning]);

  const hasRequiredDictionaries = useCallback(() => {
    return hasRequiredScannerDictionaries(
      productionWorkPlaces,
      settingsProductionShift,
    );
  }, [productionWorkPlaces, settingsProductionShift]);

  const openScanner = useCallback(async () => {
    if (isProcessing || isCheckingDictionaries || isOpeningScanner) {
      return;
    }

    try {
      setIsOpeningScanner(true);

      if (isConnected) {
        const hasLocationPermission = await requestLocationPermission();

        if (!hasLocationPermission) {
          setIsOpeningScanner(false);
          showLocationRequiredError();
          return;
        }
      }

      if (hasRequiredDictionaries()) {
        showScannerWithShiftInfo();
        return;
      }

      pendingOpenScannerRef.current = true;

      await reloadLocalData();

      const accessToken = await getValidAccessToken();

      const dictionariesReady =
        await ensureScannerDictionariesReady(accessToken);

      if (!dictionariesReady) {
        pendingOpenScannerRef.current = false;
        setIsOpeningScanner(false);
        return;
      }

      if (hasRequiredDictionaries()) {
        pendingOpenScannerRef.current = false;
        showScannerWithShiftInfo();
      }
    } catch (error) {
      console.error("Open scanner error:", error);
      pendingOpenScannerRef.current = false;
      setIsOpeningScanner(false);
      showError("Не удалось открыть сканер");
    }
  }, [
    isProcessing,
    isCheckingDictionaries,
    isOpeningScanner,
    isConnected,
    hasRequiredDictionaries,
    showScannerWithShiftInfo,
    requestLocationPermission,
    reloadLocalData,
    getValidAccessToken,
    ensureScannerDictionariesReady,
    showError,
    showLocationRequiredError,
  ]);

  const closeScanner = useCallback(() => setIsScannerVisible(false), []);

  useEffect(() => {
    if (isScannerVisible) {
      setIsProcessing(false);
    } else {
      setIsProcessing(false);
    }
  }, [isScannerVisible]);

  useEffect(() => {
    if (!pendingOpenScannerRef.current) {
      return;
    }

    if (!hasRequiredDictionaries()) {
      return;
    }

    pendingOpenScannerRef.current = false;

    requestAnimationFrame(() => {
      showScannerWithShiftInfo();
    });
  }, [hasRequiredDictionaries, showScannerWithShiftInfo]);

  return {
    isScannerVisible,
    isOpeningScanner,
    isGettingLocation,
    isProcessing,
    currentShift,
    isCheckingDictionaries,
    pendingScanConfirmation,
    handleCodeScanned,
    confirmPendingScan,
    cancelPendingScan,
    setPendingScanShiftType,
    openScanner,
    closeScanner,
    getShiftType,
    getDisplayShift,
  };
};
