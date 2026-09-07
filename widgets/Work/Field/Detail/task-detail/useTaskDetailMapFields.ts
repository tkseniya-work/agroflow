import { useCallback, useMemo, useState } from "react";
import { Alert } from "react-native";

type TaskField = {
  id?: string | number | null;
  season_field?: {
    id?: string | number | null;
  } | null;
};

type Options = {
  taskId: string;
  fields: TaskField[];
  getValidAccessToken: () => Promise<string | null>;
  addProductionTaskField: (data: {
    accessToken: string;
    data: {
      production_task_id: string;
      season_field_id: string;
      production_plan_work_id: null;
    };
  }) => Promise<boolean>;
  removeProductionTaskField: (data: {
    accessToken: string;
    id: string;
  }) => Promise<boolean>;
  onReload?: () => void | Promise<void>;
};

export const useTaskDetailMapFields = ({
  taskId,
  fields,
  getValidAccessToken,
  addProductionTaskField,
  removeProductionTaskField,
  onReload,
}: Options) => {
  const [isMapModalVisible, setIsMapModalVisible] = useState(false);
  const [selectedMapFieldIds, setSelectedMapFieldIds] = useState<
    string[] | null
  >(null);
  const [isSavingMapFields, setIsSavingMapFields] = useState(false);

  const selectedFieldIds = useMemo(
    () =>
      fields
        .map((field) => field.season_field?.id ?? field.id)
        .filter(Boolean)
        .map(String),
    [fields],
  );

  const openMap = useCallback(() => {
    setSelectedMapFieldIds(null);
    setIsMapModalVisible(true);
  }, []);

  const closeMap = useCallback(() => {
    setIsMapModalVisible(false);
  }, []);

  const toggleMapField = useCallback(
    (fieldId: string) => {
      setSelectedMapFieldIds((previous) => {
        const selectedIds = previous ?? selectedFieldIds;

        return selectedIds.includes(fieldId)
          ? selectedIds.filter((id) => id !== fieldId)
          : [...selectedIds, fieldId];
      });
    },
    [selectedFieldIds],
  );

  const saveMapFields = useCallback(async () => {
    if (isSavingMapFields) return;

    const nextFieldIds = selectedMapFieldIds ?? selectedFieldIds;
    const selectedSet = new Set(selectedFieldIds);
    const nextSet = new Set(nextFieldIds);
    const fieldIdsToAdd = nextFieldIds.filter((id) => !selectedSet.has(id));
    const fieldIdsToDelete = selectedFieldIds.filter((id) => !nextSet.has(id));

    if (!fieldIdsToAdd.length && !fieldIdsToDelete.length) {
      closeMap();
      return;
    }

    const accessToken = await getValidAccessToken();
    if (!accessToken) return;

    try {
      setIsSavingMapFields(true);

      for (const fieldId of fieldIdsToDelete) {
        const taskField = fields.find(
          (item) => String(item.season_field?.id ?? item.id) === fieldId,
        );

        if (
          !taskField?.id ||
          !(await removeProductionTaskField({
            accessToken,
            id: String(taskField.id),
          }))
        ) {
          throw new Error("Не удалось удалить поле из задания");
        }
      }

      for (const fieldId of fieldIdsToAdd) {
        const success = await addProductionTaskField({
          accessToken,
          data: {
            production_task_id: taskId,
            season_field_id: fieldId,
            production_plan_work_id: null,
          },
        });

        if (!success) {
          throw new Error("Не удалось добавить поле в задание");
        }
      }

      await onReload?.();
      closeMap();
    } catch (error) {
      Alert.alert(
        "Ошибка",
        error instanceof Error
          ? error.message
          : "Не удалось сохранить выбранные поля",
      );
    } finally {
      setIsSavingMapFields(false);
    }
  }, [
    addProductionTaskField,
    closeMap,
    fields,
    getValidAccessToken,
    isSavingMapFields,
    onReload,
    removeProductionTaskField,
    selectedFieldIds,
    selectedMapFieldIds,
    taskId,
  ]);

  return {
    isMapModalVisible,
    selectedMapFieldIds,
    selectedFieldIds,
    isSavingMapFields,
    openMap,
    closeMap,
    toggleMapField,
    saveMapFields,
  };
};
