const assert = require("node:assert/strict");
const test = require("node:test");

const {
  createDictionarySyncService,
} = require("../../.test-build/features/dictionarySync/dictionarySync.service.factory");
const {
  createEmployeeSyncService,
} = require("../../.test-build/entities/employee/sync/employeeSync.service.factory");
const {
  createProductionTaskSyncService,
} = require("../../.test-build/entities/productionTask/sync/productionTaskSync.service.factory");

const createSpy = (implementation) => {
  const calls = [];
  const spy = (...args) => {
    calls.push(args);
    return implementation?.(...args);
  };

  spy.calls = calls;
  return spy;
};

const createDictionaryService = ({
  loadTechniqueStandards = async () => [],
  insertTechniqueStandards = async () => "inserted",
} = {}) => {
  const insertMany = createSpy(insertTechniqueStandards);
  const noopInsert = createSpy(async () => []);

  return {
    insertMany,
    service: createDictionarySyncService({
      dictionariesApi: {
        loadTechniqueStandards,
        loadAgriculturalMachinery: async () => [],
        loadProductionWorkPlaces: async () => [],
        loadWorkStandards: async () => [],
        loadUnitOfMeasures: async () => [],
        loadTariffsList: async () => [],
      },
      techniqueStandardRepository: { insertMany },
      agriculturalMachineryRepository: { insertMany: noopInsert },
      productionWorkPlaceRepository: { insertMany: noopInsert },
      workStandardRepository: { insertMany: noopInsert },
      unitOfMeasureRepository: { insertMany: noopInsert },
      tariffsListRepository: { insertMany: noopInsert },
    }),
  };
};

test("dictionary sync does not write empty API responses", async () => {
  const { insertMany, service } = createDictionaryService({
    loadTechniqueStandards: async () => [],
  });

  const result = await service.syncTechniqueStandards("token");

  assert.deepEqual(result, []);
  assert.equal(insertMany.calls.length, 0);
});

test("dictionary sync writes non-empty API responses", async () => {
  const payload = [{ id: "technique-1" }];
  const { insertMany, service } = createDictionaryService({
    loadTechniqueStandards: async () => payload,
    insertTechniqueStandards: async () => ({ success: true }),
  });

  const result = await service.syncTechniqueStandards("token");

  assert.deepEqual(result, { success: true });
  assert.equal(insertMany.calls.length, 1);
  assert.equal(insertMany.calls[0][0], payload);
});

test("dictionary sync propagates repository errors", async () => {
  const error = new Error("db failed");
  const { service } = createDictionaryService({
    loadTechniqueStandards: async () => [{ id: "technique-1" }],
    insertTechniqueStandards: async () => {
      throw error;
    },
  });

  await assert.rejects(() => service.syncTechniqueStandards("token"), error);
});

test("production task sync writes loaded tasks", async () => {
  const tasks = [{ id: "task-1" }];
  const insertMany = createSpy(async () => ["ok"]);
  const service = createProductionTaskSyncService({
    productionTaskApi: {
      loadProductionTasks: async () => tasks,
    },
    productionTaskRepository: {
      insertMany,
    },
  });

  const result = await service.syncProductionTasks("token", "2026");

  assert.deepEqual(result, ["ok"]);
  assert.equal(insertMany.calls.length, 1);
  assert.equal(insertMany.calls[0][0], tasks);
});

test("production task sync skips empty task lists", async () => {
  const insertMany = createSpy(async () => ["ok"]);
  const service = createProductionTaskSyncService({
    productionTaskApi: {
      loadProductionTasks: async () => [],
    },
    productionTaskRepository: {
      insertMany,
    },
  });

  const result = await service.syncProductionTasks("token", "2026");

  assert.deepEqual(result, []);
  assert.equal(insertMany.calls.length, 0);
});

test("employee sync writes loaded employee and skips null employee", async () => {
  const employee = { id: "employee-1" };
  const create = createSpy(async () => ({ lastInsertRowId: 1 }));
  const service = createEmployeeSyncService({
    employeeApi: {
      loadEmployee: async (_accessToken, userId) =>
        userId === "missing" ? null : employee,
      loadCompany: async () => null,
    },
    employeeRepository: { create },
    companyRepository: { create: createSpy(async () => undefined) },
  });

  const savedResult = await service.syncEmployee("token", "employee-1");
  const skippedResult = await service.syncEmployee("token", "missing");

  assert.deepEqual(savedResult, { lastInsertRowId: 1 });
  assert.equal(skippedResult, null);
  assert.equal(create.calls.length, 1);
  assert.equal(create.calls[0][0], employee);
});

test("employee sync writes loaded company", async () => {
  const company = { company_uuid: "company-1" };
  const create = createSpy(async () => ({ lastInsertRowId: 2 }));
  const service = createEmployeeSyncService({
    employeeApi: {
      loadEmployee: async () => null,
      loadCompany: async () => company,
    },
    employeeRepository: { create: createSpy(async () => undefined) },
    companyRepository: { create },
  });

  const result = await service.syncCompany("token", "company-1");

  assert.deepEqual(result, { lastInsertRowId: 2 });
  assert.equal(create.calls.length, 1);
  assert.equal(create.calls[0][0], company);
});
