const assert = require("node:assert/strict");
const test = require("node:test");

const {
  buildAddShiftPartPayload,
  validateAddShiftPart,
} = require("../../.test-build/widgets/Work/Field/Detail/task-shifts/AddShiftPartModal.helpers");

const validForm = {
  date: "2026-07-20",
  startAt: "08:00",
  endedDate: "2026-07-20",
  endedAt: "18:00",
  outputValue: "12.5",
  factArea: "7",
  forceLoadTrack: false,
};

test("online shift payload uses start time as end time", () => {
  const payload = buildAddShiftPartPayload({
    currentTaskId: "task-1",
    form: validForm,
    isFact: false,
    employeeId: "employee-1",
    shiftTypeId: 2,
    techniqueId: "technique-1",
    tariffId: "tariff-1",
  });

  assert.equal(payload.production_task_id, "task-1");
  assert.equal(payload.start_at, payload.ended_at);
  assert.equal(payload.start_at, payload.start_at_iso);
  assert.equal(payload.output_value, 12.5);
  assert.equal(payload.fact_area, 7);
  assert.equal(payload.force_load_track, false);
});

test("fact shift payload keeps selected relations and end time", () => {
  const payload = buildAddShiftPartPayload({
    currentTaskId: "task-1",
    form: { ...validForm, forceLoadTrack: true },
    isFact: true,
    employeeId: "employee-1",
    shiftTypeId: 1,
    techniqueId: "technique-1",
    agriculturalMachineryId: "machine-1",
    tariffId: "tariff-1",
    fieldId: "field-1",
  });

  assert.notEqual(payload.start_at, payload.ended_at);
  assert.equal(payload.employee_id, "employee-1");
  assert.equal(payload.agricultural_machinery_id, "machine-1");
  assert.equal(payload.task_field_id, "field-1");
  assert.equal(payload.force_load_track, true);
});

test("shift validation reports required selections in order", () => {
  const base = {
    accessToken: "token",
    form: validForm,
    isFact: true,
    hasEmployee: true,
    hasShiftType: true,
    hasTechnique: true,
    hasTariff: true,
  };

  assert.equal(
    validateAddShiftPart({ ...base, hasEmployee: false }),
    "Выберите сотрудника",
  );
  assert.equal(
    validateAddShiftPart({ ...base, hasTechnique: false }),
    "Выберите технику",
  );
  assert.equal(
    validateAddShiftPart({ ...base, hasTariff: false }),
    "Выберите тариф",
  );
});

test("fact shift validation rejects end time before start time", () => {
  const error = validateAddShiftPart({
    accessToken: "token",
    form: { ...validForm, endedAt: "07:00" },
    isFact: true,
    hasEmployee: true,
    hasShiftType: true,
    hasTechnique: true,
    hasTariff: true,
  });

  assert.equal(error, "Окончание не может быть раньше начала");
});

test("GPS track preview does not require a tariff", () => {
  const error = validateAddShiftPart({
    accessToken: "token",
    form: { ...validForm, forceLoadTrack: true },
    isFact: true,
    hasEmployee: true,
    hasShiftType: true,
    hasTechnique: true,
    hasTariff: false,
  });

  assert.equal(error, null);
});
