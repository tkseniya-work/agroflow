import type {
  LastCreatedBys,
  LastModifiedBys,
  Status,
} from "../../../db/schema";
import type { ProductionTask } from "../model/productionTask.types";
import type { ProductionTaskRow } from "../repo/productionTask.repository";

export type LocalProductionTask = Omit<
  Partial<ProductionTask>,
  "created_by" | "last_modified_by" | "status"
> & {
  id: string;
  season_year: number | null;
  comment: string | null;
  date_start: string | null;
  calculated_date_end: string | null;
  status: Status | null;
  created_by: LastCreatedBys | null;
  last_modified_by: LastModifiedBys | null;
  productionTask: ProductionTaskRow["productionTask"];
  lastCreatedBy: LastCreatedBys | null;
  lastModifiedBy: LastModifiedBys | null;
};

export const mapProductionTaskRowToLocal = (
  row: ProductionTaskRow,
): LocalProductionTask => ({
  id: row.productionTask.id,
  season_year: row.productionTask.season_year,
  comment: row.productionTask.comment,
  date_start: row.productionTask.date_start,
  calculated_date_end: row.productionTask.calculated_date_end,
  status: row.status,
  created_by: row.lastCreatedBy,
  last_modified_by: row.lastModifiedBy,
  productionTask: row.productionTask,
  lastCreatedBy: row.lastCreatedBy,
  lastModifiedBy: row.lastModifiedBy,
});

export const mapProductionTaskRowsToLocal = (
  rows: ProductionTaskRow[],
): LocalProductionTask[] => rows.map(mapProductionTaskRowToLocal);
