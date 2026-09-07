import { useEffect, useMemo, useState } from "react";

import type { ProductionTask } from "../../entities/productionTask";
import type { TaskFilterType } from "../../src/utils/taskUtils";
import {
  filterTaskList,
  getServerTaskTypeIds,
  normalizeAndSortTasks,
} from "./tasksSection.logic";

type Filters = {
  search: string;
  taskTypes: number[];
};

type Options = {
  productionTasks: ProductionTask[];
  serverFiltering: boolean;
  onFiltersChange?: (filters: Filters) => void;
};

export const useTaskListFilters = ({
  productionTasks,
  serverFiltering,
  onFiltersChange,
}: Options) => {
  const [activeTaskChip, setActiveTaskChip] = useState<TaskFilterType>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const tasks = useMemo(
    () => normalizeAndSortTasks(productionTasks),
    [productionTasks],
  );

  const filteredTasks = useMemo(
    () =>
      filterTaskList({
        tasks,
        activeTaskFilter: activeTaskChip,
        searchQuery,
        serverFiltering,
      }),
    [activeTaskChip, searchQuery, serverFiltering, tasks],
  );

  useEffect(() => {
    if (!serverFiltering || !onFiltersChange) {
      return;
    }

    const delay = searchQuery ? 350 : 180;
    const timeout = setTimeout(() => {
      onFiltersChange({
        search: searchQuery,
        taskTypes: getServerTaskTypeIds(activeTaskChip),
      });
    }, delay);

    return () => clearTimeout(timeout);
  }, [activeTaskChip, onFiltersChange, searchQuery, serverFiltering]);

  return {
    activeTaskChip,
    setActiveTaskChip,
    searchQuery,
    setSearchQuery,
    filteredTasks,
  };
};
