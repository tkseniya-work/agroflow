import { productionWorkPlaceRepository } from "./repo/productionWorkPlace.repository";
import { createLocalCollectionAtoms } from "../../shared/lib/jotaiUtils";

const productionWorkPlaceAtoms = createLocalCollectionAtoms({
  name: "productionWorkPlaces",
  repository: productionWorkPlaceRepository,
});

export const productionWorkPlacesDataAtom =
  productionWorkPlaceAtoms.dataAtom;
export const productionWorkPlacesLoadingAtom =
  productionWorkPlaceAtoms.loadingAtom;
export const productionWorkPlacesErrorAtom =
  productionWorkPlaceAtoms.errorAtom;
export const loadProductionWorkPlacesAtom = productionWorkPlaceAtoms.loadAtom;
export const addProductionWorkPlacesAtom = productionWorkPlaceAtoms.addAtom;
export const deleteProductionWorkPlacesAtom =
  productionWorkPlaceAtoms.deleteAtom;
export const deleteAllProductionWorkPlacesAtom =
  productionWorkPlaceAtoms.deleteAllAtom;
export const hasProductionWorkPlacesAtom =
  productionWorkPlaceAtoms.hasItemsAtom;
