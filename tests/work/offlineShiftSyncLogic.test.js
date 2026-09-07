const assert = require("node:assert/strict");
const test = require("node:test");

const {
  getPrecedingPartCloseAt,
} = require("../../.test-build/widgets/Work/work-screen/offlineShiftSync.logic");

test("previous server part closes one second before first offline segment", () => {
  const closeAt = getPrecedingPartCloseAt([
    { scanned_at: "2026-08-19T11:00:00.000Z" },
    { scanned_at: "2026-08-19T10:00:00.000Z" },
  ]);

  assert.equal(closeAt?.toISOString(), "2026-08-19T09:59:59.000Z");
});

test("partially synced group still recalculates its preceding server part", () => {
  const closeAt = getPrecedingPartCloseAt([
    {
      scanned_at: "2026-08-19T10:00:00.000Z",
      server_shift_id: "server-shift-1",
    },
  ]);

  assert.equal(closeAt?.toISOString(), "2026-08-19T09:59:59.000Z");
});

test("invalid offline segment time does not create a close request", () => {
  assert.equal(getPrecedingPartCloseAt([{ scanned_at: null }]), null);
});
