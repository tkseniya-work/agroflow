const assert = require("node:assert/strict");
const test = require("node:test");

const {
  processShiftData,
} = require("../../.test-build/src/utils/shiftDataUtils");

const createResponse = (parts) => ({
  shifts: [
    {
      production_shift_id: "shift-1",
      date: "2026-08-19",
      open_at: "2026-08-19T09:00:00.000Z",
      closed_at: null,
      field_tasks: [],
      transport_tasks: [],
      products_transportation_tasks: [],
      stationary_tasks: [
        {
          production_task_id: "task-1",
          work_standard_id: "work-1",
          work_place_id: "place-1",
          tariffs: [
            {
              tariff: { id: "tariff-1", unit_code: "539" },
              parts,
            },
          ],
        },
      ],
    },
  ],
});

const dictionaries = [undefined, undefined, undefined, undefined, undefined];

test("shift processing cache is invalidated when a new part appears", () => {
  const firstPart = {
    id: "part-1",
    start_at: "2026-08-19T09:00:00.000Z",
    end_at: "2026-08-19T09:10:00.000Z",
    is_initial: false,
  };
  const latestPart = {
    id: "part-2",
    start_at: "2026-08-19T10:00:00.000Z",
    end_at: "2026-08-19T10:00:00.000Z",
    is_initial: true,
  };

  const before = processShiftData(createResponse([firstPart]), ...dictionaries);
  const after = processShiftData(
    createResponse([firstPart, latestPart]),
    ...dictionaries,
  );

  assert.equal(before.length, 1);
  assert.equal(after.length, 2);
  assert.equal(after.at(-1).partIds, "part-2");
  assert.equal(after.at(-1).partInitial, true);
});

test("shift processing cache is invalidated when an initial part closes", () => {
  const openPart = {
    id: "part-1",
    start_at: "2026-08-19T10:00:00.000Z",
    end_at: "2026-08-19T10:00:00.000Z",
    is_initial: true,
  };
  const closedPart = {
    ...openPart,
    end_at: "2026-08-19T10:15:00.000Z",
    is_initial: false,
  };

  const before = processShiftData(createResponse([openPart]), ...dictionaries);
  const after = processShiftData(createResponse([closedPart]), ...dictionaries);

  assert.equal(before[0].partInitial, true);
  assert.equal(after[0].partInitial, false);
  assert.equal(after[0].endAt, "2026-08-19T10:15:00.000Z");
});
