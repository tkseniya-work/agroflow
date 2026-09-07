import { useCallback } from "react";
import { DataSyncService } from "../model/dataSync.types";
import { useSyncOperations } from "./useSyncOperations";
import { useSyncState } from "./useSyncState";

export const useDataSyncService = (): DataSyncService => {
  const syncState = useSyncState();
  const { syncOperations, clearOperations } = useSyncOperations();

  const clearAllData = useCallback(async (): Promise<boolean> => {
    try {
      await clearOperations.technique();
      await clearOperations.agriculturalMachinery();
      await clearOperations.productionWorkPlaces();
      await clearOperations.workStandard();
      await clearOperations.productionTask();
      await clearOperations.unitOfMeasure();
      await clearOperations.allProductionShift();
      await clearOperations.settingsProductionShift();
      await clearOperations.tariffsList();
      return true;
    } catch (err) {
      syncState.setSyncError(err, "clear all data");
      return false;
    }
  }, [clearOperations, syncState]);

  const clearOfflineShiftQueue = useCallback(async (): Promise<void> => {
    await clearOperations.openProductionShift();
    await clearOperations.closeProductionShift();
  }, [clearOperations]);

  const syncAllData = useCallback(
    async (
      accessToken: string,
      userId: string,
      startDate: string,
      endDate: string,
    ): Promise<boolean> => {
      syncState.startSync();

      try {
        const syncFunctions = [
          () => syncOperations.technique(accessToken),
          () => syncOperations.agriculturalMachinery(accessToken),
          () => syncOperations.productionWorkPlaces(accessToken),
          () => syncOperations.workStandard(accessToken),
          () => syncOperations.unitOfMeasure(accessToken),
          //() => syncOperations.productionShiftByDate(accessToken, userId, startDate, endDate),
          () => syncOperations.settingsProductionShift(accessToken),
          () => syncOperations.tariffsList(accessToken),
        ];

        for (let i = 0; i < syncFunctions.length; i++) {
          await syncFunctions[i]();
          syncState.updateProgress(i + 1, syncFunctions.length);
        }

        syncState.completeSync(true);
        return true;
      } catch (err) {
        syncState.setSyncError(err, "full sync");
        syncState.completeSync(false);
        return false;
      }
    },
    [syncOperations, syncState],
  );

  const smartSyncAllData = useCallback(
    async (
      accessToken: string,
      userId: string,
      startDate: string,
      endDate: string,
    ): Promise<boolean> => {
      syncState.startSync();

      try {
        // Шаг 1: Очистка
        const isCleared = await clearAllData();

        if (!isCleared) {
          syncState.completeSync(false);
          return false;
        }

        // Шаг 2: Синхронизация
        const syncFunctions = [
          () => syncOperations.technique(accessToken),
          () => syncOperations.agriculturalMachinery(accessToken),
          () => syncOperations.productionWorkPlaces(accessToken),
          () => syncOperations.workStandard(accessToken),
          () => syncOperations.unitOfMeasure(accessToken),
          () => syncOperations.productionShiftByDate(accessToken, userId, startDate, endDate),
          () => syncOperations.settingsProductionShift(accessToken),
          () => syncOperations.tariffsList(accessToken),
        ];
        const totalSteps = syncFunctions.length + 1;

        syncState.updateProgress(1, totalSteps);

        for (let i = 0; i < syncFunctions.length; i++) {
          await syncFunctions[i]();
          syncState.updateProgress(i + 2, totalSteps);
        }

        syncState.completeSync(true);
        return true;
      } catch (err) {
        syncState.setSyncError(err, "smart sync");
        syncState.completeSync(false);
        return false;
      }
    },
    [syncOperations, clearAllData, syncState],
  );

  const smartSyncAllDictionaries = useCallback(
    async (accessToken: string | null): Promise<boolean> => {
      syncState.startSync();

      try {
        if (!accessToken) {
          syncState.setSyncError(
            new Error("Access token is required for dictionary sync"),
            "smart dictionary sync",
          );
          syncState.completeSync(false);
          return false;
        }

        // Справочники обновляются через upsert. Не очищаем локальную базу
        // заранее: при частичной ошибке должны сохраниться офлайн-данные.
        const syncFunctions = [
          () => syncOperations.technique(accessToken),
          () => syncOperations.agriculturalMachinery(accessToken),
          () => syncOperations.productionWorkPlaces(accessToken),
          () => syncOperations.workStandard(accessToken),
          () => syncOperations.unitOfMeasure(accessToken),
          () => syncOperations.settingsProductionShift(accessToken),
          () => syncOperations.tariffsList(accessToken),
        ];
        const totalSteps = syncFunctions.length;

        for (let i = 0; i < syncFunctions.length; i++) {
          await syncFunctions[i]();
          syncState.updateProgress(i + 1, totalSteps);
        }

        syncState.completeSync(true);
        return true;
      } catch (err) {
        syncState.setSyncError(err, "smart sync");
        syncState.completeSync(false);
        return false;
      }
    },
    [syncOperations, syncState],
  );

  return {
    syncAllData,
    smartSyncAllData,
    smartSyncAllDictionaries,
    syncEmployeeData: syncOperations.employee,
    syncCompanyData: syncOperations.company,
    syncTechniqueData: syncOperations.technique,
    syncAgriculturalMachineryData: syncOperations.agriculturalMachinery,
    syncProductionWorkPlacesData: syncOperations.productionWorkPlaces,
    syncWorkStandardData: syncOperations.workStandard,
    syncProductionTaskData: syncOperations.productionTask,
    syncUnitOfMeasureData: syncOperations.unitOfMeasure,
    syncProductionShiftData: syncOperations.productionShift,
    syncSettingsProductionShiftData: syncOperations.settingsProductionShift,
    syncTariffsList: syncOperations.tariffsList,

    clearAllData,
    clearOfflineShiftQueue,
    clearEmployeeData: clearOperations.employee,
    clearCompanyData: clearOperations.company,
    clearTechniqueData: clearOperations.technique,
    clearAgriculturalMachineryData: clearOperations.agriculturalMachinery,
    clearProductionWorkPlacesData: clearOperations.productionWorkPlaces,
    clearWorkStandardData: clearOperations.workStandard,
    clearProductionTaskData: clearOperations.productionTask,
    clearUnitOfMeasureData: clearOperations.unitOfMeasure,
    clearProductionShiftData: clearOperations.productionShift,
    clearAllProductionShiftData: clearOperations.allProductionShift,
    clearSettingsProductionShiftData: clearOperations.settingsProductionShift,
    clearTariffsListData: clearOperations.tariffsList,

    ...syncState,
  };
};
