import {
  closeProductionShiftRepository,
  openProductionShiftRepository,
} from "../repo/productionShift.repository";
import type {
  closeProductionShifts,
  openProductionShifts,
} from "../../../db/schema";

export type OpenProductionShiftQueueInput =
  typeof openProductionShifts.$inferInsert;

export type CloseProductionShiftQueueInput =
  typeof closeProductionShifts.$inferInsert;

export type CloseProductionShiftQueuePayload =
  | CloseProductionShiftQueueInput
  | CloseProductionShiftQueueInput[];

export const productionShiftQueueService = {
  loadOpenShifts() {
    return openProductionShiftRepository.findAll();
  },

  async addOpenShift(openShiftData: OpenProductionShiftQueueInput) {
    if (!openShiftData) {
      throw new Error("No open shift data provided");
    }

    const result = await openProductionShiftRepository.create(openShiftData);

    if (!result) {
      throw new Error("Failed to add open production shift");
    }

    const items = await openProductionShiftRepository.findAll();

    return { result, items };
  },

  async updateOpenShiftEndedAt(request: { id: number | string; endedAt: string }) {
    await openProductionShiftRepository.updateEndedAt(request);

    return openProductionShiftRepository.findAll();
  },

  async updateOpenShiftSyncState(request: {
    id: number | string;
    serverShiftId?: string | null;
    serverPartId?: string | null;
    syncStatus?: string | null;
    syncError?: string | null;
  }) {
    await openProductionShiftRepository.updateSyncState(request);

    return openProductionShiftRepository.findAll();
  },

  async deleteOpenShiftsByIds(ids: (number | string)[]) {
    const numericIds = ids.map(Number).filter((id) => Number.isFinite(id));

    if (!numericIds.length) return null;

    await openProductionShiftRepository.deleteByIds(numericIds);

    return openProductionShiftRepository.findAll();
  },

  async clearOpenShifts() {
    await openProductionShiftRepository.clear();

    return [];
  },

  loadCloseShifts() {
    return closeProductionShiftRepository.findAll();
  },

  async addCloseShift(closeShiftData: CloseProductionShiftQueuePayload) {
    if (!closeShiftData) {
      throw new Error("No close shift data provided");
    }

    const result = await closeProductionShiftRepository.create(closeShiftData);

    if (!result) {
      throw new Error("Failed to add close production shift");
    }

    const items = await closeProductionShiftRepository.findAll();

    return { result, items };
  },

  async clearCloseShifts() {
    await closeProductionShiftRepository.clear();

    return [];
  },
};
