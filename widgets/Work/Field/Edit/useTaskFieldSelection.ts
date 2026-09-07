import { useCallback, useEffect, useMemo, useState } from "react";

import type { FieldProductionTaskResponse } from "../../../../entities/productionTask";

type AddFieldPayload = {
  production_task_id: string;
  season_field_id: string;
  production_plan_work_id: string | null;
};

type SaveTaskPayload = {
  field_work_ids: {
    season_field_id: string;
    production_plan_work_id: string | null;
  }[];
};

type Args = {
  currentTask: FieldProductionTaskResponse | null;
  addTaskField: (data: AddFieldPayload) => Promise<boolean>;
  removeTaskField: (id: string) => Promise<boolean>;
  saveTask: (data: SaveTaskPayload) => Promise<boolean>;
  showError: (message: string) => void;
};

export function useTaskFieldSelection({
  currentTask,
  addTaskField,
  removeTaskField,
  saveTask,
  showError,
}: Args) {
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [selectedFieldIds, setSelectedFieldIds] = useState<string[]>([]);
  const [draftSelectedFieldIds, setDraftSelectedFieldIds] = useState<string[]>(
    [],
  );
  const [selectedWorkIds, setSelectedWorkIds] = useState<
    Record<string, string | null>
  >({});
  const [isSaving, setIsSaving] = useState(false);
  const [updatingFieldId, setUpdatingFieldId] = useState<string | null>(null);
  const taskFields = useMemo(
    () => currentTask?.field_task?.task_fields ?? [],
    [currentTask],
  );

  useEffect(() => {
    const taskFieldIds = taskFields
      .map((field) => field.season_field?.id ?? field.id)
      .filter(Boolean)
      .map(String);
    const taskWorkIds = taskFields.reduce<Record<string, string | null>>(
      (acc, field) => {
        const fieldId = String(field.season_field?.id ?? field.id);
        acc[fieldId] = field.plan_work?.id ?? null;
        return acc;
      },
      {},
    );

    setSelectedFieldIds(taskFieldIds);
    setSelectedWorkIds(taskWorkIds);
  }, [taskFields]);

  const openMap = useCallback(() => {
    setDraftSelectedFieldIds(selectedFieldIds);
    setIsMapOpen(true);
  }, [selectedFieldIds]);

  const closeMap = useCallback(() => {
    if (isSaving) return;

    setDraftSelectedFieldIds(selectedFieldIds);
    setIsMapOpen(false);
  }, [isSaving, selectedFieldIds]);

  const toggleDraftField = useCallback(
    (field: any) => {
      if (!field?.id || isSaving) return;

      const fieldId = String(field.id);
      setDraftSelectedFieldIds((previous) =>
        previous.includes(fieldId)
          ? previous.filter((item) => item !== fieldId)
          : [...previous, fieldId],
      );
    },
    [isSaving],
  );

  const saveMap = useCallback(async () => {
    if (!currentTask?.id || isSaving) return;

    const selectedSet = new Set(selectedFieldIds);
    const draftSet = new Set(draftSelectedFieldIds);
    const fieldIdsToAdd = draftSelectedFieldIds.filter(
      (fieldId) => !selectedSet.has(fieldId),
    );
    const fieldIdsToDelete = selectedFieldIds.filter(
      (fieldId) => !draftSet.has(fieldId),
    );

    if (fieldIdsToAdd.length === 0 && fieldIdsToDelete.length === 0) {
      setIsMapOpen(false);
      return;
    }

    try {
      setIsSaving(true);

      for (const fieldId of fieldIdsToDelete) {
        const taskField = taskFields.find(
          (item) => String(item.season_field?.id ?? item.id) === fieldId,
        );

        if (!taskField?.id) continue;

        setUpdatingFieldId(fieldId);
        const success = await removeTaskField(String(taskField.id));

        if (!success) {
          showError("Не удалось удалить поле из задания");
          setIsMapOpen(false);
          return;
        }
      }

      for (const fieldId of fieldIdsToAdd) {
        setUpdatingFieldId(fieldId);
        const success = await addTaskField({
          production_task_id: currentTask.id,
          season_field_id: fieldId,
          production_plan_work_id: null,
        });

        if (!success) {
          showError("Не удалось добавить поле в задание");
          return;
        }
      }

      setSelectedFieldIds(draftSelectedFieldIds);
      setSelectedWorkIds((previous) => {
        const next = { ...previous };

        fieldIdsToDelete.forEach((fieldId) => {
          delete next[fieldId];
        });
        fieldIdsToAdd.forEach((fieldId) => {
          next[fieldId] = null;
        });

        return next;
      });
      setIsMapOpen(false);
    } finally {
      setUpdatingFieldId(null);
      setIsSaving(false);
    }
  }, [
    addTaskField,
    currentTask?.id,
    draftSelectedFieldIds,
    isSaving,
    removeTaskField,
    selectedFieldIds,
    showError,
    taskFields,
  ]);

  const deleteField = useCallback(
    async (field: any) => {
      const fieldId = String(field.id);
      const taskField =
        field.taskField ??
        taskFields.find(
          (item) => String(item.season_field?.id ?? item.id) === fieldId,
        );

      if (!taskField?.id || isSaving) return;

      try {
        setIsSaving(true);
        setUpdatingFieldId(fieldId);

        const success = await removeTaskField(String(taskField.id));

        if (!success) {
          showError("Не удалось удалить поле из задания");
          return;
        }

        setSelectedFieldIds((previous) =>
          previous.filter((id) => id !== fieldId),
        );
        setSelectedWorkIds((previous) => {
          const next = { ...previous };
          delete next[fieldId];
          return next;
        });
      } finally {
        setUpdatingFieldId(null);
        setIsSaving(false);
      }
    },
    [isSaving, removeTaskField, showError, taskFields],
  );

  const toggleWork = useCallback(
    async (field: any, work: any) => {
      const fieldId = String(field.id);
      const workId = String(work.id);
      const previousWorkId = selectedWorkIds[fieldId] ?? null;
      const nextWorkId = previousWorkId === workId ? null : workId;
      const nextSelectedWorkIds = {
        ...selectedWorkIds,
        [fieldId]: nextWorkId,
      };

      setSelectedWorkIds(nextSelectedWorkIds);
      setUpdatingFieldId(fieldId);

      try {
        const success = await saveTask({
          field_work_ids: selectedFieldIds.map((seasonFieldId) => ({
            season_field_id: seasonFieldId,
            production_plan_work_id:
              nextSelectedWorkIds[seasonFieldId] ?? null,
          })),
        });

        if (!success) {
          setSelectedWorkIds((previous) => ({
            ...previous,
            [fieldId]: previousWorkId,
          }));
          showError("Не удалось сохранить плановую работу");
        }
      } catch {
        setSelectedWorkIds((previous) => ({
          ...previous,
          [fieldId]: previousWorkId,
        }));
        showError("Не удалось сохранить плановую работу");
      } finally {
        setUpdatingFieldId(null);
      }
    },
    [saveTask, selectedFieldIds, selectedWorkIds, showError],
  );

  return {
    isMapOpen,
    selectedFieldIds,
    draftSelectedFieldIds,
    selectedWorkIds,
    isSaving,
    updatingFieldId,
    openMap,
    closeMap,
    toggleDraftField,
    saveMap,
    deleteField,
    toggleWork,
  };
}
