const assert = require("node:assert/strict");
const test = require("node:test");

const {
  hasRequiredScannerDictionaries,
} = require("../../.test-build/features/dictionarySync/lib/dictionariesReadiness.logic");

test("scanner dictionaries are ready only when workplaces and shift settings are non-empty arrays", () => {
  assert.equal(
    hasRequiredScannerDictionaries([{ id: "place-1" }], [{ id: "settings-1" }]),
    true,
  );
  assert.equal(
    hasRequiredScannerDictionaries([{ id: "place-1" }], []),
    false,
  );
  assert.equal(
    hasRequiredScannerDictionaries([], [{ id: "settings-1" }]),
    false,
  );
  assert.equal(
    hasRequiredScannerDictionaries([{ id: "place-1" }], null),
    false,
  );
});
