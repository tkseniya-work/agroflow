const assert = require("node:assert/strict");
const test = require("node:test");

const {
  buildMaterialQuantityRequest,
  buildShiftPartSavePlan,
  getMaterialQuantityError,
  getShiftPartOutputValue,
  hasTransportationTask,
  hasTransportTask,
  toApiIso,
  toNumberOrNull,
} = require("../../.test-build/widgets/Work/Field/Detail/task-shifts/ShiftPartEditModal.helpers");

const form = {
  startAt: "2026-07-20T08:00:00+03:00",
  endedAt: "2026-07-20T18:00:00+03:00",
  outputValue: "12.5",
  factArea: "7",
  threshed: "",
  numberOfBins: "",
  transportedWeight: "",
  numberOfTrips: "",
  forceLoadTrack: false,
};

const basePlan = (overrides = {}) =>
  buildShiftPartSavePlan({
    accessToken: "token",
    currentTaskId: "task-1",
    productionShiftId: "shift-1",
    detailsType: "field",
    form,
    originalStartAt: toApiIso(form.startAt),
    originalEndedAt: toApiIso(form.endedAt),
    originalFieldId: "field-1",
    editablePartIds: ["part-1", "part-2"],
    isTransportOutput: false,
    selectedFieldId: "field-1",
    selectedTechnique: { id: "technique-1" },
    selectedAgriMachineId: "machine-1",
    selectedTariffId: "tariff-1",
    oldTariffId: "tariff-1",
    isTransportation: false,
    isTransportTask: false,
    workPlaces: [
      {
        id: "work-place-1",
        work_place_technique: { technique: { id: "technique-1" } },
      },
    ],
    ...overrides,
  });

test("unchanged shift skips part updates and sends grouped field totals", () => {
  const plan = basePlan();

  assert.deepEqual(plan.partRequests, []);
  assert.equal(plan.hasInvalidTimes, false);
  assert.equal(plan.totalsRequest.taskId, "task-1");
  assert.equal(plan.totalsRequest.shiftId, "shift-1");
  assert.equal(plan.totalsRequest.workPlaceId, "work-place-1");
  assert.equal(plan.totalsRequest.oldTariffId, null);
  assert.deepEqual(plan.totalsRequest.updateFieldTaskParts, {
    taskFieldId: "field-1",
    agriculturalMachineryId: "machine-1",
    outputValue: 12.5,
    factArea: 7,
    threshed: null,
    numberOfBins: null,
  });
  assert.equal("shiftPartsIds" in plan.totalsRequest, false);
});

test("changed tariff sends the original tariff as the group key", () => {
  const plan = basePlan({
    selectedTariffId: "tariff-2",
    oldTariffId: "tariff-1",
  });

  assert.equal(plan.totalsRequest.tariffId, "tariff-2");
  assert.equal(plan.totalsRequest.oldTariffId, "tariff-1");
});

test("transportation field output sends exactly one transportation totals block", () => {
  const plan = basePlan({
    isTransportation: true,
    form: {
      ...form,
      outputValue: "12,5",
      transportedWeight: "1500",
      numberOfTrips: "3",
    },
  });

  assert.deepEqual(plan.totalsRequest.updateTransportationTaskParts, {
    agriculturalMachineryId: "machine-1",
    outputValue: 12.5,
    transportedWeight: 1500,
    numberOfTrips: 3,
  });
  assert.equal("updateFieldTaskParts" in plan.totalsRequest, false);
});

test("transport task sends transport totals and accepts decimal comma", () => {
  const plan = basePlan({
    isTransportOutput: true,
    isTransportTask: true,
    form: { ...form, outputValue: "8,75" },
  });

  assert.deepEqual(plan.totalsRequest.updateTransportTaskParts, {
    agriculturalMachineryId: "machine-1",
    outputValue: 8.75,
  });
  assert.equal("updateFieldTaskParts" in plan.totalsRequest, false);
});

test("task kind is resolved from task type id without nested task data", () => {
  assert.equal(hasTransportTask({ task_type: { id: 2 } }), true);
  assert.equal(hasTransportationTask({ task_type: { id: 4 } }), true);
  assert.equal(hasTransportationTask({ task_type: { id: 2 } }), false);
  assert.equal(toNumberOrNull(" 3,5 "), 3.5);
});

test("transport editor falls back from a zero total to production kilometers", () => {
  assert.equal(
    getShiftPartOutputValue({
      tariffGrouped: { output_value_total: 0 },
      fieldGrouped: { production_kilometers: 84.5 },
      transferGrouped: null,
      isTransportOutput: true,
    }),
    84.5,
  );
});

test("transport editor keeps a non-zero manually entered output", () => {
  assert.equal(
    getShiftPartOutputValue({
      tariffGrouped: {
        output_value_total: 17.5,
        production_kilometers: 84.5,
      },
      fieldGrouped: null,
      transferGrouped: null,
      isTransportOutput: true,
    }),
    17.5,
  );
});

test("field change updates every grouped part", () => {
  const plan = basePlan({ selectedFieldId: "field-2" });

  assert.equal(plan.partRequests.length, 2);
  assert.deepEqual(
    plan.partRequests.map((request) => request.id),
    ["part-1", "part-2"],
  );
  assert.ok(
    plan.partRequests.every((request) => request.taskFieldId === "field-2"),
  );
});

test("invalid end time is safely moved after the start", () => {
  const plan = basePlan({
    form: { ...form, endedAt: "2026-07-20T07:00:00+03:00" },
  });
  const request = plan.partRequests[0];

  assert.equal(
    Date.parse(request.endedAt) - Date.parse(request.startAt),
    1000,
  );
  assert.equal(plan.hasInvalidTimes, false);
});

test("missing changed start time marks the save plan as invalid", () => {
  const plan = basePlan({ form: { ...form, startAt: "" } });

  assert.equal(plan.hasInvalidTimes, true);
});

test("seed material request preserves unit code", () => {
  const request = buildMaterialQuantityRequest({
    accessToken: "token",
    materialPartIds: ["part-1", "part-2"],
    selectedMaterial: {
      id: "seed-1",
      type: "seed",
      label: "Пшеница",
      value: 10,
      unit: "кг",
      unitCode: 4,
    },
    materialQuantity: "15.5",
  });

  assert.deepEqual(request.data, {
    parts_ids: ["part-1", "part-2"],
    material_id: "seed-1",
    material_type: "seed",
    parts_quantity: 15.5,
    unit_code: 4,
  });
});

test("material quantity accepts decimal comma and rejects invalid values", () => {
  const request = buildMaterialQuantityRequest({
    accessToken: "token",
    materialPartIds: ["part-1"],
    selectedMaterial: {
      id: "fertilizer-1",
      type: "fertilizer",
      label: "Удобрение",
      value: 10,
      unit: "кг",
    },
    materialQuantity: "15,5",
  });

  assert.equal(request.data.parts_quantity, 15.5);
  assert.equal(getMaterialQuantityError(""), "Укажите количество расходника");
  assert.equal(
    getMaterialQuantityError("-1"),
    "Введите корректное неотрицательное число",
  );
  assert.equal(getMaterialQuantityError("0"), null);
});
