import {
  getEmployeeShiftGroups,
  getShiftAggregates,
} from "../../../../../src/utils/taskUtils";
import type {
  AnalyticsByFields,
  AnalyticsField,
  AnalyticsTechnique,
} from "./TaskAnalytics.types";

export type TaskAnalyticsResult = AnalyticsByFields & {
  techniques: AnalyticsTechnique[];
};

export const toAnalyticsNumber = (value: any) => Number(value || 0);

export const parseDurationMinutes = (value: any) => {
  if (typeof value === "number") return value;
  if (!value) return 0;

  const parts = String(value).split(":").map(Number);

  if (parts.length === 3) {
    return parts[0] * 60 + parts[1] + parts[2] / 60;
  }

  return Number(value) || 0;
};

export const buildTaskAnalytics = ({
  currentTask,
  currentTaskAnalytic,
  fields,
  groupedParts,
}: {
  currentTask: any;
  currentTaskAnalytic: any;
  fields: any[];
  groupedParts: any[];
}): TaskAnalyticsResult => {
  const taskAnalytic =
    currentTaskAnalytic ??
    currentTask?.currentTaskAnalytic ??
    currentTask?.current_task_analytic ??
    currentTask?.analytic ??
    currentTask?.analytics ??
    currentTask?.field_task?.analytic ??
    currentTask?.field_task?.analytics;
  const backendAnalyticByFields =
    taskAnalytic?.analytic_by_fields ??
    taskAnalytic?.analyticByFields ??
    currentTask?.analytic_by_fields ??
    currentTask?.analyticByFields;
  const backendFields = Array.isArray(backendAnalyticByFields?.fields)
    ? backendAnalyticByFields.fields
    : [];

  if (backendFields.length > 0) {
    return buildBackendAnalytics({
      currentTask,
      taskAnalytic,
      backendAnalyticByFields,
      backendFields,
    });
  }

  return buildGroupedPartsAnalytics(fields, groupedParts);
};

const buildBackendAnalytics = ({
  currentTask,
  taskAnalytic,
  backendAnalyticByFields,
  backendFields,
}: {
  currentTask: any;
  taskAnalytic: any;
  backendAnalyticByFields: any;
  backendFields: any[];
}): TaskAnalyticsResult => {
  const techniquesById = new Map<string, AnalyticsTechnique>();
  const ensureTechnique = (item: any) => {
    const technique = item?.technique_standard ?? item?.techniqueStandard ?? {};
    const id = String(technique?.id ?? item?.id);
    const existing = techniquesById.get(id) ?? {
      id,
      name: technique?.name ?? "Техника",
      stateNumber: technique?.state_number ?? "",
      loading: 0,
      performance: 0,
      fuelConsumptionPerHa: 0,
    };

    techniquesById.set(id, existing);
    return existing;
  };

  (taskAnalytic?.techniques_loading ?? currentTask?.techniques_loading ?? []).forEach(
    (item: any) => {
      ensureTechnique(item).loading = toAnalyticsNumber(item?.loading);
    },
  );
  (taskAnalytic?.techniques_perfomance ??
    currentTask?.techniques_perfomance ??
    []).forEach((item: any) => {
    ensureTechnique(item).performance = toAnalyticsNumber(item?.perfomance);
  });
  (taskAnalytic?.techniques_fuel_consumptions ??
    currentTask?.techniques_fuel_consumptions ??
    []).forEach((item: any) => {
    ensureTechnique(item).fuelConsumptionPerHa = toAnalyticsNumber(
      item?.fuel_consumption_per_ha,
    );
  });

  const completed =
    toAnalyticsNumber(taskAnalytic?.completed ?? currentTask?.completed) ||
    backendFields.reduce(
      (sum: number, field: any) => sum + toAnalyticsNumber(field?.fact_area),
      0,
    );
  const needToDo =
    toAnalyticsNumber(taskAnalytic?.need_to_do ?? currentTask?.need_to_do) ||
    backendFields.reduce(
      (sum: number, field: any) => sum + toAnalyticsNumber(field?.total_area),
      0,
    );
  const progressPercent =
    toAnalyticsNumber(
      taskAnalytic?.execution_progress_percent ??
        currentTask?.execution_progress_percent,
    ) || (needToDo ? Math.min((completed / needToDo) * 100, 100) : 0);
  const transfer = backendAnalyticByFields?.transfer
    ? {
        fuelQuantity: toAnalyticsNumber(
          backendAnalyticByFields.transfer.total_fuel_quantity,
        ),
        fuelAmount: toAnalyticsNumber(
          backendAnalyticByFields.transfer.total_fuel_amount,
        ),
        salary: toAnalyticsNumber(backendAnalyticByFields.transfer.salary),
      }
    : null;

  return {
    fields: backendFields.map((field: any) => ({
      id: String(field?.season_field_id ?? field?.id),
      name: field?.season_field_name ?? field?.name ?? "Поле",
      factArea: toAnalyticsNumber(field?.fact_area),
      totalArea: toAnalyticsNumber(field?.total_area),
      fuelPerHa: toAnalyticsNumber(field?.fuel_per_ha),
      fuelAmountPerHa: toAnalyticsNumber(field?.fuel_amount_per_ha),
      fertilizersPerHa: toAnalyticsNumber(field?.fertilizers_per_ha),
      fertilizersAmountPerHa: toAnalyticsNumber(
        field?.fertilizers_amount_per_ha,
      ),
      pesticidesPerHa: toAnalyticsNumber(field?.pesticides_per_ha),
      pesticidesAmountPerHa: toAnalyticsNumber(field?.pesticides_amount_per_ha),
      seedsPerHa: toAnalyticsNumber(
        field?.seeds_kg_per_ha ?? field?.seeds_pe_per_ha,
      ),
      seedsAmountPerHa: toAnalyticsNumber(field?.seeds_amount_per_ha),
      seedsUnit: field?.seeds_pe_per_ha ? "п.е./га" : "кг/га",
      salary: toAnalyticsNumber(field?.salary),
    })),
    transfer,
    progress: { completed, needToDo, percent: progressPercent },
    techniques: Array.from(techniquesById.values()),
  };
};

