import type { MachineryModel, TechniqueStandard } from "../../../db/schema";
import type { TechniqueStandardRow } from "../repo/techniqueStandard.repository";

export type LocalTechniqueStandard = TechniqueStandard & {
  machinery_model: MachineryModel | null;
  techniqueStandard: TechniqueStandard;
  machineryModel: MachineryModel | null;
};

export const mapTechniqueStandardRowToLocal = (
  row: TechniqueStandardRow,
): LocalTechniqueStandard => ({
  ...row.techniqueStandard,
  machinery_model: row.machineryModel,
  techniqueStandard: row.techniqueStandard,
  machineryModel: row.machineryModel,
});

export const mapTechniqueStandardRowsToLocal = (
  rows: TechniqueStandardRow[],
): LocalTechniqueStandard[] => rows.map(mapTechniqueStandardRowToLocal);
