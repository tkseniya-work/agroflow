import type { ShiftData } from "../../../entities/productionShift";

export interface DataSyncService {
  syncAllData: (accessToken: string, userId: string, startDate: string, endDate: string) => Promise<boolean>;
  smartSyncAllDictionaries: (accessToken: string | null) => Promise<boolean>;
  smartSyncAllData: (accessToken: string, userId: string, startDate: string, endDate: string) => Promise<boolean>;
  syncEmployeeData: (accessToken: string, userId: string) => Promise<unknown>;
  syncCompanyData: (accessToken: string, companyUuid: string) => Promise<unknown>;
  syncTechniqueData: (accessToken: string) => Promise<unknown>;
  syncAgriculturalMachineryData: (accessToken: string) => Promise<unknown>;
  syncProductionWorkPlacesData: (accessToken: string) => Promise<unknown>;
  syncWorkStandardData: (accessToken: string) => Promise<unknown>;
  syncProductionTaskData: (accessToken: string, year: string) => Promise<unknown>;
  syncUnitOfMeasureData: (accessToken: string) => Promise<unknown>;
  syncProductionShiftData: (serverData: ShiftData[]) => Promise<unknown>;
  syncSettingsProductionShiftData: (accessToken: string) => Promise<unknown>;
  syncTariffsList: (accessToken: string) => Promise<unknown>;

  clearAllData: () => Promise<boolean>;
  clearOfflineShiftQueue: () => Promise<void>;
  clearEmployeeData: () => Promise<unknown>;
  clearCompanyData: () => Promise<unknown>;
  clearTechniqueData: () => Promise<unknown>;
  clearAgriculturalMachineryData: () => Promise<unknown>;
  clearProductionWorkPlacesData: () => Promise<unknown>;
  clearWorkStandardData: () => Promise<unknown>;
  clearProductionTaskData: () => Promise<unknown>;
  clearUnitOfMeasureData: () => Promise<unknown>;
  clearProductionShiftData: (shift: ShiftData[]) => Promise<unknown>;
  clearAllProductionShiftData: () => Promise<unknown>;
  clearSettingsProductionShiftData: () => Promise<unknown>;
  clearTariffsListData: () => Promise<unknown>;

  isSyncing: boolean;
  syncProgress: number;
  lastSyncDate: Date | null;
  error: string | null;
  syncStatus: "idle" | "syncing" | "success" | "error";
}

export type SyncStatus = "idle" | "syncing" | "success" | "error";

export interface SyncState {
  isSyncing: boolean;
  syncProgress: number;
  lastSyncDate: Date | null;
  error: string | null;
  syncStatus: SyncStatus;
}

export interface SyncConfig {
  entities: readonly {
    key: SyncEntityKey;
    name: string;
  }[];
}

export type SyncEntityKey = 
  | 'employee'
  | 'technique'
  | 'agriculturalMachinery'
  | 'productionWorkPlaces'
  | 'workStandard'
  | 'productionTask'
  | 'unitOfMeasure'
  | 'productionShift'
  | 'tariffsList';
