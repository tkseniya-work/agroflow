import { UserRole } from "./tabsConfig";

export interface AssistantAccessConfig {
  roles: UserRole[];
}

export const ASSISTANT_ACCESS_CONFIG: Record<string, AssistantAccessConfig> = {
  "Информационный бот": {
    roles: ["erp-worker", null, "admin", "erp-admin", "checkman"],
  },

  "Агро бот": {
    roles: ["admin", "erp-admin", "checkman"],
  },

  "Финансовый бот": {
    roles: ["admin", "erp-admin", "checkman"],
  },
};
