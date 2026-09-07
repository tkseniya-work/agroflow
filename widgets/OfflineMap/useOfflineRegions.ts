import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  offlineManager,
  OfflinePackDownloadState,
  StyleURL,
} from "@rnmapbox/maps";
import { useState } from "react";
import { MapboxGeocodingService } from "../../src/services/MapboxGeocodingService";
import { getBoundsCenter } from "../../src/utils/mapUtils";
import {
  OfflineRegion,
  OfflineRegionDownloadState,
} from "../../src/types/map.types";

const STYLES = {
  SATELLITE: StyleURL.Satellite,
  STREET: StyleURL.Street,
};

const getLocationName = (locationInfo: any, fallback: string): string => {
  const city =
    typeof locationInfo.city === "string"
      ? locationInfo.city
      : locationInfo.city?.name;

  const region =
    typeof locationInfo.regionName === "string"
      ? locationInfo.regionName
      : locationInfo.regionName?.name;

  return city || region || fallback;
};

export const useOfflineRegions = () => {
  const [regions, setRegions] = useState<OfflineRegion[]>([]);
  const [downloadStates, setDownloadStates] = useState<
    Record<string, OfflineRegionDownloadState>
  >({});

  const updateRegionMetadata = (
    regionId: string,
    metadata: Partial<NonNullable<OfflineRegion["metadata"]>>,
  ) => {
    setRegions((previous) => {
      const updated = previous.map((region) =>
        region.id === regionId
          ? { ...region, metadata: { ...region.metadata, ...metadata } }
          : region,
      );

      void AsyncStorage.setItem("offline_regions", JSON.stringify(updated));
      return updated;
    });
  };

  const createProgressListener = (regionId: string) =>
    (_pack: unknown, status: any) => {
      const percentage = Math.max(
        0,
        Math.min(100, Math.round(Number(status?.percentage) || 0)),
      );
      const completedResourceSize = Math.max(
        0,
        Number(status?.completedResourceSize) || 0,
      );
      const complete =
        status?.state === OfflinePackDownloadState.Complete ||
        percentage >= 100;

      setDownloadStates((previous) => ({
        ...previous,
        [regionId]: {
          status: complete ? "complete" : "downloading",
          percentage,
          completedResourceSize,
        },
      }));

      if (complete) {
        updateRegionMetadata(regionId, {
          completedResourceSize,
          downloadedAt: new Date().toISOString(),
        });
      }
    };

  const createErrorListener = (regionId: string) =>
    (_pack: unknown, error: any) => {
      setDownloadStates((previous) => ({
        ...previous,
        [regionId]: {
          status: "error",
          percentage: previous[regionId]?.percentage ?? 0,
          completedResourceSize:
            previous[regionId]?.completedResourceSize ?? 0,
          error: error?.message || "Не удалось скачать область",
        },
      }));
    };

  const getOfflinePacksSafely = async () => {
    try {
      return await offlineManager.getPacks();
    } catch {
      return [];
    }
  };

  const loadRegions = async () => {
    try {
      const saved = await AsyncStorage.getItem("offline_regions");
      if (saved) {
        const parsedRegions = JSON.parse(saved) as OfflineRegion[];
        setRegions(parsedRegions);

        const packs = await getOfflinePacksSafely();
        const nextStates: Record<string, OfflineRegionDownloadState> = {};

        for (const region of parsedRegions) {
          const pack = packs.find((item) => item.name === region.id);

          if (!pack) {
            nextStates[region.id] = {
              status: "error",
              percentage: 0,
              completedResourceSize: 0,
              error: "Офлайн-данные не найдены на устройстве",
            };
            continue;
          }

          const status = await pack.status();
          const percentage = Math.max(
            0,
            Math.min(100, Math.round(Number(status.percentage) || 0)),
          );
          const complete =
            status.state === OfflinePackDownloadState.Complete ||
            percentage >= 100;

          nextStates[region.id] = {
            status: complete ? "complete" : "downloading",
            percentage,
            completedResourceSize:
              Number(status.completedResourceSize) ||
              region.metadata?.completedResourceSize ||
              0,
          };

          if (!complete) {
            void offlineManager.subscribe(
              region.id,
              createProgressListener(region.id),
              createErrorListener(region.id),
            );
          }
        }

        setDownloadStates(nextStates);
      }
    } catch (error) {
      console.error("Error loading regions:", error);
    }
  };

  const createNewRegion = async (
    bounds: [[number, number], [number, number]],
  ): Promise<OfflineRegion | undefined> => {
    try {
      const regionId = `region_${Date.now()}`;

      let address = "";
      let locationInfo: any = {};

      try {
        const [lng, lat] = getBoundsCenter(bounds);
        const geocodingResult = await MapboxGeocodingService.reverseGeocode(
          lng,
          lat,
        );

        locationInfo = {
          regionName: geocodingResult.region,
          city: geocodingResult.city,
          address: geocodingResult.address,
          country: geocodingResult.country,
          fullAddress: geocodingResult.fullAddress,
        };

        address = geocodingResult.fullAddress || geocodingResult.address || "";
      } catch (error) {
        console.error("Geocoding failed:", error);
      }

      const fallbackName = `Область · ${new Date().toLocaleString("ru-RU", {
        day: "2-digit",
        month: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      })}`;
      const name = getLocationName(locationInfo, fallbackName);

      const newRegion: OfflineRegion = {
        id: regionId,
        name,
        bounds,
        minZoom: 10,
        maxZoom: 16,
        styleURL: STYLES.SATELLITE,
        metadata: {
          address: address,
          fullAddress: locationInfo.fullAddress,
          name: name,
          actualCenter: getBoundsCenter(bounds),
          actualZoom: 12,
        },
        isDeletable: true,
      };

      return newRegion;
    } catch (error: any) {
      console.error("Error creating region:", error);
      return undefined;
    }
  };

  const saveRegion = async (bounds: [[number, number], [number, number]]) => {
    try {
      const newRegion = await createNewRegion(bounds);
      if (!newRegion) return;

      const offlinePackOptions = {
        name: newRegion.id,
        styleURL: newRegion.styleURL,
        bounds: newRegion.bounds,
        minZoom: newRegion.minZoom,
        maxZoom: newRegion.maxZoom,
        metadata: {
          ...newRegion.metadata,
          id: newRegion.id,
          displayName: newRegion.name,
          name: newRegion.id,
          actualCenter: newRegion.metadata?.actualCenter,
          actualZoom: newRegion.metadata?.actualZoom,
          isDeletable: newRegion.isDeletable,
        },
      };

      await offlineManager.createPack(
        offlinePackOptions,
        createProgressListener(newRegion.id),
        createErrorListener(newRegion.id),
      );

      setDownloadStates((previous) => ({
        ...previous,
        [newRegion.id]: previous[newRegion.id] ?? {
          status: "downloading",
          percentage: 0,
          completedResourceSize: 0,
        },
      }));

      setRegions((prevRegions) => {
        const updated = [...prevRegions, newRegion];
        void AsyncStorage.setItem("offline_regions", JSON.stringify(updated));
        return updated;
      });
    } catch (error: any) {
      console.error("Error saving region:", error);
      throw error;
    }
  };

  const deleteRegion = async (id: string) => {
    try {
      offlineManager.unsubscribe(id);
      await offlineManager.deletePack(id);

      const updated = regions.filter((r) => r.id !== id);
      await AsyncStorage.setItem("offline_regions", JSON.stringify(updated));
      setRegions(updated);
      setDownloadStates((previous) => {
        const next = { ...previous };
        delete next[id];
        return next;
      });
    } catch (error) {
      console.error("Error deleting region:", error);
      throw error;
    }
  };

  const clearAllOfflineMaps = async () => {
    try {
      const allPacks = await getOfflinePacksSafely();

      for (const pack of allPacks) {
        try {
          offlineManager.unsubscribe(pack.name);
          await offlineManager.deletePack(pack.name); // можно использовать pack.id, если поддерживается
        } catch (error) {
          console.warn(`Не удалось удалить пакет ${pack.name}`, error);
        }
      }

      await AsyncStorage.removeItem("offline_regions");
      await AsyncStorage.removeItem("company_auto_region");
      await AsyncStorage.removeItem("company_region");

      setRegions([]);
      setDownloadStates({});
    } catch (error) {
      console.error("Ошибка при очистке офлайн-карт:", error);
    }
  };

  return {
    regions,
    downloadStates,
    loadRegions,
    saveRegion,
    deleteRegion,
    clearAllOfflineMaps,
  };
};
