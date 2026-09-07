import { eq } from "drizzle-orm";

import { db } from "../../../db/client";
import {
  agriculturalMachineryModels,
  agriculturalMachineryStandards,
} from "../../../db/schema";
import type {
  AgriculturalMachineryModel,
  AgriculturalMachineryStandards,
} from "../../../db/schema";
import type { RepositoryMutationResult } from "../../../shared/lib/repository.types";

export type AgriculturalMachineryInput = AgriculturalMachineryStandards & {
  machinery_model?: AgriculturalMachineryModel | null;
};

export type AgriculturalMachineryRow = {
  agriculturalMachineryStandard: AgriculturalMachineryStandards;
  agriculturalMachineryModel: AgriculturalMachineryModel | null;
};

export const agriculturalMachineryRepository = {
  findAll() {
    return db
      .select()
      .from(agriculturalMachineryStandards)
      .leftJoin(
        agriculturalMachineryModels,
        eq(
          agriculturalMachineryStandards.id,
          agriculturalMachineryModels.agriculturalMachineryId,
        ),
      );
  },

  async insertMany(items: AgriculturalMachineryInput[]) {
    const results: RepositoryMutationResult[] = [];

    await db.transaction(async (tx) => {
      for (const item of items) {
        const { machinery_model, ...agriculturalMachineryStandard } = item;

        const [machineryResult] = await tx
          .insert(agriculturalMachineryStandards)
          .values(agriculturalMachineryStandard)
          .onConflictDoUpdate({
            target: agriculturalMachineryStandards.id,
            set: agriculturalMachineryStandard,
          })
          .returning({ id: agriculturalMachineryStandards.id });

        if (!machineryResult) {
          throw new Error("Failed to insert agriculturalMachinery");
        }

        const agriculturalMachineryId = machineryResult.id;

        if (machinery_model) {
          const agriculturalMachineryModel = {
            ...machinery_model,
            agriculturalMachineryId,
          };

          await tx
            .insert(agriculturalMachineryModels)
            .values(agriculturalMachineryModel)
            .onConflictDoUpdate({
              target: agriculturalMachineryModels.id,
              set: agriculturalMachineryModel,
            });
        }

        results.push({ agriculturalMachineryId, success: true });
      }
    });

    return results;
  },

  async deleteMany(items: AgriculturalMachineryRow[]) {
    await db.transaction(async (tx) => {
      for (const item of items) {
        const { agriculturalMachineryStandard, agriculturalMachineryModel } =
          item;

        if (agriculturalMachineryModel) {
          await tx
            .delete(agriculturalMachineryModels)
            .where(
              eq(
                agriculturalMachineryModels.agriculturalMachineryId,
                agriculturalMachineryStandard.id,
              ),
            );
        }

        await tx
          .delete(agriculturalMachineryStandards)
          .where(
            eq(
              agriculturalMachineryStandards.id,
              agriculturalMachineryStandard.id,
            ),
          );
      }
    });
  },

  async clear() {
    await db.transaction(async (tx) => {
      await tx.delete(agriculturalMachineryModels);
      await tx.delete(agriculturalMachineryStandards);
    });
  },
};
