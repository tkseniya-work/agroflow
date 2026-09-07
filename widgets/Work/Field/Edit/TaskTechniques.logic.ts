export type TaskType = "field" | "transport" | "transportation";

export type TaskTechniquePayload = {
  production_task_id?: string;
  technique_standard_id?: string;
  agriculture_machine_standard_id?: string | null;
  technique_id?: string;
  agriculture_machine_id?: string | null;
  agricultural_machine_id?: string | null;
  task_id?: string;
  tariff_id: string;
  transfer_tariff_id?: string;
  work_speed?: number | null;
  processing_depth?: number | null;
  solute_flow_rate?: number | null;
};

export type TechniqueOption = {
  id: string;
  name: string;
  displayName: string;
  stateNumber?: string | null;
  machineryModelId?: string | null;
  machineryModelName?: string | null;
  machineryModelPower?: number | null;
  additionalInfo?: any | null;
  raw: any;
};

export type MachineryOption = {
  id: string;
  name: string;
  machineryModelId?: string | null;
  machineryModelName?: string | null;
  raw: any;
};

export type GenerateTariffTarget = "main" | "transfer";

export const toNumberOrNull = (value: string) => {
  const normalized = value.replace(",", ".").trim();
  if (!normalized) return null;

  const numberValue = Number(normalized);

  return Number.isFinite(numberValue) ? numberValue : null;
};

const hasValue = (value: unknown) =>
  value !== null && value !== undefined && value !== "";

const getTechniqueRecord = (item: any) =>
  item?.techniqueStandard ?? item?.technique_standard ?? item;

const getTechniqueModel = (item: any) =>
  item?.machineryModel ??
  item?.machinery_model ??
  getTechniqueRecord(item)?.machinery_model ??
  null;

const getTechniqueAdditionalInfo = (item: any) =>
  item?.additional_info ?? getTechniqueRecord(item)?.additional_info ?? null;

export const buildTechniqueDisplayName = (
  name?: string | null,
  modelName?: string | null,
  stateNumber?: string | null,
) => {
  const parts = [modelName ?? name, stateNumber]
    .map((value) => value?.trim())
    .filter((value): value is string => Boolean(value))
    .filter(
      (value, index, values) =>
        values.findIndex(
          (item) =>
            item.toLocaleLowerCase("ru-RU") ===
            value.toLocaleLowerCase("ru-RU"),
        ) === index,
    );

  return parts.join(" · ") || "Без названия";
};

export const getAssignedTechniqueDisplayName = (item: any) => {
  const technique =
    item?.technique ??
    item?.technique_standard ??
    item?.techniqueStandard ??
    item;
  const model =
    technique?.machinery_model ??
    technique?.machineryModel ??
    item?.machinery_model ??
    item?.machineryModel;

  return buildTechniqueDisplayName(
    technique?.name,
    model?.name,
    technique?.state_number ?? technique?.stateNumber,
  );
};

export const getMoveTechniqueId = (technique: TechniqueOption) =>
  technique.id;

