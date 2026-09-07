const assert = require("node:assert/strict");
const test = require("node:test");

const {
  buildFieldPartCardModel,
} = require("../../.test-build/widgets/Work/Field/Detail/task-shifts/FieldPartCard.helpers");

const aggregate = {
  technique_standard: {
    name: "Трактор",
    state_number: "А123АА",
    machinery_model: { name: "МТЗ-82" },
  },
  agricultural_machine: { name: "Сеялка" },
};

const tariffPart = {
  shift_parts: [
    {
      id: "part-1",
      employee_id: "employee-1",
      part_type: { id: 2 },
    },
    { id: "part-2" },
  ],
  output_value_total: 12,
  payment_total: 1000,
  exp_bonus_amount_total: 200,
  overtime_bonus_amount_total: 100,
  tariff_price_parameters: { unit: 50, shift: 500 },
  pesticides: [{ id: "p-1", name: "Гербицид", quantity: 3 }],
  tariff: {
    norm_value: 10,
    unit_code: { description: "га" },
    tariff_type: 1,
    tariff_ranked_parameters: {
      rank: { number: 4, ratio: 1.2 },
      increasing_ratio: 1.1,
    },
  },
};

const fieldPart = {
  task_field_name: "Поле 7",
  area_fact: 5,
  payment_total: 1000,
  fuel_total: 20,
  fuel_per_ha: 4,
  avg_speed: 8,
  max_speed: 12,
  small_stops_duration: 10,
  long_stops_duration: 20,
  number_of_bins: 2,
  threshed: 3000,
  open_at_parts_time: "2026-07-20T08:00:00Z",
  closed_at_parts_time: "2026-07-20T18:00:00Z",
};

const buildModel = (overrides = {}) =>
  buildFieldPartCardModel({
    employeeName: "Иванов И.И.",
    employeePosition: "Механизатор",
    aggregate,
    fieldPart,
    tariffPart,
    productionShiftId: "shift-1",
    shiftType: 1,
    qrCodeScannedAt: "2026-07-20T07:50:00Z",
    shiftName: "Первая смена",
    ...overrides,
  });

const getSection = (model, title) =>
  model.detailPayload.sections.find((section) => section.title === title);

test("field card model keeps edit context and only the first delete id", () => {
  const model = buildModel();

  assert.equal(model.detailPayload.title, "Поле 7");
  assert.deepEqual(model.deleteIds, ["part-1"]);
  assert.equal(model.detailPayload.editContext.productionShiftId, "shift-1");
  assert.equal(model.detailPayload.editContext.employeeId, "employee-1");
  assert.equal(model.compact.title, "Поле 7");
  assert.equal(model.compact.result, "5,0 га");
  assert.deepEqual(
    model.compact.badges
      .filter((item) => ["QR", "Руч."].includes(item.label))
      .map(({ label, tone }) => ({ label, tone })),
    [
      { label: "QR", tone: "sourceQr" },
      { label: "Руч.", tone: "sourceManual" },
    ],
  );
  assert.deepEqual(
    model.compact.badges.slice(0, 2).map((item) => item.label),
    ["QR", "Руч."],
  );
});

test("field card model includes harvest, payroll and consumables", () => {
  const model = buildModel();
  const harvest = getSection(model, "Уборка урожая");
  const payroll = getSection(model, "ФОТ");
  const materials = getSection(model, "Расходники");

  assert.equal(
    harvest.rows.find((row) => row.label === "Намолот в тоннах").value,
    "3,00 т",
  );
  assert.equal(
    payroll.rows.find((row) => row.label === "Базовый ФОТ").value,
    "700,00 ₽",
  );
  assert.deepEqual(materials.items, ["СЗР: Гербицид 3,00 л", "ГСМ: 20,00 л"]);
});

test("field card model matches web values and manual corrections", () => {
  const model = buildModel({
    fieldPart: {
      ...fieldPart,
      parts_duration: 125,
    },
    tariffPart: {
      ...tariffPart,
      manual_fact_area: 7,
      manual_output_value: 15,
      break_duration: "01:30:00",
      extend_duration: "00:15:00",
      shift_parts: [
        {
          id: "part-1",
          employee_id: "employee-1",
          part_type: { id: 1 },
        },
      ],
      tariff: {
        ...tariffPart.tariff,
        norm_fuel_per_ha: 3.5,
      },
    },
    qrCodeScannedAt: null,
  });
  const area = model.compact.metrics.find((item) =>
    item.label.startsWith("Площадь"),
  );
  const output = model.compact.metrics.find((item) =>
    item.label.startsWith("Выработка"),
  );
  const badgeLabels = model.compact.badges.map((item) => item.label);
  const movement = getSection(model, "Движение и простои");

  assert.deepEqual(area, {
    label: "Площадь · вручную",
    value: "7,0 га",
    tone: "warning",
  });
  assert.deepEqual(output, {
    label: "Выработка · вручную",
    value: "15,0 га",
    tone: "warning",
  });
  assert.equal(model.compact.duration, "2 ч 5 мин");
  assert.ok(badgeLabels.includes("QR"));
  assert.ok(badgeLabels.includes("перерыв 1 ч 30 мин"));
  assert.ok(badgeLabels.includes("продление 15 мин"));
  assert.ok(badgeLabels.includes("норма 3,50 л/га"));
  assert.equal(
    movement.rows.find((row) => row.label === "Перерыв").value,
    "1 ч 30 мин",
  );
});

