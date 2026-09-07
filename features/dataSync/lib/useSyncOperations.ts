import { useCallback, useMemo } from "react";
import {
  CloseInitialPartRequest,
  CloseProductionShiftRequest,
  OpenProductionShiftRequest,
  UpdateProductionShiftPartRequest,
  UpdateProductionShiftPartTariff,
} from "../../../entities/productionShift/model/productionShift.interface";
import { dictionarySyncService } from "../../../features/dictionarySync/dictionarySync.service";
import { employeeSyncService } from "../../../entities/employee/sync/employeeSync.service";
import { localDataClearService } from "./localDataClear.service";
import { productionShiftActionsService } from "../../../entities/productionShift/api/productionShiftActions.service";
import {
  CloseProductionShiftQueuePayload,
  OpenProductionShiftQueueInput,
  productionShiftQueueService,
} from "../../../entities/productionShift/queue/productionShiftQueue.service";
import { productionShiftSyncService } from "../../../entities/productionShift/sync/productionShiftSync.service";
import { productionTaskSyncService } from "../../../entities/productionTask/sync/productionTaskSync.service";
import type { ShiftData } from "../../../entities/productionShift/model/shift.types";

const runLoggedOperation = async <T>(
  operation: () => Promise<T>,
  errorMessage: string,
) => {
  try {
    return await operation();
  } catch (err) {
    console.error(errorMessage, err);
    throw err;
  }
};

