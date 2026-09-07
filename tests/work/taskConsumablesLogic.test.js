const assert = require("node:assert/strict");
const test = require("node:test");

const {
  buildConsumableItems,
  buildConsumablePayload,
  buildSourceOptions,
  buildUnitOptions,
  getConsumableRowMeta,
  normalizeDictionaryItems,
} = require("../../.test-build/widgets/Work/Field/Edit/TaskConsumables.logic");

test("consumable dictionaries are flattened from nested API shapes", () => {
  const first = { id: "seed-1", name: "Омская 36" };
  const second = { id: "seed-2", name: "Алтайская 70" };

  assert.deepEqual(
    normalizeDictionaryItems({
      result: [{ crop_varieties: [first] }, { children: [second] }],
    }),
    [first, second],
  );
  assert.deepEqual(normalizeDictionaryItems(null), []);
  assert.deepEqual(normalizeDictionaryItems("invalid"), []);
});

test("source options use type-specific names and dictionary metadata", () => {
  const options = buildSourceOptions(
    {
      data: [
        {
          id: "record-1",
          pesticide: { id: "pesticide-1", name: "Гербицид" },
          producer: "Производитель",
        },
      ],
    },
    "pesticide",
  );

  assert.deepEqual(options, [
    {
      id: "record-1",
      title: "Гербицид",
      subtitle: "Производитель",
      raw: {
        id: "record-1",
        pesticide: { id: "pesticide-1", name: "Гербицид" },
        producer: "Производитель",
      },
    },
  ]);
});

test("unit options support type-based and id-based dictionaries", () => {
  const options = buildUnitOptions([
    { type: 4, name: "кг/га", description: "Килограммы на гектар" },
    { id: "unit-2", description: "Штук на гектар" },
  ]);

  assert.deepEqual(
    options.map(({ id, title }) => ({ id, title })),
    [
      { id: 4, title: "кг/га" },
      { id: "unit-2", title: "Штук на гектар" },
    ],
  );
});

test("norm and plan items keep their consumable types and order", () => {
  const field = {
    seed_norm_consumption: { id: "seed-norm" },
    pesticide_norm_consumption: [{ id: "pesticide-norm" }],
    fertilizer_norm_consumption: [{ id: "fertilizer-norm" }],
    seed_plan_consumption: { id: "seed-plan" },
    pesticide_plan_consumptions: [{ id: "pesticide-plan" }],
    fertilizer_plan_consumptions: [{ id: "fertilizer-plan" }],
  };

  assert.deepEqual(
    buildConsumableItems(field, "norm").map(({ type, item }) => [
      type,
      item.id,
    ]),
    [
      ["seed", "seed-norm"],
      ["pesticide", "pesticide-norm"],
      ["fertilizer", "fertilizer-norm"],
    ],
  );
  assert.deepEqual(
    buildConsumableItems(field, "plan").map(({ type, item }) => [
      type,
      item.id,
    ]),
    [
      ["seed", "seed-plan"],
      ["pesticide", "pesticide-plan"],
      ["fertilizer", "fertilizer-plan"],
    ],
  );
});

test("new seed payload uses nested variety, decimal comma and selected unit", () => {
  const result = buildConsumablePayload({
    fieldId: "field-1",
    type: "seed",
    editingItem: null,
    selectedSource: {
      id: "plan-1",
      crop_variety_standard: { id: "variety-1" },
      weight: 42,
    },
    selectedUnit: { type: 7 },
    quantity: " 12,5 ",
  });

  assert.deepEqual(result, {
    error: null,
    payload: {
      id: null,
      production_task_field_id: "field-1",
      crop_variety_standard_id: "variety-1",
      unit_code: 7,
      quantity: 12.5,
      weight: 42,
    },
  });
});

test("edited pesticide payload keeps record id and existing unit", () => {
  const result = buildConsumablePayload({
    fieldId: "field-1",
    type: "pesticide",
    editingItem: {
      id: "norm-1",
      pesticide: { id: "pesticide-1" },
      unit_code: { id: 3 },
    },
    selectedSource: null,
    selectedUnit: null,
    quantity: "2",
  });

  assert.deepEqual(result, {
    error: null,
    payload: {
      id: "norm-1",
      production_task_field_id: "field-1",
      pesticide_id: "pesticide-1",
      unit_code: 3,
      quantity: 2,
      weight: null,
    },
  });
});

test("edited seed payload keeps both norm and crop variety ids", () => {
  const result = buildConsumablePayload({
    fieldId: "field-1",
    type: "seed",
    editingItem: {
      id: "norm-1",
      crop_variety_standard: { id: "variety-1" },
      unit_code: { id: 7, description: "кг/га" },
    },
    selectedSource: null,
    selectedUnit: { type: 7 },
    quantity: "12,5",
  });

  assert.deepEqual(result, {
    error: null,
    payload: {
      id: "norm-1",
      production_task_field_id: "field-1",
      crop_variety_standard_id: "variety-1",
      unit_code: 7,
      quantity: 12.5,
      weight: null,
    },
  });
});

test("consumable payload reports quantity, source and seed unit errors", () => {
  const base = {
    fieldId: "field-1",
    type: "seed",
    editingItem: null,
    selectedSource: null,
    selectedUnit: null,
  };

  assert.equal(buildConsumablePayload({ ...base, quantity: "0" }).error, "Укажите норму");
  assert.equal(
    buildConsumablePayload({ ...base, quantity: "1" }).error,
    "Выберите расходник из плана",
  );
  assert.equal(
    buildConsumablePayload({
      ...base,
      selectedSource: { id: "seed-1" },
      quantity: "1",
    }).error,
    "Выберите единицу измерения",
  );
});

test("row metadata formats each consumable type", () => {
  assert.deepEqual(
    getConsumableRowMeta(
      {
        fertilizer: { name: "Аммофос" },
        norm_value: 15,
      },
      "fertilizer",
    ),
    { name: "Аммофос", value: 15, unit: "кг/га" },
  );
  assert.deepEqual(
    getConsumableRowMeta(
      { name: "Пшеница", quantity: 0, unit_code: { description: "шт/га" } },
      "seed",
    ),
    { name: "Пшеница", value: 0, unit: "шт/га" },
  );
});
