import type { useDataSync } from "./index";

export class DataSyncService {
  constructor(
    private syncAllData: ReturnType<typeof useDataSync>["syncAllData"],
    private syncEmployeeData: ReturnType<
      typeof useDataSync
    >["syncEmployeeData"],
    private syncCompanyData: ReturnType<typeof useDataSync>["syncCompanyData"],
    private reloadLocalData: () => Promise<boolean>,
  ) {}

  async syncUserData(
    accessToken: string,
    userId: string,
    companyUuid: string,
  ): Promise<{ success: boolean; warnings: string[] }> {
    const warnings: string[] = [];

    try {
      const startDate = new Date(new Date().getFullYear(), 0, 1).toISOString();
      const endDate = new Date().toISOString();

      await this.syncEmployeeData(accessToken, userId);
      await this.reloadLocalData();

      const [allDataResult, companyResult] = await Promise.allSettled([
        this.syncAllData(accessToken, userId, startDate, endDate),
        this.syncCompanyData(accessToken, companyUuid),
      ]);

      // Даже частичная синхронизация могла сохранить справочники в БД.
      // После перелогина локальное состояние уже очищено, поэтому перечитываем
      // базу независимо от итогового статуса остальных запросов.
      await this.reloadLocalData();

      if (
        allDataResult.status !== "fulfilled" ||
        !allDataResult.value
      ) {
        warnings.push("Основная синхронизация не завершена.");
      }

      if (
        companyResult.status === "rejected"
      ) {
        warnings.push("Синхронизация данных компании не удалась.");
      }

      return {
        success: warnings.length === 0,
        warnings,
      };
    } catch (error) {
      console.error("Data sync error:", error);
      warnings.push("Ошибка при синхронизации данных.");
      return { success: false, warnings };
    }
  }
}
