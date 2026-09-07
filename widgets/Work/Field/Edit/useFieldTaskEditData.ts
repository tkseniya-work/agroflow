import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "../../../../entities/auth/lib/useAuth";
import { useNetworkStatus } from "../../../../shared/lib/useNetworkStatus";
import { useDictionaryActions } from "../../../../features/dictionarySync";
import { ProductionTaskConsumableType } from "../../../../entities/productionTask/api/productionTaskActions.types";
import { FieldProductionTaskResponse } from "../../../../entities/productionTask/model/fieldProductionTask.interface";
import { useProductionTasks } from "../../../../entities/productionTask/lib/useProductionTasks";
import {
  getSettledValue,
  normalizeFieldTaskListResponse,
  settleRequest,
} from "./fieldTaskEditData.logic";

type FieldTaskEditPayload = {
  season_field_ids?: string[];
  field_work_ids?: {
    season_field_id: string;
    production_plan_work_id: string | null;
  }[];
};

type TaskTechniquePayload = {
  production_task_id?: string;
  technique_standard_id?: string;
  agriculture_machine_standard_id?: string | null;
  technique_id?: string;
  agriculture_machine_id?: string | null;
  agricultural_machine_id?: string | null;
  task_id?: string;
  tariff_id: string;
  transfer_tariff_id?: string;
  work_speed?: number | null;
  processing_depth?: number | null;
  solute_flow_rate?: number | null;
};

type TaskFieldPayload = {
  production_task_id: string;
  season_field_id: string;
  production_plan_work_id?: string | null;
};

type MoveTaskTechniquePayload = TaskTechniquePayload;

type TaskConsumablePayload = {
  id?: string | null;
  production_task_field_id: string;
  crop_variety_standard_id?: string | null;
  pesticide_id?: string | null;
  fertilizer_id?: string | null;
  unit_code?: number | string | null;
  quantity: number;
  weight?: number | null;
};

type UseFieldTaskEditDataOptions = {
  includeDictionaries?: boolean;
};

