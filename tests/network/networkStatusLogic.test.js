const assert = require("node:assert/strict");
const test = require("node:test");

const {
  probeWithRetry,
  resolveReachableNetworkStatus,
} = require("../../.test-build/shared/lib/networkStatus.logic");

test("API probe recovers when the second attempt succeeds", async () => {
  let attempts = 0;

  const isReachable = await probeWithRetry(async () => {
    attempts += 1;
    return attempts === 2;
  });

  assert.equal(isReachable, true);
  assert.equal(attempts, 2);
});

test("API probe stops immediately after a successful attempt", async () => {
  let attempts = 0;

  const isReachable = await probeWithRetry(async () => {
    attempts += 1;
    return true;
  });

  assert.equal(isReachable, true);
  assert.equal(attempts, 1);
});

test("API probe reports failure only after both attempts fail", async () => {
  let attempts = 0;

  const isReachable = await probeWithRetry(async () => {
    attempts += 1;
    return false;
  });

  assert.equal(isReachable, false);
  assert.equal(attempts, 2);
});

test("network status distinguishes API failure from limited internet", () => {
  assert.equal(resolveReachableNetworkStatus(true, [false]), "online");
  assert.equal(
    resolveReachableNetworkStatus(false, [false, true]),
    "service-unavailable",
  );
  assert.equal(
    resolveReachableNetworkStatus(false, [false, false]),
    "limited",
  );
});