const buildGroupedPartsAnalytics = (
  fields: any[],
  groupedParts: any[],
): TaskAnalyticsResult => {
  const fieldTotals = new Map<string, AnalyticsField>();
  const transfer = { fuelQuantity: 0, fuelAmount: 0, salary: 0 };
  const techniqueTotals = new Map<
    string,
    {
      id: string;
      name: string;
      stateNumber: string;
      factArea: number;
      fuelQuantity: number;
      durationMinutes: number;
    }
  >();

  fields.forEach((field: any) => {
    const id = String(field?.id ?? field?.season_field?.id);

    fieldTotals.set(id, {
      id,
      name: field?.season_field?.name ?? field?.name ?? "Поле",
      factArea: 0,
      totalArea: toAnalyticsNumber(field?.area ?? field?.season_field?.area),
      fuelPerHa: 0,
      fuelAmountPerHa: 0,
      fertilizersPerHa: 0,
      fertilizersAmountPerHa: 0,
      pesticidesPerHa: 0,
      pesticidesAmountPerHa: 0,
      seedsPerHa: 0,
      seedsAmountPerHa: 0,
      seedsUnit: "",
      salary: 0,
    });
  });

  groupedParts.forEach((group: any) => {
    const employees =
      group?.employees_task_parts ||
      group?.employeesTaskParts ||
      group?.employees ||
      group?.employee_parts ||
      [];

    employees.forEach((employee: any) => {
      getEmployeeShiftGroups(employee).forEach((shift: any) => {
        getShiftAggregates(shift).forEach((groupedAggregate: any) => {
          addGroupedAggregate(
            groupedAggregate,
            fieldTotals,
            techniqueTotals,
            transfer,
          );
        });
      });
    });
  });

  const analyticFields = Array.from(fieldTotals.values()).map((field) => {
    if (!field.factArea) return field;

    return {
      ...field,
      fuelPerHa: field.fuelPerHa / field.factArea,
      fuelAmountPerHa: field.fuelAmountPerHa / field.factArea,
      fertilizersPerHa: field.fertilizersPerHa / field.factArea,
      fertilizersAmountPerHa: field.fertilizersAmountPerHa / field.factArea,
      pesticidesPerHa: field.pesticidesPerHa / field.factArea,
      pesticidesAmountPerHa: field.pesticidesAmountPerHa / field.factArea,
      seedsPerHa: field.seedsPerHa / field.factArea,
      seedsAmountPerHa: field.seedsAmountPerHa / field.factArea,
    };
  });
  const hasTransfer =
    transfer.fuelQuantity > 0 ||
    transfer.fuelAmount > 0 ||
    transfer.salary > 0;
  const completed = analyticFields.reduce(
    (sum, field) => sum + field.factArea,
    0,
  );
  const needToDo = analyticFields.reduce(
    (sum, field) => sum + field.totalArea,
    0,
  );
  const progressPercent = needToDo
    ? Math.min((completed / needToDo) * 100, 100)
    : 0;
  const maxTechniqueDuration = Math.max(
    ...Array.from(techniqueTotals.values()).map(
      (item) => item.durationMinutes,
    ),
    0,
  );
  const techniques: AnalyticsTechnique[] = Array.from(techniqueTotals.values())
    .filter((item) => item.factArea > 0 || item.durationMinutes > 0)
    .map((item) => ({
      id: item.id,
      name: item.name,
      stateNumber: item.stateNumber,
      loading: maxTechniqueDuration
        ? (item.durationMinutes / maxTechniqueDuration) * 100
        : 0,
      performance: item.durationMinutes
        ? item.factArea / (item.durationMinutes / 60)
        : 0,
      fuelConsumptionPerHa: item.factArea
        ? item.fuelQuantity / item.factArea
        : 0,
    }));

  return {
    fields: analyticFields,
    transfer: hasTransfer ? transfer : null,
    progress: { completed, needToDo, percent: progressPercent },
    techniques,
  };
};

