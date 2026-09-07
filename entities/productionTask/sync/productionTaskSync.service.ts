import { productionTaskApi } from "../api/productionTask.api";
import { productionTaskRepository } from "../repo/productionTask.repository";
import { createProductionTaskSyncService } from "./productionTaskSync.service.factory";

export const productionTaskSyncService = createProductionTaskSyncService({
  productionTaskApi,
  productionTaskRepository,
});
