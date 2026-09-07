import { eq } from "drizzle-orm";

import { db } from "../../../db/client";
import {
  lastCreatedBys,
  lastModifiedBys,
  productionTasks,
  status,
} from "../../../db/schema";
import type {
  LastCreatedBys,
  LastModifiedBys,
  Status,
} from "../../../db/schema";
import type { ProductionTask } from "../model/productionTask.types";
import type { RepositoryMutationResult } from "../../../shared/lib/repository.types";

export type ProductionTaskRow = {
  productionTask: typeof productionTasks.$inferSelect;
  status: Status | null;
  lastCreatedBy: LastCreatedBys | null;
  lastModifiedBy: LastModifiedBys | null;
};

const mapProductionTaskToDb = (item: ProductionTask) => ({
  id: item.id,
  season_year: item.season_year,
  comment: item.comment,
  date_start: item.date_start,
  calculated_date_end: item.calculated_date_end,
});

export const productionTaskRepository = {
  findAll() {
    return db
      .select()
      .from(productionTasks)
      .leftJoin(status, eq(productionTasks.id, status.productionTaskId))
      .leftJoin(
        lastModifiedBys,
        eq(productionTasks.id, lastModifiedBys.productionTaskId),
      )
      .leftJoin(
        lastCreatedBys,
        eq(productionTasks.id, lastCreatedBys.productionTaskId),
      );
  },

  async insertMany(items: ProductionTask[]) {
    const results: RepositoryMutationResult[] = [];

    await db.transaction(async (tx) => {
      for (const item of items) {
        await tx
          .delete(status)
          .where(eq(status.productionTaskId, item.id));
        await tx
          .delete(lastCreatedBys)
          .where(eq(lastCreatedBys.productionTaskId, item.id));
        await tx
          .delete(lastModifiedBys)
          .where(eq(lastModifiedBys.productionTaskId, item.id));
        await tx
          .delete(productionTasks)
          .where(eq(productionTasks.id, item.id));

        const [taskResult] = await tx
          .insert(productionTasks)
          .values(mapProductionTaskToDb(item))
          .returning({ id: productionTasks.id });

        if (!taskResult) {
          throw new Error("Failed to insert productionTask");
        }

        const productionTaskId = taskResult.id;

        if (item.status) {
          await tx.insert(status).values({
            id: String(item.status.id),
            description: item.status.description,
            productionTaskId,
          });
        }

        if (item.created_by) {
          await tx.insert(lastCreatedBys).values({
            ...item.created_by,
            productionTaskId,
          });
        }

        if (item.last_modified_by) {
          await tx.insert(lastModifiedBys).values({
            ...item.last_modified_by,
            productionTaskId,
          });
        }

        results.push({ productionTaskId, success: true });
      }
    });

    return results;
  },

  async deleteMany(items: ProductionTaskRow[]) {
    await db.transaction(async (tx) => {
      for (const item of items) {
        const {
          productionTask,
          status: taskStatus,
          lastCreatedBy,
          lastModifiedBy,
        } = item;

        if (taskStatus) {
          await tx
            .delete(status)
            .where(eq(status.productionTaskId, productionTask.id));
        }

        if (lastCreatedBy) {
          await tx
            .delete(lastCreatedBys)
            .where(eq(lastCreatedBys.productionTaskId, productionTask.id));
        }

        if (lastModifiedBy) {
          await tx
            .delete(lastModifiedBys)
            .where(eq(lastModifiedBys.productionTaskId, productionTask.id));
        }

        await tx
          .delete(productionTasks)
          .where(eq(productionTasks.id, productionTask.id));
      }
    });
  },

  async clear() {
    await db.transaction(async (tx) => {
      await tx.delete(status);
      await tx.delete(lastCreatedBys);
      await tx.delete(lastModifiedBys);
      await tx.delete(productionTasks);
    });
  },
};