const addGroupedAggregate = (
  groupedAggregate: any,
  fieldTotals: Map<string, AnalyticsField>,
  techniqueTotals: Map<
    string,
    {
      id: string;
      name: string;
      stateNumber: string;
      factArea: number;
      fuelQuantity: number;
      durationMinutes: number;
    }
  >,
  transfer: { fuelQuantity: number; fuelAmount: number; salary: number },
) => {
  const outputValueAggregateParts =
    groupedAggregate?.output_value_aggregate_parts ??
    groupedAggregate?.outputValueAggregateParts;
  const transferAggregateParts =
    groupedAggregate?.transfer_aggregate_parts ??
    groupedAggregate?.transferAggregateParts;
  const aggregate = groupedAggregate?.aggregate ?? {};
  const technique =
    aggregate?.technique_standard ??
    aggregate?.techniqueStandard ??
    aggregate?.technique;
  const techniqueId = String(technique?.id ?? groupedAggregate?.id);
  const techniqueTotal = techniqueTotals.get(techniqueId) ?? {
    id: techniqueId,
    name: technique?.name ?? "Техника",
    stateNumber: technique?.state_number ?? "",
    factArea: 0,
    fuelQuantity: 0,
    durationMinutes: 0,
  };

  (
    outputValueAggregateParts?.fields_task_parts ||
    outputValueAggregateParts?.fieldsTaskParts ||
    outputValueAggregateParts?.fields ||
    []
  ).forEach((fieldPart: any) => {
    const fieldId = String(
      fieldPart?.task_field_id ?? fieldPart?.taskFieldId ?? fieldPart?.id,
    );
    const factArea = toAnalyticsNumber(fieldPart?.area_fact);
    const current = fieldTotals.get(fieldId) ?? {
      id: fieldId,
      name: fieldPart?.task_field_name ?? "Поле",
      factArea: 0,
      totalArea: toAnalyticsNumber(fieldPart?.total_area),
      fuelPerHa: 0,
      fuelAmountPerHa: 0,
      fertilizersPerHa: 0,
      fertilizersAmountPerHa: 0,
      pesticidesPerHa: 0,
      pesticidesAmountPerHa: 0,
      seedsPerHa: 0,
      seedsAmountPerHa: 0,
      seedsUnit: "",
      salary: 0,
    };

    current.factArea += factArea;
    current.salary += toAnalyticsNumber(fieldPart?.payment_total);
    techniqueTotal.factArea += factArea;
    techniqueTotal.fuelQuantity +=
      toAnalyticsNumber(fieldPart?.fuel_per_ha) * factArea;
    techniqueTotal.durationMinutes += parseDurationMinutes(
      fieldPart?.parts_duration,
    );

    addWeightedFieldValues(current, fieldPart, factArea);
    fieldTotals.set(fieldId, current);
  });

  (
    transferAggregateParts?.grouped_by_tariff_parts ||
    transferAggregateParts?.groupedByTariffParts ||
    transferAggregateParts?.tariff_parts ||
    []
  ).forEach((transferPart: any) => {
    transfer.fuelQuantity += toAnalyticsNumber(transferPart?.fuel_total);
    transfer.fuelAmount +=
      toAnalyticsNumber(transferPart?.total_fuel_amount) ||
      toAnalyticsNumber(transferPart?.fuel_amount_total) ||
      toAnalyticsNumber(transferPart?.fuel_amount);
    transfer.salary += toAnalyticsNumber(transferPart?.payment_total);
  });

  techniqueTotals.set(techniqueId, techniqueTotal);
};

const addWeightedFieldValues = (
  current: AnalyticsField,
  fieldPart: any,
  factArea: number,
) => {
  const addWeighted = (
    key: keyof Pick<
      AnalyticsField,
      | "fuelPerHa"
      | "fuelAmountPerHa"
      | "fertilizersPerHa"
      | "fertilizersAmountPerHa"
      | "pesticidesPerHa"
      | "pesticidesAmountPerHa"
      | "seedsPerHa"
      | "seedsAmountPerHa"
    >,
    value: any,
  ) => {
    current[key] += toAnalyticsNumber(value) * factArea;
  };

  addWeighted("fuelPerHa", fieldPart?.fuel_per_ha);
  addWeighted("fuelAmountPerHa", fieldPart?.fuel_amount_per_ha);
  addWeighted("fertilizersPerHa", fieldPart?.fertilizers_per_ha);
  addWeighted(
    "fertilizersAmountPerHa",
    fieldPart?.fertilizers_amount_per_ha,
  );
  addWeighted("pesticidesPerHa", fieldPart?.pesticides_per_ha);
  addWeighted("pesticidesAmountPerHa", fieldPart?.pesticides_amount_per_ha);
  addWeighted(
    "seedsPerHa",
    fieldPart?.seeds_kg_per_ha ?? fieldPart?.seeds_pe_per_ha,
  );
  addWeighted("seedsAmountPerHa", fieldPart?.seeds_amount_per_ha);
  current.seedsUnit = fieldPart?.seeds_pe_per_ha ? "п.е./га" : "кг/га";
};
