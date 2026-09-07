import { tariffsApi } from "../../data/api/tariffs.api";

export const useTariffActions = () => ({
  generateTariff: tariffsApi.generate,
  loadTariffsList: tariffsApi.loadList,
  searchTariffs: tariffsApi.search,
});
