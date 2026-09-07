import { eq } from "drizzle-orm";

import { db } from "../../../db/client";
import { machineryModels, techniqueStandards } from "../../../db/schema";
import type { MachineryModel, TechniqueStandard } from "../../../db/schema";
import type { RepositoryMutationResult } from "../../../shared/lib/repository.types";

export type TechniqueStandardInput = TechniqueStandard & {
  machinery_model?: MachineryModel | null;
};

export type TechniqueStandardRow = {
  techniqueStandard: TechniqueStandard;
  machineryModel: MachineryModel | null;
};

export const techniqueStandardRepository = {
  findAll() {
    return db
      .select()
      .from(techniqueStandards)
      .leftJoin(
        machineryModels,
        eq(techniqueStandards.id, machineryModels.techniqueStandardId),
      );
  },

  async insertMany(items: TechniqueStandardInput[]) {
    const results: RepositoryMutationResult[] = [];

    await db.transaction(async (tx) => {
      for (const item of items) {
        const { machinery_model, ...techniqueStandard } = item;

        const [techniqueResult] = await tx
          .insert(techniqueStandards)
          .values(techniqueStandard)
          .onConflictDoUpdate({
            target: techniqueStandards.id,
            set: techniqueStandard,
          })
          .returning({ id: techniqueStandards.id });

        if (!techniqueResult) {
          throw new Error("Failed to insert techniqueStandard");
        }

        const techniqueStandardId = techniqueResult.id;

        if (machinery_model) {
          const machineryModel = {
            ...machinery_model,
            techniqueStandardId,
          };

          await tx
            .insert(machineryModels)
            .values(machineryModel)
            .onConflictDoUpdate({
              target: machineryModels.id,
              set: machineryModel,
            });
        }

        results.push({ techniqueStandardId, success: true });
      }
    });

    return results;
  },

  async deleteMany(items: TechniqueStandardRow[]) {
    await db.transaction(async (tx) => {
      for (const item of items) {
        const { techniqueStandard, machineryModel } = item;

        if (machineryModel) {
          await tx
            .delete(machineryModels)
            .where(eq(machineryModels.id, machineryModel.id));
        }

        await tx
          .delete(techniqueStandards)
          .where(eq(techniqueStandards.id, techniqueStandard.id));
      }
    });
  },

  async clear() {
    await db.transaction(async (tx) => {
      await tx.delete(machineryModels);
      await tx.delete(techniqueStandards);
    });
  },
};
