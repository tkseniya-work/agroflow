import { useEffect, useMemo, useState } from "react";

import type { FieldProductionTaskResponse } from "../../../../../entities/productionTask";
import type { PickerOption } from "../../../../AppSelector/AppPickerModal";
import type { ShiftPartDetails } from "../../../../../src/types/task.types";
import { getTariffPartIds } from "../../../../../src/utils/taskUtils";
import {
  useShiftPartReferenceData,
  useShiftPartTariffs,
} from "../../../shared/useShiftPartReferenceData";
import {
  asInput,
  FormState,
  getAgriSource,
  getMaterialItems,
  getShiftPartOutputValue,
  getTaskTechniques,
  getTechniqueFromTaskItem,
  getTechniqueId,
  getTechniqueModelId,
  getTechniqueSource,
  hasTransportTask,
  hasTransportationTask,
  parseMaterialQuantity,
  toApiIso,
} from "./ShiftPartEditModal.helpers";

type TokenLoader = (accessToken: string) => Promise<any>;

type UseShiftPartEditFormParams = {
  visible: boolean;
  currentTask: FieldProductionTaskResponse;
  details: ShiftPartDetails | null;
  accessToken: string | null;
  loadWorkPlaces: TokenLoader;
  loadAgriculturalMachinery: TokenLoader;
  loadShiftSettings: TokenLoader;
  searchTariffs: (request: any) => Promise<any>;
};

export type ShiftPartEditPicker =
  | "shift"
  | "field"
  | "technique"
  | "agri"
  | "tariff";

const createInitialForm = (): FormState => ({
  startAt: "",
  endedAt: "",
  outputValue: "",
  factArea: "",
  threshed: "",
  numberOfBins: "",
  transportedWeight: "",
  numberOfTrips: "",
  forceLoadTrack: false,
});

const areSameIds = (
  left: string | number | null | undefined,
  right: string | number | null | undefined,
) => String(left ?? "") === String(right ?? "");

const normalizeQuantity = (value: string) => {
  const parsed = parseMaterialQuantity(value);

  return Number.isFinite(parsed) ? String(parsed) : value.trim();
};