test("transport output model calculates fuel, stops and transported weight", () => {
  const model = buildModel({
    fieldPart: {
      ...fieldPart,
      is_product_transportation_task: true,
      is_transportation_output: true,
      production_kilometers: 100,
      fuel_total: 25,
      number_of_trips: 4,
      transported_weight: 2500,
    },
    tariffPart: {
      ...tariffPart,
      is_product_transportation_task: true,
      task_field_name: "Поле 7",
    },
  });
  const movement = getSection(model, "Движение и простои");
  const transportation = getSection(model, "Транспортировка продукции");

  assert.equal(model.variant, "field");
  assert.equal(model.detailPayload.title, "Выработка");
  assert.equal(model.detailPayload.color, "#0b9444");
  assert.equal(model.detailPayload.icon, "tractor-variant");
  assert.equal(model.compact.title, "Выработка");
  assert.equal(model.compact.result, "12,0 га");
  assert.deepEqual(
    model.compact.metrics.map(({ label, value }) => ({ label, value })),
    [
      { label: "Выработка", value: "12,0 га" },
      { label: "Пробег", value: "100,0 км" },
      { label: "Вес", value: "2,50 т" },
      { label: "Рейсы", value: "4 шт." },
      { label: "Начислено", value: "1\u00a0000,00 ₽" },
      { label: "ГСМ факт", value: "25,0 л/100км" },
    ],
  );
  assert.ok(
    model.compact.badges.some((badge) => badge.label === "Поле 7"),
  );
  assert.equal(
    movement.rows.find((row) => row.label === "Расход ГСМ").value,
    "25,0 л/100км",
  );
  assert.equal(
    movement.rows.find((row) => row.label === "Всего простоев").value,
    "30 мин",
  );
  assert.equal(
    transportation.rows.find(
      (row) => row.label === "Перевезенный вес в тоннах",
    ).value,
    "2,50 т",
  );
});

test("transport task uses tariff metrics, manual output and transport styling", () => {
  const model = buildModel({
    aggregate: {
      ...aggregate,
      technique_standard: {
        ...aggregate.technique_standard,
        machinery_model: {
          name: "КамАЗ",
          fuel_consumption_per_distance: 28,
        },
      },
    },
    fieldPart: {
      ...fieldPart,
      is_transport_task: true,
      task_field_name: "Поле 12",
      payment_total: 9999,
    },
    tariffPart: {
      ...tariffPart,
      is_transport_task: true,
      task_field_name: "Поле 12",
      open_at_parts_time: "2026-07-20T09:00:00Z",
      closed_at_parts_time: "2026-07-20T11:05:00Z",
      parts_duration: 125,
      output_value_total: 80,
      manual_output_value_total: 95,
      production_kilometers: 42.5,
      fuel_per_100km: 24.4,
      payment_total: 2300,
      extend_duration: "00:15:00",
      shift_parts: [
        {
          id: "transport-1",
          employee_id: "employee-1",
          part_type: { id: 3 },
        },
      ],
      tariff: {
        ...tariffPart.tariff,
        unit_code: { short_name: "т" },
      },
    },
    qrCodeScannedAt: null,
  });

  assert.equal(model.variant, "transport");
  assert.equal(model.compact.title, "Поле 12");
  assert.equal(model.compact.time, "12:00 - 14:05");
  assert.equal(model.compact.duration, "2 ч 5 мин");
  assert.deepEqual(
    model.compact.metrics.map(({ label, value }) => ({ label, value })),
    [
      { label: "Выработка", value: "95,0 т" },
      { label: "Пробег", value: "42,5 км" },
      { label: "Начислено", value: "2 300,00 ₽" },
      { label: "ГСМ факт", value: "24,4 л/100км" },
    ],
  );
  assert.ok(model.compact.badges.some((badge) => badge.label === "Авто"));
  assert.ok(
    model.compact.badges.some(
      (badge) =>
        badge.label === "Ручн. кор." &&
        badge.tone === "correction",
    ),
  );
  assert.ok(
    model.compact.badges.some(
      (badge) => badge.label === "продление 15 мин",
    ),
  );
  assert.ok(
    model.compact.badges.some(
      (badge) => badge.label === "норма 28,0 л/100км",
    ),
  );
  assert.equal(
    getSection(model, "Результат работы").rows.find(
      (row) => row.label === "Выработка · авторасчёт",
    ).value,
    "80,0 т",
  );
});
