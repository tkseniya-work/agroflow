const assert = require("node:assert/strict");
const test = require("node:test");

const {
  processShiftData,
} = require("../../.test-build/src/utils/shiftDataUtils");

const createStationaryShift = (workStandard) => ({
  shifts: [
    {
      production_shift_id: "shift-1",
      date: "2026-07-28",
      shift_type: { id: 1, description: "Первая смена" },
      open_at: "2026-07-28T07:00:00.000Z",
      closed_at: null,
      field_tasks: [],
      transport_tasks: [],
      products_transportation_tasks: [],
      stationary_tasks: [
        {
          production_task_id: "task-1",
          work_standard: workStandard,
          work_place_id: "place-1",
          work_place_name: "Ток",
          parts_duration: 10,
          tariffs: [
            {
              tariff: { id: "tariff-1" },
              parts: [
                {
                  id: "part-1",
                  start_at: "2026-07-28T07:00:00.000Z",
                  end_at: "2026-07-28T07:10:00.000Z",
                  part_duration_minutes: 10,
                  output_value: 1,
                  is_initial: false,
                },
              ],
            },
          ],
        },
      ],
    },
  ],
});

test("shift work resolves a nested work standard after relogin", () => {
  const result = processShiftData(
    createStationaryShift({
      id: "WORK-1",
      name: "Сортировка зерна",
    }),
    [],
    [],
    [],
    [],
    [{ id: "work-1", name: "Работа из справочника" }],
  );

  assert.equal(result.length, 1);
  assert.equal(result[0].workName, "Работа из справочника");
});

test("shift work falls back to the name returned with the shift", () => {
  const result = processShiftData(
    createStationaryShift({
      id: "missing-work",
      name: "Сушка зерна",
    }),
    [],
    [],
    [],
    [],
    [],
  );

  assert.equal(result.length, 1);
  assert.equal(result[0].workName, "Сушка зерна");
});
