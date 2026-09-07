const assert = require("node:assert/strict");
const test = require("node:test");

const {
  DataSyncService,
} = require("../../.test-build/features/dataSync/DataSyncService");

test("login reloads dictionaries saved by a partially failed sync", async () => {
  const calls = [];
  const reloadLocalData = async () => {
    calls.push("reload");
    return true;
  };
  const service = new DataSyncService(
    async () => {
      calls.push("sync-all");
      return false;
    },
    async () => {
      calls.push("employee");
      return true;
    },
    async () => {
      calls.push("company");
      return true;
    },
    reloadLocalData,
  );

  const result = await service.syncUserData(
    "token",
    "employee-1",
    "company-1",
  );

  assert.equal(result.success, false);
  assert.deepEqual(result.warnings, [
    "Основная синхронизация не завершена.",
  ]);
  assert.equal(
    calls.filter((call) => call === "reload").length,
    2,
  );
  assert.equal(calls[0], "employee");
  assert.equal(calls[1], "reload");
});
