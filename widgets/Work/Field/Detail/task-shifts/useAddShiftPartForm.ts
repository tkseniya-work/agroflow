import dayjs from "dayjs";
import { useEffect, useMemo, useState } from "react";

import type { FieldProductionTaskResponse } from "../../../../../entities/productionTask";
import type { PickerOption } from "../../../../AppSelector/AppPickerModal";
import {
  buildEmployeePickerOptions,
  buildShiftTypes,
  buildTariffPickerOptions,
  getDefaultShiftEndDate,
  normalizeShiftTime,
} from "../../../shared/shiftPartFormUtils";
import {
  useShiftPartReferenceData,
  useShiftPartTariffs,
} from "../../../shared/useShiftPartReferenceData";
import {
  AddShiftMode,
  AddShiftPartFormState,
  getTechniqueModelId,
} from "./AddShiftPartModal.helpers";

type TokenLoader = (accessToken: string) => Promise<any>;

type UseAddShiftPartFormParams = {
  visible: boolean;
  mode: AddShiftMode;
  currentTask: FieldProductionTaskResponse;
  accessToken: string | null;
  employees: any[];
  loadWorkPlaces: TokenLoader;
  loadAgriculturalMachinery: TokenLoader;
  loadShiftSettings: TokenLoader;
  searchTariffs: (request: any) => Promise<any>;
};

export type AddShiftPicker =
  | "employee"
  | "shift"
  | "technique"
  | "agri"
  | "tariff"
  | "field";

const createInitialForm = (): AddShiftPartFormState => {
  const today = dayjs().format("YYYY-MM-DD");

  return {
    date: today,
    startAt: "",
    endedDate: today,
    endedAt: "",
    outputValue: "",
    factArea: "",
    forceLoadTrack: false,
  };
};

