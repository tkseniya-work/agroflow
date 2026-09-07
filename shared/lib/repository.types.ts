export type RepositoryMutationResult = {
  id?: string | number;
  work_standard_tariff_id?: string;
  techniqueStandardId?: string;
  agriculturalMachineryId?: string;
  productionTaskId?: string;
  success: boolean;
};

export type RepositoryItemResult = RepositoryMutationResult & {
  productionWorkPlaceId?: string;
  error?: string;
};
