import { useMemo } from "react";
import { useAtomValue } from "jotai";

import type {
  CloseProductionShifts,
  Company,
  Employee,
  OpenProductionShifts,
  Position,
  UnitOfMeasure,
  WorkStandard,
} from "../../db/schema";
import type { TariffsList } from "../../entities/dictionaries";
import type {
  ProductionShiftSettingsDto,
  ShiftData,
} from "../../entities/productionShift";
import {
  mapAgriculturalMachineryRowsToLocal,
  type LocalAgriculturalMachinery,
  loadAgriculturalMachineryAtom,
} from "../../entities/agriculturalMachinery";
import {
  mapProductionTaskRowsToLocal,
  type LocalProductionTask,
} from "../../entities/productionTask/mappers/productionTask.mapper";
import {
  mapProductionWorkPlaceRowsToLocal,
  type LocalProductionWorkPlace,
  loadProductionWorkPlacesAtom,
} from "../../entities/productionWorkPlace";
import {
  mapTechniqueStandardRowsToLocal,
  type LocalTechniqueStandard,
  loadTechniqueStandardAtom,
} from "../../entities/techniqueStandard";

import { loadCompanyAtom, loadEmployyeAtom } from "../../entities/employee/store";
import {
  loadCloseProductionShiftsAtom,
  loadOpenProductionShiftsAtom,
  loadProductionShiftAtom,
  loadSettingsProductionShiftsAtom,
} from "../../entities/productionShift/store";
import { loadProductionTaskAtom } from "../../entities/productionTask/store";
import { loadTariffsListAtom } from "../../entities/tariffsList";
import { loadUnitOfMeasureAtom } from "../../entities/unitOfMeasure";
import { loadWorkStandardAtom } from "../../entities/workStandard";

export type EmployeeInfo = Omit<
  Employee,
  "birthday" | "hired_at" | "date_of_dismissal"
> & {
  birthday: string | number | null;
  hired_at: string | number | null;
  date_of_dismissal: string | number | null;
};

export type EmployeeInfoRow = {
  id: string | null;
  employees: EmployeeInfo;
  position: Position | null;
};

export type CompanyInfoRow = Company & {
  companyId?: string | number | null;
};

export const useEmployeeInfo = (): EmployeeInfoRow | null | undefined => {
  const employeeData = useAtomValue(loadEmployyeAtom);

  return useMemo(() => {
    if (!employeeData?.data) return null;

    return {
      ...employeeData.data,
      id: employeeData.data.employees?.id ?? null,
    };
  }, [employeeData?.data]);
};

export const useCompanyInfo = (): CompanyInfoRow | null | undefined => {
  const companyData = useAtomValue(loadCompanyAtom);

  return companyData?.data;
};

export const useTechniqueStandards = (): LocalTechniqueStandard[] => {
  const techniqueData = useAtomValue(loadTechniqueStandardAtom);

  return useMemo(
    () => mapTechniqueStandardRowsToLocal(techniqueData?.data ?? []),
    [techniqueData?.data],
  );
};

export const useAgriculturalMachinery = (): LocalAgriculturalMachinery[] => {
  const agriculturalMachineryData = useAtomValue(loadAgriculturalMachineryAtom);

  return useMemo(
    () =>
      mapAgriculturalMachineryRowsToLocal(
        agriculturalMachineryData?.data ?? [],
      ),
    [agriculturalMachineryData?.data],
  );
};

export const useProductionWorkPlaces = (): LocalProductionWorkPlace[] => {
  const productionWorkPlacesData = useAtomValue(loadProductionWorkPlacesAtom);

  return useMemo(
    () => mapProductionWorkPlaceRowsToLocal(productionWorkPlacesData?.data ?? []),
    [productionWorkPlacesData?.data],
  );
};

export const useWorkStandards = (): WorkStandard[] => {
  const workStandardData = useAtomValue(loadWorkStandardAtom);

  return workStandardData?.data ?? [];
};

export const useProductionTasks = (): LocalProductionTask[] => {
  const productionTaskData = useAtomValue(loadProductionTaskAtom);

  return useMemo(
    () => mapProductionTaskRowsToLocal(productionTaskData?.data ?? []),
    [productionTaskData?.data],
  );
};

export const useProductionShiftData = (): ShiftData[] => {
  const productionShiftData = useAtomValue(loadProductionShiftAtom);

  return productionShiftData?.data ?? [];
};

export const useShiftSettings = (): ProductionShiftSettingsDto[] => {
  const settingsProductionShiftData = useAtomValue(
    loadSettingsProductionShiftsAtom,
  );

  return settingsProductionShiftData?.data
    ? [settingsProductionShiftData.data]
    : [];
};

export const useOfflineShiftQueue = (): {
  closeProductionShift: CloseProductionShifts[];
  openProductionShift: OpenProductionShifts[];
} => {
  const closeProductionShiftData = useAtomValue(loadCloseProductionShiftsAtom);
  const openProductionShiftData = useAtomValue(loadOpenProductionShiftsAtom);

  return useMemo(
    () => ({
      closeProductionShift: closeProductionShiftData?.data ?? [],
      openProductionShift: openProductionShiftData?.data ?? [],
    }),
    [closeProductionShiftData?.data, openProductionShiftData?.data],
  );
};

export const useUnitOfMeasures = (): UnitOfMeasure[] => {
  const unitOfMeasureData = useAtomValue(loadUnitOfMeasureAtom);

  return unitOfMeasureData?.data ?? [];
};

export const useTariffsList = (): TariffsList[] => {
  const tariffsListData = useAtomValue(loadTariffsListAtom);

  return tariffsListData?.data ?? [];
};

export const useLocalDictionaries = () => {
  const techniqueStandard = useTechniqueStandards();
  const agriculturalMachinery = useAgriculturalMachinery();
  const productionWorkPlaces = useProductionWorkPlaces();
  const workStandard = useWorkStandards();
  const productionTask = useProductionTasks();
  const unitOfMeasure = useUnitOfMeasures();
  const tariffsList = useTariffsList();

  return useMemo(
    () => ({
      techniqueStandard,
      agriculturalMachinery,
      productionWorkPlaces,
      workStandard,
      productionTask,
      unitOfMeasure,
      tariffsList,
    }),
    [
      agriculturalMachinery,
      productionTask,
      productionWorkPlaces,
      tariffsList,
      techniqueStandard,
      unitOfMeasure,
      workStandard,
    ],
  );
};
