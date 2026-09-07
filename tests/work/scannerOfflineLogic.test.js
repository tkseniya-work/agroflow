const assert = require("node:assert/strict");
const test = require("node:test");

const {
  createOfflineGroupKey,
  createOfflineShift,
  getActiveDifferentOfflineShift,
  getActiveOfflineShift,
  getSegmentType,
} = require("../../.test-build/features/scanner/lib/useScanner.helpers");

test("offline segment payload preserves group, location and pending state", () => {
  const scannedAt = new Date("2026-07-27T07:00:00.000Z");
  const groupKey = createOfflineGroupKey("employee-1", 1, scannedAt);
  const scannedPlace = {
    type: "Point",
    coordinates: [43.2, 50.5],
  };

  assert.equal(
    groupKey,
    "offline_employee-1_1_2026-07-27T07:00:00.000Z",
  );
  assert.deepEqual(
    createOfflineShift(
      "work-place-1_qr",
      1,
      "employee-1",
      scannedAt.toISOString(),
      null,
      scannedPlace,
      "Кировец",
      "mobile",
      groupKey,
    ),
    {
      code: "work-place-1_qr",
      shift_type: 1,
      employee_id: "employee-1",
      scanned_at: "2026-07-27T07:00:00.000Z",
      ended_at: null,
      scanned_place: scannedPlace,
      workplace_name: "Кировец",
      segment_type: "mobile",
      offline_group_key: groupKey,
      sync_status: "pending",
    },
  );
});

test("offline workplace type supports Russian and English dictionary values", () => {
  assert.equal(
    getSegmentType({ workplaceType: { description: "Стационарное" } }),
    "stationary",
  );
  assert.equal(
    getSegmentType({ workplaceType: { description: "Mobile machinery" } }),
    "mobile",
  );
  assert.equal(getSegmentType({}), null);
});

test("same-shift scan continues the latest active offline group", () => {
  const shifts = [
    {
      id: 1,
      employee_id: "employee-1",
      shift_type: 1,
      scanned_at: "2026-07-27T07:00:00.000Z",
      ended_at: null,
      offline_group_key: "older",
    },
    {
      id: 2,
      employee_id: "employee-1",
      shift_type: 1,
      scanned_at: "2026-07-27T09:00:00.000Z",
      ended_at: null,
      offline_group_key: "latest",
    },
    {
      id: 3,
      employee_id: "employee-1",
      shift_type: 1,
      scanned_at: "2026-07-27T10:00:00.000Z",
      ended_at: "2026-07-27T11:00:00.000Z",
      offline_group_key: "closed",
    },
  ];

  assert.equal(
    getActiveOfflineShift(shifts, "employee-1", 1)?.offline_group_key,
    "latest",
  );
});

test("different active shift blocks opening another offline shift", () => {
  const shifts = [
    {
      id: 1,
      employee_id: "employee-1",
      shift_type: 2,
      scanned_at: "2026-07-27T19:00:00.000Z",
      ended_at: null,
    },
    {
      id: 2,
      employee_id: "other-employee",
      shift_type: 2,
      scanned_at: "2026-07-27T20:00:00.000Z",
      ended_at: null,
    },
  ];

  assert.equal(
    getActiveDifferentOfflineShift(shifts, "employee-1", 1)?.id,
    1,
  );
  assert.equal(
    getActiveDifferentOfflineShift(shifts, "employee-1", 2),
    undefined,
  );
});
