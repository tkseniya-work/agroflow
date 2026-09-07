const assert = require("node:assert/strict");
const test = require("node:test");

const {
  buildProductionShiftTotalsV2Payload,
} = require("../../.test-build/entities/productionShift/api/productionShiftActions.service");

const baseRequest = {
  accessToken: "token",
  taskId: "task-1",
  shiftId: "shift-1",
  tariffId: "tariff-2",
  oldTariffId: "tariff-1",
  workPlaceId: "place-1",
};

test("field totals v2 payload uses snake case and only the field block", () => {
  const payload = buildProductionShiftTotalsV2Payload({
    ...baseRequest,
    updateFieldTaskParts: {
      taskFieldId: "field-1",
      agriculturalMachineryId: null,
      outputValue: 12,
      factArea: 7,
      threshed: null,
      numberOfBins: null,
    },
  });

  assert.deepEqual(payload, {
    task_id: "task-1",
    shift_id: "shift-1",
    tariff_id: "tariff-2",
    old_tariff_id: "tariff-1",
    work_place_id: "place-1",
    update_field_task_parts: {
      task_field_id: "field-1",
      agricultural_machinery_id: null,
      output_value: 12,
      fact_area: 7,
      threshed: null,
      number_of_bins: null,
    },
  });
});

test("stationary totals v2 payload contains no other update block", () => {
  const payload = buildProductionShiftTotalsV2Payload({
    ...baseRequest,
    oldTariffId: null,
    updateStationaryTaskParts: { outputValue: 25 },
  });

  assert.deepEqual(payload.update_stationary_task_parts, {
    output_value: 25,
  });
  assert.deepEqual(
    Object.keys(payload).filter((key) => key.startsWith("update_")),
    ["update_stationary_task_parts"],
  );
  assert.equal("shift_parts_ids" in payload, false);
});

test("transport totals v2 payload contains transport output", () => {
  const payload = buildProductionShiftTotalsV2Payload({
    ...baseRequest,
    updateTransportTaskParts: {
      agriculturalMachineryId: "machine-1",
      outputValue: 8.75,
    },
  });

  assert.deepEqual(payload.update_transport_task_parts, {
    agricultural_machinery_id: "machine-1",
    output_value: 8.75,
  });
  assert.deepEqual(
    Object.keys(payload).filter((key) => key.startsWith("update_")),
    ["update_transport_task_parts"],
  );
});

test("transportation totals v2 payload contains output, weight and trips", () => {
  const payload = buildProductionShiftTotalsV2Payload({
    ...baseRequest,
    updateTransportationTaskParts: {
      agriculturalMachineryId: "machine-1",
      outputValue: 12.5,
      transportedWeight: 1500,
      numberOfTrips: 3,
    },
  });

  assert.deepEqual(payload.update_transportation_task_parts, {
    agricultural_machinery_id: "machine-1",
    output_value: 12.5,
    transported_weight: 1500,
    number_of_trips: 3,
  });
  assert.deepEqual(
    Object.keys(payload).filter((key) => key.startsWith("update_")),
    ["update_transportation_task_parts"],
  );
});
