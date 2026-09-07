import { useSetAtom } from "jotai";
import { useCallback, useMemo, useState } from "react";
import { Alert } from "react-native";

import { addTariffsListAtom } from "../../../../entities/tariffsList";
import { useAuth } from "../../../../entities/auth/lib/useAuth";
import { useLocalDictionaries } from "../../../../features/localData/useLocalData";
import { useTariffActions } from "../../../../src/hooks/database/useTariffActions";
import { useAlerts } from "../../../../shared/lib/useAlerts";
import type { PickerOption } from "../../../AppSelector/AppPickerModal";
import {
  buildMachineryOptions,
  buildTariffPickerOptions,
  buildTechniqueOptions,
  filterCurrentTariffs,
  filterTransferTariffs,
  findTransferWork,
  getBusyTechniqueContext,
  type MachineryOption,
  type TechniqueOption,
} from "./TaskTechniques.logic";
import type { TaskTechniquesProps } from "./TaskTechniques.types";
import { useTaskTechniqueForm } from "./useTaskTechniqueForm";

const EMPTY_TECHNIQUES: any[] = [];

type Args = Pick<
  TaskTechniquesProps,
  | "currentTask"
  | "techniqueWithAdditionalInfo"
  | "onAddTechnique"
  | "onDeleteTechnique"
  | "onMoveTechnique"
> & {
  taskType: NonNullable<TaskTechniquesProps["taskType"]>;
};

export const useTaskTechniquesScreen = ({
  currentTask,
  taskType,
  techniqueWithAdditionalInfo = EMPTY_TECHNIQUES,
  onAddTechnique,
  onDeleteTechnique,
  onMoveTechnique,
}: Args) => {
  const { getValidAccessToken } = useAuth();
  const { generateTariff } = useTariffActions();
  const saveGeneratedTariff = useSetAtom(addTariffsListAtom);
  const {
    techniqueStandard = EMPTY_TECHNIQUES,
    agriculturalMachinery = EMPTY_TECHNIQUES,
    tariffsList = EMPTY_TECHNIQUES,
    workStandard = EMPTY_TECHNIQUES,
  } = useLocalDictionaries();
  const { showError, showOtherInformation } = useAlerts();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const taskTechniques =
    currentTask?.field_task?.techniques ?? EMPTY_TECHNIQUES;
  const techniqueSource = techniqueWithAdditionalInfo.length
    ? techniqueWithAdditionalInfo
    : techniqueStandard;

  const currentTechniqueIds = useMemo(
    () =>
      new Set(
        taskTechniques
          .map((item) => item.technique?.id)
          .filter(Boolean)
          .map(String),
      ),
    [taskTechniques],
  );

  const techniqueOptions = useMemo(
    () => buildTechniqueOptions(techniqueSource, currentTechniqueIds),
    [currentTechniqueIds, techniqueSource],
  );
  const machineryOptions = useMemo(
    () => buildMachineryOptions(agriculturalMachinery),
    [agriculturalMachinery],
  );
  const transferWork = useMemo(
    () => findTransferWork(workStandard),
    [workStandard],
  );

  const form = useTaskTechniqueForm({
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
  });

  const currentTariffs = useMemo(
    () =>
      filterCurrentTariffs({
        tariffs: tariffsList,
        workStandardId: currentTask?.work_standard?.id,
        techniqueModelId: form.selectedTechnique?.machineryModelId,
        machineryModelId: form.selectedMachinery?.machineryModelId,
      }),
    [
      currentTask?.work_standard?.id,
      form.selectedMachinery?.machineryModelId,
      form.selectedTechnique?.machineryModelId,
      tariffsList,
    ],
  );
  const transferTariffs = useMemo(
    () =>
      filterTransferTariffs({
        tariffs: tariffsList,
        workStandards: workStandard,
        techniqueModelId: form.selectedTechnique?.machineryModelId,
      }),
    [form.selectedTechnique?.machineryModelId, tariffsList, workStandard],
  );

  const techniquePickerOptions = useMemo<PickerOption<TechniqueOption>[]>(
    () => {
      const free = techniqueOptions.filter((item) => !item.additionalInfo);
      const busy = techniqueOptions.filter((item) => item.additionalInfo);

      return [...free, ...busy].map((item) => ({
        id: item.id,
        title: item.displayName,
        subtitle: [
          item.machineryModelPower
            ? `${item.machineryModelPower} л.с.`
            : null,
          item.additionalInfo ? "Занята" : "Свободна",
          item.additionalInfo
            ? getBusyTechniqueContext(item.additionalInfo)
            : null,
        ]
          .filter(Boolean)
          .join(" · "),
        sectionTitle: item.additionalInfo
          ? `Занятая техника (${busy.length})`
          : `Свободная техника (${free.length})`,
        badgeText: item.additionalInfo ? "Занята" : null,
        variant: item.additionalInfo ? ("danger" as const) : ("default" as const),
        raw: item,
      }));
    },
    [techniqueOptions],
  );
  const machineryPickerOptions = useMemo<PickerOption<MachineryOption>[]>(
    () =>
      machineryOptions.map((item) => ({
        id: item.id,
        title: item.name,
        raw: item,
      })),
    [machineryOptions],
  );
  const tariffPickerOptions = useMemo(
    () => buildTariffPickerOptions(currentTariffs),
    [currentTariffs],
  );
  const transferTariffPickerOptions = useMemo(
    () => buildTariffPickerOptions(transferTariffs),
    [transferTariffs],
  );

  const confirmDelete = useCallback(
    (id: string) => {
      Alert.alert(
        "Удалить агрегат",
        "Вы действительно хотите удалить агрегат?",
        [
          { text: "Отмена", style: "cancel" },
          {
            text: "Удалить",
            style: "destructive",
            onPress: async () => {
              try {
                setDeletingId(id);

                const success = await onDeleteTechnique(id);

                if (!success) {
                  showError("Не удалось удалить агрегат");
                }
              } finally {
                setDeletingId(null);
              }
            },
          },
        ],
      );
    },
    [onDeleteTechnique, showError],
  );

  return {
    taskTechniques,
    deletingId,
    transferWork,
    techniquePickerOptions,
    machineryPickerOptions,
    tariffPickerOptions,
    transferTariffPickerOptions,
    form,
    confirmDelete,
  };
};