export const useFieldTaskEditData = (
  id: string,
  options: UseFieldTaskEditDataOptions = {},
) => {
  const includeDictionaries = options.includeDictionaries ?? true;
  const { getValidAccessToken } = useAuth();
  const { isConnected } = useNetworkStatus();
  const {
    loadCropStandards,
    loadFertilizerStandards,
    loadPesticideStandards,
    loadTechniqueWithAdditionalInfo,
  } = useDictionaryActions();
  const {
    updateAllProductionTask,
    getFieldTaskById,
    getSeasonFieldWorks,
    getSowingUnitCodes,
    addProductionTaskField,
    removeProductionTaskField,
    addProductionFieldTaskTechnique,
    moveProductionFieldTaskTechnique,
    removeProductionFieldTaskTechnique,
    saveTaskConsumable,
    removeTaskConsumable,
  } = useProductionTasks({
    status: [],
    autoLoad: false,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isTechniqueDataLoading, setIsTechniqueDataLoading] = useState(false);
  const [isConsumableDataLoading, setIsConsumableDataLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const loadRequestIdRef = useRef(0);

  const [currentTask, setCurrentTask] =
    useState<FieldProductionTaskResponse | null>(null);
  const [productionFieldsList, setProductionFieldsList] = useState<any[]>([]);
  const tariffsList = useMemo<any[]>(() => [], []);
  const worksList = useMemo<any[]>(() => [], []);
  const seasons = useMemo<any[]>(() => [], []);
  const [techniqueWithAdditionalInfo, setTechniqueWithAdditionalInfo] =
    useState<any[]>([]);
  const [cropStandardsList, setCropStandardsList] = useState<any[]>([]);
  const [fertilizerStandardsList, setFertilizerStandardsList] = useState<any[]>(
    [],
  );
  const [pesticideStandardsList, setPesticideStandardsList] = useState<any[]>(
    [],
  );
  const [sowingUnitCodeList, setSowingUnitCodeList] = useState<any[]>([]);

  const loadData = useCallback(async () => {
    const requestId = ++loadRequestIdRef.current;
    const isCurrentRequest = () => loadRequestIdRef.current === requestId;

    if (!id) {
      setCurrentTask(null);
      setProductionFieldsList([]);
      setTechniqueWithAdditionalInfo([]);
      setCropStandardsList([]);
      setFertilizerStandardsList([]);
      setPesticideStandardsList([]);
      setSowingUnitCodeList([]);
      setIsTechniqueDataLoading(false);
      setIsConsumableDataLoading(false);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      setIsTechniqueDataLoading(includeDictionaries);
      setIsConsumableDataLoading(includeDictionaries);

      if (!isConnected) {
        setCurrentTask(null);
        setProductionFieldsList([]);
        setTechniqueWithAdditionalInfo([]);
        setCropStandardsList([]);
        setFertilizerStandardsList([]);
        setPesticideStandardsList([]);
        setSowingUnitCodeList([]);
        setIsTechniqueDataLoading(false);
        setIsConsumableDataLoading(false);
        setError("Нет подключения к интернету");
        return;
      }

      const accessToken = await getValidAccessToken();
      if (!isCurrentRequest()) return;

      if (!accessToken) {
        setCurrentTask(null);
        setProductionFieldsList([]);
        setTechniqueWithAdditionalInfo([]);
        setCropStandardsList([]);
        setFertilizerStandardsList([]);
        setPesticideStandardsList([]);
        setSowingUnitCodeList([]);
        setIsTechniqueDataLoading(false);
        setIsConsumableDataLoading(false);
        setError("Не удалось получить access token");
        return;
      }

      const techniqueRequest = includeDictionaries
        ? settleRequest(loadTechniqueWithAdditionalInfo(accessToken))
        : null;
      const consumableRequests = includeDictionaries
        ? Promise.all([
            settleRequest(loadCropStandards(accessToken)),
            settleRequest(loadFertilizerStandards(accessToken)),
            settleRequest(loadPesticideStandards(accessToken)),
            settleRequest(getSowingUnitCodes({ accessToken })),
          ])
        : null;

      const task = (await getFieldTaskById({
        accessToken,
        productionTaskId: id,
      })) as FieldProductionTaskResponse | null;
      if (!isCurrentRequest()) return;

      if (!task) {
        setCurrentTask(null);
        setProductionFieldsList([]);
        setError("Не удалось загрузить задание");
        setIsTechniqueDataLoading(false);
        setIsConsumableDataLoading(false);
        return;
      }

      // Основные данные показываем сразу. Справочники уже загружаются
      // параллельно и не блокируют карту и назначенные сущности.
      setCurrentTask(task);
      setProductionFieldsList(task.field_task?.task_fields ?? []);
      setIsLoading(false);

      if (!includeDictionaries) {
        setTechniqueWithAdditionalInfo([]);
        setCropStandardsList([]);
        setFertilizerStandardsList([]);
        setPesticideStandardsList([]);
        setSowingUnitCodeList([]);
        return;
      }

      const fieldWorksRequest = settleRequest(
        task.season_year && task.work_standard?.work_kind_id
          ? getSeasonFieldWorks({
              accessToken,
              season: task.season_year,
              workKind: task.work_standard.work_kind_id,
            })
          : Promise.resolve([]),
      );

      void techniqueRequest?.then((result) => {
        if (!isCurrentRequest()) return;

        if (result.status === "fulfilled") {
          setTechniqueWithAdditionalInfo(result.value ?? []);
        }
        setIsTechniqueDataLoading(false);
      });

      void consumableRequests?.then(
        ([cropResult, fertilizerResult, pesticideResult, unitResult]) => {
          if (!isCurrentRequest()) return;

          if (cropResult.status === "fulfilled") {
            setCropStandardsList(
              normalizeFieldTaskListResponse(cropResult.value),
            );
          }
          if (fertilizerResult.status === "fulfilled") {
            setFertilizerStandardsList(
              normalizeFieldTaskListResponse(fertilizerResult.value),
            );
          }
          if (pesticideResult.status === "fulfilled") {
            setPesticideStandardsList(
              normalizeFieldTaskListResponse(pesticideResult.value),
            );
          }
          if (unitResult.status === "fulfilled") {
            setSowingUnitCodeList(
              normalizeFieldTaskListResponse(unitResult.value),
            );
          }
          setIsConsumableDataLoading(false);
        },
      );

      void fieldWorksRequest.then((result) => {
        if (!isCurrentRequest()) return;

        const seasonFieldWorks = getSettledValue(result, []);
        setProductionFieldsList(
          Array.isArray(seasonFieldWorks) && seasonFieldWorks.length > 0
            ? seasonFieldWorks
            : (task.field_task?.task_fields ?? []),
        );
      });
    } catch (e) {
      if (!isCurrentRequest()) return;

      setCurrentTask(null);
      setProductionFieldsList([]);
      setTechniqueWithAdditionalInfo([]);
      setCropStandardsList([]);
      setFertilizerStandardsList([]);
      setPesticideStandardsList([]);
      setSowingUnitCodeList([]);
      setIsTechniqueDataLoading(false);
      setIsConsumableDataLoading(false);
      setError(e);
    } finally {
      if (isCurrentRequest()) {
        setIsLoading(false);
      }
    }
  }, [
    getValidAccessToken,
    getFieldTaskById,
    getSeasonFieldWorks,
    getSowingUnitCodes,
    id,
    includeDictionaries,
    isConnected,
    loadCropStandards,
    loadFertilizerStandards,
    loadPesticideStandards,
    loadTechniqueWithAdditionalInfo,
  ]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const saveTask = useCallback(
    async (payload: FieldTaskEditPayload) => {
      if (!id || !currentTask) return false;

      const accessToken = await getValidAccessToken();
      if (!accessToken) {
        setError("Не удалось получить access token");
        return false;
      }

      const success = await updateAllProductionTask({
        accessToken,
        taskId: id,
        seasonYear: currentTask.season_year,
        comment: currentTask.comment ?? "",
        dateStart: currentTask.date_start,
        seasonFieldIds: payload.season_field_ids,
        fieldWorkIds: payload.field_work_ids,
      });

      if (!success) return false;

      await loadData();
      return true;
    },
    [currentTask, getValidAccessToken, id, loadData, updateAllProductionTask]
  );

  const addTaskTechnique = useCallback(
    async (data: TaskTechniquePayload) => {
      const productionTaskId = data.production_task_id ?? data.task_id;
      const techniqueStandardId =
        data.technique_standard_id ?? data.technique_id;

      if (!productionTaskId || !techniqueStandardId || !data.transfer_tariff_id) {
        setError("Не все данные техники заполнены");
        return false;
      }

      const accessToken = await getValidAccessToken();
      if (!accessToken) {
        setError("Не удалось получить access token");
        return false;
      }

      const success = await addProductionFieldTaskTechnique({
        accessToken,
        data: {
          production_task_id: productionTaskId,
          technique_standard_id: techniqueStandardId,
          agriculture_machine_standard_id:
            data.agriculture_machine_standard_id ??
            data.agriculture_machine_id ??
            data.agricultural_machine_id ??
            undefined,
          tariff_id: data.tariff_id,
          transfer_tariff_id: data.transfer_tariff_id,
          work_speed: data.work_speed ?? undefined,
          processing_depth: data.processing_depth ?? undefined,
          solute_flow_rate: data.solute_flow_rate ?? undefined,
        },
      });

      if (!success) return false;

      await loadData();
      return true;
    },
    [addProductionFieldTaskTechnique, getValidAccessToken, loadData],
  );

  const addTaskField = useCallback(
    async (data: TaskFieldPayload) => {
      const accessToken = await getValidAccessToken();
      if (!accessToken) {
        setError("Не удалось получить access token");
        return false;
      }

      const success = await addProductionTaskField({
        accessToken,
        data,
      });

      if (!success) return false;

      await loadData();
      return true;
    },
    [addProductionTaskField, getValidAccessToken, loadData],
  );

  const removeTaskField = useCallback(
    async (taskFieldId: string) => {
      const accessToken = await getValidAccessToken();
      if (!accessToken) {
        setError("Не удалось получить access token");
        return false;
      }

      const success = await removeProductionTaskField({
        accessToken,
        id: taskFieldId,
      });

      if (!success) return false;

      await loadData();
      return true;
    },
    [getValidAccessToken, loadData, removeProductionTaskField],
  );

  const removeTaskTechnique = useCallback(
    async (techniqueTaskId: string) => {
      const accessToken = await getValidAccessToken();
      if (!accessToken) {
        setError("Не удалось получить access token");
        return false;
      }

      const success = await removeProductionFieldTaskTechnique({
        accessToken,
        id: techniqueTaskId,
      });

      if (!success) return false;

      await loadData();
      return true;
    },
    [getValidAccessToken, loadData, removeProductionFieldTaskTechnique],
  );

  const moveTechniqueToTask = useCallback(
    async (data: MoveTaskTechniquePayload) => {
      const accessToken = await getValidAccessToken();
      if (!accessToken) {
        setError("Не удалось получить access token");
        return false;
      }

      const success = await moveProductionFieldTaskTechnique({
        accessToken,
        data: {
          technique_id: data.technique_id ?? data.technique_standard_id,
          tariff_id: data.tariff_id,
          transfer_tariff_id: data.transfer_tariff_id,
          agricultural_machine_id:
            data.agricultural_machine_id ??
            data.agriculture_machine_standard_id ??
            null,
          task_id: data.task_id ?? data.production_task_id,
          work_speed: data.work_speed,
        },
      });

      if (!success) return false;

      await loadData();
      return true;
    },
    [getValidAccessToken, loadData, moveProductionFieldTaskTechnique],
  );

  const saveTaskConsumableNorm = useCallback(
    async (
      type: ProductionTaskConsumableType,
      data: TaskConsumablePayload,
    ) => {
      const accessToken = await getValidAccessToken();
      if (!accessToken) {
        setError("Не удалось получить access token");
        return false;
      }

      const success = await saveTaskConsumable({
        accessToken,
        type,
        data,
      });

      if (!success) return false;

      await loadData();
      return true;
    },
    [getValidAccessToken, loadData, saveTaskConsumable],
  );

  const removeTaskConsumableNorm = useCallback(
    async (type: ProductionTaskConsumableType, consumableId: string) => {
      const accessToken = await getValidAccessToken();
      if (!accessToken) {
        setError("Не удалось получить access token");
        return false;
      }

      const success = await removeTaskConsumable({
        accessToken,
        type,
        id: consumableId,
      });

      if (!success) return false;

      await loadData();
      return true;
    },
    [getValidAccessToken, loadData, removeTaskConsumable],
  );

  return useMemo(
    () => ({
      currentTask,
      productionFieldsList,
      tariffsList,
      worksList,
      seasons,
      techniqueWithAdditionalInfo,
      cropStandardsList,
      fertilizerStandardsList,
      pesticideStandardsList,
      sowingUnitCodeList,
      isLoading,
      isTechniqueDataLoading,
      isConsumableDataLoading,
      error,
      reload: loadData,
      saveTask,
      addTaskField,
      removeTaskField,
      addTaskTechnique,
      removeTaskTechnique,
      moveTechniqueToTask,
      saveTaskConsumableNorm,
      removeTaskConsumableNorm,
    }),
    [
      currentTask,
      productionFieldsList,
      tariffsList,
      worksList,
      seasons,
      techniqueWithAdditionalInfo,
      cropStandardsList,
      fertilizerStandardsList,
      pesticideStandardsList,
      sowingUnitCodeList,
      isLoading,
      isTechniqueDataLoading,
      isConsumableDataLoading,
      error,
      loadData,
      saveTask,
      addTaskField,
      removeTaskField,
      addTaskTechnique,
      removeTaskTechnique,
      moveTechniqueToTask,
      saveTaskConsumableNorm,
      removeTaskConsumableNorm,
    ]
  );
};
