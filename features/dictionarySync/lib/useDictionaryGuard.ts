import { useCallback, useMemo, useState } from "react";
import { useDatabaseBootstrap } from "../../../shared/store/databaseBootstrap";
import {
  useProductionWorkPlaces,
  useShiftSettings,
} from "../../localData/useLocalData";
import { dictionaryReadinessService } from "../dictionaryReadiness.service";
import { useAlerts } from "../../../shared/lib/useAlerts";
import { useNetworkStatus } from "../../../shared/lib/useNetworkStatus";
import { useDataSyncService } from "../../dataSync";
import { useDictionariesFreshness } from "./useDictionariesFreshness";

export const useDictionaryGuard = () => {
  const [isCheckingDictionaries, setIsCheckingDictionaries] = useState(false);

  const { isConnected } = useNetworkStatus();
  const { smartSyncAllDictionaries } = useDataSyncService();

  const { reloadLocalData } = useDatabaseBootstrap();
  const productionWorkPlaces = useProductionWorkPlaces();
  const settingsProductionShift = useShiftSettings();

  const {
    hasRequiredDictionaries,
    shouldSyncDictionaries,
    markDictionariesSynced,
  } = useDictionariesFreshness();

  const { showError, showSuccess, showConfirmation } = useAlerts();

  const missingDictionaries = useMemo(() => {
    const missing: string[] = [];

    if (productionWorkPlaces?.length === 0) {
      missing.push("рабочие места");
    }

    if (settingsProductionShift && settingsProductionShift?.length === 0) {
      missing.push("настройки смен");
    }

    return missing;
  }, [productionWorkPlaces, settingsProductionShift]);

  const syncDictionaries = useCallback(
    async (accessToken: string) => {
      if (!isConnected) {
        showError("Для загрузки справочников нужен интернет");
        return false;
      }

      setIsCheckingDictionaries(true);

      try {
        const synced = await smartSyncAllDictionaries(accessToken);

        if (!synced) {
          showError("Не удалось синхронизировать справочники");
          return false;
        }

        const reloaded = await reloadLocalData();
        const hasSavedDictionaries =
          await dictionaryReadinessService.hasRequiredScannerDictionaries();

        if (!reloaded || !hasSavedDictionaries) {
          showError(
            "Сервер не вернул обязательные справочники. Попробуйте позже",
          );
          return false;
        }

        await markDictionariesSynced();

        showSuccess("Справочники синхронизированы");
        return true;
      } catch (error) {
        console.error("Dictionary sync error:", error);
        showError("Не удалось синхронизировать справочники");
        return false;
      } finally {
        setIsCheckingDictionaries(false);
      }
    },
    [
      isConnected,
      smartSyncAllDictionaries,
      markDictionariesSynced,
      reloadLocalData,
      showError,
      showSuccess,
    ],
  );

  const ensureDictionariesReady = useCallback(
    async (accessToken: string | null): Promise<boolean> => {
      const hasDictionaries = hasRequiredDictionaries();

      if (!isConnected) {
        if (hasDictionaries) {
          return true;
        }

        showError("Для загрузки справочников нужен интернет");
        return false;
      }

      const shouldSync = await shouldSyncDictionaries();

      if (!shouldSync && hasDictionaries) {
        return true;
      }

      if (!accessToken) {
        showError("Нет токена авторизации для синхронизации");
        return false;
      }

      return new Promise((resolve) => {
        const reasonText = missingDictionaries.length
          ? `В локальной базе нет данных: ${missingDictionaries.join(", ")}.`
          : "Справочники давно не обновлялись.";

        showConfirmation(
          "Нужна синхронизация",
          `${reasonText}\n\nСинхронизировать сейчас?`,
          async () => {
            const synced = await syncDictionaries(accessToken);
            resolve(synced);
          },
          () => {
            resolve(false);
          },
        );
      });
    },
    [
      isConnected,
      hasRequiredDictionaries,
      shouldSyncDictionaries,
      missingDictionaries,
      showConfirmation,
      syncDictionaries,
      showError,
    ],
  );

  const ensureScannerDictionariesReady = useCallback(
    async (accessToken: string | null): Promise<boolean> => {
      const hasDictionaries = hasRequiredDictionaries();

      if (hasDictionaries) {
        return true;
      }

      if (!isConnected) {
        showError("Для загрузки справочников нужен интернет");
        return false;
      }

      if (!accessToken) {
        showError("Нет токена авторизации для синхронизации");
        return false;
      }

      return new Promise((resolve) => {
        const reasonText = missingDictionaries.length
          ? `В локальной базе нет данных: ${missingDictionaries.join(", ")}.`
          : "Не найдены обязательные справочники для сканера.";

        showConfirmation(
          "Нужна синхронизация",
          `${reasonText}\n\nСинхронизировать сейчас?`,
          async () => {
            const synced = await syncDictionaries(accessToken);
            resolve(synced);
          },
          () => {
            resolve(false);
          },
        );
      });
    },
    [
      isConnected,
      hasRequiredDictionaries,
      missingDictionaries,
      showConfirmation,
      syncDictionaries,
      showError,
    ],
  );

  return {
    isCheckingDictionaries,
    ensureDictionariesReady,
    ensureScannerDictionariesReady,
  };
};
