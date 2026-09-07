import { SyncConfig } from "./model/dataSync.types";

export const SYNC_CONFIG: SyncConfig = {
  entities: [
    { key: 'technique', name: 'Техника' },
    { key: 'agriculturalMachinery', name: 'Сельхозтехника' },
    { key: 'productionWorkPlaces', name: 'Рабочие места' },
    { key: 'workStandard', name: 'Справочник работ' },
    { key: 'productionTask', name: 'Производственные задачи' },
    { key: 'unitOfMeasure', name: 'Единицы измерения' },
    { key: 'productionShift', name: 'Производственные смены' },
  ] as const
};