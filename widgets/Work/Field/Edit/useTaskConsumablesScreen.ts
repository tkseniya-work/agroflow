import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert } from "react-native";

import type { ProductionTaskField , ProductionTaskConsumableType } from "../../../../entities/productionTask";
import { useAlerts } from "../../../../shared/lib/useAlerts";
import {
  buildConsumableItems,
  buildFieldOptions,
  buildSourceOptions,
  buildUnitOptions,
} from "./TaskConsumables.logic";
import type {
  ConsumableTab,
  TaskConsumablesProps,
} from "./TaskConsumables.types";
import { useTaskConsumableForm } from "./useTaskConsumableForm";

const EMPTY_FIELDS: ProductionTaskField[] = [];

type Args = Pick<
  TaskConsumablesProps,
  | "currentTask"
  | "cropStandardsList"
  | "fertilizerStandardsList"
  | "pesticideStandardsList"
  | "sowingUnitCodeList"
  | "onSaveNorm"
  | "onDeleteNorm"
>;

export const useTaskConsumablesScreen = ({
  currentTask,
  cropStandardsList,
  fertilizerStandardsList,
  pesticideStandardsList,
  sowingUnitCodeList,
  onSaveNorm,
  onDeleteNorm,
}: Args) => {
  const fields = currentTask?.field_task?.task_fields ?? EMPTY_FIELDS;
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(
    fields[0]?.id ?? null,
  );
  const [activeTab, setActiveTab] = useState<ConsumableTab>("norm");
  const [isFieldPickerVisible, setIsFieldPickerVisible] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { showWarning, showError } = useAlerts();

  const selectedField = useMemo(
    () =>
      fields.find((field) => String(field.id) === String(selectedFieldId)) ??
      fields[0] ??
      null,
    [fields, selectedFieldId],
  );

  useEffect(() => {
    if (!selectedFieldId && fields[0]?.id) {
      setSelectedFieldId(fields[0].id);
    }
  }, [fields, selectedFieldId]);

  const form = useTaskConsumableForm({
    selectedField,
    showWarning,
    showError,
    onSaveNorm,
  });

  const fieldOptions = useMemo(() => buildFieldOptions(fields), [fields]);
  const normItems = useMemo(
    () => buildConsumableItems(selectedField, "norm"),
    [selectedField],
  );
  const planItems = useMemo(
    () => buildConsumableItems(selectedField, "plan"),
    [selectedField],
  );
  const visibleItems = activeTab === "norm" ? normItems : planItems;

  const sourceOptions = useMemo(() => {
    const dictionarySource =
      form.editingType === "seed"
        ? cropStandardsList
        : form.editingType === "pesticide"
          ? pesticideStandardsList
          : fertilizerStandardsList;

    return buildSourceOptions(dictionarySource, form.editingType);
  }, [
    cropStandardsList,
    fertilizerStandardsList,
    form.editingType,
    pesticideStandardsList,
  ]);

  const unitOptions = useMemo(
    () => buildUnitOptions(sowingUnitCodeList),
    [sowingUnitCodeList],
  );

  const selectField = useCallback((field: ProductionTaskField) => {
    setSelectedFieldId(field.id);
  }, []);

  const confirmDelete = useCallback(
    (type: ProductionTaskConsumableType, id: string) => {
      Alert.alert(
        "Удалить расходник",
        "Вы действительно хотите удалить расходник?",
        [
          { text: "Отмена", style: "cancel" },
          {
            text: "Удалить",
            style: "destructive",
            onPress: async () => {
              try {
                setDeletingId(id);

                const success = await onDeleteNorm(type, id);

                if (!success) {
                  showError("Не удалось удалить расходник");
                }
              } finally {
                setDeletingId(null);
              }
            },
          },
        ],
      );
    },
    [onDeleteNorm, showError],
  );

  const openFieldPicker = useCallback(() => {
    setIsFieldPickerVisible(true);
  }, []);

  const closeFieldPicker = useCallback(() => {
    setIsFieldPickerVisible(false);
  }, []);

  return {
    fields,
    selectedField,
    activeTab,
    setActiveTab,
    isFieldPickerVisible,
    openFieldPicker,
    closeFieldPicker,
    selectField,
    deletingId,
    fieldOptions,
    visibleItems,
    sourceOptions,
    unitOptions,
    form,
    confirmDelete,
  };
};

export type TaskConsumablesScreenModel = ReturnType<
  typeof useTaskConsumablesScreen
>;
