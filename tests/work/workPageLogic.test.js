const assert = require("node:assert/strict");
const test = require("node:test");

const {
  canRoleManageTasks,
  flattenPendingShifts,
  getScannerLaunchAction,
  getShiftLoadingStatus,
  getWorkSectionState,
} = require("../../.test-build/widgets/Work/work-screen/workPageLogic");

test("work page grants task management only to supported roles", () => {
  assert.equal(canRoleManageTasks("admin"), true);
  assert.equal(canRoleManageTasks("erp-admin"), true);
  assert.equal(canRoleManageTasks("checkman"), true);
  assert.equal(canRoleManageTasks("employee"), false);
  assert.equal(canRoleManageTasks(null), false);
});

test("work page shows tasks and shifts according to role and active tab", () => {
  assert.deepEqual(getWorkSectionState(true, 0), {
    isTasksSection: true,
    isShiftsSection: false,
  });
  assert.deepEqual(getWorkSectionState(true, 1), {
    isTasksSection: false,
    isShiftsSection: true,
  });
  assert.deepEqual(getWorkSectionState(false, 0), {
    isTasksSection: false,
    isShiftsSection: true,
  });
});

test("shifts-only roles receive only the offline sync status", () => {
  assert.equal(getWorkSectionState(false, 0).isShiftsSection, true);
  assert.equal(
    getShiftLoadingStatus("dictionaries"),
    null,
  );
  assert.equal(
    getShiftLoadingStatus("shifts"),
    null,
  );
  assert.equal(
    getShiftLoadingStatus("offline-sync"),
    "Синхронизируем офлайн-смены…",
  );
});

test("work page flattens pending shifts in the declared group order", () => {
  const firstShift = { id: "shift-1" };
  const secondShift = { id: "shift-2" };
  const thirdShift = { id: "shift-3" };

  assert.deepEqual(
    flattenPendingShifts({
      keys: ["second", "first", "missing"],
      grouped: {
        first: [firstShift],
        second: [secondShift, thirdShift],
      },
    }),
    [secondShift, thirdShift, firstShift],
  );
});

test("work page returns an empty pending list for incomplete grouped data", () => {
  assert.deepEqual(flattenPendingShifts(null), []);
  assert.deepEqual(flattenPendingShifts({ keys: [], grouped: {} }), []);
  assert.deepEqual(flattenPendingShifts({ keys: ["one"] }), []);
});

test("scanner opens directly in offline mode when no shift is expired", () => {
  assert.equal(
    getScannerLaunchAction({
      isConnected: false,
      forcedOffline: false,
      expiredPendingCount: 0,
      syncablePendingCount: 2,
    }),
    "open_scanner",
  );
});

test("scanner closes expired shifts before opening in offline mode", () => {
  assert.equal(
    getScannerLaunchAction({
      isConnected: true,
      forcedOffline: true,
      expiredPendingCount: 1,
      syncablePendingCount: 0,
    }),
    "close_expired_offline_then_open",
  );
});

test("scanner closes expired shifts and syncs them in online mode", () => {
  assert.equal(
    getScannerLaunchAction({
      isConnected: true,
      forcedOffline: false,
      expiredPendingCount: 1,
      syncablePendingCount: 3,
    }),
    "close_expired_then_sync",
  );
});

test("scanner syncs pending shifts before checking online shifts", () => {
  assert.equal(
    getScannerLaunchAction({
      isConnected: true,
      forcedOffline: false,
      expiredPendingCount: 0,
      syncablePendingCount: 2,
    }),
    "sync_then_check_online",
  );
});

test("scanner checks online shifts when local queue is empty", () => {
  assert.equal(
    getScannerLaunchAction({
      isConnected: true,
      forcedOffline: false,
      expiredPendingCount: 0,
      syncablePendingCount: 0,
    }),
    "check_online",
  );
});
