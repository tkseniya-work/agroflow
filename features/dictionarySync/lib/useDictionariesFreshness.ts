import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback } from "react";
import {
  useProductionWorkPlaces,
  useShiftSettings,
} from "../../localData/useLocalData";
import { hasRequiredScannerDictionaries } from "./dictionariesReadiness.logic";

const DICTIONARIES_LAST_SYNC_KEY = "dictionaries_last_sync_at";
const DICTIONARIES_SYNC_INTERVAL = 6 * 60 * 60 * 1000;

export const useDictionariesFreshness = () => {
  const productionWorkPlaces = useProductionWorkPlaces();
  const settingsProductionShift = useShiftSettings();

  const hasRequiredDictionaries = useCallback(() => {
    return hasRequiredScannerDictionaries(
      productionWorkPlaces,
      settingsProductionShift,
    );
  }, [productionWorkPlaces, settingsProductionShift]);

  const areDictionariesExpired = useCallback(async () => {
    const lastSync = await AsyncStorage.getItem(DICTIONARIES_LAST_SYNC_KEY);

    if (!lastSync) {
      return true;
    }

    const lastSyncTime = Number(lastSync);

    if (!Number.isFinite(lastSyncTime)) {
      return true;
    }

    return Date.now() - lastSyncTime > DICTIONARIES_SYNC_INTERVAL;
  }, []);

  const shouldSyncDictionaries = useCallback(async () => {
    const hasDictionaries = hasRequiredDictionaries();

    if (!hasDictionaries) {
      return true;
    }

    return areDictionariesExpired();
  }, [hasRequiredDictionaries, areDictionariesExpired]);

  const markDictionariesSynced = useCallback(async () => {
    await AsyncStorage.setItem(
      DICTIONARIES_LAST_SYNC_KEY,
      String(Date.now()),
    );
  }, []);

  const resetDictionariesSyncDate = useCallback(async () => {
    await AsyncStorage.removeItem(DICTIONARIES_LAST_SYNC_KEY);
  }, []);

  return {
    hasRequiredDictionaries,
    shouldSyncDictionaries,
    markDictionariesSynced,
    resetDictionariesSyncDate,
  };
};
