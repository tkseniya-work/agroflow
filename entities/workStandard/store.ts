import type { WorkStandard } from "../../db/schema";
import { workStandardRepository } from "./repo/workStandard.repository";
import { createLocalCollectionAtoms } from "../../shared/lib/jotaiUtils";

const workStandardAtoms = createLocalCollectionAtoms<WorkStandard, {
  id: string | null;
}[], {
  success: true;
  insertedCount: number;
  insertedIds: unknown[];
}>({
  name: "workStandards",
  repository: workStandardRepository,
  addResult: (insertedStandards) => ({
    success: true,
    insertedCount: insertedStandards.length,
    insertedIds: insertedStandards.map((standard) => standard.id),
  }),
});

export const workStandardsDataAtom = workStandardAtoms.dataAtom;
export const workStandardsLoadingAtom = workStandardAtoms.loadingAtom;
export const workStandardsErrorAtom = workStandardAtoms.errorAtom;
export const loadWorkStandardAtom = workStandardAtoms.loadAtom;
export const addWorkStandardAtom = workStandardAtoms.addAtom;
export const deleteWorkStandardAtom = workStandardAtoms.deleteAtom;
export const deleteAllWorkStandardsAtom = workStandardAtoms.deleteAllAtom;
export const hasWorkStandardsAtom = workStandardAtoms.hasItemsAtom;