export const useShiftPartEditForm = ({
  visible,
  currentTask,
  details,
  accessToken,
  loadWorkPlaces,
  loadAgriculturalMachinery,
  loadShiftSettings,
  searchTariffs,
}: UseShiftPartEditFormParams) => {
  const [activeTab, setActiveTab] = useState<"part" | "materials">("part");
  const [picker, setPicker] = useState<ShiftPartEditPicker | null>(null);
  const [selectedShiftType, setSelectedShiftType] = useState<any>(null);
  const [selectedField, setSelectedField] = useState<any>(null);
  const [selectedTechnique, setSelectedTechnique] = useState<any>(null);
  const [selectedAgriMachine, setSelectedAgriMachine] = useState<any>(null);
  const [selectedTariff, setSelectedTariff] = useState<any>(null);
  const [selectedMaterialIndex, setSelectedMaterialIndex] = useState(0);
  const [materialQuantity, setMaterialQuantity] = useState("");
  const [form, setForm] = useState<FormState>(createInitialForm);
  const { workPlaces, agriculturalMachinery, shiftSettings } =
    useShiftPartReferenceData({
      visible,
      accessToken,
      loadWorkPlaces,
      loadAgriculturalMachinery,
      loadShiftSettings,
    });
  const { tariffs: currentTariffs, setTariffs: setCurrentTariffs } =
    useShiftPartTariffs({
      visible,
      accessToken,
      workStandardId: currentTask?.work_standard?.id,
      technique: selectedTechnique,
      agriculturalMachinery: selectedAgriMachine,
      getTechniqueModelId,
      searchTariffs,
    });

  const context = details?.editContext;
  const fieldGrouped = context?.fieldGrouped;
  const tariffGrouped = context?.tariffGrouped;
  const transferGrouped = context?.transferGrouped;
  const aggregate = context?.aggregate;
  const shiftParts = useMemo(
    () => tariffGrouped?.shift_parts || tariffGrouped?.shiftParts || [],
    [tariffGrouped],
  );
  const shiftPartsIds = useMemo(
    () => getTariffPartIds(tariffGrouped),
    [tariffGrouped],
  );
  const materialPartIds = useMemo(
    () =>
      shiftPartsIds.length
        ? shiftPartsIds
        : (details?.deleteIds ?? []).filter(Boolean).map(String),
    [details?.deleteIds, shiftPartsIds],
  );
  const editablePartIds = useMemo(
    () =>
      details?.deleteIds?.length
        ? details.deleteIds.filter(Boolean).map(String)
        : shiftPartsIds,
    [details?.deleteIds, shiftPartsIds],
  );
  const editablePart = useMemo(
    () =>
      shiftParts.find((part: any) =>
        editablePartIds.includes(String(part?.id)),
      ),
    [editablePartIds, shiftParts],
  );
  const originalStartAt = useMemo(
    () => toApiIso(editablePart?.start_at ?? ""),
    [editablePart?.start_at],
  );
  const originalEndedAt = useMemo(
    () => toApiIso(editablePart?.end_at ?? editablePart?.ended_at ?? ""),
    [editablePart?.end_at, editablePart?.ended_at],
  );
  const materialItems = useMemo(() => getMaterialItems(details), [details]);
  const selectedMaterial = materialItems[selectedMaterialIndex];
  const techniqueSource = getTechniqueSource(aggregate);
  const agriculturalSource = getAgriSource(aggregate);
  const isHarvesting = Number(currentTask?.work_standard?.work_kind_id) === 9;
  const isTransportTask = hasTransportTask(currentTask);
  const isTransportation = hasTransportationTask(currentTask);
  const isTransportOutput = Boolean(
    fieldGrouped?.is_transportation_output ??
      fieldGrouped?.isTransportationOutput ??
      tariffGrouped?.is_transportation_output ??
      tariffGrouped?.isTransportationOutput ??
      isTransportTask,
  );
  const source = details?.type === "field" ? fieldGrouped : transferGrouped;
  const transportationSource = isTransportation
    ? details?.type === "transfer"
      ? transferGrouped ?? tariffGrouped
      : fieldGrouped ?? tariffGrouped
    : null;
  const outputValue = getShiftPartOutputValue({
    tariffGrouped,
    fieldGrouped,
    transferGrouped,
    isTransportOutput: isTransportOutput || isTransportation,
  });
  const initialForm = useMemo<FormState>(
    () => ({
      startAt: asInput(editablePart?.start_at ?? source?.open_at_parts_time),
      endedAt: asInput(
        editablePart?.end_at ??
          editablePart?.ended_at ??
          source?.closed_at_parts_time,
      ),
      outputValue: asInput(outputValue),
      factArea: asInput(fieldGrouped?.area_fact),
      threshed: asInput(fieldGrouped?.threshed),
      numberOfBins: asInput(fieldGrouped?.number_of_bins),
      transportedWeight: asInput(transportationSource?.transported_weight),
      numberOfTrips: asInput(transportationSource?.number_of_trips),
      forceLoadTrack: false,
    }),
    [
      editablePart?.end_at,
      editablePart?.ended_at,
      editablePart?.start_at,
      fieldGrouped?.area_fact,
      fieldGrouped?.number_of_bins,
      fieldGrouped?.threshed,
      source?.closed_at_parts_time,
      source?.open_at_parts_time,
      outputValue,
      transportationSource?.number_of_trips,
      transportationSource?.transported_weight,
    ],
  );

  const shiftTypes = useMemo(
    () => [
      {
        id: 1,
        label: "Первая смена",
        start_at: shiftSettings?.first_shift_start,
        end_at: shiftSettings?.first_shift_end,
      },
      {
        id: 2,
        label: "Вторая смена",
        start_at: shiftSettings?.second_shift_start,
        end_at: shiftSettings?.second_shift_end,
      },
    ],
    [shiftSettings],
  );
  const techniqueOptions = useMemo<PickerOption<any>[]>(() => {
    const techniques = getTaskTechniques(currentTask);

    return techniques.map((item: any) => {
      const technique = getTechniqueFromTaskItem(item);
      const workPlace = workPlaces.find(
        (place: any) =>
          place?.work_place_technique?.technique?.id === technique?.id,
      );

      return {
        id: technique?.id,
        title: [technique?.name, technique?.state_number]
          .filter(Boolean)
          .join(" | "),
        subtitle: technique?.machinery_model?.name,
        raw: {
          id: technique?.id,
          technique_id: technique?.id,
          work_place_id: workPlace?.id,
          label: technique?.name,
          technique: item,
          workPlace,
        },
      };
    });
  }, [currentTask, workPlaces]);
  const fieldOptions = useMemo<PickerOption<any>[]>(
    () =>
      (currentTask?.field_task?.task_fields || []).map((item: any) => ({
        id: item.id,
        title: item?.season_field?.name ?? item?.name ?? "Поле",
        subtitle: item?.season_field?.field?.name,
        raw: {
          id: item.id,
          label: item?.season_field?.name ?? item?.name ?? "Поле",
        },
      })),
    [currentTask?.field_task?.task_fields],
  );
  const agriOptions = useMemo<PickerOption<any>[]>(() => {
    const modelId =
      selectedTechnique?.technique?.technique?.agriculture_machine
        ?.machinery_model?.id ??
      selectedTechnique?.technique?.agriculture_machine?.machinery_model?.id;

    return agriculturalMachinery
      .filter((item: any) => !modelId || item?.machinery_model?.id === modelId)
      .map((item: any) => ({
        id: item.id,
        title: item.name,
        subtitle: item?.machinery_model?.name,
        raw: {
          id: item.id,
          label: item.name,
          agriculturalMachinery: item,
        },
      }));
  }, [agriculturalMachinery, selectedTechnique]);
  const tariffOptions = useMemo<PickerOption<any>[]>(
    () =>
      currentTariffs.map((item: any) => ({
        id: item.id,
        title: `Норма: ${item?.norm_value ?? "-"}`,
        subtitle: item?.comment || item?.unit_code,
        raw: {
          id: item.id,
          label: `Норма: ${item?.norm_value ?? "-"} | ${item?.comment || ""}`,
          tariff: item,
        },
      })),
    [currentTariffs],
  );
  const pickerConfig = useMemo(() => {
    if (picker === "shift") {
      return {
        title: "Тип смены",
        data: shiftTypes.map((item) => ({
          id: item.id,
          title: item.label,
          subtitle: [item.start_at, item.end_at].filter(Boolean).join(" - "),
          raw: item,
        })),
        selectedId: selectedShiftType?.id,
        onSelect: setSelectedShiftType,
      };
    }

    if (picker === "field") {
      return {
        title: "Поле",
        data: fieldOptions,
        selectedId: selectedField?.id,
        onSelect: setSelectedField,
      };
    }

    if (picker === "technique") {
      return {
        title: "Техника",
        data: techniqueOptions,
        selectedId: getTechniqueId(selectedTechnique),
        onSelect: (item: any) => {
          setSelectedTechnique(item);
          setSelectedAgriMachine(null);
          setSelectedTariff(null);
          setCurrentTariffs([]);
        },
      };
    }

    if (picker === "agri") {
      return {
        title: "СХМ",
        data: agriOptions,
        selectedId: selectedAgriMachine?.id,
        onSelect: (item: any) => {
          setSelectedAgriMachine(item);
          setSelectedTariff(null);
        },
      };
    }

    return {
      title: "Тариф",
      data: tariffOptions,
      selectedId: selectedTariff?.id,
      onSelect: setSelectedTariff,
    };
  }, [
    agriOptions,
    fieldOptions,
    picker,
    selectedAgriMachine?.id,
    selectedField?.id,
    selectedShiftType?.id,
    selectedTariff?.id,
    selectedTechnique,
    setCurrentTariffs,
    shiftTypes,
    tariffOptions,
    techniqueOptions,
  ]);

  useEffect(() => {
    if (!visible || !details) return;

    setActiveTab("part");
    setPicker(null);
    setSelectedMaterialIndex(0);
    setMaterialQuantity(asInput(materialItems[0]?.value));
    setForm(initialForm);
    setSelectedShiftType({
      id: details.shiftType ?? 1,
      label:
        details.shiftName ||
        (details.shiftType === 2 ? "Вторая смена" : "Первая смена"),
    });
    setSelectedField(
      !isTransportOutput && fieldGrouped?.task_field_id
        ? {
            id: fieldGrouped.task_field_id,
            label: fieldGrouped.task_field_name,
          }
        : null,
    );
    setSelectedTechnique(
      techniqueSource
        ? {
            id: techniqueSource.id,
            technique_id: techniqueSource.id,
            label: techniqueSource.name,
            technique: techniqueSource,
          }
        : null,
    );
    setSelectedAgriMachine(
      agriculturalSource
        ? {
            id: agriculturalSource.id,
            label: agriculturalSource.name,
            agriculturalMachinery: agriculturalSource,
          }
        : null,
    );
    setSelectedTariff(
      tariffGrouped?.tariff
        ? {
            id: tariffGrouped.tariff.id,
            label: `Норма: ${tariffGrouped.tariff.norm_value ?? "-"} | ${tariffGrouped.tariff.comment || ""}`,
            tariff: tariffGrouped.tariff,
          }
        : null,
    );
  }, [
    agriculturalSource,
    details,
    editablePart,
    fieldGrouped,
    initialForm,
    isTransportOutput,
    materialItems,
    tariffGrouped,
    techniqueSource,
    transferGrouped,
    visible,
  ]);

  useEffect(() => {
    if (!selectedMaterial) {
      setMaterialQuantity("");
      return;
    }

    setMaterialQuantity(asInput(selectedMaterial.value));
  }, [selectedMaterial]);

  const setField = (key: keyof FormState, value: string | boolean) => {
    setForm((previous) => ({ ...previous, [key]: value }));
  };
  const partHasUnsavedChanges = useMemo(() => {
    const formChanged = (Object.keys(initialForm) as (keyof FormState)[]).some(
      (key) => form[key] !== initialForm[key],
    );
    const initialFieldId =
      !isTransportOutput && fieldGrouped?.task_field_id
        ? fieldGrouped.task_field_id
        : null;

    return (
      formChanged ||
      !areSameIds(selectedShiftType?.id, details?.shiftType ?? 1) ||
      !areSameIds(selectedField?.id, initialFieldId) ||
      !areSameIds(getTechniqueId(selectedTechnique), techniqueSource?.id) ||
      !areSameIds(selectedAgriMachine?.id, agriculturalSource?.id) ||
      !areSameIds(selectedTariff?.id, tariffGrouped?.tariff?.id)
    );
  }, [
    agriculturalSource?.id,
    details?.shiftType,
    fieldGrouped?.task_field_id,
    form,
    initialForm,
    isTransportOutput,
    selectedAgriMachine?.id,
    selectedField?.id,
    selectedShiftType?.id,
    selectedTariff?.id,
    selectedTechnique,
    tariffGrouped?.tariff?.id,
    techniqueSource?.id,
  ]);
  const materialHasUnsavedChanges = Boolean(
    selectedMaterial &&
      normalizeQuantity(materialQuantity) !==
        normalizeQuantity(asInput(selectedMaterial.value)),
  );
  const hasUnsavedChanges =
    partHasUnsavedChanges || materialHasUnsavedChanges;

  return {
    activeTab,
    setActiveTab,
    picker,
    setPicker,
    selectedShiftType,
    selectedField,
    selectedTechnique,
    selectedAgriMachine,
    selectedTariff,
    selectedMaterialIndex,
    setSelectedMaterialIndex,
    materialQuantity,
    setMaterialQuantity,
    form,
    setField,
    context,
    fieldGrouped,
    tariffGrouped,
    transferGrouped,
    materialPartIds,
    editablePartIds,
    originalStartAt,
    originalEndedAt,
    materialItems,
    selectedMaterial,
    isHarvesting,
    isTransportTask,
    isTransportation,
    isTransportOutput,
    workPlaces,
    agriOptions,
    pickerConfig,
    hasUnsavedChanges,
  };
};
