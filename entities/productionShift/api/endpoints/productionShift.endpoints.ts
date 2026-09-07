export const API = {
  productionShiftsByEmployee: `${process.env.EXPO_PUBLIC_AGRO_API_URL}/api/production-shifts/parts/grouped/by-employee/v2/`,
  closeProductionShift: `${process.env.EXPO_PUBLIC_AGRO_API_URL}/api/production-shifts/close/`,
  openProductionShift: `${process.env.EXPO_PUBLIC_AGRO_API_URL}/api/production-shifts/open-by-qr/`,
  settingsProductionShift: `${process.env.EXPO_PUBLIC_AGRO_API_URL}/api/production-shifts/settings/`,
  updateProductionShiftPart: `${process.env.EXPO_PUBLIC_AGRO_API_URL}/api/production-shifts/parts`,
  updateProductionShiftPartTariff: `${process.env.EXPO_PUBLIC_AGRO_API_URL}/api/production-shifts/parts/tariff`,
  updateProductionShiftTotalsV2: `${process.env.EXPO_PUBLIC_AGRO_API_URL}/api/production-shifts/totals/v2`,
  closeInitialPart: `${process.env.EXPO_PUBLIC_AGRO_API_URL}/api/production-shifts/close-initial-part`,
};
