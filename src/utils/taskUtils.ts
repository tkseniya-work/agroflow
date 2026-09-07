import { FieldProductionTaskResponse ,
  ProductionTask,
  Status,
} from "../../entities/productionTask";
import { TrackItem } from "../../entities/techniqueMonitoring";
import Colors from "../../shared/styles/Colors";

export type TaskFilterType =
  | "all"
  | "field"
  | "transport"
  | "stationary"
  | "transportation";

export const getTaskIcon = (task: any) => {
  const taskTypeId = task?.task_type?.id;

  if (taskTypeId === 1) {
    return {
      name: "leaf-outline",
      color: Colors.greenColor,
      backgroundColor: "#E8F5E9",
    };
  }

  if (taskTypeId === 2) {
    return {
      name: "car-outline",
      color: "#673AB7",
      backgroundColor: "#F3E8FF",
    };
  }

  if (taskTypeId === 3) {
    return {
      name: "business-outline",
      color: "#FF5722",
      backgroundColor: "#FFF1EC",
    };
  }

  if (taskTypeId === 4) {
    return {
      name: "cube-outline",
      color: "#ED6C02",
      backgroundColor: "#FFF3E0",
    };
  }

  return {
    name: "clipboard-outline",
    color: Colors.greenColor,
    backgroundColor: "#E8F5E9",
  };
};

export function normalizeTask(task: any) {
  const taskTypeId = task?.task_type?.id;

  return {
    ...task,
    stationary: taskTypeId === 3,
    transport: taskTypeId === 2,
    transportation: taskTypeId === 4,
  };
}

export function filterTaskByType(task: any, type: TaskFilterType) {
  if (type === "all") return true;

  if (type === "field") {
    return !task.stationary && !task.transport && !task.transportation;
  }

  if (type === "stationary") {
    return task.stationary && !task.transport && !task.transportation;
  }

  if (type === "transport") {
    return !task.stationary && task.transport && !task.transportation;
  }

  if (type === "transportation") {
    return !task.stationary && !task.transport && task.transportation;
  }

  return true;
}

export const isFieldTask = (task: any) => {
  const taskTypeId = task?.task_type?.id;

  switch (taskTypeId) {
    case 1:
      return true;
    case 2:
      return false;
    case 3:
      return false;
    case 4:
      return false;
  }
};

export const getTaskStatusText = (status: Status) => {
  if (!status) return;

  if (status.id === 1) return "Активно";
  if (status.id === 2) return "Завершено";

  return "Статус не указан";
};

export const getTaskZones = (item: any): string[] => {
  const zones = Array.isArray(item?.zones) ? item.zones : [];

  return zones.map((zone: any) => zone).filter(Boolean);
};

export const getTaskTypeText = (item: ProductionTask) => {
  return item?.task_type?.description || "Тип не указан";
};

export const getProgressColor = (value: number) => {
  if (value <= 30) return Colors.error;
  if (value <= 80) return Colors.warning;

  return Colors.greenColor;
};

export const formatRussianDate = (dateString?: string | null) => {
  if (!dateString) return "Дата не указана";

  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return dateString;

  return date.toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
};

export const isToday = (dateString?: string | null) => {
  if (!dateString) return false;

  const date = new Date(dateString);
  const now = new Date();

  return (
    date.getUTCFullYear() === now.getFullYear() &&
    date.getUTCMonth() === now.getMonth() &&
    date.getUTCDate() === now.getDate()
  );
};

