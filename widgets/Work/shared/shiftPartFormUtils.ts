import type { PickerOption } from "../../AppSelector/AppPickerModal";
import { getEmployeeAvatarUrl } from "../components/EmployeeAvatar";

export {
  buildShiftDateTime,
  getDefaultShiftEndDate,
  isShiftDateInputValid,
  isShiftTimeInputValid,
  normalizeShiftTime,
} from "./shiftPartDateTimeUtils";

type ShiftLabels = {
  first: string;
  second: string;
};

export const getShiftEmployeeFullName = (employee: any) =>
  [employee?.surname, employee?.firstname, employee?.middlename]
    .filter(Boolean)
    .join(" ") ||
  employee?.email ||
  "Без имени";

export const getShiftEmployeeShortName = (employee: any) => {
  const surname = employee?.surname?.trim?.() || "";
  const firstname = employee?.firstname?.trim?.() || "";
  const middlename = employee?.middlename?.trim?.() || "";
  const shortName = [
    surname,
    firstname ? `${firstname.charAt(0)}.` : "",
    middlename ? `${middlename.charAt(0)}.` : "",
  ]
    .filter(Boolean)
    .join(" ")
    .trim();

  return shortName || employee?.email || "Без имени";
};

export const getAgriculturalMachineryModelId = (option: any) =>
  option?.agriculturalMachinery?.machinery_model?.id;

export const buildShiftTypes = (settings: any, labels: ShiftLabels) => [
  {
    id: 1,
    label: labels.first,
    start_at: settings?.first_shift_start ?? "07:00:00",
    end_at: settings?.first_shift_end ?? "",
    icon: "sunny-outline" as const,
  },
  {
    id: 2,
    label: labels.second,
    start_at: settings?.second_shift_start ?? "19:00:00",
    end_at: settings?.second_shift_end ?? "",
    icon: "moon-outline" as const,
  },
];

export const buildEmployeePickerOptions = (
  employees: any[],
): PickerOption<any>[] =>
  [...employees]
    .sort((a, b) =>
      getShiftEmployeeFullName(a).localeCompare(
        getShiftEmployeeFullName(b),
        "ru",
      ),
    )
    .map((employee) => ({
      id: employee.id,
      title: getShiftEmployeeShortName(employee),
      subtitle: employee.position?.name || "Должность не указана",
      badgeText: employee.status === "active" ? "активен" : null,
      imageUrl: getEmployeeAvatarUrl(employee),
      showAvatar: true,
      raw: employee,
    }));

export const buildTariffPickerOptions = (
  tariffs: any[],
): PickerOption<any>[] =>
  tariffs.map((tariff) => ({
    id: tariff.id,
    title: `Норма: ${tariff?.norm_value ?? "-"}`,
    subtitle: tariff?.comment || tariff?.unit_code,
    raw: {
      id: tariff.id,
      label: `Норма: ${tariff?.norm_value ?? "-"} | ${tariff?.comment || ""}`,
      tariff,
    },
  }));
