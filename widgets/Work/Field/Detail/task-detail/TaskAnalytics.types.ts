export type AnalyticsField = {
  id: string;
  name: string;
  factArea: number;
  totalArea: number;
  fuelPerHa: number;
  fuelAmountPerHa: number;
  fertilizersPerHa: number;
  fertilizersAmountPerHa: number;
  pesticidesPerHa: number;
  pesticidesAmountPerHa: number;
  seedsPerHa: number;
  seedsAmountPerHa: number;
  seedsUnit: string;
  salary: number;
};

export type AnalyticsTransfer = {
  fuelQuantity: number;
  fuelAmount: number;
  salary: number;
} | null;

export type AnalyticsTechnique = {
  id: string;
  name: string;
  stateNumber: string;
  loading: number;
  performance: number;
  fuelConsumptionPerHa: number;
};

export type AnalyticsByFields = {
  fields: AnalyticsField[];
  transfer: AnalyticsTransfer;
  progress: {
    completed: number;
    needToDo: number;
    percent: number;
  };
};
