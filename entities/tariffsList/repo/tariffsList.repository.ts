import { eq } from "drizzle-orm";

import { db } from "../../../db/client";
import { tariffsList } from "../../../db/schema";
import type { TariffsList } from "../../dictionaries/model/dictionary.interface";
import { mapTariffListToDb } from "../mappers/tariffsList.mapper";
import type { RepositoryMutationResult } from "../../../shared/lib/repository.types";

type TariffsListDeleteItem = {
  id: string | number;
  work_standard_tariff_id?: string | null;
};

export const tariffsListRepository = {
  findAll() {
    return db.select().from(tariffsList);
  },

  async insertMany(items: TariffsList[]) {
    const results: RepositoryMutationResult[] = [];

    await db.transaction(async (tx) => {
      for (const item of items) {
        const [result] = await tx
          .insert(tariffsList)
          .values(mapTariffListToDb(item))
          .onConflictDoUpdate({
            target: tariffsList.work_standard_tariff_id,
            set: mapTariffListToDb(item),
          })
          .returning({ id: tariffsList.id });

        if (!result) {
          throw new Error("Failed to insert workStandardTariff");
        }

        results.push({
          id: result.id,
          work_standard_tariff_id: item.id,
          success: true,
        });
      }
    });

    return results;
  },

  upsertMany(items: TariffsList[]) {
    return tariffsListRepository.insertMany(items);
  },

  async deleteMany(items: TariffsListDeleteItem[]) {
    await db.transaction(async (tx) => {
      for (const item of items) {
        const localId = item.id;
        const serverId = item.work_standard_tariff_id ?? String(item.id);

        if (typeof localId === "string") {
          await tx.delete(tariffsList).where(eq(tariffsList.id, localId));
        } else {
          await tx
            .delete(tariffsList)
            .where(eq(tariffsList.work_standard_tariff_id, serverId));
        }
      }
    });
  },

  clear() {
    return db.delete(tariffsList).execute();
  },
};
