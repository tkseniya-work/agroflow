const assert = require("node:assert/strict");
const test = require("node:test");

const {
  mapAgriculturalMachineryRowToLocal,
} = require("../../.test-build/entities/agriculturalMachinery/mappers/agriculturalMachinery.mapper");
const {
  mapProductionTaskRowToLocal,
} = require("../../.test-build/entities/productionTask/mappers/productionTask.mapper");
const {
  mapProductionWorkPlaceRowToLocal,
} = require("../../.test-build/entities/productionWorkPlace/mappers/productionWorkPlace.mapper");
const {
  mapTechniqueStandardRowToLocal,
} = require("../../.test-build/entities/techniqueStandard/mappers/techniqueStandard.mapper");

test("mapTechniqueStandardRowToLocal keeps flat fields and compatibility aliases", () => {
  const techniqueStandard = {
    id: "technique-1",
    name: "Tractor",
    state_number: "A100",
    icon_link: "icon.png",
  };
  const machineryModel = {
    id: "model-1",
    name: "Model X",
    fuel_consumption_per_distance: 12,
  };

  const result = mapTechniqueStandardRowToLocal({
    techniqueStandard,
    machineryModel,
  });

  assert.equal(result.id, "technique-1");
  assert.equal(result.name, "Tractor");
  assert.equal(result.machinery_model, machineryModel);
  assert.equal(result.techniqueStandard, techniqueStandard);
  assert.equal(result.machineryModel, machineryModel);
});

test("mapAgriculturalMachineryRowToLocal keeps machinery model aliases", () => {
  const agriculturalMachineryStandard = {
    id: "agri-1",
    name: "Seeder",
  };
  const agriculturalMachineryModel = {
    id: "agri-model-1",
    name: "Seeder Model",
  };

  const result = mapAgriculturalMachineryRowToLocal({
    agriculturalMachineryStandard,
    agriculturalMachineryModel,
  });

  assert.equal(result.id, "agri-1");
  assert.equal(result.name, "Seeder");
  assert.equal(result.machinery_model, agriculturalMachineryModel);
  assert.equal(
    result.agriculturalMachineryStandard,
    agriculturalMachineryStandard,
  );
  assert.equal(result.agriculturalMachineryModel, agriculturalMachineryModel);
});

test("mapProductionWorkPlaceRowToLocal maps DB row to API-shaped local model", () => {
  const row = {
    productionWorkPlace: {
      id: "work-place-1",
      name: "Gate",
      code: "QR-1",
      comapny_id: "company-1",
      is_deleted: 0,
      deleted_at: null,
    },
    workplaceType: {
      id: "1",
      description: "stationary",
      productionWorkPlaceId: "work-place-1",
    },
    workplaceZone: {
      id: 10,
      productionWorkPlaceId: "work-place-1",
    },
    coordinate: {
      id: 20,
      type: "Polygon",
      coordinates: JSON.stringify([
        [
          [1, 2],
          [3, 4],
        ],
      ]),
      workplaceZoneId: "10",
      seasonFieldsId: null,
      taskFieldsId: null,
    },
  };

  const result = mapProductionWorkPlaceRowToLocal(row);

  assert.equal(result.id, "work-place-1");
  assert.equal(result.name, "Gate");
  assert.equal(result.work_place_type.description, "stationary");
  assert.deepEqual(result.work_place_zone.coordinates.coordinates, [
    [
      [1, 2],
      [3, 4],
    ],
  ]);
  assert.equal(result.is_deleted, false);
  assert.equal(result.productionWorkPlace, row.productionWorkPlace);
  assert.equal(result.workplaceType, row.workplaceType);
});

test("mapProductionTaskRowToLocal maps joined task metadata", () => {
  const row = {
    productionTask: {
      id: "task-1",
      season_year: 2026,
      comment: "note",
      date_start: "2026-07-01",
      calculated_date_end: "2026-07-10",
    },
    status: {
      id: "1",
      description: "created",
      productionTaskId: "task-1",
    },
    lastCreatedBy: {
      id: 1,
      user_id: "user-1",
      fullname: "Creator",
      productionTaskId: "task-1",
    },
    lastModifiedBy: {
      id: 2,
      user_id: "user-2",
      fullname: "Editor",
      productionTaskId: "task-1",
    },
  };

  const result = mapProductionTaskRowToLocal(row);

  assert.equal(result.id, "task-1");
  assert.equal(result.season_year, 2026);
  assert.equal(result.status, row.status);
  assert.equal(result.created_by, row.lastCreatedBy);
  assert.equal(result.last_modified_by, row.lastModifiedBy);
  assert.equal(result.productionTask, row.productionTask);
});
