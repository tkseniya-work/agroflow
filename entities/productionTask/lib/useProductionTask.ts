import { useCallback, useEffect, useMemo, useState } from "react";
import { useNetworkStatus } from "../../../shared/lib/useNetworkStatus";
import { SeasonRequest } from "../../season/model/season.interface";
import { ProductionTask } from "../model/productionTask.types";
import { useProductionTasks } from "./useProductionTasks";

type UseProductionTaskParams = {
  season: SeasonRequest | null;
};

export const useProductionTask = ({ season }: UseProductionTaskParams) => {
  const { isConnected } = useNetworkStatus();
  const [productionTaskError, setProductionTaskError] = useState<unknown>(null);
  const {
    productionTasks: loadedProductionTasks,
    isLoadingTask,
    loadTasks,
  } = useProductionTasks({
    season,
    status: [1],
    autoLoad: false,
  });

  const productionTasks = useMemo(
    () =>
      loadedProductionTasks.filter(
        (task: ProductionTask) => task.task_type.id === 1 && task.status.id === 1,
      ),
    [loadedProductionTasks],
  );

  const loadProductionTasks = useCallback(async () => {
    if (!season) {
      return;
    }

    try {
      setProductionTaskError(null);

      if (!isConnected) {
        setProductionTaskError("Нет подключения к интернету");
        return;
      }

      await loadTasks();
    } catch (e) {
      setProductionTaskError(e);
    }
  }, [isConnected, loadTasks, season]);

  useEffect(() => {
    if (!season || !isConnected) return;

    loadProductionTasks();
  }, [season, isConnected]);

  return {
    productionTasks,
    loadingProductionTasks: isLoadingTask,
    productionTaskError,
    loadProductionTasks,
  };
};
