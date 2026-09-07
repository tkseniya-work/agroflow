import { dictionariesApi } from "../api/dictionaries.api";

export const useDictionaryActions = () => ({
  loadAgriculturalMachinery: dictionariesApi.loadAgriculturalMachinery,
  loadCropStandards: dictionariesApi.loadCropStandards,
  loadFertilizerStandards: dictionariesApi.loadFertilizerStandards,
  loadPesticideStandards: dictionariesApi.loadPesticideStandards,
  loadProductionWorkPlaces: dictionariesApi.loadProductionWorkPlaces,
  loadTechniqueStandardById: dictionariesApi.loadTechniqueStandardById,
  loadTechniqueStandards: dictionariesApi.loadTechniqueStandards,
  loadTechniqueWithAdditionalInfo: dictionariesApi.loadTechniqueWithAdditionalInfo,
  loadUnitOfMeasures: dictionariesApi.loadUnitOfMeasures,
  loadWorkStandards: dictionariesApi.loadWorkStandards,
});
