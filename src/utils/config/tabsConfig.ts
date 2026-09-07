import { Ionicons } from "@expo/vector-icons";

export type UserRole =
  | "admin"
  | "erp-admin"
  | "erp-worker"
  | "checkman"
  | null;

export interface TabConfig {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  activeIcon: keyof typeof Ionicons.glyphMap;
  roles: UserRole[];
}

// This trimmed sample keeps only the work and map tabs — the original app
// also had a home tab (index) and a profile tab.
export const TAB_CONFIG: Record<string, TabConfig> = {
  work: {
    title: "Смены",
    icon: "time-outline",
    activeIcon: "time",
    roles: ["erp-worker", "admin", "erp-admin", "checkman", null],
  },

  map: {
    title: "Карта",
    icon: "map-outline",
    activeIcon: "map",
    roles: ["erp-worker", "admin", "erp-admin", "checkman", null],
  },
} as const;

export const getTabConfig = (
  tabName: string,
): TabConfig | null => {
  return TAB_CONFIG[tabName] || null;
};

export const getAllTabs = (): string[] => {
  return Object.keys(TAB_CONFIG);
};

export const getTabTitle = (
  tabName: string,
  role: UserRole,
): string => {
  if (tabName === "work") {
    return role === "erp-worker" || role === null || role === "checkman"
      ? "Смены"
      : "Задания";
  }

  return TAB_CONFIG[tabName]?.title ?? "";
};
