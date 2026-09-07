import { atom } from "jotai";
import {
  processedShiftRepository,
  settingsProductionShiftRepository,
} from "./repo/productionShift.repository";
import {
  createLocalCollectionAtoms,
  createLocalQueueAtoms,
  createLocalRecordAtoms,
} from "../../shared/lib/jotaiUtils";
import {
  CloseProductionShiftQueuePayload,
  OpenProductionShiftQueueInput,
  productionShiftQueueService,
} from "./queue/productionShiftQueue.service";
import type {
  CloseProductionShifts,
  OpenProductionShifts,
  SettingsProductionShift,
} from "../../db/schema";
import type { ShiftData } from "./model/shift.types";

const productionShiftAtoms = createLocalCollectionAtoms<
  ShiftData,
  ShiftData[],
  ShiftData[]
>({
  name: "processed shift data",
  repository: processedShiftRepository,
  onEmptyAdd: () => [],
});

export const productionShiftsDataAtom = productionShiftAtoms.dataAtom;
export const productionShiftsLoadingAtom = productionShiftAtoms.loadingAtom;
export const productionShiftsErrorAtom = productionShiftAtoms.errorAtom;

const settingsProductionShiftAtoms =
  createLocalRecordAtoms<SettingsProductionShift>({
    name: "production shifts settings",
    repository: settingsProductionShiftRepository,
  });

export const settingsProductionShiftsDataAtom =
  settingsProductionShiftAtoms.dataAtom;
export const settingsProductionShiftsLoadingAtom =
  settingsProductionShiftAtoms.loadingAtom;
export const settingsProductionShiftsErrorAtom =
  settingsProductionShiftAtoms.errorAtom;

const openProductionShiftAtoms = createLocalQueueAtoms<
  OpenProductionShifts,
  OpenProductionShiftQueueInput,
  unknown
>({
  name: "open production shifts",
  actions: {
    load: productionShiftQueueService.loadOpenShifts,
    add: productionShiftQueueService.addOpenShift,
    clear: productionShiftQueueService.clearOpenShifts,
  },
});

export const openProductionShiftsDataAtom = openProductionShiftAtoms.dataAtom;
export const openProductionShiftsLoadingAtom =
  openProductionShiftAtoms.loadingAtom;
export const openProductionShiftsErrorAtom = openProductionShiftAtoms.errorAtom;

const closeProductionShiftAtoms = createLocalQueueAtoms<
  CloseProductionShifts,
  CloseProductionShiftQueuePayload,
  unknown
>({
  name: "close production shifts",
  actions: {
    load: productionShiftQueueService.loadCloseShifts,
    add: productionShiftQueueService.addCloseShift,
    clear: productionShiftQueueService.clearCloseShifts,
  },
});

export const closeProductionShiftsDataAtom =
  closeProductionShiftAtoms.dataAtom;
export const closeProductionShiftsLoadingAtom =
  closeProductionShiftAtoms.loadingAtom;
export const closeProductionShiftsErrorAtom =
  closeProductionShiftAtoms.errorAtom;

export const loadProductionShiftAtom = productionShiftAtoms.loadAtom;
export const addProductionShiftAtom = productionShiftAtoms.addAtom;
export const deleteAllproductionShiftsAtom = productionShiftAtoms.deleteAllAtom;
export const deleteAllProductionShiftsAtom = productionShiftAtoms.deleteAllAtom;

export const loadSettingsProductionShiftsAtom =
  settingsProductionShiftAtoms.loadAtom;
export const addSettingsProductionShiftsAtom =
  settingsProductionShiftAtoms.addAtom;
export const deleteAllSettingsProductionShiftAtom =
  settingsProductionShiftAtoms.deleteAtom;

export const loadOpenProductionShiftsAtom = openProductionShiftAtoms.loadAtom;
export const addOpenProductionShiftAtom = openProductionShiftAtoms.addAtom;

export const updateOpenProductionShiftEndedAtAtom = atom(
  null,
  async (get, set, request: { id: number | string; endedAt: string }) => {
    set(openProductionShiftsLoadingAtom, true);
    set(openProductionShiftsErrorAtom, null);

    try {
      const openShiftsData =
        await productionShiftQueueService.updateOpenShiftEndedAt(request);
      set(openProductionShiftsDataAtom, openShiftsData);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to update open production shift";
      set(openProductionShiftsErrorAtom, errorMessage);
      console.error("Error updating open production shift:", error);
      throw error;
    } finally {
      set(openProductionShiftsLoadingAtom, false);
    }
  },
);

export const updateOpenProductionShiftSyncStateAtom = atom(
  null,
  async (
    get,
    set,
    request: {
      id: number | string;
      serverShiftId?: string | null;
      serverPartId?: string | null;
      syncStatus?: string | null;
      syncError?: string | null;
    },
  ) => {
    set(openProductionShiftsLoadingAtom, true);
    set(openProductionShiftsErrorAtom, null);

    try {
      const openShiftsData =
        await productionShiftQueueService.updateOpenShiftSyncState(request);
      set(openProductionShiftsDataAtom, openShiftsData);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to update open production shift sync state";
      set(openProductionShiftsErrorAtom, errorMessage);
      console.error("Error updating open production shift sync state:", error);
      throw error;
    } finally {
      set(openProductionShiftsLoadingAtom, false);
    }
  },
);

export const deleteOpenProductionShiftsByIdsAtom = atom(
  null,
  async (get, set, ids: (number | string)[]) => {
    if (!ids.length) return;

    set(openProductionShiftsLoadingAtom, true);
    set(openProductionShiftsErrorAtom, null);

    try {
      const openShiftsData =
        await productionShiftQueueService.deleteOpenShiftsByIds(ids);

      if (openShiftsData) {
        set(openProductionShiftsDataAtom, openShiftsData);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to delete open production shifts by ids";
      set(openProductionShiftsErrorAtom, errorMessage);
      console.error("Error deleting open production shifts by ids:", error);
      throw error;
    } finally {
      set(openProductionShiftsLoadingAtom, false);
    }
  },
);

export const deleteProductionShiftAtom = atom(
  null,
  async (_get, set, _productionShift: ShiftData | ShiftData[]) =>
    set(productionShiftAtoms.deleteAllAtom),
);

export const deleteAllOpenProductionShiftAtom =
  openProductionShiftAtoms.clearAtom;

export const loadCloseProductionShiftsAtom = closeProductionShiftAtoms.loadAtom;
export const addCloseProductionShiftAtom = closeProductionShiftAtoms.addAtom;
export const deleteAllCloseProductionShiftAtom =
  closeProductionShiftAtoms.clearAtom;

export const hasProductionShiftsAtom = productionShiftAtoms.hasItemsAtom;

export const hasOpenProductionShiftsAtom = openProductionShiftAtoms.hasItemsAtom;
export const hasCloseProductionShiftsAtom =
  closeProductionShiftAtoms.hasItemsAtom;

export const hasSettingsProductionShiftsAtom = atom(
  (get) => get(settingsProductionShiftsDataAtom) !== null,
);
