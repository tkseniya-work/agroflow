import { API } from "../../../features/dictionarySync/api/endpoints/dictionaries.endpoints";
import type { ProductionTask } from "../model/productionTask.types";
import { safeGetArray } from "../../../shared/lib/apiUtils";

export const productionTaskApi = {
  loadProductionTasks(accessToken: string | null, year: string | null) {
    if (!year) return Promise.resolve([]);

    return safeGetArray<ProductionTask>(
      API.productionTask.concat(year),
      accessToken,
      "Production tasks",
    );
  },
};
