import dayjs from "dayjs";
import { useEffect, useMemo, useState } from "react";

import type {
  ProductionTask,
  CreateFieldProductionTaskRequest,
  CreateTransportationProductionTaskRequest,
  CreateTransportProductionTaskRequest,
  UpdateProductionTaskRequest,
} from "../../../entities/productionTask";
import { useAuth } from "../../../entities/auth/lib/useAuth";
import { useWorkStandards } from "../../../features/localData/useLocalData";
import { useSeasonFields, type SeasonRequest } from "../../../entities/season";
import type { PickerOption } from "../../AppSelector/AppPickerModal";
import type { ProductionTaskFormSubmit } from "./ProductionTaskFormModal.types";

type Params = {
  visible: boolean;
  currentTask?: ProductionTask | null;
  requireWorkStandardOnCreate: boolean;
  keepOpenOnFalse: boolean;
  onClose: () => void;
  onSubmit: ProductionTaskFormSubmit;
};

type CreateRequest =
  | CreateFieldProductionTaskRequest
  | CreateTransportProductionTaskRequest
  | CreateTransportationProductionTaskRequest;

export const useProductionTaskFormModal = ({
  visible,
  currentTask,
  requireWorkStandardOnCreate,
  keepOpenOnFalse,
  onClose,
  onSubmit,
}: Params) => {
  const { getValidAccessToken } = useAuth();
  const workStandards = useWorkStandards();
  const { seasons, currentSeason, changeSeason } = useSeasonFields();
  const [saving, setSaving] = useState(false);
  const [selectedSeason, setSelectedSeason] = useState<SeasonRequest | null>(
    null,
  );
  const [selectedWorkStandard, setSelectedWorkStandard] = useState<any | null>(
    null,
  );
  const [dateStart, setDateStartValue] = useState(
    dayjs().format("YYYY-MM-DD"),
  );
  const [comment, setComment] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);
  const isEditMode = Boolean(currentTask?.id);

  useEffect(() => {
    if (!visible) return;

    setValidationError(null);

    if (currentTask) {
      setSelectedSeason(
        seasons?.find(
          (item: any) => Number(item.year) === Number(currentTask.season_year),
        ) || null,
      );
      setSelectedWorkStandard(currentTask.work_standard || null);
      setDateStartValue(
        currentTask.date_start
          ? dayjs(currentTask.date_start).format("YYYY-MM-DD")
          : dayjs().format("YYYY-MM-DD"),
      );
      setComment(currentTask.comment || "");

      return;
    }

    setSelectedSeason(currentSeason || null);
    setSelectedWorkStandard(null);
    setDateStartValue(dayjs().format("YYYY-MM-DD"));
    setComment("");
  }, [visible, currentTask, seasons, currentSeason]);

  const seasonOptions = useMemo<PickerOption<SeasonRequest>[]>(
    () =>
      (seasons || []).map((item: any) => ({
        id: item.id || item.year,
        title: item.year,
        subtitle: item?.is_current ? "Текущий сезон" : null,
        raw: item,
      })),
    [seasons],
  );
  const workOptions = useMemo<PickerOption[]>(
    () =>
      (workStandards || []).map((item: any) => ({
        id: item.id,
        title: item.name,
        raw: item,
      })),
    [workStandards],
  );

  const selectSeason = async (season: SeasonRequest) => {
    setSelectedSeason(season);
    setValidationError(null);
    await changeSeason?.(season);
  };

  const selectWorkStandard = (workStandard: any) => {
    setSelectedWorkStandard(workStandard);
    setValidationError(null);
  };

  const setDateStart = (value: string) => {
    setDateStartValue(value);
    setValidationError(null);
  };

  const validate = () => {
    if (!selectedSeason) return "Выберите сезон";
    if (!dateStart) return "Укажите дату начала";
    if (
      requireWorkStandardOnCreate &&
      !isEditMode &&
      !selectedWorkStandard
    ) {
      return "Выберите вид работы";
    }

    return null;
  };

  const handleSubmit = async () => {
    const error = validate();

    if (error) {
      setValidationError(error);
      return;
    }

    try {
      setSaving(true);

      const accessToken = await getValidAccessToken();
      const data: CreateRequest | UpdateProductionTaskRequest = isEditMode
        ? {
            accessToken,
            taskId: currentTask!.id,
            seasonYear: selectedSeason?.year,
            dateStart,
            comment,
          }
        : {
            accessToken,
            seasonYear: selectedSeason?.year,
            dateStart,
            workStandardId: selectedWorkStandard?.id,
            comment,
          };
      const result = await onSubmit(data);

      if (keepOpenOnFalse && result === false) return;

      onClose();
    } finally {
      setSaving(false);
    }
  };

  return {
    comment,
    dateStart,
    handleSubmit,
    saving,
    seasonOptions,
    selectSeason,
    selectWorkStandard,
    selectedSeason,
    selectedWorkStandard,
    setComment,
    setDateStart,
    validationError,
    workOptions,
  };
};
