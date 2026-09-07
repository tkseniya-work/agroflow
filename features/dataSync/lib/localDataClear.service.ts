import {
  companyRepository,
  employeeRepository,
} from "../../../entities/employee/repo/employee.repository";
import { agriculturalMachineryRepository } from "../../../entities/agriculturalMachinery";
import { productionWorkPlaceRepository } from "../../../entities/productionWorkPlace";
import {
  closeProductionShiftRepository,
  openProductionShiftRepository,
  processedShiftRepository,
  settingsProductionShiftRepository,
} from "../../../entities/productionShift/repo/productionShift.repository";
import { productionTaskRepository } from "../../../entities/productionTask/repo/productionTask.repository";
import { tariffsListRepository } from "../../../entities/tariffsList";
import { techniqueStandardRepository } from "../../../entities/techniqueStandard";
import { unitOfMeasureRepository } from "../../../entities/unitOfMeasure";
import { workStandardRepository } from "../../../entities/workStandard";

export const localDataClearService = {
  employee() {
    return employeeRepository.clear();
  },

  company() {
    return companyRepository.clear();
  },

  technique() {
    return techniqueStandardRepository.clear();
  },

  agriculturalMachinery() {
    return agriculturalMachineryRepository.clear();
  },

  productionWorkPlaces() {
    return productionWorkPlaceRepository.clear();
  },

  workStandard() {
    return workStandardRepository.clear();
  },

  productionTask() {
    return productionTaskRepository.clear();
  },

  unitOfMeasure() {
    return unitOfMeasureRepository.clear();
  },

  productionShift() {
    return processedShiftRepository.clear();
  },

  settingsProductionShift() {
    return settingsProductionShiftRepository.clear();
  },

  openProductionShift() {
    return openProductionShiftRepository.clear();
  },

  closeProductionShift() {
    return closeProductionShiftRepository.clear();
  },

  tariffsList() {
    return tariffsListRepository.clear();
  },
};
