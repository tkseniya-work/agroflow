import { API } from "./endpoints/dictionaries.endpoints";
import type {
  ProductionWorkPlaceDto,
  TechniqueStandardByIdRequest,
  TariffsList,
} from "../../../entities/dictionaries";
import type {
  AgriculturalMachineryInput,
} from "../../../entities/agriculturalMachinery";
import type { TechniqueStandardInput } from "../../../entities/techniqueStandard";
import type { UnitOfMeasure, WorkStandard } from "../../../db/schema";
import { safeGetArray, safeGetData } from "../../../shared/lib/apiUtils";

export const dictionariesApi = {
  loadTechniqueStandards(accessToken: string) {
    return safeGetArray<TechniqueStandardInput>(
      API.techniqueStandard,
      accessToken,
      "Technique standards",
    );
  },

  loadAgriculturalMachinery(accessToken: string) {
    return safeGetArray<AgriculturalMachineryInput>(
      API.agriculturalMachineryStandard,
      accessToken,
      "Agricultural machinery standards",
    );
  },

  loadProductionWorkPlaces(accessToken: string) {
    return safeGetArray<ProductionWorkPlaceDto>(
      API.productionWorkPlaces,
      accessToken,
      "Production work places",
    );
  },

  loadWorkStandards(accessToken: string) {
    return safeGetArray<WorkStandard>(
      API.workStandard,
      accessToken,
      "Work standards",
    );
  },

  loadUnitOfMeasures(accessToken: string) {
    return safeGetArray<UnitOfMeasure>(
      API.unitOfMeasure,
      accessToken,
      "Units of measure",
    );
  },

  loadTariffsList(accessToken: string) {
    return safeGetArray<TariffsList>(
      API.tariffsList,
      accessToken,
      "Tariffs list",
    );
  },

  loadTechniqueStandardById(request: TechniqueStandardByIdRequest) {
    return safeGetData(
      API.techniqueStandardBy.concat(`${request.techniqueId}`),
      request.accessToken,
      "Technique standard by id",
      null,
    );
  },

  loadTechniqueWithAdditionalInfo(accessToken: string) {
    return safeGetArray(
      API.techniqueWithAdditionalInfo,
      accessToken,
      "Techniques with additional info",
    );
  },

  loadCropStandards(accessToken: string) {
    return safeGetArray(API.cropStandardList, accessToken, "Crop standards");
  },

  loadFertilizerStandards(accessToken: string) {
    return safeGetArray(
      API.fertilizerStandardList,
      accessToken,
      "Fertilizer standards",
    );
  },

  loadPesticideStandards(accessToken: string) {
    return safeGetArray(
      API.pesticideStandardList,
      accessToken,
      "Pesticide standards",
    );
  },
};
