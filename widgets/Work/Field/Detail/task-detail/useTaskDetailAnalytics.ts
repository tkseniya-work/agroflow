import { useEffect, useMemo, useRef, useState } from "react";

import type { FieldProductionTaskResponse } from "../../../../../entities/productionTask";
import { normalizeGroupedPartsResponse } from "../../../../../src/utils/taskUtils";
import { buildTaskAnalytics } from "./taskAnalytics.logic";

type Options = {
  isActive: boolean;
  currentTask: FieldProductionTaskResponse;
  fields: any[];
  getValidAccessToken: () => Promise<string | null>;
  getProductionFieldTaskGroupedParts: (data: {
    accessToken: string;
    taskId: string;
  }) => Promise<any>;
  getCurrentFieldTaskAnalytic: (data: {
    accessToken: string;
    id: string;
  }) => Promise<any>;
};

export const useTaskDetailAnalytics = ({
  isActive,
  currentTask,
  fields,
  getValidAccessToken,
  getProductionFieldTaskGroupedParts,
  getCurrentFieldTaskAnalytic,
}: Options) => {
  const loadedAnalyticsTaskIdRef = useRef<string | null>(null);
  const [currentTaskAnalytic, setCurrentTaskAnalytic] = useState<any>(null);
  const [groupedParts, setGroupedParts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setGroupedParts([]);
    setCurrentTaskAnalytic(null);
    setIsLoading(false);
    loadedAnalyticsTaskIdRef.current = null;
  }, [currentTask.id]);

  useEffect(() => {
    if (!isActive) return;
    if (loadedAnalyticsTaskIdRef.current === currentTask.id) return;

    let mounted = true;

    const loadAnalyticsData = async () => {
      if (mounted) setIsLoading(true);

      try {
        const accessToken = await getValidAccessToken();
        if (!accessToken) return;

        const [groupedPartsResponse, analyticResponse] = await Promise.all([
          getProductionFieldTaskGroupedParts({
            accessToken,
            taskId: currentTask.id,
          }),
          getCurrentFieldTaskAnalytic({
            accessToken,
            id: currentTask.id,
          }),
        ]);

        if (mounted) {
          setGroupedParts(normalizeGroupedPartsResponse(groupedPartsResponse));
          setCurrentTaskAnalytic(analyticResponse ?? null);
          loadedAnalyticsTaskIdRef.current = currentTask.id;
        }
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    void loadAnalyticsData();

    return () => {
      mounted = false;
    };
  }, [
    currentTask.id,
    getCurrentFieldTaskAnalytic,
    getProductionFieldTaskGroupedParts,
    getValidAccessToken,
    isActive,
  ]);

  const analyticByFields = useMemo(
    () =>
      buildTaskAnalytics({
        currentTask,
        currentTaskAnalytic,
        fields,
        groupedParts,
      }),
    [currentTask, currentTaskAnalytic, fields, groupedParts],
  );

  return {
    analyticByFields,
    currentTaskAnalytic,
    groupedParts,
    isLoading,
  };
};
