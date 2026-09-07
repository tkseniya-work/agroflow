import type { ProductionTaskConsumableRequest } from "./productionTaskActions.types";

const getUnitCode = (unitCode: number | string | null | undefined) => {
  if (unitCode === null || unitCode === undefined || unitCode === "") {
    return 0;
  }

  return Number(unitCode);
};

export const buildConsumableRequestData = (
  type: ProductionTaskConsumableRequest["type"],
  data: ProductionTaskConsumableRequest["data"],
) => {
  const recordId = data.id ? { id: data.id } : {};

  if (type === "seed") {
    return {
      ...recordId,
      crop_variety_standard_id: data.crop_variety_standard_id,
      quantity: data.quantity,
      unit_code: getUnitCode(data.unit_code),
      production_task_field_id: data.production_task_field_id,
      ...(data.id
        ? data.weight !== null && data.weight !== undefined
          ? { weight: data.weight }
          : {}
        : { weight: data.weight ?? 0 }),
    };
  }

  if (type === "fertilizer") {
    return {
      ...recordId,
      fertilizer_id: data.fertilizer_id,
      quantity: data.quantity,
      production_task_field_id: data.production_task_field_id,
    };
  }

  return {
    ...recordId,
    pesticide_id: data.pesticide_id,
    quantity: data.quantity,
    production_task_field_id: data.production_task_field_id,
  };
};
