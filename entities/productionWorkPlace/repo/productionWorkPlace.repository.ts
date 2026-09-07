import { eq } from "drizzle-orm";

import { db } from "../../../db/client";
import {
  coordinates,
  productionWorkPlaces,
  workplaceTypes,
  workplaceZones,
} from "../../../db/schema";
import type {
  Coordinates,
  ProductionWorkPlace,
  WorkplaceType,
  WorkplaceZone,
} from "../../../db/schema";
import type { ProductionWorkPlaceDto } from "../../dictionaries/model/dictionary.interface";
import type { RepositoryItemResult } from "../../../shared/lib/repository.types";

export type ProductionWorkPlaceRow = {
  productionWorkPlace: ProductionWorkPlace;
  workplaceType: WorkplaceType | null;
  workplaceZone: WorkplaceZone | null;
  coordinate: Coordinates | null;
};

const insertProductionWorkPlace = (work: ProductionWorkPlaceDto) =>
  db.transaction(async (tx) => {
    const workPlaceData = {
      id: work.id,
      name: work.name,
      comapny_id: work.comapny_id,
      code: work.code,
      is_deleted: Number(work.is_deleted),
      deleted_at: work.deleted_at ? new Date(work.deleted_at).getTime() : null,
    };

    const relatedZones = await tx
      .select()
      .from(workplaceZones)
      .where(eq(workplaceZones.productionWorkPlaceId, work.id));

    for (const zone of relatedZones) {
      await tx
        .delete(coordinates)
        .where(eq(coordinates.workplaceZoneId, zone.id.toString()));
    }

    await tx
      .delete(workplaceZones)
      .where(eq(workplaceZones.productionWorkPlaceId, work.id));
    await tx
      .delete(workplaceTypes)
      .where(eq(workplaceTypes.productionWorkPlaceId, work.id));
    await tx
      .insert(productionWorkPlaces)
      .values(workPlaceData)
      .onConflictDoUpdate({
        target: productionWorkPlaces.id,
        set: workPlaceData,
      });

    const productionWorkPlaceId = work.id;

    if (work.work_place_type) {
      await tx.insert(workplaceTypes).values({
        id: String(work.work_place_type.id),
        description: work.work_place_type.description,
        productionWorkPlaceId,
      });
    }

    if (work.work_place_zone) {
      const zoneInsertResult = await tx
        .insert(workplaceZones)
        .values({ productionWorkPlaceId });

      const workplaceZoneId = Number(zoneInsertResult.lastInsertRowId);

      if (work.work_place_zone.coordinates && !Number.isNaN(workplaceZoneId)) {
        const coordinateValues = {
          type: work.work_place_zone.coordinates.type || "Polygon",
          coordinates: JSON.stringify(
            work.work_place_zone.coordinates.coordinates,
          ),
          workplaceZoneId: workplaceZoneId.toString(),
        } as unknown as typeof coordinates.$inferInsert;

        await tx.insert(coordinates).values(coordinateValues);
      }
    }

    return { productionWorkPlaceId, success: true };
  });

const deleteProductionWorkPlace = (item: ProductionWorkPlaceRow) =>
  db.transaction(async (tx) => {
    const { productionWorkPlace } = item;
    const workPlaceId = productionWorkPlace.id;

    const relatedZones = await tx
      .select()
      .from(workplaceZones)
      .where(eq(workplaceZones.productionWorkPlaceId, workPlaceId));

    for (const zone of relatedZones) {
      await tx
        .delete(coordinates)
        .where(eq(coordinates.workplaceZoneId, zone.id.toString()));
    }

    await tx
      .delete(workplaceZones)
      .where(eq(workplaceZones.productionWorkPlaceId, workPlaceId));

    await tx
      .delete(workplaceTypes)
      .where(eq(workplaceTypes.productionWorkPlaceId, workPlaceId));

    await tx
      .delete(productionWorkPlaces)
      .where(eq(productionWorkPlaces.id, workPlaceId));
  });

export const productionWorkPlaceRepository = {
  findAll() {
    return db
      .select({
        productionWorkPlace: productionWorkPlaces,
        workplaceType: workplaceTypes,
        workplaceZone: workplaceZones,
        coordinate: coordinates,
      })
      .from(productionWorkPlaces)
      .leftJoin(
        workplaceTypes,
        eq(productionWorkPlaces.id, workplaceTypes.productionWorkPlaceId),
      )
      .leftJoin(
        workplaceZones,
        eq(productionWorkPlaces.id, workplaceZones.productionWorkPlaceId),
      )
      .leftJoin(coordinates, eq(workplaceZones.id, coordinates.workplaceZoneId));
  },

  async insertMany(items: ProductionWorkPlaceDto[]) {
    const results: RepositoryItemResult[] = [];

    for (const item of items) {
      try {
        results.push(await insertProductionWorkPlace(item));
      } catch (error) {
        console.error("Error processing work place item:", error);
        results.push({
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    return results;
  },

  async deleteMany(items: ProductionWorkPlaceRow[]) {
    for (const item of items) {
      try {
        await deleteProductionWorkPlace(item);
      } catch (error) {
        console.error("Error deleting work place:", error);
      }
    }
  },

  async clear() {
    await db.transaction(async (tx) => {
      await tx.delete(coordinates);
      await tx.delete(workplaceZones);
      await tx.delete(workplaceTypes);
      await tx.delete(productionWorkPlaces);
    });
  },
};
