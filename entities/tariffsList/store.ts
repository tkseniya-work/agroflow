import type { TariffsList } from "../dictionaries/model/dictionary.interface";
import { tariffsListRepository } from "./repo/tariffsList.repository";
import { createLocalCollectionAtoms } from "../../shared/lib/jotaiUtils";

const tariffsListAtoms = createLocalCollectionAtoms<TariffsList>({
  name: "tariffsList",
  repository: tariffsListRepository,
});

export const tariffsListDataAtom = tariffsListAtoms.dataAtom;
export const tariffsListLoadingAtom = tariffsListAtoms.loadingAtom;
export const tariffsListErrorAtom = tariffsListAtoms.errorAtom;
export const loadTariffsListAtom = tariffsListAtoms.loadAtom;
export const addTariffsListAtom = tariffsListAtoms.addAtom;
export const deleteTariffsListAtom = tariffsListAtoms.deleteAtom;
export const deleteAllTariffsListAtom = tariffsListAtoms.deleteAllAtom;
export const hasTariffsListAtom = tariffsListAtoms.hasItemsAtom;
