import { agriculturalMachineryRepository } from "./repo/agriculturalMachinery.repository";
import { createLocalCollectionAtoms } from "../../shared/lib/jotaiUtils";

const agriculturalMachineryAtoms = createLocalCollectionAtoms({
  name: "agriculturalMachinery",
  repository: agriculturalMachineryRepository,
});

export const agriculturalMachineryDataAtom =
  agriculturalMachineryAtoms.dataAtom;
export const agriculturalMachineryLoadingAtom =
  agriculturalMachineryAtoms.loadingAtom;
export const agriculturalMachineryErrorAtom =
  agriculturalMachineryAtoms.errorAtom;
export const loadAgriculturalMachineryAtom =
  agriculturalMachineryAtoms.loadAtom;
export const addAgriculturalMachineryAtom = agriculturalMachineryAtoms.addAtom;
export const deleteAgriculturalMachineryAtom =
  agriculturalMachineryAtoms.deleteAtom;
export const deleteAllAgriculturalMachineryAtom =
  agriculturalMachineryAtoms.deleteAllAtom;
export const hasAgriculturalMachineryAtom =
  agriculturalMachineryAtoms.hasItemsAtom;
