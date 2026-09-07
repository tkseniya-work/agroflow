const assert = require("node:assert/strict");
const test = require("node:test");

const {
  buildTransferPartCardModel,
  isAlmostInstantPart,
} = require("../../.test-build/widgets/Work/Field/Detail/task-shifts/TransferPartCard.helpers");

const aggregate = {
  technique_standard: {
    name: "КамАЗ",
    state_number: "А123АА",
    machinery_model: { name: "65115" },
  },
};

const currentPart = {
  shift_parts: [{ id: "part-1", employee_id: "employee-1" }],
  production_kilometers: 80,
  fuel_total: 16,
  payment_total: 900,
  parts_duration: 120,
  open_at_parts_time: "2026-07-20T08:00:00Z",
  closed_at_parts_time: "2026-07-20T10:00:00Z",
  tariff: { norm_value: 100, unit_code: "км" },
};

const buildModel = (overrides = {}) =>
  buildTransferPartCardModel({
    employeeName: "Иванов И.И.",
    employeePosition: "Водитель",
    aggregate,
    currentPart,
    productionShiftId: "shift-1",
    shiftType: 1,
    kilometers: 0,
    avgSpeed: 40,
    maxSpeed: 65,
    qrCodeScannedAt: null,
    shiftName: "Первая смена",
    ...overrides,
  });

test("initial transfer part builds employee boarding details", () => {
  const model = buildModel({
    currentPart: {
      ...currentPart,
      shift_parts: [
        { id: "part-1", employee_id: "employee-1", is_initial: true },
      ],
    },
  });

  assert.equal(model.isInitial, true);
  assert.equal(model.detailPayload.title, "Посадка сотрудника");
  assert.equal(model.detailPayload.deleteTitle, "Удалить посадку сотрудника");
  assert.equal(model.detailPayload.sections.length, 1);
  assert.equal(
    model.detailPayload.sections[0].rows.some(
      (row) => ["Техника", "Модель", "СХМ"].includes(row.label),
    ),
    false,
  );
  assert.deepEqual(model.compact.initialBadges, []);
  assert.deepEqual(model.deleteIds, ["part-1"]);
});

test("regular transfer calculates distance and fuel consumption", () => {
  const model = buildModel({
    currentPart: {
      ...currentPart,
      shift_parts: [
        { id: "qr", part_type: { id: 1 } },
        { id: "manual", part_type: { id: 2 } },
        { id: "auto", part_type: { id: 3 } },
      ],
    },
  });
  const movement = model.detailPayload.sections.find(
    (section) => section.title === "Движение и топливо",
  );

  assert.equal(model.isInitial, false);
  assert.equal(model.detailPayload.title, "Перегон");
  assert.equal(model.compact.title, "Перегон");
  assert.equal(model.compact.result, "80,0 км");
  assert.deepEqual(
    model.compact.metrics.map(({ label, value }) => ({ label, value })),
    [
      { label: "Перегон", value: "80,0 км" },
      { label: "Начислено", value: "900,00 ₽" },
      { label: "Расход ГСМ", value: "20,0 л/100км" },
      { label: "ГСМ всего", value: "16,0 л" },
    ],
  );
  assert.deepEqual(
    model.compact.badges
      .filter((item) => ["QR", "Руч.", "Авто"].includes(item.label))
      .map(({ label, tone }) => ({ label, tone })),
    [
      { label: "QR", tone: "sourceQr" },
      { label: "Руч.", tone: "sourceManual" },
      { label: "Авто", tone: "sourceAuto" },
    ],
  );
  assert.equal(
    model.compact.badges.some(
      (badge) =>
        badge.label.includes("КамАЗ") || badge.label.startsWith("СХМ:"),
    ),
    false,
  );
  assert.equal(
    movement.rows.find((row) => row.label === "Расход").value,
    "20,0 л/100км",
  );
});

test("transportation includes weight and trip metrics", () => {
  const model = buildModel({
    currentPart: {
      ...currentPart,
      is_transportation: true,
      transported_weight: 2500,
      number_of_trips: 3,
    },
  });

  assert.equal(model.detailPayload.title, "Транспортировка");
  assert.equal(model.transferIcon, "truck-delivery-outline");
  assert.deepEqual(
    model.detailPayload.summary.slice(0, 3).map(({ label, value }) => ({
      label,
      value,
    })),
    [
      { label: "Пробег", value: "80,0 км" },
      { label: "Вес", value: "2,5 т" },
      { label: "Рейсы", value: "3 шт" },
    ],
  );
});

test("one-second part is displayed as an open interval", () => {
  const start = "2026-07-20T08:00:00Z";
  const end = "2026-07-20T08:00:01Z";
  const model = buildModel({
    currentPart: {
      ...currentPart,
      open_at_parts_time: start,
      closed_at_parts_time: end,
    },
  });

  assert.equal(isAlmostInstantPart(start, end), true);
  assert.match(model.compact.time, /-> сейчас$/);
});
