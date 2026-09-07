import Colors from "../../../shared/styles/Colors";

const numberFormatter = new Intl.NumberFormat("ru-RU", {
  maximumFractionDigits: 2,
});

export const formatTaskInfoDate = (value?: string | null) => {
  if (!value) return "Не указана";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("ru-RU");
};

export const formatTaskInfoNumber = (
  value?: number | string | null,
  suffix = "",
) => {
  const number = Number(value ?? 0);

  return `${numberFormatter.format(Number.isFinite(number) ? number : 0)}${suffix}`;
};

export const getTaskInfoInitials = (fullname?: string | null) => {
  if (!fullname) return "?";

  return fullname
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
};

export const getTaskInfoStatusPalette = (statusId?: number) => {
  if (statusId === 1) {
    return {
      backgroundColor: "#ECFDF3",
      color: Colors.greenColor,
    };
  }

  if (statusId === 2) {
    return {
      backgroundColor: "#F2F4F7",
      color: Colors.grey600,
    };
  }

  return {
    backgroundColor: "#EFF8FF",
    color: Colors.blue,
  };
};
