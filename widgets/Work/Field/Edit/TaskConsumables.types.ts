import type { FieldProductionTaskResponse , ProductionTaskConsumableType } from "../../../../entities/productionTask";
import type { ConsumablePayload } from "./TaskConsumables.logic";

export type ConsumableTab = "norm" | "plan";

export type TaskConsumablesProps = {
  currentTask: FieldProductionTaskResponse | null;
  cropStandardsList: any[];
  fertilizerStandardsList: any[];
  pesticideStandardsList: any[];
  sowingUnitCodeList: any[];
  isDataLoading?: boolean;
  onSaveNorm: (
    type: ProductionTaskConsumableType,
    data: ConsumablePayload,
  ) => Promise<boolean>;
  onDeleteNorm: (
    type: ProductionTaskConsumableType,
    id: string,
  ) => Promise<boolean>;
};
