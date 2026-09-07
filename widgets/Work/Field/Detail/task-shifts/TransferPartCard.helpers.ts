import type {
  ShiftPartDetails,
  TransferPartCardProps,
} from "../../../../../src/types/task.types";
import {
  formatDurationMinutes,
  formatMoney,
  formatNullableNumber,
  formatNumber,
  formatShiftTime,
  formatTime,
  getPartTypeLabels,
  getTariffPartIds,
} from "../../../../../src/utils/taskUtils";
import Colors from "../../../../../shared/styles/Colors";

type BuildTransferPartCardModelParams = Pick<
  TransferPartCardProps,
  | "employeeName"
  | "employeePosition"
  | "aggregate"
  | "currentPart"
  | "productionShiftId"
  | "shiftType"
  | "kilometers"
  | "avgSpeed"
  | "maxSpeed"
  | "qrCodeScannedAt"
> & {
  shiftName: string;
};

export const isAlmostInstantPart = (
  start?: string | null,
  end?: string | null,
) => {
  if (!start || !end) return false;

  const startDate = new Date(start);
  const endDate = new Date(end);

  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    return false;
  }

  return Math.abs(endDate.getTime() - startDate.getTime() - 1000) < 100;
};

export const buildTransferPartCardModel = ({
  employeeName,
  employeePosition,
  aggregate,
  currentPart,
  productionShiftId,
  shiftType,
  kilometers,
  avgSpeed,
  maxSpeed,
  qrCodeScannedAt,
  shiftName,
}: BuildTransferPartCardModelParams) => {
  const shiftParts = currentPart?.shift_parts || currentPart?.shiftParts || [];
  const typeLabels = getPartTypeLabels(shiftParts, qrCodeScannedAt);
  const initialPart = shiftParts.find(
    (part: any) => part?.is_initial ?? part?.isInitial,
  );
  const isInitial = Boolean(initialPart);
  const isTransportation =
    Boolean(currentPart?.is_transportation ?? currentPart?.isTransportation) ||
    Boolean(aggregate?.is_transportation ?? aggregate?.isTransportation);
  const transferTitle = isTransportation ? "Транспортировка" : "Перегон";
  const transferIcon: ShiftPartDetails["icon"] = isTransportation
    ? "truck-delivery-outline"
    : "truck-fast-outline";
  const technique = aggregate?.technique_standard ?? aggregate?.technique;
  const agriculturalMachine =
    aggregate?.agricultural_machine ?? aggregate?.agriculture_machine;
  const safeKilometers =
    Number(kilometers) ||
    Number(currentPart?.production_kilometers) ||
    Number(currentPart?.output_value_total) ||
    0;
  const fuelTotal = Number(currentPart?.fuel_total) || 0;
  const fuelPer100 =
    Number(currentPart?.fuel_per_100km) ||
    (safeKilometers > 0 ? (fuelTotal / safeKilometers) * 100 : 0);
  const transportedWeight = Number(currentPart?.transported_weight) || 0;
  const numberOfTrips = Number(currentPart?.number_of_trips) || 0;
  const tariff = currentPart?.tariff || {};
  const unitLabel = tariff?.unit_code ?? "ед";
  const paymentTotal = currentPart?.payment_total;
  const onlyStartTime = isAlmostInstantPart(
    currentPart?.open_at_parts_time,
    currentPart?.closed_at_parts_time,
  );
  const timeText = onlyStartTime
    ? `${formatTime(currentPart?.open_at_parts_time)} -> сейчас`
    : formatShiftTime(
        currentPart?.open_at_parts_time,
        currentPart?.closed_at_parts_time,
      );
  const durationText = formatDurationMinutes(currentPart?.parts_duration);
  const sourceBadges = typeLabels.map((label) => ({
    icon: "radio-button-on-outline" as const,
    label,
    tone:
      label === "QR"
        ? ("sourceQr" as const)
        : label === "Руч."
          ? ("sourceManual" as const)
          : ("sourceAuto" as const),
  }));
  const priceParameters =
    currentPart?.tariff_price_parameters ||
    tariff?.tariff_price_parameters ||
    {};
  const deleteIds = getTariffPartIds(currentPart).slice(0, 1);
  const detailPayload: ShiftPartDetails = {
    type: "transfer",
    title: isInitial ? "Посадка сотрудника" : transferTitle,
    subtitle: isInitial
      ? `Сотрудник сел в технику · ${
          formatTime(currentPart?.open_at_parts_time) || "время не указано"
        }`
      : formatShiftTime(
          currentPart?.open_at_parts_time,
          currentPart?.closed_at_parts_time,
        ),
    shiftName,
    shiftType,
    color: isInitial ? Colors.greenColor : Colors.blue,
    icon: isInitial ? "account-check-outline" : transferIcon,
    deleteTitle: isInitial
      ? "Удалить посадку сотрудника"
      : isTransportation
        ? "Удалить отрезок транспортировки"
        : "Удалить отрезок перегона",
    deleteIds,
    editContext: {
      productionShiftId,
      aggregate,
      transferGrouped: currentPart,
      tariffGrouped: currentPart,
      employeeId: shiftParts[0]?.employee_id,
    },
    summary: isInitial
      ? [
          {
            label: "Начало",
            value: formatTime(currentPart?.open_at_parts_time) || "—",
            accent: true,
          },
          {
            label: "Источник",
            value: typeLabels.length ? typeLabels.join(" · ") : "Не указан",
          },
        ]
      : [
          {
            label: "Пробег",
            value: `${formatNumber(safeKilometers, 1)} км`,
            accent: true,
          },
          ...(isTransportation
            ? [
                {
                  label: "Вес",
                  value: `${formatNumber(transportedWeight / 1000, 1)} т`,
                  accent: true,
                },
                {
                  label: "Рейсы",
                  value: `${formatNumber(numberOfTrips, 0)} шт`,
                },
              ]
            : []),
          { label: "ФОТ", value: formatMoney(paymentTotal), accent: true },
          { label: "ГСМ", value: `${formatNumber(fuelTotal, 1)} л` },
          {
            label: "Расход",
            value: `${formatNumber(fuelPer100, 1)} л/100км`,
          },
        ],
    sections: isInitial
      ? [
          {
            title: "Посадка сотрудника",
            icon: "account-check-outline",
            rows: [
              { label: "Сотрудник", value: employeeName, strong: true },
              { label: "Должность", value: employeePosition },
              { label: "Смена", value: shiftName },
              {
                label: "Начало",
                value: formatTime(currentPart?.open_at_parts_time) || "—",
              },
              {
                label: "Источник",
                value: typeLabels.length
                  ? typeLabels.join(" · ")
                  : "Не указан",
              },
            ],
          },
        ]
      : [
      {
        title: "Смена и техника",
        icon: "truck-fast-outline",
        rows: [
          { label: "Сотрудник", value: employeeName, strong: true },
          { label: "Должность", value: employeePosition },
          { label: "Смена", value: shiftName },
          {
            label: "Начало",
            value: formatTime(currentPart?.open_at_parts_time) || "—",
          },
          {
            label: "Окончание",
            value: formatTime(currentPart?.closed_at_parts_time) || "сейчас",
          },
          {
            label: "Техника",
            value:
              [technique?.name, technique?.state_number]
                .filter(Boolean)
                .join(" · ") || "—",
          },
          { label: "Модель", value: technique?.machinery_model?.name || "—" },
          { label: "СХМ", value: agriculturalMachine?.name || "Без СХМ" },
        ],
      },
      {
        title: transferTitle,
        icon: isTransportation
          ? "truck-delivery-outline"
          : "map-marker-distance",
        rows: [
          {
            label: "Пробег",
            value: `${formatNumber(safeKilometers, 1)} км`,
            strong: true,
          },
          {
            label: "Выработка",
            value: `${formatNullableNumber(currentPart?.output_value_total, 1)} ${unitLabel}`,
          },
          ...(isTransportation
            ? [
                {
                  label: "Перевезенный вес",
                  value: `${formatNullableNumber(transportedWeight, 1)} кг`,
                  strong: true,
                },
                {
                  label: "Количество рейсов",
                  value: `${formatNullableNumber(numberOfTrips, 0)} шт`,
                },
              ]
            : []),
          {
            label: "Длительность",
            value: formatDurationMinutes(currentPart?.parts_duration),
          },
          {
            label: "Источник",
            value: typeLabels.length ? typeLabels.join(" · ") : "Не указан",
          },
        ],
      },
      {
        title: "Движение и топливо",
        icon: "speedometer",
        rows: [
          {
            label: "Средняя скорость",
            value: `${formatNumber(avgSpeed, 1)} км/ч`,
          },
          {
            label: "Максимальная скорость",
            value: `${formatNumber(maxSpeed, 1)} км/ч`,
            strong: true,
          },
          { label: "ГСМ всего", value: `${formatNumber(fuelTotal, 1)} л` },
          {
            label: "Расход",
            value: `${formatNumber(fuelPer100, 1)} л/100км`,
            strong: true,
          },
        ],
      },
      {
        title: "ФОТ",
        icon: "wallet-outline",
        rows: [
          {
            label: "ФОТ всего",
            value: formatMoney(paymentTotal),
            strong: true,
          },
          {
            label: "Тариф за единицу",
            value: `${formatMoney(priceParameters?.unit)} / ${unitLabel}`,
          },
          {
            label: "Норма",
            value: `${formatNullableNumber(tariff?.norm_value, 2)} ${unitLabel}`,
          },
          { label: "Комментарий", value: tariff?.comment || "—" },
        ],
      },
      {
        title: "Тариф",
        icon: "file-document-outline",
        rows: [
          {
            label: "Норма выработки",
            value: `${formatNullableNumber(tariff?.norm_value, 2)} ${unitLabel}`,
            strong: true,
          },
          {
            label: "ГСМ в час",
            value: `${formatNullableNumber(tariff?.norm_fuel_value_per_hour, 2)} л/ч`,
          },
          {
            label: "ГСМ на единицу",
            value: `${formatNullableNumber(tariff?.norm_fuel_value_per_unit, 2)} л/${unitLabel}`,
          },
          {
            label: "Коэффициент переработки",
            value: formatNullableNumber(tariff?.overtime_ratio, 2),
          },
        ],
      },
      {
        title: "Расходники",
        icon: "gas-station-outline",
        items:
          fuelTotal > 0
            ? [`ГСМ: ${formatNumber(fuelTotal, 1)} л`]
            : ["ГСМ не списывались"],
      },
        ],
    rows: isInitial
      ? [
          { label: "Сотрудник", value: employeeName },
          {
            label: "Начало",
            value: formatTime(currentPart?.open_at_parts_time) || "—",
          },
          {
            label: "Источник",
            value: typeLabels.length ? typeLabels.join(" · ") : "Не указан",
          },
        ]
      : [
          { label: "Тип", value: transferTitle },
          {
            label: "Пробег",
            value: `${formatNumber(safeKilometers, 1)} км`,
          },
          { label: "ФОТ", value: formatMoney(currentPart?.payment_total) },
          { label: "ГСМ всего", value: `${formatNumber(fuelTotal, 1)} л` },
          {
            label: "Расход",
            value: `${formatNumber(fuelPer100, 1)} л/100км`,
          },
          {
            label: "Скорость",
            value: `${formatNumber(avgSpeed, 0)} / ${formatNumber(maxSpeed, 0)} км/ч`,
          },
          {
            label: "Техника",
            value:
              [technique?.name, technique?.state_number]
                .filter(Boolean)
                .join(" · ") || "Не указана",
          },
          {
            label: "Модель",
            value: technique?.machinery_model?.name || "Не указана",
          },
          {
            label: "Источник",
            value: typeLabels.length ? typeLabels.join(" · ") : "Не указан",
          },
        ],
  };

  return {
    detailPayload,
    deleteIds,
    isInitial,
    transferIcon,
    compact: {
      initialTime: formatTime(currentPart?.open_at_parts_time),
      initialBadges: sourceBadges,
      time: timeText,
      duration: durationText,
      title: transferTitle,
      result: `${formatNumber(safeKilometers, 1)} км`,
      payment: formatMoney(currentPart?.payment_total),
      badges: [
        ...sourceBadges,
        {
          icon: "speedometer-outline" as const,
          label: `ср. ${formatNumber(avgSpeed, 0)} км/ч`,
          tone: "default" as const,
        },
        {
          icon: "flash-outline" as const,
          label: `макс. ${formatNumber(maxSpeed, 0)} км/ч`,
          tone: "default" as const,
        },
      ],
      metrics: [
        {
          label: isTransportation ? "Пробег" : "Перегон",
          value: `${formatNumber(safeKilometers, 1)} км`,
          tone: "default" as const,
        },
        {
          label: "Начислено",
          value: formatMoney(currentPart?.payment_total),
          tone: "success" as const,
        },
        {
          label: "Расход ГСМ",
          value: `${formatNumber(fuelPer100, 1)} л/100км`,
          tone: "default" as const,
        },
        {
          label: "ГСМ всего",
          value: `${formatNumber(fuelTotal, 1)} л`,
          tone: "default" as const,
        },
      ],
    },
  };
};
