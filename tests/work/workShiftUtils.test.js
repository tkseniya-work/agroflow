const assert = require("node:assert/strict");
const test = require("node:test");

const {
  shouldRequestOnlineShiftCloseTime,
} = require("../../.test-build/src/utils/workShiftUtils");

const settings = {
  first_shift_start: "07:00:00",
  first_shift_end: "19:00:00",
  second_shift_start: "19:00:00",
  second_shift_end: "07:00:00",
};

test("old online shift requires explicit close date and time", () => {
  const oldShift = {
    productionShiftId: "shift-1",
    shiftType: { id: 1 },
    openAt: "2026-07-20T07:00:00",
  };

  assert.equal(
    shouldRequestOnlineShiftCloseTime(
      [oldShift],
      settings,
      new Date("2026-07-20T20:00:00"),
    ),
    true,
  );
});

test("active online shift keeps the regular close confirmation", () => {
  const activeShift = {
    productionShiftId: "shift-2",
    shiftType: { id: 1 },
    openAt: "2026-07-20T07:00:00",
  };

  assert.equal(
    shouldRequestOnlineShiftCloseTime(
      [activeShift],
      settings,
      new Date("2026-07-20T18:30:00"),
    ),
    false,
  );
});

test("group requires time selection when at least one online shift is old", () => {
  const activeShift = {
    productionShiftId: "shift-2",
    shiftType: { id: 1 },
    openAt: "2026-07-21T07:00:00",
  };
  const oldShift = {
    productionShiftId: "shift-1",
    shiftType: { id: 2 },
    openAt: "2026-07-19T19:00:00",
  };

  assert.equal(
    shouldRequestOnlineShiftCloseTime(
      [activeShift, oldShift],
      settings,
      new Date("2026-07-21T12:00:00"),
    ),
    true,
  );
});
