import { dictionariesApi } from "./api/dictionaries.api";
import { agriculturalMachineryRepository } from "../../entities/agriculturalMachinery";
import { productionWorkPlaceRepository } from "../../entities/productionWorkPlace";
import { tariffsListRepository } from "../../entities/tariffsList";
import { techniqueStandardRepository } from "../../entities/techniqueStandard";
import { unitOfMeasureRepository } from "../../entities/unitOfMeasure";
import { workStandardRepository } from "../../entities/workStandard";
import { createDictionarySyncService } from "./dictionarySync.service.factory";

export const dictionarySyncService = createDictionarySyncService({
  dictionariesApi,
  techniqueStandardRepository,
  agriculturalMachineryRepository,
  productionWorkPlaceRepository,
  workStandardRepository,
  unitOfMeasureRepository,
  tariffsListRepository,
});
