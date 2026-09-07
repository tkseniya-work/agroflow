import type { ProductionTask } from "../../entities/productionTask";
import type { TaskFilterType } from "../../src/utils/taskUtils";

export const TASK_TYPE_BY_FILTER: Partial<Record<TaskFilterType, number>> = {
  field: 1,
  transport: 2,
  stationary: 3,
  transportation: 4,
};

export const normalizeTaskSearchText = (value: unknown) =>
  String(value ?? "")
    .toLocaleLowerCase("ru-RU")
    .replace(/\s+/g, " ")
    .trim();

export const normalizeAndSortTasks = (
  productionTasks: ProductionTask[] = [],
): ProductionTask[] =>
  [...productionTasks]
    .map((task) => {
      const taskTypeId = task?.task_type?.id;

      return {
        ...task,
        stationary: taskTypeId === 3,
        transport: taskTypeId === 2,
        transportation: taskTypeId === 4,
      };
    })
    .sort((a, b) => {
      const dateA = a?.date_start ? new Date(a.date_start).getTime() : 0;
      const dateB = b?.date_start ? new Date(b.date_start).getTime() : 0;

      return dateB - dateA;
    });

const taskMatchesType = (task: ProductionTask, filter: TaskFilterType) => {
  const taskTypeId = task?.task_type?.id;

  if (filter === "field") {
    return taskTypeId !== 2 && taskTypeId !== 3 && taskTypeId !== 4;
  }

  const taskType = TASK_TYPE_BY_FILTER[filter];

  return taskType ? taskTypeId === taskType : true;
};

export const filterTaskList = ({
  tasks,
  activeTaskFilter,
  searchQuery,
  serverFiltering,
}: {
  tasks: ProductionTask[];
  activeTaskFilter: TaskFilterType;
  searchQuery: string;
  serverFiltering: boolean;
}) => {
  if (serverFiltering) {
    return tasks;
  }

  const normalizedQuery = normalizeTaskSearchText(searchQuery);

  return tasks.filter((task) => {
    if (!taskMatchesType(task, activeTaskFilter)) {
      return false;
    }

    if (!normalizedQuery) {
      return true;
    }

    const searchableText = normalizeTaskSearchText(
      [task?.work_standard?.name, task?.comment].filter(Boolean).join(" "),
    );

    return searchableText.includes(normalizedQuery);
  });
};

export const getServerTaskTypeIds = (filter: TaskFilterType) => {
  const taskType = TASK_TYPE_BY_FILTER[filter];

  return taskType ? [taskType] : [1, 2, 3, 4];
};
