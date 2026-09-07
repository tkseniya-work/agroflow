import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  CreateFieldProductionTaskRequest,
  CreateProductionTaskFieldRequest,
  CreateProductionTransportationTaskFieldRequest,
  CreateStationaryProductionTaskRequest,
  CreateTransportationProductionTaskRequest,
  CreateTransportProductionTaskRequest,
  CurrentFieldTaskAnalyticRequest,
  CurrentFieldTaskRequest,
  CurrentTransportTaskAnalyticRequest,
  CurrentTransportTaskRequest,
  CurrentTransportationTaskAnalyticRequest,
  CurrentTransportationTaskRequest,
  DeleteProductionFieldTaskTechniqueRequest,
  DeleteProductionTaskRequest,
  DeleteProductionTaskConsumableRequest,
  DeleteProductionTaskFieldRequest,
  DeleteProductionTaskPartsRequest,
  EditPartsMaterialQuantityRequest,
  FieldTaskByIdRequest,
  MoveProductionFieldTaskTechniqueRequest,
  ProductionFieldTaskGroupedPartsRequest,
  ProductionFieldTaskTechniqueRequest,
  ProductionShiftPartRequest,
  ProductionShiftPartsBatchRequest,
  ProductionTaskConsumableRequest,
  ProductionTaskEvaluationRequest,
  ProductionTaskPageResponse,
  ProductionTaskPartsRequest,
  ProductionTaskShiftForceLoadPreviewRequest,
  ProductionTransportationTaskEvaluationRequest,
  SeasonFieldWorksRequest,
  SowingUnitCodeRequest,
  UpdateProductionTransportationTaskFieldRequest,
  UpdateProductionTaskRequest,
  UpdateProductionTaskStatusRequest,
  UpdateStationaryProductionTaskRequest,
} from "../api/productionTaskActions.types";
import { ProductionTask } from "../model/productionTask.types";
import { UpdateProductionShiftPartRequest } from "../../productionShift/model/productionShift.interface";

import { SeasonRequest } from "../../season/model/season.interface";
import { useProductionTaskActions } from "./useProductionTaskActions";
import { useAuth } from "../../auth/lib/useAuth";
import { useNetworkStatus } from "../../../shared/lib/useNetworkStatus";

export type UseProductionTasksParams = {
  season?: SeasonRequest | null;
  status: number[];
  autoLoad?: boolean;
  paginated?: boolean;
  pageSize?: number;
};

export type ProductionTaskPageFilters = {
  search: string;
  taskTypes: number[];
};

const EMPTY_GROUPED_TASKS = {
  field: [],
  transport: [],
  stationary: [],
  transportation: [],
};

const isProductionTaskPageResponse = (
  data: ProductionTaskPageResponse | ProductionTask[] | null,
): data is ProductionTaskPageResponse =>
  Boolean(data && !Array.isArray(data) && Array.isArray(data.data));

