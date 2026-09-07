import { productionShiftApi } from "../api/productionShift.api";
import {
  processedShiftRepository,
  settingsProductionShiftRepository,
} from "../repo/productionShift.repository";
import type { ProductionShiftRequest } from "../model/productionShift.interface";
import type { ShiftData } from "../model/shift.types";

export const productionShiftSyncService = {
  loadByDate(request: ProductionShiftRequest) {
    return productionShiftApi.loadByEmployee(request);
  },

  async saveProcessedShifts(shiftsData: ShiftData[]) {
    if (!Array.isArray(shiftsData) || shiftsData.length === 0) return [];

    return processedShiftRepository.insertMany(shiftsData);
  },

  async syncSettings(accessToken: string) {
    const settings = await productionShiftApi.loadSettings(accessToken);

    if (!settings) return null;

    return settingsProductionShiftRepository.create(settings);
  },
};
