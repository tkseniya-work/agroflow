import Colors from "../../shared/styles/Colors";

export const formatDate = (date?: string | null) => {
  if (!date) return "—";

  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return date;

  const day = String(parsed.getDate()).padStart(2, "0");
  const month = String(parsed.getMonth() + 1).padStart(2, "0");
  const year = parsed.getFullYear();

  return `${day}.${month}.${year}`;
};

export const formatNdvi = (value?: number | string | null) => {
  if (value === null || value === undefined || value === "") return "—";

  const numeric = Number(value);
  if (Number.isNaN(numeric)) return String(value);

  return numeric.toFixed(2);
};

export const getNdviStatus = (value?: number | string | null) => {
  const numeric = Number(value);

  if (
    value === null ||
    value === undefined ||
    value === "" ||
    Number.isNaN(numeric)
  ) {
    return {
      label: "Нет данных",
      tone: "neutral" as const,
    };
  }

  if (numeric < 0.2) {
    return {
      label: "Низкий",
      tone: "danger" as const,
    };
  }

  if (numeric < 0.5) {
    return {
      label: "Средний",
      tone: "warning" as const,
    };
  }

  return {
    label: "Хороший",
    tone: "success" as const,
  };
};

export const getStatusStyles = (
  tone: "neutral" | "danger" | "warning" | "success",
) => {
  switch (tone) {
    case "danger":
      return {
        backgroundColor: "#FDECEC",
        color: "#C62828",
      };
    case "warning":
      return {
        backgroundColor: "#FFF4E5",
        color: "#C77700",
      };
    case "success":
      return {
        backgroundColor: "#EAF7EE",
        color: "#2E7D32",
      };
    default:
      return {
        backgroundColor: "#EEF2F6",
        color: Colors.grey600,
      };
  }
};

export const formatShortDate = (dateString?: string) => {
  if (!dateString) return "—";

  try {
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return "—";

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");

    return `${day}.${month}`;
  } catch {
    return "—";
  }
};

export const getNdviTone = (value?: number | null) => {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return {
      backgroundColor: "rgba(148, 163, 184, 0.12)",
      color: "#475569",
      label: "Нет данных",
      solidColor: "#94A3B8",
    };
  }

  if (value < 0.1) {
    return {
      backgroundColor: "rgba(19, 43, 11, 0.14)",
      color: "#132b0b",
      label: "Очень низкий",
      solidColor: "#132b0b",
    };
  }

  if (value < 0.3) {
    return {
      backgroundColor: "rgba(69, 129, 0, 0.14)",
      color: "#458100",
      label: "Низкий",
      solidColor: "#458100",
    };
  }

  if (value < 0.5) {
    return {
      backgroundColor: "rgba(115, 160, 0, 0.14)",
      color: "#73a000",
      label: "Умеренный",
      solidColor: "#73a000",
    };
  }

  if (value < 0.7) {
    return {
      backgroundColor: "rgba(208, 223, 0, 0.18)",
      color: "#7a8400",
      label: "Хороший",
      solidColor: "#B7C400",
    };
  }

  return {
    backgroundColor: "rgba(253, 254, 111, 0.22)",
    color: "#8b6b00",
    label: "Высокий",
    solidColor: "#D6BC00",
  };
};
