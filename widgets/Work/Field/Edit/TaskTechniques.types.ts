import type { FieldProductionTaskResponse } from "../../../../entities/productionTask";
import type {
  TaskTechniquePayload,
  TaskType,
} from "./TaskTechniques.logic";

export type TaskTechniquesProps = {
  currentTask: FieldProductionTaskResponse | null;
  taskType?: TaskType;
  techniqueWithAdditionalInfo?: any[];
  isDataLoading?: boolean;
  onAddTechnique: (data: TaskTechniquePayload) => Promise<boolean>;
  onDeleteTechnique: (id: string) => Promise<boolean>;
  onMoveTechnique: (data: TaskTechniquePayload) => Promise<boolean>;
};
