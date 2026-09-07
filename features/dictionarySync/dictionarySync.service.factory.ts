import type { UnitOfMeasure, WorkStandard } from "../../db/schema";
import type {
  ProductionWorkPlaceDto,
  TariffsList,
} from "../../entities/dictionaries";
import type { AgriculturalMachineryInput } from "../../entities/agriculturalMachinery";
import type { TechniqueStandardInput } from "../../entities/techniqueStandard";

type DictionaryApi = {
  loadTechniqueStandards: (
    accessToken: string,
  ) => Promise<TechniqueStandardInput[]>;
  loadAgriculturalMachinery: (
    accessToken: string,
  ) => Promise<AgriculturalMachineryInput[]>;
  loadProductionWorkPlaces: (
    accessToken: string,
  ) => Promise<ProductionWorkPlaceDto[]>;
  loadWorkStandards: (accessToken: string) => Promise<WorkStandard[]>;
  loadUnitOfMeasures: (accessToken: string) => Promise<UnitOfMeasure[]>;
  loadTariffsList: (accessToken: string) => Promise<TariffsList[]>;
};

type CollectionRepository<Item> = {
  insertMany: (items: Item[]) => Promise<unknown> | unknown;
};

type DictionarySyncDependencies = {
  dictionariesApi: DictionaryApi;
  techniqueStandardRepository: CollectionRepository<TechniqueStandardInput>;
  agriculturalMachineryRepository: CollectionRepository<AgriculturalMachineryInput>;
  productionWorkPlaceRepository: CollectionRepository<ProductionWorkPlaceDto>;
  workStandardRepository: CollectionRepository<WorkStandard>;
  unitOfMeasureRepository: CollectionRepository<UnitOfMeasure>;
  tariffsListRepository: CollectionRepository<TariffsList>;
};

const hasItems = <T>(items: T[]): items is [T, ...T[]] => items.length > 0;

export const createDictionarySyncService = ({
  dictionariesApi,
  techniqueStandardRepository,
  agriculturalMachineryRepository,
  productionWorkPlaceRepository,
  workStandardRepository,
  unitOfMeasureRepository,
  tariffsListRepository,
}: DictionarySyncDependencies) => ({
  async syncTechniqueStandards(accessToken: string) {
    const serverData = await dictionariesApi.loadTechniqueStandards(accessToken);

    if (!hasItems(serverData)) return [];

    return techniqueStandardRepository.insertMany(serverData);
  },

  async syncAgriculturalMachinery(accessToken: string) {
    const serverData =
      await dictionariesApi.loadAgriculturalMachinery(accessToken);

    if (!hasItems(serverData)) return [];

    return agriculturalMachineryRepository.insertMany(serverData);
  },

  async syncProductionWorkPlaces(accessToken: string) {
    const serverData =
      await dictionariesApi.loadProductionWorkPlaces(accessToken);

    if (!hasItems(serverData)) return [];

    return productionWorkPlaceRepository.insertMany(serverData);
  },

  async syncWorkStandards(accessToken: string) {
    const serverData = await dictionariesApi.loadWorkStandards(accessToken);

    if (!hasItems(serverData)) return [];

    return workStandardRepository.insertMany(serverData);
  },

  async syncUnitOfMeasures(accessToken: string) {
    const serverData = await dictionariesApi.loadUnitOfMeasures(accessToken);

    if (!hasItems(serverData)) return [];

    return unitOfMeasureRepository.insertMany(serverData);
  },

  async syncTariffsList(accessToken: string) {
    const serverData = await dictionariesApi.loadTariffsList(accessToken);

    if (!hasItems(serverData)) return [];

    return tariffsListRepository.insertMany(serverData);
  },
});
