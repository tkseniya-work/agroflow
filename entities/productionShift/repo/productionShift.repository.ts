import { desc, eq, inArray } from "drizzle-orm";

import { db } from "../../../db/client";
import {
  closeProductionShifts,
  openProductionShifts,
  processedShiftData,
  settingsProductionShifts,
} from "../../../db/schema";
import {
  mapDbToShiftData,
  mapShiftDataToDb,
} from "../mappers/productionShift.mapper";
import type { ShiftData } from "../model/shift.types";

type OpenProductionShiftInsert = typeof openProductionShifts.$inferInsert;
type CloseProductionShiftInsert = typeof closeProductionShifts.$inferInsert;
type SettingsProductionShiftInsert =
  typeof settingsProductionShifts.$inferInsert;

export const processedShiftRepository = {
  async findAll() {
    const rows = await db
      .select()
      .from(processedShiftData)
      .orderBy(desc(processedShiftData.openAt));

    return rows.map(mapDbToShiftData);
  },

  async insertMany(shiftsData: ShiftData[]) {
    const rows = shiftsData.map(mapShiftDataToDb);

    await db.insert(processedShiftData).values(rows);

    return shiftsData;
  },

  deleteMany(_shiftsData: ShiftData[]) {
    return processedShiftRepository.clear();
  },

  clear() {
    return db.delete(processedShiftData).execute();
  },
};

export const settingsProductionShiftRepository = {
  async findFirst() {
    const rows = await db.select().from(settingsProductionShifts).limit(1);
    return rows[0] || null;
  },

  async create(settingsData: SettingsProductionShiftInsert) {
    const [result] = await db.transaction(async (tx) => {
      await tx.delete(settingsProductionShifts);

      return tx.insert(settingsProductionShifts).values(settingsData).returning();
    });

    return result;
  },

  clear() {
    return db.delete(settingsProductionShifts).execute();
  },
};

export const openProductionShiftRepository = {
  findAll() {
    return db
      .select()
      .from(openProductionShifts)
      .orderBy(desc(openProductionShifts.id));
  },

  async create(openShiftData: OpenProductionShiftInsert) {
    const [result] = await db
      .insert(openProductionShifts)
      .values(openShiftData)
      .returning();

    return result;
  },

  updateEndedAt(request: { id: number | string; endedAt: string }) {
    return db
      .update(openProductionShifts)
      .set({ ended_at: request.endedAt })
      .where(eq(openProductionShifts.id, Number(request.id)))
      .execute();
  },

  updateSyncState(request: {
    id: number | string;
    serverShiftId?: string | null;
    serverPartId?: string | null;
    syncStatus?: string | null;
    syncError?: string | null;
  }) {
    return db
      .update(openProductionShifts)
      .set({
        server_shift_id: request.serverShiftId ?? null,
        server_part_id: request.serverPartId ?? null,
        sync_status: request.syncStatus ?? null,
        sync_error: request.syncError ?? null,
      })
      .where(eq(openProductionShifts.id, Number(request.id)))
      .execute();
  },

  deleteByIds(ids: (number | string)[]) {
    const numericIds = ids.map(Number).filter((id) => Number.isFinite(id));

    if (!numericIds.length) return Promise.resolve();

    return db
      .delete(openProductionShifts)
      .where(inArray(openProductionShifts.id, numericIds))
      .execute();
  },

  clear() {
    return db.delete(openProductionShifts).execute();
  },
};

export const closeProductionShiftRepository = {
  findAll() {
    return db
      .select()
      .from(closeProductionShifts)
      .orderBy(desc(closeProductionShifts.id));
  },

  async create(
    closeShiftData: CloseProductionShiftInsert | CloseProductionShiftInsert[],
  ) {
    if (Array.isArray(closeShiftData)) {
      const [result] = await db
        .insert(closeProductionShifts)
        .values(closeShiftData)
        .returning();

      return result;
    }

    const [result] = await db
      .insert(closeProductionShifts)
      .values(closeShiftData)
      .returning();

    return result;
  },

  clear() {
    return db.delete(closeProductionShifts).execute();
  },
};
