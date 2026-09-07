import type {
  AgriculturalMachineryModel,
  AgriculturalMachineryStandards,
} from "../../../db/schema";
import type { AgriculturalMachineryRow } from "../repo/agriculturalMachinery.repository";

export type LocalAgriculturalMachinery = AgriculturalMachineryStandards & {
  machinery_model: AgriculturalMachineryModel | null;
  agriculturalMachineryStandard: AgriculturalMachineryStandards;
  agriculturalMachineryModel: AgriculturalMachineryModel | null;
};

export const mapAgriculturalMachineryRowToLocal = (
  row: AgriculturalMachineryRow,
): LocalAgriculturalMachinery => ({
  ...row.agriculturalMachineryStandard,
  machinery_model: row.agriculturalMachineryModel,
  agriculturalMachineryStandard: row.agriculturalMachineryStandard,
  agriculturalMachineryModel: row.agriculturalMachineryModel,
});

export const mapAgriculturalMachineryRowsToLocal = (
  rows: AgriculturalMachineryRow[],
): LocalAgriculturalMachinery[] => rows.map(mapAgriculturalMachineryRowToLocal);