export const formatTime = (value?: string | null) => {
  if (!value) return null;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  return date.toLocaleTimeString("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const formatNumber = (value: any, digits = 2) => {
  const number = Number(value);
  const safe = Number.isFinite(number) ? number : 0;

  return safe.toLocaleString("ru-RU", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
};

export const formatMoney = (value: any) => `${formatNumber(value)} ₽`;

export const formatNullableNumber = (value: any, digits = 2, suffix = "") => {
  if (value === null || value === undefined || value === "") return "—";

  return `${formatNumber(value, digits)}${suffix}`;
};

export const formatDurationMinutes = (value: any) => {
  const totalMinutes = Number(value) || 0;

  if (totalMinutes <= 0) return "0 мин";

  const hours = Math.floor(totalMinutes / 60);
  const minutes = Math.round(totalMinutes % 60);

  if (!hours) return `${formatNumber(minutes, minutes % 1 === 0 ? 0 : 1)} мин`;
  if (!minutes) return `${hours} ч`;

  return `${hours} ч ${minutes} мин`;
};

export const formatShiftTime = (start?: string | null, end?: string | null) => {
  const startTime = formatTime(start) ?? "--:--";
  const endTime = formatTime(end);

  if (!endTime) return `${startTime} - сейчас`;

  return `${startTime} - ${endTime}`;
};

export const getTrackColor = (type?: number) => {
  switch (Number(type)) {
    case 5:
      return "#EF4444";
    case 4:
      return "#42A5F5";
    case 3:
      return "#F59E0B";
    case 2:
      return "#1A0B6F";
    case 1:
      return "#9C27B0";
    default:
      return Colors.greenColor;
  }
};

const parseTrackCoordinates = (value: any): any[] => {
  if (Array.isArray(value)) return value;

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);

      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  return [];
};

export const normalizeTrackItems = (tracks?: any[]): TrackItem[] =>
  (Array.isArray(tracks) ? tracks : []).flatMap((track: any) => {
    const coordinates = parseTrackCoordinates(track?.c)
      .map((point: any) => {
        if (Array.isArray(point) && point.length >= 2) {
          const longitude = Number(point[0]);
          const latitude = Number(point[1]);

          return Number.isFinite(longitude) && Number.isFinite(latitude)
            ? ([longitude, latitude] as [number, number])
            : null;
        }

        const longitude = Number(point?.longitude ?? point?.lng);
        const latitude = Number(point?.latitude ?? point?.lat);

        return Number.isFinite(longitude) && Number.isFinite(latitude)
          ? ([longitude, latitude] as [number, number])
          : null;
      })
      .filter(Boolean) as [number, number][];

    if (coordinates.length < 2) return [];

    return [
      {
        ...track,
        type: Number(track?.type ?? 4),
        c: coordinates,
      } as TrackItem,
    ];
  });

export const getTrackCoordinates = (tracks: TrackItem[]) =>
  normalizeTrackItems(tracks).flatMap((track) => track.c);

export const buildTrackFeatureCollection = (tracks: TrackItem[]) => ({
  type: "FeatureCollection" as const,
  features: normalizeTrackItems(tracks)
    .map((track: any) => ({
      type: "Feature" as const,
      properties: {
        color: getTrackColor(track.type),
      },
      geometry: {
        type: "LineString" as const,
        coordinates: track.c,
      },
    })),
});

export const getEmployeeName = (employee: any) => {
  const source = employee?.employee ?? employee?.employee_info ?? employee;
  const parts = [source?.surname, source?.firstname, source?.middlename]
    .filter((item) => Boolean(item && String(item).trim()))
    .map((item) => String(item).trim());

  return (
    parts.join(" ") ||
    source?.fullname ||
    source?.full_name ||
    employee?.employee_name ||
    employee?.email ||
    "Сотрудник"
  );
};

export const getEmployeeShortName = (employee: any) => {
  const source = employee?.employee ?? employee?.employee_info ?? employee;
  const surname = String(source?.surname || "").trim();
  const firstname = String(source?.firstname || "").trim();
  const middlename = String(source?.middlename || "").trim();
  const shortName = [
    surname,
    firstname ? `${firstname.charAt(0)}.` : "",
    middlename ? `${middlename.charAt(0)}.` : "",
  ]
    .filter(Boolean)
    .join(" ");

  return shortName || getEmployeeName(source);
};

export const getEmployeeId = (employee: any) =>
  employee?.employee_id ??
  employee?.employeeId ??
  employee?.employee?.id ??
  employee?.employee_info?.id ??
  employee?.id ??
  null;

export const getEmployeePosition = (employee: any) => {
  const source = employee?.employee ?? employee?.employee_info ?? employee;

  return (
    source?.position?.name || source?.position_name || "Должность не указана"
  );
};

export const getWorkTypeLabel = (groupedAggregate: any) => {
  const hasFieldWork = Boolean(
    groupedAggregate?.output_value_aggregate_parts ??
    groupedAggregate?.outputValueAggregateParts,
  );
  const transferAggregate =
    groupedAggregate?.transfer_aggregate_parts ??
    groupedAggregate?.transferAggregateParts;
  const hasTransfer = Boolean(transferAggregate);
  const isTransportation =
    Boolean(
      groupedAggregate?.is_transportation ??
        groupedAggregate?.isTransportation ??
        transferAggregate?.is_transportation ??
        transferAggregate?.isTransportation,
    );

  return [
    hasFieldWork ? "Выработка" : null,
    hasTransfer ? (isTransportation ? "Транспортировка" : "Перегон") : null,
  ]
    .filter(Boolean)
    .join(" + ");
};

const getEntityCompanyId = (entity: any) =>
  entity?.company_id ??
  entity?.companyId ??
  entity?.company?.id ??
  entity?.company?.uuid ??
  entity?.company?.company_id ??
  entity?.company?.companyId ??
  null;

const getTechniqueCompanyId = (technique: any) =>
  getEntityCompanyId(technique) ??
  getEntityCompanyId(technique?.technique) ??
  getEntityCompanyId(technique?.technique_standard) ??
  getEntityCompanyId(technique?.techniqueStandard) ??
  null;

const getAggregateCompanyId = (aggregate: any) =>
  getEntityCompanyId(aggregate) ??
  getTechniqueCompanyId(aggregate?.technique) ??
  getTechniqueCompanyId(aggregate?.technique_standard) ??
  getTechniqueCompanyId(aggregate?.techniqueStandard) ??
  null;

export const getCompanyId = (currentTask: FieldProductionTaskResponse | any) =>
  getEntityCompanyId(currentTask) ??
  getEntityCompanyId(currentTask?.company) ??
  getAggregateCompanyId(currentTask?.field_task?.techniques?.[0]) ??
  getAggregateCompanyId(currentTask?.fieldTask?.techniques?.[0]) ??
  getAggregateCompanyId(currentTask?.transport_task?.aggregates?.[0]) ??
  getAggregateCompanyId(currentTask?.transportTask?.aggregates?.[0]) ??
  getAggregateCompanyId(currentTask?.transport_task?.techniques?.[0]) ??
  getAggregateCompanyId(currentTask?.transportTask?.techniques?.[0]) ??
  getAggregateCompanyId(currentTask?.transportation_task?.aggregates?.[0]) ??
  getAggregateCompanyId(currentTask?.transportationTask?.aggregates?.[0]) ??
  getAggregateCompanyId(currentTask?.transportation_task?.techniques?.[0]) ??
  getAggregateCompanyId(currentTask?.transportationTask?.techniques?.[0]) ??
  getAggregateCompanyId(
    currentTask?.products_transportation_task?.aggregates?.[0],
  ) ??
  getAggregateCompanyId(
    currentTask?.productsTransportationTask?.aggregates?.[0],
  ) ??
  getAggregateCompanyId(currentTask?.product_transportation_task?.aggregates?.[0]) ??
  getAggregateCompanyId(currentTask?.productTransportationTask?.aggregates?.[0]) ??
  getEntityCompanyId(currentTask?.stationary_task?.work_place) ??
  getEntityCompanyId(currentTask?.stationaryTask?.workPlace) ??
  getEntityCompanyId(currentTask?.stationary_work_place) ??
  null;

export const getLatestOpenAt = (employee: any) => {
  const times = getEmployeeShiftGroups(employee)
    .map((shift: any) => new Date(shift.open_at || 0).getTime())
    .filter((time: number) => Number.isFinite(time));

  return Math.max(...times, 0);
};

export const normalizeArray = (value: any) =>
  Array.isArray(value) ? value : [];

export const getEmployeeShiftGroups = (employee: any) => {
  if (
    employee?.shift_aggregate_task_parts ||
    employee?.shiftAggregateTaskParts ||
    employee?.output_value_aggregate_parts ||
    employee?.outputValueAggregateParts ||
    employee?.transfer_aggregate_parts ||
    employee?.transferAggregateParts
  ) {
    return [employee];
  }

  return normalizeArray(
    employee?.employee_group ??
      employee?.employeeGroup ??
      employee?.employee_shifts_parts ??
      employee?.employeeShiftsParts ??
      employee?.shifts ??
      employee?.shift_groups ??
      employee?.groups,
  );
};

export const getShiftAggregates = (shift: any) => {
  if (
    shift?.output_value_aggregate_parts ||
    shift?.outputValueAggregateParts ||
    shift?.transfer_aggregate_parts ||
    shift?.transferAggregateParts ||
    shift?.grouped_by_tariff_parts ||
    shift?.groupedByTariffParts
  ) {
    return [shift];
  }

  return normalizeArray(
    shift?.shift_aggregate_task_parts ??
      shift?.shiftAggregateTaskParts ??
      shift?.aggregate_shift_parts ??
      shift?.aggregateShiftParts ??
      shift?.shift_aggregates ??
      shift?.aggregates ??
      shift?.grouped_aggregates ??
      shift?.groupedAggregates,
  );
};

export const normalizeGroupedPartsResponse = (response: any) => {
  if (Array.isArray(response)) return response;

  return normalizeArray(
    response?.data ??
      response?.items ??
      response?.groups ??
      response?.currentTaskGroupedParts ??
      response?.current_task_grouped_parts,
  );
};

export const getTariffPartIds = (tariffPart: any) =>
  (tariffPart?.shift_parts || tariffPart?.shiftParts || [])
    .map((shiftPart: any) => shiftPart?.id)
    .filter(Boolean)
    .map(String);

export const getPartTypeLabels = (shiftParts: any[], qrCodeScannedAt?: any) => {
  const labels: string[] = [];

  const hasPartType = (typeId: number) =>
    shiftParts?.some(
      (part: any) =>
        Number(part?.part_type?.id ?? part?.partType?.id) === typeId,
    );

  if (qrCodeScannedAt || hasPartType(1)) labels.push("QR");
  if (hasPartType(2)) {
    labels.push("Руч.");
  }
  if (hasPartType(3)) {
    labels.push("Авто");
  }

  return labels;
};

export const getMaterialSummary = (tariffPart: any, fallbackPart?: any) => {
  const fuelTotal =
    tariffPart?.fuel_total ??
    tariffPart?.fuelTotal ??
    fallbackPart?.fuel_total ??
    fallbackPart?.fuelTotal;
  const items = [
    ...(tariffPart?.pesticides || []).map(
      (item: any) => `СЗР: ${item.name ?? ""} ${formatNumber(item.quantity)} л`,
    ),
    ...(tariffPart?.fertilizers || []).map(
      (item: any) =>
        `Удобрение: ${item.name ?? ""} ${formatNumber(item.quantity)} кг`,
    ),
    ...(tariffPart?.seeds || []).map((item: any) => {
      const unit = item.unit_code?.description ?? "кг";
      return `Семена: ${item.variety_name ?? item.name ?? ""} ${formatNumber(item.quantity)} ${unit}`;
    }),
    ...(tariffPart?.fuel || []).map(
      (item: any) => `ГСМ: ${formatNumber(item.quantity)} л`,
    ),
  ];

  if (!items.some((item) => item.startsWith("ГСМ:")) && Number(fuelTotal) > 0) {
    items.push(`ГСМ: ${formatNumber(fuelTotal)} л`);
  }

  return items.filter(Boolean);
};
