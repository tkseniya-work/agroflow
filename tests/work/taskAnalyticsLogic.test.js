const assert = require("node:assert/strict");
const test = require("node:test");

const {
  buildTaskAnalytics,
  parseDurationMinutes,
} = require("../../.test-build/widgets/Work/Field/Detail/task-detail/taskAnalytics.logic");

test("task analytics converts duration formats to minutes", () => {
  assert.equal(parseDurationMinutes(45), 45);
  assert.equal(parseDurationMinutes("02:30:00"), 150);
  assert.equal(parseDurationMinutes("12"), 12);
  assert.equal(parseDurationMinutes(null), 0);
});

test("task analytics prefers backend field and technique metrics", () => {
  const result = buildTaskAnalytics({
    currentTask: {},
    currentTaskAnalytic: {
      analytic_by_fields: {
        fields: [
          {
            season_field_id: "field-1",
            season_field_name: "Поле 1",
            fact_area: 5,
            total_area: 10,
            fuel_per_ha: 2,
            seeds_pe_per_ha: 3,
            salary: 150,
          },
        ],
        transfer: {
          total_fuel_quantity: 4,
          total_fuel_amount: 200,
          salary: 100,
        },
      },
      completed: 5,
      need_to_do: 10,
      execution_progress_percent: 50,
      techniques_loading: [
        {
          technique_standard: {
            id: "technique-1",
            name: "МТЗ-82",
            state_number: "А123АА",
          },
          loading: 75,
        },
      ],
      techniques_perfomance: [
        { technique_standard: { id: "technique-1" }, perfomance: 8 },
      ],
      techniques_fuel_consumptions: [
        {
          technique_standard: { id: "technique-1" },
          fuel_consumption_per_ha: 6,
        },
      ],
    },
    fields: [],
    groupedParts: [],
  });

  assert.deepEqual(result.progress, {
    completed: 5,
    needToDo: 10,
    percent: 50,
  });
  assert.deepEqual(result.transfer, {
    fuelQuantity: 4,
    fuelAmount: 200,
    salary: 100,
  });
  assert.deepEqual(result.fields[0], {
    id: "field-1",
    name: "Поле 1",
    factArea: 5,
    totalArea: 10,
    fuelPerHa: 2,
    fuelAmountPerHa: 0,
    fertilizersPerHa: 0,
    fertilizersAmountPerHa: 0,
    pesticidesPerHa: 0,
    pesticidesAmountPerHa: 0,
    seedsPerHa: 3,
    seedsAmountPerHa: 0,
    seedsUnit: "п.е./га",
    salary: 150,
  });
  assert.deepEqual(result.techniques, [
    {
      id: "technique-1",
      name: "МТЗ-82",
      stateNumber: "А123АА",
      loading: 75,
      performance: 8,
      fuelConsumptionPerHa: 6,
    },
  ]);
});

test("task analytics calculates fallback metrics from grouped shift parts", () => {
  const result = buildTaskAnalytics({
    currentTask: {},
    currentTaskAnalytic: null,
    fields: [{ id: "field-1", name: "Поле 1", area: 10 }],
    groupedParts: [
      {
        employees_task_parts: [
          {
            shift_aggregate_task_parts: [
              {
                aggregate: {
                  technique_standard: {
                    id: "technique-1",
                    name: "МТЗ-82",
                    state_number: "А123АА",
                  },
                },
                output_value_aggregate_parts: {
                  fields_task_parts: [
                    {
                      task_field_id: "field-1",
                      area_fact: 4,
                      fuel_per_ha: 2,
                      fuel_amount_per_ha: 120,
                      seeds_kg_per_ha: 10,
                      seeds_amount_per_ha: 300,
                      payment_total: 500,
                      parts_duration: "02:00:00",
                    },
                  ],
                },
                transfer_aggregate_parts: {
                  grouped_by_tariff_parts: [
                    {
                      fuel_total: 3,
                      total_fuel_amount: 180,
                      payment_total: 100,
                    },
                  ],
                },
              },
            ],
          },
        ],
      },
    ],
  });

  assert.deepEqual(result.progress, {
    completed: 4,
    needToDo: 10,
    percent: 40,
  });
  assert.equal(result.fields[0].fuelPerHa, 2);
  assert.equal(result.fields[0].seedsPerHa, 10);
  assert.equal(result.fields[0].salary, 500);
  assert.deepEqual(result.transfer, {
    fuelQuantity: 3,
    fuelAmount: 180,
    salary: 100,
  });
  assert.deepEqual(result.techniques, [
    {
      id: "technique-1",
      name: "МТЗ-82",
      stateNumber: "А123АА",
      loading: 100,
      performance: 2,
      fuelConsumptionPerHa: 2,
    },
  ]);
});
