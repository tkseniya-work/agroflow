const assert = require("node:assert/strict");
const test = require("node:test");

const {
  getActivePendingShiftsByGroup,
} = require("../../.test-build/widgets/Work/ShiftsSection.logic");

test("pending shifts keep only open segments and sort newest first", () => {
  const older = {
    id: "older",
    scannedAt: "2026-07-20T08:00:00.000Z",
  };
  const newer = {
    id: "newer",
    scannedAt: "2026-07-20T10:00:00.000Z",
  };
  const closed = {
    id: "closed",
    scannedAt: "2026-07-20T12:00:00.000Z",
    endedAt: "2026-07-20T13:00:00.000Z",
  };
  const source = [older, closed, newer];

  const result = getActivePendingShiftsByGroup({
    keys: ["first"],
    grouped: { first: source },
  });

  assert.deepEqual(
    result.first.map((shift) => shift.id),
    ["newer", "older"],
  );
  assert.deepEqual(source, [older, closed, newer]);
});

test("pending shifts preserve declared groups and support openAt dates", () => {
  const result = getActivePendingShiftsByGroup({
    keys: ["missing", "second"],
    grouped: {
      second: [
        { id: "older", openAt: "2026-07-20T08:00:00.000Z" },
        { id: "newer", openAt: "2026-07-20T09:00:00.000Z" },
      ],
    },
  });

  assert.deepEqual(result.missing, []);
  assert.deepEqual(
    result.second.map((shift) => shift.id),
    ["newer", "older"],
  );
});
