import { eq } from "drizzle-orm";

import { db } from "../../../db/client";
import { workStandards } from "../../../db/schema";
import type { WorkStandard } from "../../../db/schema";

export const workStandardRepository = {
  findAll() {
    return db.select().from(workStandards);
  },

  async insertMany(items: WorkStandard[]) {
    const results: { id: string | null }[] = [];

    await db.transaction(async (tx) => {
      for (const item of items) {
        const [result] = await tx
          .insert(workStandards)
          .values(item)
          .onConflictDoUpdate({
            target: workStandards.id,
            set: item,
          })
          .returning({ id: workStandards.id });

        if (result) {
          results.push(result);
        }
      }
    });

    return results;
  },

  async deleteMany(items: WorkStandard[]) {
    await db.transaction(async (tx) => {
      for (const item of items) {
        await tx.delete(workStandards).where(eq(workStandards.id, item.id));
      }
    });
  },

  clear() {
    return db.delete(workStandards).execute();
  },
};
