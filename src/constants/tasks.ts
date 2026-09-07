import { TaskFilterType } from "../utils/taskUtils";

export const TASK_FILTERS: { title: string; type: TaskFilterType }[] = [
  { title: "Все", type: "all" },
  { title: "Полевые", type: "field" },
  { title: "Транспортные", type: "transport" },
  { title: "Стационарные", type: "stationary" },
  { title: "Транспортировка", type: "transportation" },
];