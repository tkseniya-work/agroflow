const assert = require("node:assert/strict");
const test = require("node:test");

const {
  getSettledValue,
  normalizeFieldTaskListResponse,
  settleRequest,
} = require("../../.test-build/widgets/Work/Field/Edit/fieldTaskEditData.logic");

test("field task request settlement preserves successful results", async () => {
  const result = await settleRequest(Promise.resolve(["value"]));

  assert.deepEqual(result, { status: "fulfilled", value: ["value"] });
  assert.deepEqual(getSettledValue(result, []), ["value"]);
});

test("field task request settlement converts a rejection to a fallback", async () => {
  const error = new Error("dictionary unavailable");
  const result = await settleRequest(Promise.reject(error));

  assert.equal(result.status, "rejected");
  assert.deepEqual(getSettledValue(result, []), []);
});

test("field task dictionary normalization supports nested partial responses", () => {
  const first = { id: "first", name: "Первый" };
  const second = { id: "second", name: "Второй" };

  assert.deepEqual(
    normalizeFieldTaskListResponse({
      data: [{ items: [first] }, { results: [second] }],
    }),
    [first, second],
  );
  assert.deepEqual(normalizeFieldTaskListResponse(null), []);
});
