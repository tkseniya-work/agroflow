import { useCallback, useState } from "react";

import { FieldProductionTaskResponse } from "../../../../entities/productionTask";
import {
  buildTaskTechniquePayload,
  GenerateTariffTarget,
  MachineryOption,
  TaskTechniquePayload,
  TaskType,
  TechniqueOption,
  validateTechniqueForm,
} from "./TaskTechniques.logic";

type Args = {
  currentTask: FieldProductionTaskResponse | null;
  taskType: TaskType;
  transferWork: any | null;
  getValidAccessToken: () => Promise<any>;
  generateTariff: (params: any) => Promise<any>;
  saveGeneratedTariff: (tariffs: any[]) => Promise<any> | any;
  showError: (message: string) => void;
  showOtherInformation: (title: string, message: string) => void;
  onAddTechnique: (data: TaskTechniquePayload) => Promise<boolean>;
  onMoveTechnique: (data: TaskTechniquePayload) => Promise<boolean>;
};

export function useTaskTechniqueForm({
  currentTask,
  taskType,
  transferWork,
  getValidAccessToken,
  generateTariff,
  saveGeneratedTariff,
  showError,
  showOtherInformation,
  onAddTechnique,
  onMoveTechnique,
}: Args) {
  const [isVisible, setIsVisible] = useState(false);
  const [generateTariffTarget, setGenerateTariffTarget] =
    useState<GenerateTariffTarget | null>(null);
  const [selectedTechnique, setSelectedTechnique] =
    useState<TechniqueOption | null>(null);
  const [selectedMachinery, setSelectedMachinery] =
    useState<MachineryOption | null>(null);
  const [selectedTariff, setSelectedTariff] = useState<any | null>(null);
  const [selectedTransferTariff, setSelectedTransferTariff] = useState<
    any | null
  >(null);
  const [workSpeed, setWorkSpeed] = useState("");
  const [processingDepth, setProcessingDepth] = useState("");
  const [soluteFlowRate, setSoluteFlowRate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingTariff, setIsGeneratingTariff] = useState(false);

  const isTransportationTask = taskType === "transportation";
  const isTransportLikeTask =
    taskType === "transport" || isTransportationTask;
  const requiresTransferTariff = taskType === "field";
  const shouldMoveTechnique = Boolean(selectedTechnique?.additionalInfo);

  const reset = useCallback(() => {
    setSelectedTechnique(null);
    setSelectedMachinery(null);
    setSelectedTariff(null);
    setSelectedTransferTariff(null);
    setWorkSpeed("");
    setProcessingDepth("");
    setSoluteFlowRate("");
    setGenerateTariffTarget(null);
  }, []);

  const open = useCallback(() => {
    setIsVisible(true);
  }, []);

  const close = useCallback(() => {
    setIsVisible(false);
    reset();
  }, [reset]);

  const selectTechnique = useCallback((technique: TechniqueOption) => {
    setSelectedTechnique(technique);
    setSelectedTariff(null);
    setSelectedTransferTariff(null);
  }, []);

  const selectMachinery = useCallback((machinery: MachineryOption) => {
    setSelectedMachinery(machinery);
    setSelectedTariff(null);
  }, []);

  const openGenerateTariff = useCallback(
    (target: GenerateTariffTarget) => {
      if (!selectedTechnique) {
        showOtherInformation(
          "Сначала выберите технику",
          "Модель техники нужна для генерации тарифа.",
        );
        return;
      }

      const work =
        target === "transfer" ? transferWork : currentTask?.work_standard;

      if (!work?.id) {
        showError(
          target === "transfer"
            ? "Не найдена работа типа «Перегон»"
            : "Не удалось определить работу",
        );
        return;
      }

      setGenerateTariffTarget(target);
    },
    [
      currentTask?.work_standard,
      selectedTechnique,
      showError,
      showOtherInformation,
      transferWork,
    ],
  );

  const closeGenerateTariff = useCallback(() => {
    setGenerateTariffTarget(null);
  }, []);

  const generateSelectedTariff = useCallback(async () => {
    if (!generateTariffTarget || !selectedTechnique) return;

    const work =
      generateTariffTarget === "transfer"
        ? transferWork
        : currentTask?.work_standard;

    if (!work?.id) return;

    try {
      setIsGeneratingTariff(true);

      const accessToken = await getValidAccessToken();
      const response = await generateTariff({
        accessToken,
        work_standard_id: String(work.id),
        technique_model_id: selectedTechnique.machineryModelId ?? null,
        agricultural_machinery_model_id:
          selectedMachinery?.machineryModelId ?? null,
      });
      const generatedTariff = response?.tariff ?? response?.data ?? response;

      if (!generatedTariff?.id) {
        throw new Error("Generated tariff has no id");
      }

      const normalizedTariff = {
        ...generatedTariff,
        work_standard_id:
          generatedTariff.work_standard_id ?? String(work.id),
        technique_model_id:
          generatedTariff.technique_model_id ??
          selectedTechnique.machineryModelId ??
          null,
        agricultural_machinery_model_id:
          generatedTariff.agricultural_machinery_model_id ??
          selectedMachinery?.machineryModelId ??
          null,
        is_deleted: generatedTariff.is_deleted ?? false,
        deleted_at: generatedTariff.deleted_at ?? null,
      };

      await saveGeneratedTariff([normalizedTariff]);

      if (generateTariffTarget === "transfer") {
        setSelectedTransferTariff(normalizedTariff);
      } else {
        setSelectedTariff(normalizedTariff);
      }

      setGenerateTariffTarget(null);
      showOtherInformation(
        "Тариф создан",
        "Новый тариф автоматически выбран в форме.",
      );
    } catch (error) {
      console.error("Generate tariff error:", error);
      showError("Не удалось сгенерировать тариф");
    } finally {
      setIsGeneratingTariff(false);
    }
  }, [
    currentTask?.work_standard,
    generateTariff,
    generateTariffTarget,
    getValidAccessToken,
    saveGeneratedTariff,
    selectedMachinery?.machineryModelId,
    selectedTechnique,
    showError,
    showOtherInformation,
    transferWork,
  ]);

  const submit = useCallback(async () => {
    const validationError = validateTechniqueForm({
      taskId: currentTask?.id,
      selectedTechnique,
      selectedTariff,
      requiresTransferTariff,
      selectedTransferTariff,
    });

    if (validationError) {
      showOtherInformation("Не все заполнено", validationError);
      return;
    }

    if (!currentTask || !selectedTechnique) return;

    try {
      setIsSubmitting(true);

      const submitTechnique = shouldMoveTechnique
        ? onMoveTechnique
        : onAddTechnique;
      const payload = buildTaskTechniquePayload({
        taskId: currentTask.id,
        taskType,
        selectedTechnique,
        selectedMachinery,
        selectedTariff,
        selectedTransferTariff,
        workSpeed,
        processingDepth,
        soluteFlowRate,
        shouldMoveTechnique,
      });
      const success = await submitTechnique(payload);

      if (success) {
        close();
      } else {
        showError(
          shouldMoveTechnique
            ? "Не удалось переместить технику"
            : "Не удалось добавить технику",
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [
    close,
    currentTask,
    onAddTechnique,
    onMoveTechnique,
    processingDepth,
    requiresTransferTariff,
    selectedMachinery,
    selectedTariff,
    selectedTechnique,
    selectedTransferTariff,
    shouldMoveTechnique,
    showError,
    showOtherInformation,
    soluteFlowRate,
    taskType,
    workSpeed,
  ]);

  return {
    isVisible,
    generateTariffTarget,
    selectedTechnique,
    selectedMachinery,
    selectedTariff,
    selectedTransferTariff,
    workSpeed,
    processingDepth,
    soluteFlowRate,
    isSubmitting,
    isGeneratingTariff,
    isTransportationTask,
    isTransportLikeTask,
    requiresTransferTariff,
    open,
    close,
    selectTechnique,
    selectMachinery,
    selectTariff: setSelectedTariff,
    selectTransferTariff: setSelectedTransferTariff,
    changeWorkSpeed: setWorkSpeed,
    changeProcessingDepth: setProcessingDepth,
    changeSoluteFlowRate: setSoluteFlowRate,
    openGenerateTariff,
    closeGenerateTariff,
    generateSelectedTariff,
    submit,
  };
}
