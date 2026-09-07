export const hasRequiredScannerDictionaries = (
  productionWorkPlaces: unknown,
  settingsProductionShift: unknown,
) => {
  return Boolean(
    Array.isArray(productionWorkPlaces) &&
      productionWorkPlaces.length > 0 &&
      Array.isArray(settingsProductionShift) &&
      settingsProductionShift.length > 0,
  );
};
