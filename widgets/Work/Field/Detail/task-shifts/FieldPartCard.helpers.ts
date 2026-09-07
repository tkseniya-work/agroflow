import type { FieldPartCardProps, ShiftPartDetails } from "../../../../../src/types/task.types";
import {
  formatDurationMinutes,
  formatMoney,
  formatNullableNumber,
  formatNumber,
  formatShiftTime,
  formatTime,
  getMaterialSummary,
  getPartTypeLabels,
  getTariffPartIds,
} from "../../../../../src/utils/taskUtils";
import Colors from "../../../../../shared/styles/Colors";

type BuildFieldPartCardModelParams = Pick<
  FieldPartCardProps,
  | "employeeName"
  | "employeePosition"
  | "aggregate"
  | "fieldPart"
  | "tariffPart"
  | "productionShiftId"
  | "shiftType"
  | "qrCodeScannedAt"
> & {
  shiftName: string;
};

type DetailSection = NonNullable<ShiftPartDetails["sections"]>[number];

const formatDate = (value?: string | null) => {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const formatId = (value: any) => {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "object") {
    return String(value.description ?? value.name ?? value.id ?? "—");
  }

  return String(value);
};

const hasPositiveValue = (value: any) => {
  const number = Number(value);
  return Number.isFinite(number) && number > 0;
};

export const durationSpanToMinutes = (value?: string | number | null) => {
  if (value === null || value === undefined || value === "") return 0;
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;

  if (!String(value).includes(":")) {
    const minutes = Number(value);
    return Number.isFinite(minutes) ? minutes : 0;
  }

  let days = 0;
  let time = String(value);

  if (time.includes(".") && time.indexOf(".") < time.indexOf(":")) {
    const [dayPart, timePart] = time.split(".");
    days = Number(dayPart) || 0;
    time = timePart;
  }

  const [hours, minutes, seconds] = time.split(":").map(Number);

  return (
    days * 1440 +
    (Number(hours) || 0) * 60 +
    (Number(minutes) || 0) +
    (Number(seconds) || 0) / 60
  );
};

const buildTariffSection = ({
  tariff,
  unitLabel,
  priceParameters,
  rankedParameters,
  includeFieldNorms,
}: {
  tariff: any;
  unitLabel: string;
  priceParameters: any;
  rankedParameters: any;
  includeFieldNorms: boolean;
}): DetailSection => {
  const rank = rankedParameters?.rank || {};

  return {
    title: "Тариф",
    icon: "file-document-outline",
    metricGroups: [
      {
        title: "Основные параметры",
        rows: [
          {
            label: "Код единицы",
            value: `${formatId(tariff?.unit_code)} | ${unitLabel}`,
          },
          {
            label: "Тип тарифа",
            value: tariff?.tariff_type === 0 ? "Сетка" : "Фиксированный",
          },
          { label: "Тип нагрузки", value: formatId(tariff?.workload_type) },
          { label: "Комментарий", value: tariff?.comment || "—" },
        ],
      },
      {
        title: "Нормы",
        rows: [
          {
            label: "Норма выработки",
            value: `${formatNullableNumber(tariff?.norm_value, 2)} ${unitLabel}`,
            strong: true,
          },
          ...(includeFieldNorms
            ? [
                {
                  label: "Норма площади",
                  value: `${formatNullableNumber(tariff?.norm_value_ha, 2)} га`,
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
                  label: "ГСМ на гектар",
                  value: `${formatNullableNumber(tariff?.norm_fuel_per_ha, 2)} л/га`,
                },
              ]
            : []),
        ],
      },
      {
        title: "Оплата",
        rows: [
          { label: "За смену", value: formatMoney(priceParameters?.shift) },
          {
            label: "За единицу",
            value: `${formatMoney(priceParameters?.unit)} / ${unitLabel}`,
            strong: true,
          },
          {
            label: "Коэффициент переработки",
            value: formatNullableNumber(tariff?.overtime_ratio, 2),
          },
        ],
      },
      {
        title: "Разряд и коэффициенты",
        rows: [
          { label: "Разряд", value: formatId(rank?.number) },
          {
            label: "Коэффициент разряда",
            value: formatNullableNumber(rank?.ratio, 2),
          },
          {
            label: "Повышающий коэффициент",
            value: formatNullableNumber(rankedParameters?.increasing_ratio, 2),
          },
        ],
      },
    ],
  };
};

