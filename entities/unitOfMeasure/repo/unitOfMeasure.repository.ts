import { eq } from "drizzle-orm";

import { db } from "../../../db/client";
import { unitOfMeasures } from "../../../db/schema";
import type { UnitOfMeasure } from "../../../db/schema";

export const unitOfMeasureRepository = {
  findAll() {
    return db.select().from(unitOfMeasures);
  },

  async insertMany(items: UnitOfMeasure[]) {
    const results: { id: number }[] = [];

    await db.transaction(async (tx) => {
      for (const item of items) {
        const [result] = await tx
          .insert(unitOfMeasures)
          .values(item)
          .onConflictDoUpdate({
            target: unitOfMeasures.id,
            set: item,
          })
          .returning({ id: unitOfMeasures.id });

        if (result) {
          results.push(result);
        }
      }
    });

    return results;
  },

  async deleteMany(items: UnitOfMeasure[]) {
    await db.transaction(async (tx) => {
      for (const item of items) {
        await tx.delete(unitOfMeasures).where(eq(unitOfMeasures.id, item.id));
      }
    });
  },

  clear() {
    return db.delete(unitOfMeasures).execute();
  },
};