const formatBusyTechniqueDate = (value?: string | null) => {
  if (!value) return null;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export const getBusyTechniqueContext = (additionalInfo: any) => {
  if (!additionalInfo) return null;

  if (additionalInfo.work_standard_name || additionalInfo.production_task_date) {
    return [
      additionalInfo.production_task_type?.description,
      additionalInfo.work_standard_name || null,
      formatBusyTechniqueDate(additionalInfo.production_task_date),
    ]
      .filter(Boolean)
      .join(" · ");
  }

  const task =
    additionalInfo.production_task ??
    additionalInfo.task ??
    additionalInfo.current_task ??
    null;
  const field =
    additionalInfo.field ??
    additionalInfo.season_field ??
    additionalInfo.production_task_field?.season_field ??
    null;
  const work =
    additionalInfo.work_standard ??
    task?.work_standard ??
    additionalInfo.work ??
    null;

  const parts = [
    work?.name ? ` : ${work.name}` : null,
    field?.name ?? field?.number
      ? ` : ${field?.name ?? field?.number}`
      : null,
    task?.date_start ?? additionalInfo.date_start
      ? ` ${formatBusyTechniqueDate(task?.date_start ?? additionalInfo.date_start)}`
      : null,
  ].filter(Boolean);

  return parts.length > 0 ? parts.join(" · ") : null;
};

const getAgriculturalRecord = (item: any) =>
  item?.agriculturalMachineryStandard ??
  item?.agricultural_machinery_standard ??
  item;

const getAgriculturalModel = (item: any) =>
  item?.agriculturalMachineryModel ?? item?.machinery_model ?? null;

export const buildTechniqueOptions = (
  source: any[],
  currentTechniqueIds: Set<string>,
): TechniqueOption[] =>
  (source || [])
    .map((item: any) => {
      const technique = getTechniqueRecord(item);
      const model = getTechniqueModel(item);
      const additionalInfo = getTechniqueAdditionalInfo(item);

      if (!technique?.id || currentTechniqueIds.has(String(technique.id))) {
        return null;
      }

      return {
        id: String(technique.id),
        name: technique.name ?? "Без названия",
        displayName: buildTechniqueDisplayName(
          technique.name,
          model?.name ?? technique.machinery_model?.name,
          technique.state_number,
        ),
        stateNumber: technique.state_number,
        machineryModelId: model?.id ?? technique.machinery_model?.id ?? null,
        machineryModelName:
          model?.name ?? technique.machinery_model?.name ?? null,
        machineryModelPower:
          model?.power ?? technique.machinery_model?.power ?? null,
        additionalInfo,
        raw: item,
      };
    })
    .filter(Boolean) as TechniqueOption[];

export const buildMachineryOptions = (source: any[]): MachineryOption[] =>
  (source || [])
    .map((item: any) => {
      const machinery = getAgriculturalRecord(item);
      const model = getAgriculturalModel(item);

      if (!machinery?.id) return null;

      return {
        id: String(machinery.id),
        name: machinery.name ?? "Без названия",
        machineryModelId: model?.id ?? machinery.machinery_model?.id ?? null,
        machineryModelName:
          model?.name ?? machinery.machinery_model?.name ?? null,
        raw: item,
      };
    })
    .filter(Boolean) as MachineryOption[];

export const filterCurrentTariffs = ({
  tariffs,
  workStandardId,
  techniqueModelId,
  machineryModelId,
}: {
  tariffs: any[];
  workStandardId?: string | null;
  techniqueModelId?: string | null;
  machineryModelId?: string | null;
}) => {
  if (!workStandardId || !techniqueModelId) return [];

  return (tariffs || []).filter((tariff: any) => {
    const sameWork =
      tariff.work_standard_id === workStandardId ||
      tariff.work_standard?.id === workStandardId;
    const sameTechnique =
      !tariff.technique_model_id ||
      tariff.technique_model_id === techniqueModelId;
    const sameMachinery =
      !machineryModelId ||
      !tariff.agricultural_machinery_model_id ||
      tariff.agricultural_machinery_model_id === machineryModelId;

    return sameWork && sameTechnique && sameMachinery && !tariff.is_deleted;
  });
};

export const findTransferWork = (workStandards: any[]) =>
  (workStandards || []).find(
    (work: any) => Number(work.work_kind_id) === 18,
  ) ?? null;

export const filterTransferTariffs = ({
  tariffs,
  workStandards,
  techniqueModelId,
}: {
  tariffs: any[];
  workStandards: any[];
  techniqueModelId?: string | null;
}) => {
  if (!techniqueModelId) return [];

  const transferWorkIds = new Set(
    (workStandards || [])
      .filter((work: any) => Number(work.work_kind_id) === 18)
      .map((work: any) => String(work.id)),
  );

  return (tariffs || []).filter(
    (tariff: any) =>
      transferWorkIds.has(String(tariff.work_standard_id)) &&
      (!tariff.technique_model_id ||
        tariff.technique_model_id === techniqueModelId) &&
      !tariff.is_deleted,
  );
};

export const buildTariffPickerOptions = (tariffs: any[]) =>
  tariffs.map((item: any) => ({
    id: item.id || item.work_standard_tariff_id,
    title: `Норма: ${item.norm_value ?? "-"}`,
    subtitle: item.comment ?? null,
    raw: item,
  }));

export const validateTechniqueForm = ({
  taskId,
  selectedTechnique,
  selectedTariff,
  requiresTransferTariff,
  selectedTransferTariff,
}: {
  taskId?: string | null;
  selectedTechnique: TechniqueOption | null;
  selectedTariff: any | null;
  requiresTransferTariff: boolean;
  selectedTransferTariff: any | null;
}) => {
  if (!taskId) return "Задание не загружено";
  if (!selectedTechnique) return "Выберите технику";
  if (!selectedTariff) return "Выберите основной тариф";
  if (requiresTransferTariff && !selectedTransferTariff) {
    return "Выберите тариф на перегон";
  }

  return null;
};

const getTariffId = (tariff: any) =>
  tariff?.id || tariff?.work_standard_tariff_id;

export const buildTaskTechniquePayload = ({
  taskId,
  taskType,
  selectedTechnique,
  selectedMachinery,
  selectedTariff,
  selectedTransferTariff,
  workSpeed,
  processingDepth,
  soluteFlowRate,
  shouldMoveTechnique,
}: {
  taskId: string;
  taskType: TaskType;
  selectedTechnique: TechniqueOption;
  selectedMachinery: MachineryOption | null;
  selectedTariff: any;
  selectedTransferTariff: any | null;
  workSpeed: string;
  processingDepth: string;
  soluteFlowRate: string;
  shouldMoveTechnique: boolean;
}): TaskTechniquePayload => {
  const isTransportTask = taskType === "transport";
  const isTransportLikeTask =
    isTransportTask || taskType === "transportation";
  const transportationPayload = {
    task_id: taskId,
    technique_id: selectedTechnique.id,
    agriculture_machine_id: selectedMachinery?.id ?? null,
    tariff_id: getTariffId(selectedTariff),
    work_speed: toNumberOrNull(workSpeed),
  };
  const commonPayload = {
    production_task_id: taskId,
    technique_standard_id: selectedTechnique.id,
    agriculture_machine_standard_id: selectedMachinery?.id ?? null,
    tariff_id: getTariffId(selectedTariff),
    transfer_tariff_id: getTariffId(selectedTransferTariff),
    work_speed: toNumberOrNull(workSpeed),
    processing_depth: toNumberOrNull(processingDepth),
    solute_flow_rate: toNumberOrNull(soluteFlowRate),
  };

  if (shouldMoveTechnique) {
    return {
      technique_id: getMoveTechniqueId(selectedTechnique),
      tariff_id: getTariffId(selectedTariff),
      transfer_tariff_id: getTariffId(selectedTransferTariff),
      agricultural_machine_id: selectedMachinery?.id ?? null,
      task_id: taskId,
      work_speed: toNumberOrNull(workSpeed),
    };
  }

  return isTransportLikeTask ? transportationPayload : commonPayload;
};

export const getTechniqueTermsText = (item: any) => {
  const term = item?.terms?.[0] ?? item;
  const workSpeed = term?.work_speed ?? term?.workSpeed;
  const processingDepth = term?.processing_depth ?? term?.processingDepth;
  const soluteFlowRate = term?.solute_flow_rate ?? term?.soluteFlowRate;

  const params = [
    hasValue(workSpeed) ? `Скорость: ${workSpeed} км/ч` : null,
    hasValue(processingDepth) ? `Глубина: ${processingDepth} см` : null,
    hasValue(soluteFlowRate) ? `Расход: ${soluteFlowRate} л/га` : null,
  ].filter(Boolean);

  return params.length > 0 ? params.join(" · ") : null;
};
