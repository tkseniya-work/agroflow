import AsyncStorage from "@react-native-async-storage/async-storage";
import { offlineManager, StyleURL } from "@rnmapbox/maps";

const noopProgressListener = () => {};

export const useCompanyRegion = () => {
  const createCompanyRegion = async (coordinate: [number, number]) => {
    const id = "company_region";

    const bounds: [[number, number], [number, number]] = [
      [coordinate[0] - 0.2, coordinate[1] - 0.2],
      [coordinate[0] + 0.2, coordinate[1] + 0.2],
    ];

    try {
      const packs = await offlineManager.getPacks();

      const alreadyExists = packs?.some((pack: any) => pack.name === id);

      if (alreadyExists) {
        await AsyncStorage.setItem("company_region", JSON.stringify(bounds));
        return;
      }

      await offlineManager.createPack(
        {
          name: id,
          bounds,
          styleURL: StyleURL.Satellite,
          minZoom: 9,
          maxZoom: 16,
        },
        noopProgressListener,
      );

      await AsyncStorage.setItem("company_region", JSON.stringify(bounds));
    } catch (error) {
      console.error("createCompanyRegion error:", error);
    }
  };

  return { createCompanyRegion };
};
