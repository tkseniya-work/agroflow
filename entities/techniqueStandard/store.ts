import { techniqueStandardRepository } from "./repo/techniqueStandard.repository";
import { createLocalCollectionAtoms } from "../../shared/lib/jotaiUtils";

const techniqueStandardAtoms = createLocalCollectionAtoms({
  name: "techniqueStandards",
  repository: techniqueStandardRepository,
});

export const techniqueStandardsDataAtom = techniqueStandardAtoms.dataAtom;
export const techniqueStandardsLoadingAtom =
  techniqueStandardAtoms.loadingAtom;
export const techniqueStandardsErrorAtom = techniqueStandardAtoms.errorAtom;
export const loadTechniqueStandardAtom = techniqueStandardAtoms.loadAtom;
export const addTechniqueStandardAtom = techniqueStandardAtoms.addAtom;
export const deleteTechniqueStandardAtom = techniqueStandardAtoms.deleteAtom;
export const deleteAllTechniqueStandardsAtom =
  techniqueStandardAtoms.deleteAllAtom;
export const hasTechniqueStandardsAtom = techniqueStandardAtoms.hasItemsAtom;
