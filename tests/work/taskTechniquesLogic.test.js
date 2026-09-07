const assert = require("node:assert/strict");
const test = require("node:test");

const {
  buildTaskTechniquePayload,
  buildTechniqueOptions,
  filterCurrentTariffs,
  filterTransferTariffs,
  getTechniqueTermsText,
  toNumberOrNull,
  validateTechniqueForm,
} = require("../../.test-build/widgets/Work/Field/Edit/TaskTechniques.logic");

const technique = {
  id: "standard-1",
  name: "Трактор",
  displayName: "МТЗ-82 · А123АА",
  machineryModelId: "model-1",
  machineryModelName: "МТЗ-82",
  additionalInfo: { task_technique_id: "technique-42" },
  raw: {},
};

const machinery = {
  id: "machine-1",
  name: "Сеялка",
  machineryModelId: "machine-model-1",
  raw: {},
};

test("technique form converts optional numeric values", () => {
  assert.equal(toNumberOrNull(" 12,5 "), 12.5);
  assert.equal(toNumberOrNull(""), null);
  assert.equal(toNumberOrNull("не число"), null);
});

test("technique options normalize records and exclude already assigned items", () => {
  const options = buildTechniqueOptions(
    [
      {
        techniqueStandard: {
          id: 1,
          name: "Трактор",
          state_number: "А123АА",
        },
        machineryModel: { id: "model-1", name: "МТЗ-82", power: 81 },
        additional_info: { technique_id: "technique-1" },
      },
      { technique_standard: { id: 2, name: "Комбайн" } },
      { name: "Запись без id" },
    ],
    new Set(["2"]),
  );

  assert.equal(options.length, 1);
  assert.deepEqual(
    {
      id: options[0].id,
      displayName: options[0].displayName,
      machineryModelId: options[0].machineryModelId,
      machineryModelPower: options[0].machineryModelPower,
      additionalInfo: options[0].additionalInfo,
    },
    {
      id: "1",
      displayName: "МТЗ-82 · А123АА",
      machineryModelId: "model-1",
      machineryModelPower: 81,
      additionalInfo: { technique_id: "technique-1" },
    },
  );
});

test("main tariffs match work, technique and selected machinery", () => {
  const matching = { id: "tariff-1", work_standard_id: "work-1" };
  const tariffs = filterCurrentTariffs({
    tariffs: [
      matching,
      {
        id: "tariff-2",
        work_standard: { id: "work-1" },
        technique_model_id: "model-1",
        agricultural_machinery_model_id: "machine-model-1",
      },
      { id: "wrong-work", work_standard_id: "work-2" },
      {
        id: "wrong-technique",
        work_standard_id: "work-1",
        technique_model_id: "model-2",
      },
      {
        id: "wrong-machinery",
        work_standard_id: "work-1",
        agricultural_machinery_model_id: "machine-model-2",
      },
      { id: "deleted", work_standard_id: "work-1", is_deleted: true },
    ],
    workStandardId: "work-1",
    techniqueModelId: "model-1",
    machineryModelId: "machine-model-1",
  });

  assert.deepEqual(
    tariffs.map((item) => item.id),
    ["tariff-1", "tariff-2"],
  );
});

test("transfer tariffs use only works with transfer kind", () => {
  const tariffs = filterTransferTariffs({
    tariffs: [
      { id: "transfer", work_standard_id: "work-transfer" },
      { id: "field", work_standard_id: "work-field" },
      {
        id: "wrong-model",
        work_standard_id: "work-transfer",
        technique_model_id: "model-2",
      },
      {
        id: "deleted",
        work_standard_id: "work-transfer",
        is_deleted: true,
      },
    ],
    workStandards: [
      { id: "work-transfer", work_kind_id: "18" },
      { id: "work-field", work_kind_id: 3 },
    ],
    techniqueModelId: "model-1",
  });

  assert.deepEqual(
    tariffs.map((item) => item.id),
    ["transfer"],
  );
});

test("field task requires transfer tariff, transport task does not", () => {
  const baseForm = {
    taskId: "task-1",
    selectedTechnique: technique,
    selectedTariff: { id: "tariff-1" },
    selectedTransferTariff: null,
  };

  assert.equal(
    validateTechniqueForm({ ...baseForm, requiresTransferTariff: true }),
    "Выберите тариф на перегон",
  );
  assert.equal(
    validateTechniqueForm({ ...baseForm, requiresTransferTariff: false }),
    null,
  );
});

test("field task payload preserves field parameters and transfer tariff", () => {
  const payload = buildTaskTechniquePayload({
    taskId: "task-1",
    taskType: "field",
    selectedTechnique: technique,
    selectedMachinery: machinery,
    selectedTariff: { work_standard_tariff_id: "tariff-main" },
    selectedTransferTariff: { id: "tariff-transfer" },
    workSpeed: "8,5",
    processingDepth: "12",
    soluteFlowRate: "",
    shouldMoveTechnique: false,
  });

  assert.deepEqual(payload, {
    production_task_id: "task-1",
    technique_standard_id: "standard-1",
    agriculture_machine_standard_id: "machine-1",
    tariff_id: "tariff-main",
    transfer_tariff_id: "tariff-transfer",
    work_speed: 8.5,
    processing_depth: 12,
    solute_flow_rate: null,
  });
});

test("transportation task uses compact payload without field parameters", () => {
  const payload = buildTaskTechniquePayload({
    taskId: "task-1",
    taskType: "transportation",
    selectedTechnique: technique,
    selectedMachinery: null,
    selectedTariff: { id: "tariff-main" },
    selectedTransferTariff: null,
    workSpeed: "20",
    processingDepth: "15",
    soluteFlowRate: "30",
    shouldMoveTechnique: false,
  });

  assert.deepEqual(payload, {
    task_id: "task-1",
    technique_id: "standard-1",
    agriculture_machine_id: null,
    tariff_id: "tariff-main",
    work_speed: 20,
  });
});

test("moving transport uses technique standard id", () => {
  const payload = buildTaskTechniquePayload({
    taskId: "task-1",
    taskType: "transport",
    selectedTechnique: technique,
    selectedMachinery: machinery,
    selectedTariff: { id: "tariff-main" },
    selectedTransferTariff: null,
    workSpeed: "18",
    processingDepth: "",
    soluteFlowRate: "",
    shouldMoveTechnique: true,
  });

  assert.deepEqual(payload, {
    task_id: "task-1",
    technique_id: "standard-1",
    agricultural_machine_id: "machine-1",
    tariff_id: "tariff-main",
    transfer_tariff_id: undefined,
    work_speed: 18,
  });
});

test("moving transportation uses the technique standard id", () => {
  const payload = buildTaskTechniquePayload({
    taskId: "task-1",
    taskType: "transportation",
    selectedTechnique: technique,
    selectedMachinery: null,
    selectedTariff: { id: "tariff-main" },
    selectedTransferTariff: null,
    workSpeed: "20",
    processingDepth: "",
    soluteFlowRate: "",
    shouldMoveTechnique: true,
  });

  assert.deepEqual(payload, {
    task_id: "task-1",
    technique_id: "standard-1",
    agricultural_machine_id: null,
    tariff_id: "tariff-main",
    transfer_tariff_id: undefined,
    work_speed: 20,
  });
});

test("technique terms text includes zero values and skips absent values", () => {
  assert.equal(
    getTechniqueTermsText({
      terms: [{ work_speed: 0, processing_depth: 12, solute_flow_rate: null }],
    }),
    "Скорость: 0 км/ч · Глубина: 12 см",
  );
  assert.equal(getTechniqueTermsText({ terms: [] }), null);
});
