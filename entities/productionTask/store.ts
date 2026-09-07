import { productionTaskRepository } from "./repo/productionTask.repository";
import { createLocalCollectionAtoms } from "../../shared/lib/jotaiUtils";

const productionTaskAtoms = createLocalCollectionAtoms({
  name: "productionTasks",
  repository: productionTaskRepository,
});

export const productionTasksDataAtom = productionTaskAtoms.dataAtom;
export const productionTasksLoadingAtom = productionTaskAtoms.loadingAtom;
export const productionTasksErrorAtom = productionTaskAtoms.errorAtom;
export const loadProductionTaskAtom = productionTaskAtoms.loadAtom;
export const addProductionTaskAtom = productionTaskAtoms.addAtom;
export const deleteProductionTaskAtom = productionTaskAtoms.deleteAtom;
export const deleteAllProductionTasksAtom = productionTaskAtoms.deleteAllAtom;
export const hasProductionTasksAtom = productionTaskAtoms.hasItemsAtom;
