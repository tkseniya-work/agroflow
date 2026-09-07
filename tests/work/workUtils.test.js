const assert = require("node:assert/strict");
const test = require("node:test");

const {
  parseScannedPlace,
  resolveScannedPlaceForSync,
} = require("../../.test-build/src/utils/workUtils");

const point = {
  type: "Point",
  coordinates: [37.6173, 55.7558],
};

test("missing offline coordinates are allowed during synchronization", () => {
  assert.equal(parseScannedPlace(null), null);
  assert.equal(parseScannedPlace(undefined), null);
  assert.equal(parseScannedPlace(""), null);
});

test("missing offline coordinates use zero point in the API request", () => {
  assert.deepEqual(resolveScannedPlaceForSync(null), {
    type: "Point",
    coordinates: [0, 0],
  });
});

test("scanner coordinates support object and JSON formats", () => {
  assert.deepEqual(parseScannedPlace(point), point);
  assert.deepEqual(parseScannedPlace(JSON.stringify(point)), point);
});

test("legacy scanner coordinates remain supported", () => {
  assert.deepEqual(
    parseScannedPlace("{type=Point, coordinates=[37.6173, 55.7558]}"),
    point,
  );
});

test("invalid scanner coordinates are ignored", () => {
  assert.equal(
    parseScannedPlace("{type=Point, coordinates=[invalid, 55.7558]}"),
    null,
  );
  assert.equal(parseScannedPlace("[object Object]"), null);
});
