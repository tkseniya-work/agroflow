import { techniqueMonitoringApi } from "../api/techniqueMonitoring.api";

export const useTechniqueMonitoringActions = () => ({
  loadAllTechniques: techniqueMonitoringApi.loadAllTechniques,
  loadMonitoringMapping: techniqueMonitoringApi.loadMonitoringMapping,
  loadProductionTaskTrack: techniqueMonitoringApi.loadProductionTaskTrack,
  loadTechniqueTrack: techniqueMonitoringApi.loadTechniqueTrack,
});