export const buildFieldPartCardModel = ({
  employeeName,
  employeePosition,
  aggregate,
  fieldPart,
  tariffPart,
  productionShiftId,
  shiftType,
  qrCodeScannedAt,
  shiftName,
}: BuildFieldPartCardModelParams) => {
  const shiftParts = tariffPart?.shift_parts || tariffPart?.shiftParts || [];
  const typeLabels = getPartTypeLabels(shiftParts, qrCodeScannedAt);
  const technique = aggregate?.technique_standard ?? aggregate?.technique;
  const isTransportTask = Boolean(
    fieldPart?.is_transport_task ||
      fieldPart?.isTransportTask ||
      tariffPart?.is_transport_task ||
      tariffPart?.isTransportTask,
  );
  const isProductTransportationTask = Boolean(
    fieldPart?.is_product_transportation_task ||
      fieldPart?.isProductTransportationTask ||
      tariffPart?.is_product_transportation_task ||
      tariffPart?.isProductTransportationTask ||
      fieldPart?.task_kind === "transportation" ||
      tariffPart?.task_kind === "transportation",
  );
  const isTransportationTask =
    isTransportTask || isProductTransportationTask;
  const isTransportationOutput =
    isTransportationTask ||
    Boolean(
      fieldPart?.is_transportation_output ||
        fieldPart?.isTransportationOutput ||
        tariffPart?.is_transportation_output ||
        tariffPart?.isTransportationOutput,
    );
  const outputValue = tariffPart?.output_value_total;
  const payment = isTransportationOutput
    ? tariffPart?.payment_total ?? fieldPart?.payment_total
    : fieldPart?.payment_total ?? tariffPart?.payment_total;
  const productionKilometers =
    tariffPart?.production_kilometers ??
    tariffPart?.productionKilometers ??
    fieldPart?.production_kilometers ??
    fieldPart?.productionKilometers;
  const fuelTotal =
    tariffPart?.fuel_total ??
    tariffPart?.fuelTotal ??
    fieldPart?.fuel_total ??
    fieldPart?.fuelTotal;
  const reportedFuelPer100Km =
    tariffPart?.fuel_per_100km ??
    tariffPart?.fuelPer100km ??
    fieldPart?.fuel_per_100km ??
    fieldPart?.fuelPer100km;
  const fuelPer100Km =
    reportedFuelPer100Km !== null && reportedFuelPer100Km !== undefined
      ? Number(reportedFuelPer100Km) || 0
      : Number(productionKilometers) > 0
        ? (Number(fuelTotal) / Number(productionKilometers)) * 100
        : 0;
  const fuelText = isTransportationOutput
    ? `${formatNumber(fuelPer100Km, 1)} л/100км`
    : `${formatNumber(fieldPart?.fuel_per_ha, 1)} л/га`;
  const typeText = typeLabels.length ? typeLabels.join(" · ") : null;
  const materials = getMaterialSummary(tariffPart, fieldPart);
  const tariff = tariffPart?.tariff || {};
  const unitLabel =
    tariff?.unit?.short_name ??
    tariff?.unit?.shortName ??
    tariff?.unit_code?.short_name ??
    tariff?.unitCode?.shortName ??
    (tariff?.unit_code ? formatId(tariff.unit_code) : "ед");
  const autoFactArea =
    Number(tariffPart?.area_fact ?? fieldPart?.area_fact) || 0;
  const manualFactArea =
    tariffPart?.manual_fact_area ??
    tariffPart?.manualFactArea ??
    fieldPart?.manual_fact_area ??
    fieldPart?.manualFactArea;
  const autoOutputValue = Number(outputValue) || 0;
  const manualOutputValue =
    tariffPart?.manual_output_value_total ??
    tariffPart?.manualOutputValueTotal ??
    tariffPart?.manual_output_value ??
    tariffPart?.manualOutputValue;
  const hasManualFactArea = hasPositiveValue(manualFactArea);
  const hasManualOutputValue = hasPositiveValue(manualOutputValue);
  const displayFactArea = hasManualFactArea
    ? Number(manualFactArea)
    : autoFactArea;
  const displayOutputValue = hasManualOutputValue
    ? Number(manualOutputValue)
    : autoOutputValue;
  const breakDurationMinutes = durationSpanToMinutes(
    tariffPart?.break_duration ?? tariffPart?.breakDuration,
  );
  const extendDurationMinutes = durationSpanToMinutes(
    tariffPart?.extend_duration ?? tariffPart?.extendDuration,
  );
  const partDuration = isTransportationOutput
    ? tariffPart?.parts_duration ??
      tariffPart?.partsDuration ??
      fieldPart?.parts_duration ??
      fieldPart?.partsDuration
    : fieldPart?.parts_duration ?? tariffPart?.parts_duration;
  const threshedKg = Number(fieldPart?.threshed) || 0;
  const numberOfBins = Number(fieldPart?.number_of_bins) || 0;
  const fuelNormPerHa = tariff?.norm_fuel_per_ha;
  const agriculturalMachine =
    aggregate?.agricultural_machine ?? aggregate?.agriculture_machine;
  const paymentTotal = payment;
  const expBonusTotal = tariffPart?.exp_bonus_amount_total || 0;
  const overtimeBonusTotal = tariffPart?.overtime_bonus_amount_total || 0;
  const basePayment = Math.max(
    0,
    Number(paymentTotal || 0) -
      Number(expBonusTotal || 0) -
      Number(overtimeBonusTotal || 0),
  );
  const priceParameters =
    tariffPart?.tariff_price_parameters ||
    tariff?.tariff_price_parameters ||
    {};
  const rankedParameters = tariff?.tariff_ranked_parameters || {};
  const startAt =
    (isTransportationOutput
      ? tariffPart?.open_at_parts_time ?? tariffPart?.openAtPartsTime
      : fieldPart?.open_at_parts_time) ||
    fieldPart?.open_at_parts_time ||
    shiftParts[0]?.start_at;
  const endAt =
    (isTransportationOutput
      ? tariffPart?.closed_at_parts_time ?? tariffPart?.closedAtPartsTime
      : fieldPart?.closed_at_parts_time) ||
    fieldPart?.closed_at_parts_time ||
    shiftParts[shiftParts.length - 1]?.end_at;
  const smallStopsDuration =
    tariffPart?.small_stops_duration ??
    tariffPart?.smallStopsDuration ??
    fieldPart?.small_stops_duration ??
    fieldPart?.smallStopsDuration;
  const longStopsDuration =
    tariffPart?.long_stops_duration ??
    tariffPart?.longStopsDuration ??
    fieldPart?.long_stops_duration ??
    fieldPart?.longStopsDuration;
  const totalStopsDuration =
    (Number(smallStopsDuration) || 0) + (Number(longStopsDuration) || 0);
  const numberOfTrips =
    tariffPart?.number_of_trips ??
    tariffPart?.numberOfTrips ??
    fieldPart?.number_of_trips ??
    fieldPart?.numberOfTrips;
  const transportedWeightKg =
    tariffPart?.transported_weight ??
    tariffPart?.transportedWeight ??
    fieldPart?.transported_weight ??
    fieldPart?.transportedWeight;
  const transportedWeightTons = (Number(transportedWeightKg) || 0) / 1000;
  const avgSpeed =
    tariffPart?.avg_speed ??
    tariffPart?.avgSpeed ??
    fieldPart?.avg_speed ??
    fieldPart?.avgSpeed;
  const maxSpeed =
    tariffPart?.max_speed ??
    tariffPart?.maxSpeed ??
    fieldPart?.max_speed ??
    fieldPart?.maxSpeed;
  const transportObjectName =
    tariffPart?.task_field_name ??
    tariffPart?.taskFieldName ??
    fieldPart?.task_field_name ??
    fieldPart?.taskFieldName ??
    (isProductTransportationTask ? "Объект не указан" : "Выработка");
  const transportDisplayTitle = isProductTransportationTask
    ? "Выработка"
    : transportObjectName;
  const fuelNormPer100Km =
    technique?.machinery_model?.fuel_consumption_per_distance ??
    technique?.machineryModel?.fuelConsumptionPerDistance;
  const isHarvestWork =
    numberOfBins > 0 || threshedKg > 0;
  const deleteIds = getTariffPartIds(tariffPart).slice(0, 1);
  const baseDetailPayload = {
    subtitle: formatShiftTime(startAt, endAt),
    shiftName,
    shiftType,
    color: isTransportTask ? Colors.blue : Colors.greenColor,
    icon: (isTransportTask
      ? "truck-fast-outline"
      : "tractor-variant") as ShiftPartDetails["icon"],
    deleteTitle: "Удалить отрезок выработки",
    deleteIds,
    editContext: {
      productionShiftId,
      aggregate,
      fieldGrouped: fieldPart,
      tariffGrouped: tariffPart,
      employeeId: shiftParts[0]?.employee_id,
    },
    materials,
  };

  const detailPayload: ShiftPartDetails = isTransportationOutput
    ? {
        ...baseDetailPayload,
        type: "field",
        title: transportDisplayTitle,
        rows: [
          { label: "Тип", value: "Выработка" },
          {
            label: "Пробег",
            value: `${formatNumber(productionKilometers, 1)} км`,
          },
          {
            label: "Выработка",
            value: `${formatNumber(displayOutputValue, 1)} ${unitLabel}`,
          },
          { label: "ФОТ", value: formatMoney(payment) },
          { label: "ГСМ всего", value: `${formatNumber(fuelTotal, 1)} л` },
          { label: "Расход", value: fuelText },
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
          { label: "Источник", value: typeText || "Не указан" },
        ],
        summary: isTransportTask
          ? [
              {
                label: "Выработка",
                value: `${formatNumber(displayOutputValue, 1)} ${unitLabel}`,
                accent: true,
              },
              {
                label: "Пробег",
                value: `${formatNumber(productionKilometers, 1)} км`,
              },
              { label: "ФОТ", value: formatMoney(payment), accent: true },
              { label: "Расход", value: fuelText },
            ]
          : [
              {
                label: "Пробег",
                value: `${formatNumber(productionKilometers, 1)} км`,
                accent: true,
              },
              {
                label: "Рейсы",
                value: `${formatNumber(numberOfTrips, 0)} шт.`,
              },
              {
                label: "Вес",
                value: `${formatNumber(transportedWeightTons, 2)} т`,
                accent: true,
              },
              { label: "ФОТ", value: formatMoney(payment), accent: true },
            ],
        sections: [
          {
            title: "Смена и техника",
            icon: isTransportTask
              ? "truck-fast-outline"
              : "tractor-variant",
            rows: [
              { label: "Сотрудник", value: employeeName, strong: true },
              { label: "Должность", value: employeePosition },
              { label: "Смена", value: shiftName },
              {
                label: "Техника",
                value:
                  [technique?.name, technique?.state_number]
                    .filter(Boolean)
                    .join(" · ") ||
                  shiftParts[0]?.work_place_name ||
                  "—",
                strong: true,
              },
              {
                label: "Модель",
                value:
                  technique?.machinery_model?.name ??
                  technique?.machineryModel?.name ??
                  "—",
              },
              { label: "СХМ", value: agriculturalMachine?.name || "Без СХМ" },
              { label: "Дата работы", value: formatDate(startAt) },
              { label: "Начало", value: formatTime(startAt) || "—" },
              { label: "Окончание", value: formatTime(endAt) || "сейчас" },
            ],
          },
          {
            title: "Результат работы",
            icon: "chart-line",
            rows: [
              {
                label: "Объект",
                value: transportObjectName,
                strong: true,
              },
              ...(Number(
                tariffPart?.area_fact ??
                  tariffPart?.areaFact ??
                  fieldPart?.area_fact,
              ) > 0
                ? [
                    {
                      label: "Площадь",
                      value: `${formatNumber(
                        tariffPart?.area_fact ??
                          tariffPart?.areaFact ??
                          fieldPart?.area_fact,
                        1,
                      )} га`,
                    },
                  ]
                : []),
              {
                label: hasManualOutputValue
                  ? "Выработка факт · вручную"
                  : "Выработка факт",
                value: `${formatNumber(displayOutputValue, 1)} ${unitLabel}`,
                strong: true,
              },
              ...(hasManualOutputValue
                ? [
                    {
                      label: "Выработка · авторасчёт",
                      value: `${formatNumber(autoOutputValue, 1)} ${unitLabel}`,
                    },
                  ]
                : []),
              {
                label: "Длительность",
                value: formatDurationMinutes(partDuration),
              },
              { label: "Источник", value: typeText || "Не указан" },
              {
                label: "Перерыв",
                value: formatDurationMinutes(breakDurationMinutes),
              },
              {
                label: "Продление",
                value: formatDurationMinutes(extendDurationMinutes),
              },
            ],
          },
          {
            title: "Движение и простои",
            icon: "speedometer",
            rows: [
              {
                label: "Пробег",
                value: `${formatNumber(productionKilometers, 1)} км`,
              },
              { label: "Расход ГСМ", value: fuelText, strong: true },
              {
                label: "Средняя скорость",
                value: `${formatNumber(avgSpeed, 1)} км/ч`,
              },
              {
                label: "Максимальная скорость",
                value: `${formatNumber(maxSpeed, 1)} км/ч`,
                strong: true,
              },
              {
                label: "ГСМ норма",
                value: `${formatNullableNumber(fuelNormPer100Km, 1)} л/100км`,
              },
              {
                label: "Остановки",
                value: formatDurationMinutes(smallStopsDuration),
              },
              {
                label: "Стоянки",
                value: formatDurationMinutes(longStopsDuration),
              },
              {
                label: "Всего простоев",
                value: formatDurationMinutes(totalStopsDuration),
                strong: true,
              },
            ],
          },
          ...(Number(numberOfTrips) > 0 || Number(transportedWeightKg) > 0
            ? [
                {
                  title: "Транспортировка продукции",
                  icon: "truck-delivery-outline" as ShiftPartDetails["icon"],
                  rows: [
                    {
                      label: "Количество рейсов",
                      value: `${formatNumber(numberOfTrips, 0)} шт.`,
                      strong: true,
                    },
                    {
                      label: "Перевезенный вес",
                      value: `${formatNumber(transportedWeightKg, 0)} кг`,
                    },
                    {
                      label: "Перевезенный вес в тоннах",
                      value: `${formatNumber(transportedWeightTons, 2)} т`,
                      strong: true,
                    },
                  ],
                },
              ]
            : []),
          {
            title: "ФОТ",
            icon: "wallet-outline",
            rows: [
              {
                label: "Выработка норма",
                value: `${formatNullableNumber(tariff?.norm_value, 2)} ${unitLabel}`,
              },
              {
                label: "Выработка факт",
                value: `${formatNumber(displayOutputValue, 1)} ${unitLabel}`,
                strong: true,
              },
              {
                label: "Тариф за единицу",
                value: `${formatMoney(priceParameters?.unit)} / ${unitLabel}`,
              },
              {
                label: "ФОТ всего",
                value: formatMoney(paymentTotal),
                strong: true,
              },
              { label: "Базовый ФОТ", value: formatMoney(basePayment) },
              { label: "Доплата за стаж", value: formatMoney(expBonusTotal) },
              {
                label: "Доплата за переработку",
                value: formatMoney(overtimeBonusTotal),
              },
            ],
          },
          buildTariffSection({
            tariff,
            unitLabel,
            priceParameters,
            rankedParameters,
            includeFieldNorms: false,
          }),
          {
            title: "Расходники",
            icon: "gas-station-outline",
            materialGroups: [
              {
                title: "ГСМ",
                icon: "gas-station-outline",
                emptyText: "ГСМ не списывались",
                items:
                  Number(fuelTotal) > 0
                    ? [
                        { label: "ГСМ", value: "ГСМ" },
                        {
                          label: "Всего",
                          value: `${formatNumber(fuelTotal, 2)} л`,
                        },
                        {
                          label: "На 100 км",
                          value: `${formatNumber(fuelPer100Km, 2)} л/100км`,
                        },
                      ]
                    : [],
              },
            ],
          },
        ],
      }
    : {
        ...baseDetailPayload,
        type: "field",
        title: fieldPart?.task_field_name || "Поле",
        summary: [
          {
            label: "Площадь факт",
            value: `${formatNumber(displayFactArea, 1)} га`,
            accent: true,
          },
          {
            label: "Выработка",
            value: `${formatNumber(displayOutputValue, 1)} ${unitLabel}`,
          },
          { label: "ФОТ", value: formatMoney(payment), accent: true },
          { label: "ГСМ", value: fuelText },
        ],
        sections: [
          {
            title: "Смена и техника",
            icon: "tractor-variant",
            rows: [
              { label: "Сотрудник", value: employeeName, strong: true },
              { label: "Должность", value: employeePosition },
              { label: "Смена", value: shiftName },
              {
                label: "Начало",
                value: formatTime(fieldPart?.open_at_parts_time) || "—",
              },
              {
                label: "Окончание",
                value: formatTime(fieldPart?.closed_at_parts_time) || "сейчас",
              },
              {
                label: "Техника",
                value:
                  [technique?.name, technique?.state_number]
                    .filter(Boolean)
                    .join(" · ") || "—",
              },
              {
                label: "Модель",
                value: technique?.machinery_model?.name || "—",
              },
              { label: "СХМ", value: agriculturalMachine?.name || "Без СХМ" },
            ],
          },
          {
            title: "Площадь и выработка",
            icon: "map-marker-radius-outline",
            rows: [
              {
                label: "Поле",
                value: fieldPart?.task_field_name || "—",
                strong: true,
              },
              {
                label: hasManualFactArea
                  ? "Площадь факт · вручную"
                  : "Площадь факт",
                value: `${formatNumber(displayFactArea, 1)} га`,
                strong: true,
              },
              ...(hasManualFactArea
                ? [
                    {
                      label: "Площадь · авторасчёт",
                      value: `${formatNumber(autoFactArea, 1)} га`,
                    },
                  ]
                : []),
              {
                label: hasManualOutputValue
                  ? "Выработка факт · вручную"
                  : "Выработка факт",
                value: `${formatNumber(displayOutputValue, 1)} ${unitLabel}`,
              },
              ...(hasManualOutputValue
                ? [
                    {
                      label: "Выработка · авторасчёт",
                      value: `${formatNumber(autoOutputValue, 1)} ${unitLabel}`,
                    },
                  ]
                : []),
              {
                label: "Норма выработки",
                value: `${formatNullableNumber(tariff?.norm_value, 2)} ${unitLabel}`,
              },
              {
                label: "Длительность",
                value: formatDurationMinutes(partDuration),
              },
              {
                label: "Источник",
                value: typeText || "Не указан",
              },
            ],
          },
          {
            title: "Движение и простои",
            icon: "speedometer",
            rows: [
              {
                label: "Средняя скорость",
                value: `${formatNumber(fieldPart?.avg_speed, 1)} км/ч`,
              },
              {
                label: "Максимальная скорость",
                value: `${formatNumber(fieldPart?.max_speed, 1)} км/ч`,
                strong: true,
              },
              {
                label: "Остановки",
                value: formatDurationMinutes(fieldPart?.small_stops_duration),
              },
              {
                label: "Стоянки",
                value: formatDurationMinutes(fieldPart?.long_stops_duration),
              },
              {
                label: "Всего простоев",
                value: formatDurationMinutes(
                  (Number(fieldPart?.small_stops_duration) || 0) +
                    (Number(fieldPart?.long_stops_duration) || 0),
                ),
                strong: true,
              },
              {
                label: "Перерыв",
                value: formatDurationMinutes(breakDurationMinutes),
              },
              {
                label: "Продление",
                value: formatDurationMinutes(extendDurationMinutes),
              },
              { label: "ГСМ факт", value: fuelText, strong: true },
              {
                label: "ГСМ норма",
                value: `${formatNullableNumber(fuelNormPerHa, 2)} л/га`,
              },
            ],
          },
          ...(isHarvestWork
            ? [
                {
                  title: "Уборка урожая",
                  icon: "sack" as ShiftPartDetails["icon"],
                  rows: [
                    {
                      label: "Количество бункеров",
                      value: `${formatNumber(numberOfBins, 0)} шт.`,
                      strong: true,
                    },
                    {
                      label: "Намолот",
                      value: `${formatNumber(threshedKg, 0)} кг`,
                    },
                    {
                      label: "Намолот в тоннах",
                      value: `${formatNumber(threshedKg / 1000, 2)} т`,
                      strong: true,
                    },
                  ],
                },
              ]
            : []),
          {
            title: "ФОТ",
            icon: "wallet-outline",
            rows: [
              {
                label: "ФОТ всего",
                value: formatMoney(paymentTotal),
                strong: true,
              },
              { label: "Базовый ФОТ", value: formatMoney(basePayment) },
              {
                label: "Тариф за единицу",
                value: `${formatMoney(priceParameters?.unit)} / ${unitLabel}`,
              },
              { label: "Доплата за стаж", value: formatMoney(expBonusTotal) },
              {
                label: "Доплата за переработку",
                value: formatMoney(overtimeBonusTotal),
              },
            ],
          },
          buildTariffSection({
            tariff,
            unitLabel,
            priceParameters,
            rankedParameters,
            includeFieldNorms: true,
          }),
          {
            title: "Расходники",
            icon: "package-variant-closed",
            items: materials.length
              ? materials
              : ["Расходники не списывались"],
          },
        ],
        rows: [
          { label: "Тип", value: "Выработка" },
          {
            label: "Площадь",
            value: `${formatNumber(displayFactArea, 1)} га`,
          },
          {
            label: "Выработка",
            value: `${formatNumber(displayOutputValue, 1)} ${unitLabel}`,
          },
          { label: "ФОТ", value: formatMoney(payment) },
          { label: "ГСМ", value: fuelText },
          {
            label: "Скорость",
            value: `${formatNumber(fieldPart?.avg_speed, 0)} / ${formatNumber(fieldPart?.max_speed, 0)} км/ч`,
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
          { label: "Источник", value: typeText || "Не указан" },
        ],
      };

  return {
    detailPayload,
    deleteIds,
    variant: isTransportTask
      ? ("transport" as const)
      : ("field" as const),
    compact: {
      time: formatShiftTime(startAt, endAt),
      duration: formatDurationMinutes(partDuration),
      title: isTransportationOutput
        ? transportDisplayTitle
        : fieldPart?.task_field_name || "Поле",
      result: isTransportationOutput
        ? `${formatNumber(displayOutputValue, 1)} ${unitLabel}`
        : `${formatNumber(displayFactArea, 1)} га`,
      payment: formatMoney(payment),
      metrics: [
        ...(!isTransportationOutput
          ? [
              {
                label: hasManualFactArea ? "Площадь · вручную" : "Площадь",
                value: `${formatNumber(displayFactArea, 1)} га`,
                tone: hasManualFactArea ? ("warning" as const) : ("default" as const),
              },
            ]
          : []),
        {
          label:
            hasManualOutputValue && !isTransportationTask
              ? "Выработка · вручную"
              : "Выработка",
          value: `${formatNumber(displayOutputValue, 1)} ${unitLabel}`,
          tone: hasManualOutputValue ? ("warning" as const) : ("default" as const),
        },
        ...(isTransportationOutput
          ? [
              {
                label: "Пробег",
                value: `${formatNumber(productionKilometers, 1)} км`,
                tone: "default" as const,
              },
            ]
          : []),
        ...(isProductTransportationTask && Number(transportedWeightKg) > 0
          ? [
              {
                label: "Вес",
                value: `${formatNumber(transportedWeightTons, 2)} т`,
                tone: "default" as const,
              },
            ]
          : []),
        ...(isProductTransportationTask && Number(numberOfTrips) > 0
          ? [
              {
                label: "Рейсы",
                value: `${formatNumber(numberOfTrips, 0)} шт.`,
                tone: "default" as const,
              },
            ]
          : []),
        {
          label: "Начислено",
          value: formatMoney(payment),
          tone: "success" as const,
        },
        {
          label: "ГСМ факт",
          value: fuelText,
          tone: "default" as const,
        },
      ],
      badges: [
        ...(isProductTransportationTask &&
        transportObjectName !== "Объект не указан"
          ? [
              {
                icon: "location-outline" as const,
                label: transportObjectName,
                tone: "default" as const,
              },
            ]
          : []),
        ...typeLabels.map((label) => ({
          icon: "radio-button-on-outline" as const,
          label,
          tone:
            label === "QR"
              ? ("sourceQr" as const)
              : label === "Руч."
                ? ("sourceManual" as const)
                : ("sourceAuto" as const),
        })),
        ...(isTransportationTask && hasManualOutputValue
          ? [
              {
                icon: "create-outline" as const,
                label: "Ручн. кор.",
                tone: "correction" as const,
              },
            ]
          : []),
        ...(!isTransportTask &&
        (technique?.machinery_model?.name || technique?.name)
          ? [
              {
                icon: "construct-outline" as const,
                label: [
                  technique?.machinery_model?.name || technique?.name,
                  technique?.state_number,
                ]
                  .filter(Boolean)
                  .join(" · "),
                tone: "default" as const,
              },
            ]
          : []),
        ...(!isTransportationTask && agriculturalMachine?.name
          ? [
              {
                icon: "settings-outline" as const,
                label: `СХМ: ${agriculturalMachine.name}`,
                tone: "default" as const,
              },
            ]
          : []),
        ...(breakDurationMinutes > 0
          ? [
              {
                icon: "cafe-outline" as const,
                label: `перерыв ${formatDurationMinutes(breakDurationMinutes)}`,
                tone: "danger" as const,
              },
            ]
          : []),
        ...(extendDurationMinutes > 0
          ? [
              {
                icon: "time-outline" as const,
                label: `продление ${formatDurationMinutes(extendDurationMinutes)}`,
                tone: "info" as const,
              },
            ]
          : []),
        ...(threshedKg > 0
          ? [
              {
                icon: "leaf-outline" as const,
                label: `${formatNumber(threshedKg / 1000, 2)} т намолот`,
                tone: "default" as const,
              },
            ]
          : []),
        ...(numberOfBins > 0
          ? [
              {
                icon: "cube-outline" as const,
                label: `${formatNumber(numberOfBins, 0)} бунк.`,
                tone: "default" as const,
              },
            ]
          : []),
        ...(!isTransportationTask &&
        fuelNormPerHa !== null &&
        fuelNormPerHa !== undefined
          ? [
              {
                icon: "speedometer-outline" as const,
                label: `норма ${formatNumber(fuelNormPerHa, 2)} л/га`,
                tone: "default" as const,
              },
            ]
          : []),
        ...(isTransportationTask &&
        fuelNormPer100Km !== null &&
        fuelNormPer100Km !== undefined
          ? [
              {
                icon: "speedometer-outline" as const,
                label: `норма ${formatNumber(fuelNormPer100Km, 1)} л/100км`,
                tone: "default" as const,
              },
            ]
          : []),
      ],
    },
  };
};
