import { productionWorkPlaceRepository } from "../../entities/productionWorkPlace";
import { settingsProductionShiftRepository } from "../../entities/productionShift/repo/productionShift.repository";

export const dictionaryReadinessService = {
  async hasRequiredScannerDictionaries() {
    const [productionWorkPlaces, settingsProductionShift] = await Promise.all([
      productionWorkPlaceRepository.findAll(),
      settingsProductionShiftRepository.findFirst(),
    ]);

    return (
      productionWorkPlaces.length > 0 &&
      Boolean(settingsProductionShift)
    );
  },
};