export const useSyncOperations = () => {
  const syncEmployeeData = useCallback(
    (accessToken: string, userId: string) =>
      runLoggedOperation(
        () => employeeSyncService.syncEmployee(accessToken, userId),
        "Error syncing employee data:",
      ),
    [],
  );

  const syncCompanyData = useCallback(
    (accessToken: string, companyUuid: string) =>
      runLoggedOperation(
        () => employeeSyncService.syncCompany(accessToken, companyUuid),
        "Error syncing company data:",
      ),
    [],
  );

  const syncTechniqueData = useCallback(
    (accessToken: string) =>
      runLoggedOperation(
        () => dictionarySyncService.syncTechniqueStandards(accessToken),
        "Error syncing technique data:",
      ),
    [],
  );

  const syncAgriculturalMachineryData = useCallback(
    (accessToken: string) =>
      runLoggedOperation(
        () => dictionarySyncService.syncAgriculturalMachinery(accessToken),
        "Error syncing agricultural machinery data:",
      ),
    [],
  );

  const syncProductionWorkPlacesData = useCallback(
    (accessToken: string) =>
      runLoggedOperation(
        () => dictionarySyncService.syncProductionWorkPlaces(accessToken),
        "Error syncing production work places data:",
      ),
    [],
  );

  const syncWorkStandardData = useCallback(
    (accessToken: string) =>
      runLoggedOperation(
        () => dictionarySyncService.syncWorkStandards(accessToken),
        "Error syncing work standard data:",
      ),
    [],
  );

  const syncProductionTaskData = useCallback(
    (accessToken: string, year: string) =>
      runLoggedOperation(
        () => productionTaskSyncService.syncProductionTasks(accessToken, year),
        "Error syncing production task data:",
      ),
    [],
  );

  const syncUnitOfMeasureData = useCallback(
    (accessToken: string) =>
      runLoggedOperation(
        () => dictionarySyncService.syncUnitOfMeasures(accessToken),
        "Error syncing UnitOfMeasure data:",
      ),
    [],
  );

  const syncTariffsListData = useCallback(
    (accessToken: string) =>
      runLoggedOperation(
        () => dictionarySyncService.syncTariffsList(accessToken),
        "Error syncing Tariffs List data:",
      ),
    [],
  );

  const syncProductionShiftByDate = useCallback(
    (
      accessToken: string,
      userId: string,
      startDate: string,
      endDate: string,
    ) =>
      runLoggedOperation(
        () =>
          productionShiftSyncService.loadByDate({
            accessToken,
            userId,
            startDate,
            endDate,
          }),
        "Error syncing ShiftData data:",
      ),
    [],
  );

  const syncProductionShiftData = useCallback(
    (serverData: ShiftData[]) =>
      runLoggedOperation(
        () => productionShiftSyncService.saveProcessedShifts(serverData),
        "Error syncing ShiftData data:",
      ),
    [],
  );

  const syncSettingsProductionShiftData = useCallback(
    (accessToken: string) =>
      runLoggedOperation(
        () => productionShiftSyncService.syncSettings(accessToken),
        "Error syncing ShiftData data:",
      ),
    [],
  );

  const syncOpenProductionShiftData = useCallback(
    (openData: OpenProductionShiftQueueInput) =>
      runLoggedOperation(
        () => productionShiftQueueService.addOpenShift(openData),
        "Error adding openShiftData data:",
      ),
    [],
  );

  const syncCloseProductionShiftData = useCallback(
    (closeData: CloseProductionShiftQueuePayload) =>
      runLoggedOperation(
        () => productionShiftQueueService.addCloseShift(closeData),
        "Error adding closeShiftData data:",
      ),
    [],
  );

  const pushCloseProductionShiftData = useCallback(
    async (closeData: CloseProductionShiftRequest[]) => {
      try {
        for (const shift of closeData) {
          const result = await productionShiftActionsService.closeShift(shift);
          if (!result) {
            return false;
          }
        }
        return true;
      } catch (err) {
        console.error("Error pushing closeShiftData data:", err);
        return false;
      }
    },
    [],
  );

  const pushOpenProductionShiftData = useCallback(
    async (openData: OpenProductionShiftRequest[]) => {
      if (!openData || openData.length === 0) return true;

      try {
        for (const shift of openData) {
          const result = await productionShiftActionsService.openShift(shift);
          if (!result) {
            return false;
          }
        }
        return true;
      } catch (err) {
        console.error("Error pushing openShiftData data:", err);
        throw err;
      }
    },
    [],
  );

  const openProductionShiftData = useCallback(
    async (openData: OpenProductionShiftRequest) => {
      try {
        const result = await productionShiftActionsService.openShift(openData);
        if (!result) {
          return null;
        }
        return result;
      } catch (err) {
        console.error("Error pushing openShiftData data:", err);
        throw err;
      }
    },
    [],
  );

  const putProductionShiftPartData = useCallback(
    async (putData: UpdateProductionShiftPartRequest) => {
      if (!putData) return true;

      try {
        const result = await productionShiftActionsService.updatePart(putData);
        if (!result) {
          return false;
        }

        return true;
      } catch (err) {
        console.error("Error putting production shift part data:", err);
        return false;
      }
    },
    [],
  );

  const putProductionShiftPartTariffData = useCallback(
    async (putData: UpdateProductionShiftPartTariff) => {
      if (!putData) return true;

      try {
        const result =
          await productionShiftActionsService.updatePartTariff(putData);
        if (!result) {
          return false;
        }
        return true;
      } catch (err) {
        console.error("Error putting production shift part tariff data:", err);
        return false;
      }
    },
    [],
  );

  const postCloseInitialPartRequestData = useCallback(
    async (postData: CloseInitialPartRequest) => {
      if (!postData) return true;

      try {
        const result =
          await productionShiftActionsService.closeInitialPart(postData);
        if (!result) {
          return null;
        }
        return result;
      } catch (err) {
        console.error("Error putting production shift part tariff data:", err);
        return false;
      }
    },
    [],
  );

  // Функции очистки данных
  const clearEmployeeData = useCallback(
    () =>
      runLoggedOperation(
        localDataClearService.employee,
        "Error clearing employee data:",
      ),
    [],
  );

  const clearCompanyData = useCallback(
    () =>
      runLoggedOperation(
        localDataClearService.company,
        "Error clearing company data:",
      ),
    [],
  );

  const clearTechniqueData = useCallback(
    () =>
      runLoggedOperation(
        localDataClearService.technique,
        "Error clearing technique data:",
      ),
    [],
  );

  const clearAgriculturalMachineryData = useCallback(
    () =>
      runLoggedOperation(
        localDataClearService.agriculturalMachinery,
        "Error clearing agricultural machinery data:",
      ),
    [],
  );

  const clearProductionWorkPlacesData = useCallback(
    () =>
      runLoggedOperation(
        localDataClearService.productionWorkPlaces,
        "Error clearing production work places data:",
      ),
    [],
  );

  const clearWorkStandardData = useCallback(
    () =>
      runLoggedOperation(
        localDataClearService.workStandard,
        "Error clearing work standard data:",
      ),
    [],
  );

  const clearProductionTaskData = useCallback(
    () =>
      runLoggedOperation(
        localDataClearService.productionTask,
        "Error clearing production task data:",
      ),
    [],
  );

  const clearUnitOfMeasureData = useCallback(
    () =>
      runLoggedOperation(
        localDataClearService.unitOfMeasure,
        "Error clearing UnitOfMeasure data:",
      ),
    [],
  );

  const clearTariffsListData = useCallback(
    () =>
      runLoggedOperation(
        localDataClearService.tariffsList,
        "Error clearing Tariffs List data:",
      ),
    [],
  );

  const clearAllProductionShiftData = useCallback(
    () =>
      runLoggedOperation(
        localDataClearService.productionShift,
        "Error clearing ProductionShift data:",
      ),
    [],
  );

  const clearProductionShiftData = useCallback(
    (_shifts: ShiftData[]) =>
      runLoggedOperation(
        localDataClearService.productionShift,
        "Error clearing ProductionShift data:",
      ),
    [],
  );

  const clearSettingsProductionShiftData = useCallback(
    () =>
      runLoggedOperation(
        localDataClearService.settingsProductionShift,
        "Error clearing settings ProductionShift data:",
      ),
    [],
  );

  const clearOpenProductionShiftData = useCallback(
    () =>
      runLoggedOperation(
        localDataClearService.openProductionShift,
        "Error clearing open ProductionShift data:",
      ),
    [],
  );

  const clearCloseProductionShiftData = useCallback(
    () =>
      runLoggedOperation(
        localDataClearService.closeProductionShift,
        "Error clearing close ProductionShift data:",
      ),
    [],
  );

  const syncOperations = useMemo(
    () => ({
      employee: syncEmployeeData,
      company: syncCompanyData,
      technique: syncTechniqueData,
      agriculturalMachinery: syncAgriculturalMachineryData,
      productionWorkPlaces: syncProductionWorkPlacesData,
      workStandard: syncWorkStandardData,
      productionTask: syncProductionTaskData,
      unitOfMeasure: syncUnitOfMeasureData,
      productionShift: syncProductionShiftData,
      productionShiftByDate: syncProductionShiftByDate,
      settingsProductionShift: syncSettingsProductionShiftData,
      openProductionShift: syncOpenProductionShiftData,
      closeProductionShift: syncCloseProductionShiftData,
      tariffsList: syncTariffsListData,
    }),
    [
      syncAgriculturalMachineryData,
      syncCloseProductionShiftData,
      syncCompanyData,
      syncEmployeeData,
      syncOpenProductionShiftData,
      syncProductionShiftByDate,
      syncProductionShiftData,
      syncProductionTaskData,
      syncProductionWorkPlacesData,
      syncSettingsProductionShiftData,
      syncTariffsListData,
      syncTechniqueData,
      syncUnitOfMeasureData,
      syncWorkStandardData,
    ],
  );

  const clearOperations = useMemo(
    () => ({
      employee: clearEmployeeData,
      company: clearCompanyData,
      technique: clearTechniqueData,
      agriculturalMachinery: clearAgriculturalMachineryData,
      productionWorkPlaces: clearProductionWorkPlacesData,
      workStandard: clearWorkStandardData,
      productionTask: clearProductionTaskData,
      unitOfMeasure: clearUnitOfMeasureData,
      allProductionShift: clearAllProductionShiftData,
      productionShift: clearProductionShiftData,
      settingsProductionShift: clearSettingsProductionShiftData,
      openProductionShift: clearOpenProductionShiftData,
      closeProductionShift: clearCloseProductionShiftData,
      tariffsList: clearTariffsListData,
    }),
    [
      clearAgriculturalMachineryData,
      clearAllProductionShiftData,
      clearCloseProductionShiftData,
      clearCompanyData,
      clearEmployeeData,
      clearOpenProductionShiftData,
      clearProductionShiftData,
      clearProductionTaskData,
      clearProductionWorkPlacesData,
      clearSettingsProductionShiftData,
      clearTariffsListData,
      clearTechniqueData,
      clearUnitOfMeasureData,
      clearWorkStandardData,
    ],
  );

  const push = useMemo(
    () => ({
      closeProductionShift: pushCloseProductionShiftData,
      openProductionShifts: pushOpenProductionShiftData,
      openProductionShift: openProductionShiftData,
      closeInitialPartRequest: postCloseInitialPartRequestData,
    }),
    [
      openProductionShiftData,
      postCloseInitialPartRequestData,
      pushCloseProductionShiftData,
      pushOpenProductionShiftData,
    ],
  );

  const put = useMemo(
    () => ({
      updateProductionShiftPart: putProductionShiftPartData,
      updateProductionShiftPartTariffData: putProductionShiftPartTariffData,
    }),
    [putProductionShiftPartData, putProductionShiftPartTariffData],
  );

  return {
    syncOperations,
    clearOperations,
    push,
    put,
  };
};
