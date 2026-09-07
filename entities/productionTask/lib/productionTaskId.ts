export const EMPTY_UUID = "00000000-0000-0000-0000-000000000000";

export const isValidProductionTaskId = (value: unknown): value is string => {
  if (value === null || value === undefined) return false;

  const normalizedValue = String(value).trim();

  return normalizedValue.length > 0 && normalizedValue !== EMPTY_UUID;
};

const getNestedTaskIds = (task: any) => {
  const transportationTasks = [
    task?.transportation_task,
    task?.products_transportation_task,
    task?.product_transportation_task,
    task?.transportationTask,
  ];

  return transportationTasks.flatMap((transportationTask) => [
    transportationTask?.production_task_id,
    transportationTask?.productionTaskId,
    transportationTask?.task_id,
    transportationTask?.taskId,
    transportationTask?.task_fields?.[0]?.task_id,
    transportationTask?.taskFields?.[0]?.taskId,
    transportationTask?.aggregates?.[0]?.task_id,
    transportationTask?.aggregates?.[0]?.taskId,
  ]);
};

export const resolveProductionTaskId = (
  task: any,
  fallbackId?: unknown,
): string | null => {
  const candidates = [
    task?.production_task_id,
    task?.productionTaskId,
    task?.task_id,
    task?.taskId,
    task?.production_task?.id,
    task?.productionTask?.id,
    task?.id,
    task?.field_task?.task_fields?.[0]?.task_id,
    task?.fieldTask?.taskFields?.[0]?.taskId,
    task?.task_fields?.[0]?.task_id,
    task?.taskFields?.[0]?.taskId,
    ...getNestedTaskIds(task),
    fallbackId,
  ];
  const productionTaskId = candidates.find(isValidProductionTaskId);

  return productionTaskId === undefined
    ? null
    : String(productionTaskId).trim();
};
