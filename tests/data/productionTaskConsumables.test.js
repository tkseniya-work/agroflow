const assert = require("node:assert/strict");
const test = require("node:test");

const {
  buildConsumableRequestData,
} = require("../../.test-build/entities/productionTask/api/productionTaskConsumables.logic");

test("edited seed request preserves record and crop variety ids", () => {
  assert.deepEqual(
    buildConsumableRequestData("seed", {
      id: "norm-1",
      production_task_field_id: "field-1",
      crop_variety_standard_id: "variety-1",
      unit_code: "7",
      quantity: 12.5,
    }),
    {
      id: "norm-1",
      crop_variety_standard_id: "variety-1",
      quantity: 12.5,
      unit_code: 7,
      production_task_field_id: "field-1",
    },
  );
});

test("edited pesticide request preserves pesticide foreign key", () => {
  assert.deepEqual(
    buildConsumableRequestData("pesticide", {
      id: "norm-2",
      production_task_field_id: "field-1",
      pesticide_id: "pesticide-1",
      quantity: 2,
    }),
    {
      id: "norm-2",
      pesticide_id: "pesticide-1",
      quantity: 2,
      production_task_field_id: "field-1",
    },
  );
});

test("edited fertilizer request preserves fertilizer foreign key", () => {
  assert.deepEqual(
    buildConsumableRequestData("fertilizer", {
      id: "norm-3",
      production_task_field_id: "field-1",
      fertilizer_id: "fertilizer-1",
      quantity: 15,
    }),
    {
      id: "norm-3",
      fertilizer_id: "fertilizer-1",
      quantity: 15,
      production_task_field_id: "field-1",
    },
  );
});

test("new seed request converts an empty unit code to zero", () => {
  assert.deepEqual(
    buildConsumableRequestData("seed", {
      production_task_field_id: "field-1",
      crop_variety_standard_id: "variety-1",
      unit_code: null,
      quantity: 10,
    }),
    {
      crop_variety_standard_id: "variety-1",
      quantity: 10,
      unit_code: 0,
      production_task_field_id: "field-1",
      weight: 0,
    },
  );
});
