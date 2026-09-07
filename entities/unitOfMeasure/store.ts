import type { UnitOfMeasure } from "../../db/schema";
import { unitOfMeasureRepository } from "./repo/unitOfMeasure.repository";
import { createLocalCollectionAtoms } from "../../shared/lib/jotaiUtils";

const unitOfMeasureAtoms = createLocalCollectionAtoms<
  UnitOfMeasure,
  { id: number }[],
  {
    success: true;
    insertedCount: number;
    insertedIds: unknown[];
  }
>({
  name: "unitOfMeasures",
  repository: unitOfMeasureRepository,
  addResult: (insertedMeasures) => ({
    success: true,
    insertedCount: insertedMeasures.length,
    insertedIds: insertedMeasures.map((measure) => measure.id),
  }),
});

export const unitOfMeasuresDataAtom = unitOfMeasureAtoms.dataAtom;
export const unitOfMeasuresLoadingAtom = unitOfMeasureAtoms.loadingAtom;
export const unitOfMeasuresErrorAtom = unitOfMeasureAtoms.errorAtom;
export const loadUnitOfMeasureAtom = unitOfMeasureAtoms.loadAtom;
export const addUnitOfMeasureAtom = unitOfMeasureAtoms.addAtom;
export const deleteUnitOfMeasureAtom = unitOfMeasureAtoms.deleteAtom;
export const deleteAllUnitOfMeasuresAtom = unitOfMeasureAtoms.deleteAllAtom;
export const hasUnitOfMeasuresAtom = unitOfMeasureAtoms.hasItemsAtom;