export const useAddShiftPartForm = ({
  visible,
  mode,
  currentTask,
  accessToken,
  employees,
  loadWorkPlaces,
  loadAgriculturalMachinery,
  loadShiftSettings,
  searchTariffs,
}: UseAddShiftPartFormParams) => {
  const [picker, setPicker] = useState<AddShiftPicker | null>(null);
  const [employee, setEmployee] = useState<any>(null);
  const [shiftType, setShiftType] = useState<any>(null);
  const [technique, setTechnique] = useState<any>(null);
  const [agriMachine, setAgriMachine] = useState<any>(null);
  const [tariff, setTariff] = useState<any>(null);
  const [field, setField] = useState<any>(null);
  const [form, setForm] = useState<AddShiftPartFormState>(createInitialForm);
  const { workPlaces, agriculturalMachinery, shiftSettings } =
    useShiftPartReferenceData({
      visible,
      accessToken,
      loadWorkPlaces,
      loadAgriculturalMachinery,
      loadShiftSettings,
    });
  const { tariffs, setTariffs } = useShiftPartTariffs({
    visible,
    accessToken,
    workStandardId: currentTask?.work_standard?.id,
    technique,
    agriculturalMachinery: agriMachine,
    getTechniqueModelId,
    searchTariffs,
  });
  const isFact = mode === "fact";
  const shiftTypes = useMemo(
    () =>
      buildShiftTypes(shiftSettings, {
        first: "Дневная смена",
        second: "Ночная смена",
      }),
    [shiftSettings],
  );
  const employeeOptions = useMemo<PickerOption<any>[]>(
    () => buildEmployeePickerOptions(employees),
    [employees],
  );
  const techniqueOptions = useMemo<PickerOption<any>[]>(() => {
    const techniques = currentTask?.field_task?.techniques || [];

    return techniques.map((item: any) => {
      const techniqueId = item?.technique?.id;
      const workPlace = workPlaces.find(
        (place: any) =>
          place?.work_place_technique?.technique?.id === techniqueId,
      );

      return {
        id: workPlace?.id || techniqueId,
        title: [item?.technique?.name, item?.technique?.state_number]
          .filter(Boolean)
          .join(" | "),
        subtitle: item?.technique?.machinery_model?.name,
        raw: {
          id: workPlace?.id || techniqueId,
          label: item?.technique?.name,
          technique: item,
          workPlace,
        },
      };
    });
  }, [currentTask?.field_task?.techniques, workPlaces]);
  const agriculturalOptions = useMemo<PickerOption<any>[]>(() => {
    const modelId =
      technique?.technique?.technique?.agriculture_machine?.machinery_model
        ?.id ??
      technique?.technique?.agriculture_machine?.machinery_model?.id;

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
  }, [agriculturalMachinery, technique]);
  const tariffOptions = useMemo<PickerOption<any>[]>(
    () => buildTariffPickerOptions(tariffs),
    [tariffs],
  );
  const fieldOptions = useMemo<PickerOption<any>[]>(
    () =>
      (currentTask?.field_task?.task_fields || []).map((item: any) => ({
        id: item.id,
        title: item?.season_field?.name || "Поле",
        subtitle: item?.season_field?.field?.name,
        raw: {
          id: item.id,
          label: item?.season_field?.name || "Поле",
        },
      })),
    [currentTask?.field_task?.task_fields],
  );
  const pickerConfig = useMemo(() => {
    if (picker === "employee") {
      return {
        title: "Сотрудник",
        data: employeeOptions,
        selectedId: employee?.id,
        onSelect: setEmployee,
      };
    }

    if (picker === "shift") {
      return {
        title: "Смена",
        data: shiftTypes.map((item) => ({
          id: item.id,
          title: item.label,
          subtitle: [item.start_at, item.end_at]
            .filter(Boolean)
            .map(normalizeShiftTime)
            .join(" - "),
          raw: item,
        })),
        selectedId: shiftType?.id,
        onSelect: (item: any) => {
          const startAt = normalizeShiftTime(item.start_at);
          const endedAt = normalizeShiftTime(item.end_at);

          setShiftType(item);
          setForm((previous) => ({
            ...previous,
            startAt,
            endedDate: isFact
              ? getDefaultShiftEndDate(previous.date, startAt, endedAt)
              : previous.endedDate,
            endedAt: isFact ? endedAt : previous.endedAt,
          }));
        },
      };
    }

    if (picker === "technique") {
      return {
        title: "Техника",
        data: techniqueOptions,
        selectedId: technique?.id,
        onSelect: (item: any) => {
          setTechnique(item);
          setAgriMachine(null);
          setTariff(null);
          setTariffs([]);
        },
      };
    }

    if (picker === "agri") {
      return {
        title: "СХМ",
        data: agriculturalOptions,
        selectedId: agriMachine?.id,
        onSelect: (item: any) => {
          setAgriMachine(item);
          setTariff(null);
        },
      };
    }

    if (picker === "tariff") {
      return {
        title: "Тариф",
        data: tariffOptions,
        selectedId: tariff?.id,
        onSelect: setTariff,
      };
    }

    return {
      title: "Поле",
      data: fieldOptions,
      selectedId: field?.id,
      onSelect: setField,
    };
  }, [
    agriMachine?.id,
    agriculturalOptions,
    employee?.id,
    employeeOptions,
    field?.id,
    fieldOptions,
    isFact,
    picker,
    setTariffs,
    shiftType?.id,
    shiftTypes,
    tariff?.id,
    tariffOptions,
    technique?.id,
    techniqueOptions,
  ]);

  useEffect(() => {
    if (!visible) return;

    const defaultShift = shiftTypes[0];
    const today = dayjs().format("YYYY-MM-DD");
    const startAt = normalizeShiftTime(defaultShift?.start_at);
    const endedAt = isFact ? normalizeShiftTime(defaultShift?.end_at) : "";

    setPicker(null);
    setShiftType(defaultShift);
    setEmployee(null);
    setTechnique(null);
    setAgriMachine(null);
    setTariff(null);
    setField(null);
    setTariffs([]);
    setForm({
      date: today,
      startAt,
      endedDate: isFact
        ? getDefaultShiftEndDate(today, startAt, endedAt)
        : today,
      endedAt,
      outputValue: "",
      factArea: "",
      forceLoadTrack: false,
    });
  }, [isFact, setTariffs, shiftTypes, visible]);

  return {
    isFact,
    picker,
    setPicker,
    employee,
    shiftType,
    technique,
    agriMachine,
    tariff,
    field,
    form,
    setForm,
    agriculturalOptions,
    pickerConfig,
  };
};
