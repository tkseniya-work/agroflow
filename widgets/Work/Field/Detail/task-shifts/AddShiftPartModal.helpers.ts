import {
  buildShiftDateTime,
  isShiftDateInputValid,
  isShiftTimeInputValid,
} from "../../../shared/shiftPartDateTimeUtils";

export type AddShiftMode = "online" | "fact";

export type AddShiftPartFormState = {
  date: string;
  startAt: string;
  endedDate: string;
  endedAt: string;
  outputValue: string;
  factArea: string;
  forceLoadTrack: boolean;
};

type BuildPayloadParams = {
  currentTaskId: string;
  form: AddShiftPartFormState;
  isFact: boolean;
  employeeId?: string | null;
  shiftTypeId?: string | number | null;
  techniqueId?: string | null;
  agriculturalMachineryId?: string | null;
  tariffId?: string | null;
  fieldId?: string | null;
};

type ValidateParams = {
  accessToken: string | null;
  form: AddShiftPartFormState;
  isFact: boolean;
  hasEmployee: boolean;
  hasShiftType: boolean;
  hasTechnique: boolean;
  hasTariff: boolean;
};

export const getTechniqueModelId = (techniqueOption: any) =>
  techniqueOption?.technique?.technique?.machinery_model?.id ??
  techniqueOption?.technique?.machinery_model?.id;

export const buildAddShiftPartPayload = ({
  currentTaskId,
  form,
  isFact,
  employeeId,
  shiftTypeId,
  techniqueId,
  agriculturalMachineryId,
  tariffId,
  fieldId,
}: BuildPayloadParams): Record<string, any> => {
  const startDt = buildShiftDateTime(form.date, form.startAt);
  const endDt =
    isFact && form.endedAt
      ? buildShiftDateTime(form.endedDate || form.date, form.endedAt)
      : null;
  const startAtIso = startDt?.toISOString() ?? null;

  return {
    id: null,
    production_task_id: currentTaskId,
    date: form.date,
    start_at: startAtIso,
    ended_at: isFact && endDt ? endDt.toISOString() : startAtIso,
    output_value: form.outputValue === "" ? null : Number(form.outputValue),
    fact_area: form.factArea === "" ? null : Number(form.factArea),
    tariff_id: tariffId ?? null,
    task_field_id: fieldId ?? null,
    work_place_id: techniqueId ?? null,
    employee_id: employeeId ?? null,
    type: shiftTypeId ?? null,
    agricultural_machinery_id: agriculturalMachineryId ?? null,
    force_load_track: isFact && form.forceLoadTrack,
    start_at_iso: startAtIso,
  };
};

export const validateAddShiftPart = ({
  accessToken,
  form,
  isFact,
  hasEmployee,
  hasShiftType,
  hasTechnique,
  hasTariff,
}: ValidateParams): string | null => {
  if (!accessToken) return "Нет токена авторизации";
  if (!hasEmployee) return "Выберите сотрудника";
  if (!hasShiftType) return "Выберите смену";
  if (!form.date || !isShiftDateInputValid(form.date)) {
    return "Укажите дату в формате YYYY-MM-DD";
  }
  if (!form.startAt) return "Укажите время начала";
  if (!isShiftTimeInputValid(form.startAt)) {
    return "Укажите время начала в формате HH:mm или HH:mm:ss";
  }

  if (isFact && form.endedAt) {
    if (!form.endedDate || !isShiftDateInputValid(form.endedDate)) {
      return "Укажите дату окончания в формате YYYY-MM-DD";
    }
    if (!isShiftTimeInputValid(form.endedAt)) {
      return "Укажите время окончания в формате HH:mm или HH:mm:ss";
    }

    const startDt = buildShiftDateTime(form.date, form.startAt);
    const endDt = buildShiftDateTime(form.endedDate, form.endedAt);

    if (startDt && endDt && endDt.isBefore(startDt)) {
      return "Окончание не может быть раньше начала";
    }
  }

  if (!hasTechnique) return "Выберите технику";
  if (!form.forceLoadTrack && !hasTariff) return "Выберите тариф";
  return null;
};
