import { useMemo } from "react";
import { useSetAtom } from "jotai";

import { loadAgriculturalMachineryAtom } from "../../entities/agriculturalMachinery";
import { loadCompanyAtom, loadEmployyeAtom } from "../../entities/employee/store";
import {
  loadCloseProductionShiftsAtom,
  loadOpenProductionShiftsAtom,
  loadProductionShiftAtom,
  loadSettingsProductionShiftsAtom,
} from "../../entities/productionShift/store";
import { loadProductionTaskAtom } from "../../entities/productionTask/store";
import { loadProductionWorkPlacesAtom } from "../../entities/productionWorkPlace";
import { loadTariffsListAtom } from "../../entities/tariffsList";
import { loadTechniqueStandardAtom } from "../../entities/techniqueStandard";
import { loadUnitOfMeasureAtom } from "../../entities/unitOfMeasure";
import { loadWorkStandardAtom } from "../../entities/workStandard";

export type LocalDataLoader = {
  key: string;
  load: () => Promise<unknown> | unknown;
};

export const useLocalDataLoaders = (): LocalDataLoader[] => {
  const loadEmployee = useSetAtom(loadEmployyeAtom);
  const loadCompany = useSetAtom(loadCompanyAtom);
  const loadTechnique = useSetAtom(loadTechniqueStandardAtom);
  const loadAgriculturalMachinery = useSetAtom(loadAgriculturalMachineryAtom);
  const loadProductionWorkPlaces = useSetAtom(loadProductionWorkPlacesAtom);
  const loadWorkStandard = useSetAtom(loadWorkStandardAtom);
  const loadProductionTask = useSetAtom(loadProductionTaskAtom);
  const loadProductionShift = useSetAtom(loadProductionShiftAtom);
  const loadSettingsProductionShift = useSetAtom(
    loadSettingsProductionShiftsAtom,
  );
  const loadCloseProductionShift = useSetAtom(loadCloseProductionShiftsAtom);
  const loadOpenProductionShift = useSetAtom(loadOpenProductionShiftsAtom);
  const loadUnitOfMeasure = useSetAtom(loadUnitOfMeasureAtom);
  const loadTariffsList = useSetAtom(loadTariffsListAtom);

  return useMemo(
    () => [
      { key: "employee", load: loadEmployee },
      { key: "company", load: loadCompany },
      { key: "technique", load: loadTechnique },
      { key: "agriculturalMachinery", load: loadAgriculturalMachinery },
      { key: "productionWorkPlaces", load: loadProductionWorkPlaces },
      { key: "workStandard", load: loadWorkStandard },
      { key: "productionTask", load: loadProductionTask },
      { key: "productionShift", load: loadProductionShift },
      { key: "settingsProductionShift", load: loadSettingsProductionShift },
      { key: "closeProductionShift", load: loadCloseProductionShift },
      { key: "openProductionShift", load: loadOpenProductionShift },
      { key: "unitOfMeasure", load: loadUnitOfMeasure },
      { key: "tariffsList", load: loadTariffsList },
    ],
    [
      loadAgriculturalMachinery,
      loadCloseProductionShift,
      loadCompany,
      loadEmployee,
      loadOpenProductionShift,
      loadProductionShift,
      loadProductionTask,
      loadProductionWorkPlaces,
      loadSettingsProductionShift,
      loadTariffsList,
      loadTechnique,
      loadUnitOfMeasure,
      loadWorkStandard,
    ],
  );
};
