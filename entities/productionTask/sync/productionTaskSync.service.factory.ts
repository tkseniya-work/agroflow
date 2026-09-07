import type { ProductionTask } from "../model/productionTask.types";

type ProductionTaskApi = {
  loadProductionTasks: (
    accessToken: string,
    year: string,
  ) => Promise<ProductionTask[]>;
};

type ProductionTaskRepository = {
  insertMany: (items: ProductionTask[]) => Promise<unknown> | unknown;
};

type ProductionTaskSyncDependencies = {
  productionTaskApi: ProductionTaskApi;
  productionTaskRepository: ProductionTaskRepository;
};

export const createProductionTaskSyncService = ({
  productionTaskApi,
  productionTaskRepository,
}: ProductionTaskSyncDependencies) => ({
  async syncProductionTasks(accessToken: string, year: string) {
    const tasks = await productionTaskApi.loadProductionTasks(accessToken, year);

    if (!tasks.length) return [];

    return productionTaskRepository.insertMany(tasks);
  },
});