export const useProductionTasks = ({
  season,
  status,
  autoLoad = true,
  paginated = false,
  pageSize = 10,
}: UseProductionTasksParams) => {
  const { getValidAccessToken } = useAuth();
  const { isConnected } = useNetworkStatus();

  const {
    createFieldProductionTask,
    createProductionFieldTaskTechnique,
    createProductionShiftPart,
    createProductionShiftPartsBatch,
    createProductionTaskField,
    createProductionTransportTaskTechnique,
    createProductionTransportationTaskField,
    createProductionTransportationTaskTechnique,
    createStationaryProductionTask,
    createTransportationProductionTask,
    createTransportProductionTask,
    deleteProductionFieldTaskTechnique,
    deleteProductionTask,
    deleteProductionTaskConsumable,
    deleteProductionTaskField,
    deleteProductionTaskParts,
    deleteProductionTransportTaskTechnique,
    deleteProductionTransportationTaskField,
    deleteProductionTransportationTaskTechnique,
    editPartsMaterialQuantity,
    editProductionShiftPart,
    loadCurrentFieldTask,
    loadCurrentFieldTaskAnalytic,
    loadCurrentTransportTask,
    loadCurrentTransportTaskAnalytic,
    loadCurrentTransportationTask,
    loadCurrentTransportationTaskAnalytic,
    loadFieldTaskById,
    loadProductionFieldTaskGroupedParts,
    loadProductionStationaryTaskGroupedParts,
    loadProductionTaskEvaluation,
    loadProductionTaskPage: loadProductionTaskPageData,
    loadProductionTaskParts,
    loadProductionTasks: loadProductionTaskData,
    loadProductionTaskShiftForceLoadPreview,
    loadProductionTransportTaskGroupedParts,
    loadProductionTransportationTaskEvaluation,
    loadProductionTransportationTaskGroupedParts,
    loadSeasonFieldWorks,
    loadSowingUnitCodes,
    moveTechniqueToNewTaskProductionFieldTask,
    saveProductionTaskConsumable,
    updateProductionTask,
    updateProductionTaskStatus,
    updateProductionTransportationTaskField,
    updateStationaryProductionTask,
  } = useProductionTaskActions();

  const [productionTasks, setProductionTasks] = useState<ProductionTask[]>([]);

  const [isLoadingTask, setIsLoadingTask] = useState(false);
  const [refreshingTask, setRefreshingTask] = useState(false);
  const [isLoadingMoreTasks, setIsLoadingMoreTasks] = useState(false);
  const [hasMoreTasks, setHasMoreTasks] = useState(false);
  const taskPageFiltersRef = useRef<ProductionTaskPageFilters>({
    search: "",
    taskTypes: [1, 2, 3, 4],
  });
  const lastLoadedTaskPageRef = useRef(1);
  const taskPageRequestIdRef = useRef(0);
  const loadingMoreTasksRef = useRef(false);

  const [isCreatingTask, setIsCreatingTask] = useState(false);
  const [isUpdatingTask, setIsUpdatingTask] = useState(false);
  const [isDeletingTask, setIsDeletingTask] = useState(false);

  const [taskActionError, setTaskActionError] = useState<string | null>(null);

  const seasonYear = season?.year ?? null;

  const statusKey = useMemo(() => {
    return Array.isArray(status) ? status.join(",") : "";
  }, [status]);

  const stableStatus = useMemo(() => {
    return statusKey
      ? statusKey
          .split(",")
          .map(Number)
          .filter((item) => Number.isFinite(item))
      : [];
  }, [statusKey]);

  const isActionLoading = isCreatingTask || isUpdatingTask || isDeletingTask;

  const ensureInternetConnection = useCallback(() => {
    if (isConnected) return true;

    setTaskActionError("Нет подключения к интернету");

    return false;
  }, [isConnected]);

  const fetchTasks = useCallback(
    async (options?: {
      silent?: boolean;
      keepPreviousOnEmpty?: boolean;
      pageNumber?: number;
      append?: boolean;
      filters?: ProductionTaskPageFilters;
    }) => {
      const requestId = paginated
        ? options?.append
          ? taskPageRequestIdRef.current
          : ++taskPageRequestIdRef.current
        : 0;

      try {
        if (!seasonYear) {
          setProductionTasks((prev) => (prev.length === 0 ? prev : []));
          return [];
        }

        if (!options?.silent) {
          setIsLoadingTask(true);
        }

        const accessToken = await getValidAccessToken();
        const pageNumber = options?.pageNumber ?? 1;
        const filters = options?.filters ?? taskPageFiltersRef.current;
        const data = paginated
          ? ((await loadProductionTaskPageData({
              accessToken,
              season: seasonYear,
              status: stableStatus,
              pageNumber,
              pageSize,
              taskTypes: filters.taskTypes,
              search: filters.search,
            })) as ProductionTaskPageResponse | null)
          : ((await loadProductionTaskData({
              accessToken,
              season: seasonYear,
              status: stableStatus,
            })) as ProductionTask[] | null);

        const nextTasks = paginated
          ? isProductionTaskPageResponse(data)
            ? data.data
            : []
          : Array.isArray(data)
            ? data
            : [];

        if (paginated && requestId !== taskPageRequestIdRef.current) {
          return [];
        }

        if (options?.keepPreviousOnEmpty && nextTasks.length === 0) {
          return nextTasks;
        }

        if (paginated) {
          const totalPages = isProductionTaskPageResponse(data)
            ? Number(data.total_pages ?? 0)
            : 0;
          const responsePage = isProductionTaskPageResponse(data)
            ? Number(data.page_number ?? pageNumber)
            : pageNumber;

          lastLoadedTaskPageRef.current = responsePage;
          setHasMoreTasks(totalPages > 0 && responsePage < totalPages);
        }

        setProductionTasks((previousTasks) => {
          if (!options?.append) {
            return nextTasks;
          }

          const tasksById = new Map(
            previousTasks.map((task) => [String(task.id), task]),
          );

          nextTasks.forEach((task: ProductionTask) => {
            tasksById.set(String(task.id), task);
          });

          return Array.from(tasksById.values());
        });

        return nextTasks;
      } catch (error) {
        console.error("loadProductionTasks error", error);
        return [];
      } finally {
        if (
          !options?.silent &&
          (!paginated || requestId === taskPageRequestIdRef.current)
        ) {
          setIsLoadingTask(false);
        }
      }
    },
    [
      seasonYear,
      stableStatus,
      getValidAccessToken,
      loadProductionTaskData,
      loadProductionTaskPageData,
      pageSize,
      paginated,
    ],
  );

  const loadTasks = useCallback(async () => {
    return fetchTasks();
  }, [fetchTasks]);

  const refreshTasks = useCallback(
    async (options?: { keepPreviousOnEmpty?: boolean }) => {
      try {
        setRefreshingTask(true);

        return await fetchTasks({
          silent: true,
          keepPreviousOnEmpty: options?.keepPreviousOnEmpty,
        });
      } catch (error) {
        console.error("refreshProductionTasks error", error);
        return [];
      } finally {
        setRefreshingTask(false);
      }
    },
    [fetchTasks],
  );

  const loadMoreTasks = useCallback(async () => {
    if (
      !paginated ||
      !hasMoreTasks ||
      isLoadingTask ||
      refreshingTask ||
      isLoadingMoreTasks ||
      loadingMoreTasksRef.current
    ) {
      return [];
    }

    const nextPage = lastLoadedTaskPageRef.current + 1;

    try {
      loadingMoreTasksRef.current = true;
      setIsLoadingMoreTasks(true);

      return await fetchTasks({
        pageNumber: nextPage,
        append: true,
        silent: true,
      });
    } finally {
      loadingMoreTasksRef.current = false;
      setIsLoadingMoreTasks(false);
    }
  }, [
    fetchTasks,
    hasMoreTasks,
    isLoadingMoreTasks,
    isLoadingTask,
    paginated,
    refreshingTask,
  ]);

  const applyTaskPageFilters = useCallback(
    async (filters: ProductionTaskPageFilters) => {
      if (!paginated) return [];

      const normalizedFilters = {
        search: filters.search.trim(),
        taskTypes: filters.taskTypes,
      };
      const currentFilters = taskPageFiltersRef.current;
      const filtersUnchanged =
        currentFilters.search === normalizedFilters.search &&
        currentFilters.taskTypes.join(",") ===
          normalizedFilters.taskTypes.join(",");

      if (filtersUnchanged) {
        return [];
      }

      taskPageFiltersRef.current = normalizedFilters;
      lastLoadedTaskPageRef.current = 1;
      setHasMoreTasks(false);

      try {
        setIsLoadingMoreTasks(true);

        return await fetchTasks({
          pageNumber: 1,
          filters: normalizedFilters,
          silent: true,
        });
      } finally {
        setIsLoadingMoreTasks(false);
      }
    },
    [fetchTasks, paginated],
  );

  const createStationaryTask = useCallback(
    async (task: CreateStationaryProductionTaskRequest) => {
      try {
        setTaskActionError(null);
        if (!ensureInternetConnection()) return false;

        setIsCreatingTask(true);

        const isSuccess = await createStationaryProductionTask(task);

        if (!isSuccess) {
          setTaskActionError("Не удалось создать стационарное задание");
          return false;
        }

        await refreshTasks();

        return true;
      } catch (error) {
        console.error("createStationaryTask error", error);

        setTaskActionError("Не удалось создать стационарное задание");

        return false;
      } finally {
        setIsCreatingTask(false);
      }
    },
    [createStationaryProductionTask, ensureInternetConnection, refreshTasks],
  );

  const updateStationaryTask = useCallback(
    async (task: UpdateStationaryProductionTaskRequest) => {
      try {
        setTaskActionError(null);
        if (!ensureInternetConnection()) return false;

        setIsUpdatingTask(true);

        const isSuccess = await updateStationaryProductionTask(task);

        if (!isSuccess) {
          setTaskActionError("Не удалось обновить стационарное задание");
          return false;
        }

        await refreshTasks();

        return true;
      } catch (error) {
        console.error("updateStationaryTask error", error);

        setTaskActionError("Не удалось обновить стационарное задание");

        return false;
      } finally {
        setIsUpdatingTask(false);
      }
    },
    [ensureInternetConnection, refreshTasks, updateStationaryProductionTask],
  );

  const createTransportTask = useCallback(
    async (task: CreateTransportProductionTaskRequest) => {
      try {
        setTaskActionError(null);
        if (!ensureInternetConnection()) return false;

        setIsCreatingTask(true);

        const isSuccess = await createTransportProductionTask(task);

        if (!isSuccess) {
          setTaskActionError("Не удалось создать транспортное задание");
          return false;
        }

        await refreshTasks();

        return true;
      } catch (error) {
        console.error("createTransportTask error", error);

        setTaskActionError("Не удалось создать транспортное задание");

        return false;
      } finally {
        setIsCreatingTask(false);
      }
    },
    [createTransportProductionTask, ensureInternetConnection, refreshTasks],
  );

  const createFieldTask = useCallback(
    async (task: CreateFieldProductionTaskRequest) => {
      try {
        setTaskActionError(null);
        if (!ensureInternetConnection()) return false;

        setIsCreatingTask(true);

        const isSuccess = await createFieldProductionTask(task);

        if (!isSuccess) {
          setTaskActionError("Не удалось создать полевое задание");
          return false;
        }

        await refreshTasks();

        return true;
      } catch (error) {
        console.error("createFieldTask error", error);

        setTaskActionError("Не удалось создать полевое задание");

        return false;
      } finally {
        setIsCreatingTask(false);
      }
    },
    [createFieldProductionTask, ensureInternetConnection, refreshTasks],
  );

  const createTransportationTask = useCallback(
    async (task: CreateTransportationProductionTaskRequest) => {
      try {
        setTaskActionError(null);
        if (!ensureInternetConnection()) return false;

        setIsCreatingTask(true);

        const isSuccess = await createTransportationProductionTask(task);

        if (!isSuccess) {
          setTaskActionError("Не удалось создать транспортировочное задание");
          return false;
        }

        await refreshTasks();

        return true;
      } catch (error) {
        console.error("createTransportationTask error", error);

        setTaskActionError("Не удалось создать транспортировочное задание");

        return false;
      } finally {
        setIsCreatingTask(false);
      }
    },
    [
      createTransportationProductionTask,
      ensureInternetConnection,
      refreshTasks,
    ],
  );

  const updateAllProductionTask = useCallback(
    async (task: UpdateProductionTaskRequest) => {
      try {
        setTaskActionError(null);
        if (!ensureInternetConnection()) return false;

        setIsUpdatingTask(true);

        const isSuccess = await updateProductionTask(task);

        if (!isSuccess) {
          setTaskActionError("Не удалось обновить транспортное задание");
          return false;
        }

        await refreshTasks();

        return true;
      } catch (error) {
        console.error("updateTransportTask error", error);

        setTaskActionError("Не удалось обновить транспортное задание");

        return false;
      } finally {
        setIsUpdatingTask(false);
      }
    },
    [ensureInternetConnection, refreshTasks, updateProductionTask],
  );

  const deleteTask = useCallback(
    async (task: DeleteProductionTaskRequest) => {
      try {
        setTaskActionError(null);
        if (!ensureInternetConnection()) return false;

        setIsDeletingTask(true);

        const isDeleted = await deleteProductionTask(task);

        if (!isDeleted) {
          setTaskActionError("Не удалось удалить задание");

          return false;
        }

        const deletedId =
          (task as any).productionTaskId ||
          (task as any).taskId ||
          (task as any).id;

        if (deletedId) {
          setProductionTasks((prev) =>
            prev.filter((item) => item.id !== deletedId),
          );
        }

        await refreshTasks({ keepPreviousOnEmpty: true });

        return true;
      } catch (error) {
        console.error("deleteTask error", error);

        setTaskActionError("Не удалось удалить задание");

        return false;
      } finally {
        setIsDeletingTask(false);
      }
    },
    [deleteProductionTask, ensureInternetConnection, refreshTasks],
  );

  const runTaskMutation = useCallback(
    async <TRequest,>(
      request: TRequest,
      action: (request: TRequest) => Promise<boolean>,
      errorMessage: string,
      options?: { refresh?: boolean },
    ) => {
      try {
        setTaskActionError(null);
        if (!ensureInternetConnection()) return false;

        setIsUpdatingTask(true);

        const isSuccess = await action(request);

        if (!isSuccess) {
          setTaskActionError(errorMessage);

          return false;
        }

        if (options?.refresh) {
          await refreshTasks({ keepPreviousOnEmpty: true });
        }

        return true;
      } catch (error) {
        console.error(errorMessage, error);

        setTaskActionError(errorMessage);

        return false;
      } finally {
        setIsUpdatingTask(false);
      }
    },
    [ensureInternetConnection, refreshTasks],
  );

  const updateTaskStatus = useCallback(
    async (task: UpdateProductionTaskStatusRequest) =>
      runTaskMutation(
        task,
        updateProductionTaskStatus,
        "Не удалось обновить статус задания",
        { refresh: true },
      ),
    [runTaskMutation, updateProductionTaskStatus],
  );

  const getFieldTaskById = useCallback(
    async (request: FieldTaskByIdRequest) => loadFieldTaskById(request),
    [loadFieldTaskById],
  );

  const addProductionTaskField = useCallback(
    async (request: CreateProductionTaskFieldRequest) =>
      runTaskMutation(
        request,
        createProductionTaskField,
        "Не удалось добавить поле в задание",
      ),
    [createProductionTaskField, runTaskMutation],
  );

  const removeProductionTaskField = useCallback(
    async (request: DeleteProductionTaskFieldRequest) =>
      runTaskMutation(
        request,
        deleteProductionTaskField,
        "Не удалось удалить поле из задания",
      ),
    [deleteProductionTaskField, runTaskMutation],
  );

  const addProductionTransportationTaskField = useCallback(
    async (request: CreateProductionTransportationTaskFieldRequest) =>
      runTaskMutation(
        request,
        createProductionTransportationTaskField,
        "Не удалось добавить поле в задание транспортировки",
      ),
    [createProductionTransportationTaskField, runTaskMutation],
  );

  const removeProductionTransportationTaskField = useCallback(
    async (request: DeleteProductionTaskFieldRequest) =>
      runTaskMutation(
        request,
        deleteProductionTransportationTaskField,
        "Не удалось удалить поле из задания транспортировки",
      ),
    [deleteProductionTransportationTaskField, runTaskMutation],
  );

  const updateTransportationTaskFieldWork = useCallback(
    async (request: UpdateProductionTransportationTaskFieldRequest) =>
      runTaskMutation(
        request,
        updateProductionTransportationTaskField,
        "Не удалось обновить плановую работу поля",
      ),
    [runTaskMutation, updateProductionTransportationTaskField],
  );

  const addProductionFieldTaskTechnique = useCallback(
    async (request: ProductionFieldTaskTechniqueRequest) =>
      runTaskMutation(
        request,
        createProductionFieldTaskTechnique,
        "Не удалось добавить технику в задание",
      ),
    [createProductionFieldTaskTechnique, runTaskMutation],
  );

  const addProductionTransportTaskTechnique = useCallback(
    async (request: ProductionFieldTaskTechniqueRequest) =>
      runTaskMutation(
        request,
        createProductionTransportTaskTechnique,
        "Не удалось добавить технику в транспортное задание",
      ),
    [createProductionTransportTaskTechnique, runTaskMutation],
  );

  const addProductionTransportationTaskTechnique = useCallback(
    async (request: ProductionFieldTaskTechniqueRequest) =>
      runTaskMutation(
        request,
        createProductionTransportationTaskTechnique,
        "Не удалось добавить технику в задание транспортировки",
      ),
    [createProductionTransportationTaskTechnique, runTaskMutation],
  );

  const moveProductionFieldTaskTechnique = useCallback(
    async (request: MoveProductionFieldTaskTechniqueRequest) =>
      runTaskMutation(
        request,
        moveTechniqueToNewTaskProductionFieldTask,
        "Не удалось перенести технику в новое задание",
      ),
    [moveTechniqueToNewTaskProductionFieldTask, runTaskMutation],
  );

  const removeProductionFieldTaskTechnique = useCallback(
    async (request: DeleteProductionFieldTaskTechniqueRequest) =>
      runTaskMutation(
        request,
        deleteProductionFieldTaskTechnique,
        "Не удалось удалить технику из задания",
      ),
    [deleteProductionFieldTaskTechnique, runTaskMutation],
  );

  const removeProductionTransportTaskTechnique = useCallback(
    async (request: DeleteProductionFieldTaskTechniqueRequest) =>
      runTaskMutation(
        request,
        deleteProductionTransportTaskTechnique,
        "Не удалось удалить технику из транспортного задания",
      ),
    [deleteProductionTransportTaskTechnique, runTaskMutation],
  );

  const removeProductionTransportationTaskTechnique = useCallback(
    async (request: DeleteProductionFieldTaskTechniqueRequest) =>
      runTaskMutation(
        request,
        deleteProductionTransportationTaskTechnique,
        "Не удалось удалить технику из задания транспортировки",
      ),
    [deleteProductionTransportationTaskTechnique, runTaskMutation],
  );

  const saveTaskConsumable = useCallback(
    async (request: ProductionTaskConsumableRequest) =>
      runTaskMutation(
        request,
        saveProductionTaskConsumable,
        "Не удалось сохранить материал задания",
      ),
    [runTaskMutation, saveProductionTaskConsumable],
  );

  const removeTaskConsumable = useCallback(
    async (request: DeleteProductionTaskConsumableRequest) =>
      runTaskMutation(
        request,
        deleteProductionTaskConsumable,
        "Не удалось удалить материал задания",
    ),
    [deleteProductionTaskConsumable, runTaskMutation],
  );

  const getSeasonFieldWorks = useCallback(
    async (request: SeasonFieldWorksRequest) => loadSeasonFieldWorks(request),
    [loadSeasonFieldWorks],
  );

  const getSowingUnitCodes = useCallback(
    async (request: SowingUnitCodeRequest) => loadSowingUnitCodes(request),
    [loadSowingUnitCodes],
  );

  const getCurrentFieldTask = useCallback(
    async (request: CurrentFieldTaskRequest) => loadCurrentFieldTask(request),
    [loadCurrentFieldTask],
  );

  const getCurrentFieldTaskAnalytic = useCallback(
    async (request: CurrentFieldTaskAnalyticRequest) =>
      loadCurrentFieldTaskAnalytic(request),
    [loadCurrentFieldTaskAnalytic],
  );

  const getCurrentTransportTask = useCallback(
    async (request: CurrentTransportTaskRequest) =>
      loadCurrentTransportTask(request),
    [loadCurrentTransportTask],
  );

  const getCurrentTransportTaskAnalytic = useCallback(
    async (request: CurrentTransportTaskAnalyticRequest) =>
      loadCurrentTransportTaskAnalytic(request),
    [loadCurrentTransportTaskAnalytic],
  );

  const getCurrentTransportationTask = useCallback(
    async (request: CurrentTransportationTaskRequest) =>
      loadCurrentTransportationTask(request),
    [loadCurrentTransportationTask],
  );

  const getCurrentTransportationTaskAnalytic = useCallback(
    async (request: CurrentTransportationTaskAnalyticRequest) =>
      loadCurrentTransportationTaskAnalytic(request),
    [loadCurrentTransportationTaskAnalytic],
  );

  const getProductionTaskEvaluation = useCallback(
    async (request: ProductionTaskEvaluationRequest) =>
      loadProductionTaskEvaluation(request),
    [loadProductionTaskEvaluation],
  );

  const getProductionTransportationTaskEvaluation = useCallback(
    async (request: ProductionTransportationTaskEvaluationRequest) =>
      loadProductionTransportationTaskEvaluation(request),
    [loadProductionTransportationTaskEvaluation],
  );

  const getProductionTaskParts = useCallback(
    async (request: ProductionTaskPartsRequest) =>
      loadProductionTaskParts(request),
    [loadProductionTaskParts],
  );

  const getProductionFieldTaskGroupedParts = useCallback(
    async (request: ProductionFieldTaskGroupedPartsRequest) =>
      loadProductionFieldTaskGroupedParts(request),
    [loadProductionFieldTaskGroupedParts],
  );

  const getProductionTransportTaskGroupedParts = useCallback(
    async (request: ProductionFieldTaskGroupedPartsRequest) =>
      loadProductionTransportTaskGroupedParts(request),
    [loadProductionTransportTaskGroupedParts],
  );

  const getProductionTransportationTaskGroupedParts = useCallback(
    async (request: ProductionFieldTaskGroupedPartsRequest) =>
      loadProductionTransportationTaskGroupedParts(request),
    [loadProductionTransportationTaskGroupedParts],
  );

  const getProductionStationaryTaskGroupedParts = useCallback(
    async (request: ProductionFieldTaskGroupedPartsRequest) =>
      loadProductionStationaryTaskGroupedParts(request),
    [loadProductionStationaryTaskGroupedParts],
  );

  const updateShiftPart = useCallback(
    async (request: UpdateProductionShiftPartRequest) =>
      runTaskMutation(
        request,
        editProductionShiftPart,
        "Не удалось обновить часть смены",
    ),
    [editProductionShiftPart, runTaskMutation],
  );

  const createShiftPart = useCallback(
    async (request: ProductionShiftPartRequest) =>
      runTaskMutation(
        request,
        createProductionShiftPart,
        "Не удалось создать часть смены",
      ),
    [createProductionShiftPart, runTaskMutation],
  );

  const updatePartsMaterialQuantity = useCallback(
    async (request: EditPartsMaterialQuantityRequest) =>
      runTaskMutation(
        request,
        editPartsMaterialQuantity,
        "Не удалось обновить количество материала",
      ),
    [editPartsMaterialQuantity, runTaskMutation],
  );

  const createShiftPartsBatch = useCallback(
    async (request: ProductionShiftPartsBatchRequest) =>
      runTaskMutation(
        request,
        createProductionShiftPartsBatch,
        "Не удалось создать части смен",
      ),
    [createProductionShiftPartsBatch, runTaskMutation],
  );

  const getTaskShiftForceLoadPreview = useCallback(
    async (request: ProductionTaskShiftForceLoadPreviewRequest) =>
      loadProductionTaskShiftForceLoadPreview(request),
    [loadProductionTaskShiftForceLoadPreview],
  );

  const removeProductionTaskParts = useCallback(
    async (request: DeleteProductionTaskPartsRequest) =>
      runTaskMutation(
        request,
        deleteProductionTaskParts,
        "Не удалось удалить часть задания",
      ),
    [deleteProductionTaskParts, runTaskMutation],
  );

  useEffect(() => {
    if (!autoLoad) return;

    loadTasks();
  }, [autoLoad, seasonYear, statusKey]);

  const groupedTasks = useMemo(() => {
    if (!Array.isArray(productionTasks) || productionTasks.length === 0) {
      return EMPTY_GROUPED_TASKS;
    }

    return {
      field: productionTasks.filter((task: any) => task?.type === "field"),

      transport: productionTasks.filter(
        (task: any) => task?.type === "transport",
      ),

      stationary: productionTasks.filter(
        (task: any) => task?.type === "stationary",
      ),

      transportation: productionTasks.filter(
        (task: any) => task?.type === "transportation",
      ),
    };
  }, [productionTasks]);

  return {
    productionTasks,
    groupedTasks,

    isLoadingTask,
    refreshingTask,
    isLoadingMoreTasks,
    hasMoreTasks,

    isCreatingTask,
    isUpdatingTask,
    isDeletingTask,
    isActionLoading,

    taskActionError,

    loadTasks,
    refreshTasks,
    loadMoreTasks,
    applyTaskPageFilters,

    createStationaryTask,
    updateStationaryTask,
    createTransportTask,
    updateAllProductionTask,
    createTransportationTask,
    createFieldTask,
    deleteTask,

    updateTaskStatus,
    getFieldTaskById,

    addProductionTaskField,
    removeProductionTaskField,
    addProductionTransportationTaskField,
    removeProductionTransportationTaskField,
    updateTransportationTaskFieldWork,

    addProductionFieldTaskTechnique,
    addProductionTransportTaskTechnique,
    addProductionTransportationTaskTechnique,
    moveProductionFieldTaskTechnique,
    removeProductionFieldTaskTechnique,
    removeProductionTransportTaskTechnique,
    removeProductionTransportationTaskTechnique,

    saveTaskConsumable,
    removeTaskConsumable,

    getSeasonFieldWorks,
    getSowingUnitCodes,
    getCurrentFieldTask,
    getCurrentFieldTaskAnalytic,
    getCurrentTransportTask,
    getCurrentTransportTaskAnalytic,
    getCurrentTransportationTask,
    getCurrentTransportationTaskAnalytic,
    getProductionTaskEvaluation,
    getProductionTransportationTaskEvaluation,
    getProductionTaskParts,
    getProductionFieldTaskGroupedParts,
    getProductionTransportTaskGroupedParts,
    getProductionTransportationTaskGroupedParts,
    getProductionStationaryTaskGroupedParts,

    createShiftPart,
    updateShiftPart,
    updatePartsMaterialQuantity,
    createShiftPartsBatch,
    getTaskShiftForceLoadPreview,
    removeProductionTaskParts,
  };
};
