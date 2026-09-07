export { productionShiftApi } from "./api/productionShift.api";
export { productionShiftActionsService } from "./api/productionShiftActions.service";
export { WorkType } from "./model/shift.types";
export type {
  ShiftData,
  GroupedShiftData,
  ShiftInfo,
  ShiftSettings,
} from "./model/shift.types";
export type {
  ProductionShiftResponseDto,
  ProductionShiftSettingsDto,
  CloseProductionShiftRequest,
  OpenProductionShiftRequest,
} from "./model/productionShift.interface";
// useProductionShiftActions/useProductionShiftUpdate, productionShiftRepository/
// queue/sync service, and store atoms are intentionally NOT re-exported here:
// useProductionShiftActions pulls in ./store, which imports the repo, which
// imports db/client.ts (opens a real SQLite connection at import time) —
// bundling that into this barrel would drag every consumer of a plain type
// like ShiftData into a real DB connection too. Import the hooks and the
// storage layer by their concrete path instead.
