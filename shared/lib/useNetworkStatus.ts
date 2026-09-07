import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Network from "expo-network";
import { useAtom } from "jotai";
import { useCallback, useEffect, useRef, useState } from "react";
import { AppState } from "react-native";
import {
  FORCED_OFFLINE_STORAGE_KEY,
  forcedOfflineAtom,
} from "../store/network";
import {
  probeWithRetry,
  resolveReachableNetworkStatus,
  type NetworkStatus,
} from "./networkStatus.logic";

export type { NetworkStatus } from "./networkStatus.logic";

const ENV_OFFLINE_MODE = process.env.EXPO_PUBLIC_OFFLINE_MODE === "true";
const NETWORK_CHECK_TIMEOUT_MS = 4000;

const APP_API_URL =
  process.env.EXPO_PUBLIC_NETWORK_API_PROBE_URL ??
  process.env.EXPO_PUBLIC_AGRO_API_URL;
const INDEPENDENT_PROBE_URLS = (
  process.env.EXPO_PUBLIC_NETWORK_PROBE_URLS ??
  "https://yandex.ru/generate_204,https://vk.com"
)
  .split(",")
  .map((url) => url.trim())
  .filter(Boolean);

const probeEndpoint = async (url: string) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), NETWORK_CHECK_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      method: "HEAD",
      cache: "no-store",
      signal: controller.signal,
    });

    // 401/403/404/405 still prove that the host is reachable. A 5xx response
    // means that the route exists, but the service cannot currently be used.
    return response.status < 500;
  } catch {
    return false;
  } finally {
    clearTimeout(timeoutId);
  }
};

type ConnectivityCheckResult = {
  status: NetworkStatus;
  connectionType: Network.NetworkStateType | undefined;
};

let connectivityCheckPromise: Promise<ConnectivityCheckResult> | null = null;

const runConnectivityCheck = () => {
  if (connectivityCheckPromise) {
    return connectivityCheckPromise;
  }

  connectivityCheckPromise = (async () => {
    const networkState = await Network.getNetworkStateAsync();

    if (!networkState.isConnected) {
      return {
        status: "offline" as const,
        connectionType: networkState.type,
      };
    }

    const [isAppApiReachable, probeResults] = await Promise.all([
      APP_API_URL
        ? probeWithRetry(() => probeEndpoint(APP_API_URL))
        : Promise.resolve(false),
      Promise.all(INDEPENDENT_PROBE_URLS.map(probeEndpoint)),
    ]);

    return {
      status: resolveReachableNetworkStatus(
        isAppApiReachable,
        probeResults,
      ),
      connectionType: networkState.type,
    };
  })().finally(() => {
    connectivityCheckPromise = null;
  });

  return connectivityCheckPromise;
};

export const useNetworkStatus = () => {
  const [networkStatus, setNetworkStatus] =
    useState<NetworkStatus>("online");
  const [isLoading, setIsLoading] = useState(false);
  const [forcedOffline, setForcedOffline] = useAtom(forcedOfflineAtom);

  const [connectionType, setConnectionType] = useState<
    Network.NetworkStateType | undefined
  >(Network.NetworkStateType.UNKNOWN);

  const lastCheckRef = useRef(0);
  const consecutiveFailuresRef = useRef(0);

  const isOfflineMode = ENV_OFFLINE_MODE || forcedOffline;

  const toggleForcedOffline = useCallback(async () => {
    const next = !forcedOffline;

    setForcedOffline(next);

    await AsyncStorage.setItem(
      FORCED_OFFLINE_STORAGE_KEY,
      next ? "true" : "false",
    );

    if (next) {
      setNetworkStatus("offline");
    }
  }, [forcedOffline, setForcedOffline]);

  const checkInternetConnection = useCallback(
    async (force = false) => {
      if (isOfflineMode) {
        setNetworkStatus("offline");
        setIsLoading(false);
        return;
      }

      const now = Date.now();

      if (!force && now - lastCheckRef.current < 10000) {
        return;
      }

      lastCheckRef.current = now;
      setIsLoading(true);

      try {
        const result = await runConnectivityCheck();

        setConnectionType(result.connectionType);
        setNetworkStatus(result.status);

        if (result.status === "online") {
          consecutiveFailuresRef.current = 0;
        } else {
          consecutiveFailuresRef.current += 1;
        }
      } catch (error) {
        console.error("Network check error:", error);
        setNetworkStatus("limited");
        consecutiveFailuresRef.current += 1;
      } finally {
        setIsLoading(false);
      }
    },
    [isOfflineMode],
  );

  const handleAppStateChange = useCallback(
    (nextAppState: string) => {
      if (nextAppState === "active") {
        checkInternetConnection(true);
      }
    },
    [checkInternetConnection],
  );

  useEffect(() => {
    const restoreForcedOfflineMode = async () => {
      const saved = await AsyncStorage.getItem(FORCED_OFFLINE_STORAGE_KEY);

      if (saved === "true") {
        setForcedOffline(true);
        setNetworkStatus("offline");
      }
    };

    restoreForcedOfflineMode();
  }, [setForcedOffline]);

  useEffect(() => {
    if (isOfflineMode) {
      setNetworkStatus("offline");
      setIsLoading(false);
      return;
    }

    const initialCheck = setTimeout(() => {
      checkInternetConnection(true);
    }, 1000);

    const intervalId = setInterval(() => {
      checkInternetConnection();
    }, 20000);

    const networkSubscription = Network.addNetworkStateListener(
      (networkState) => {
        setConnectionType(networkState.type);

        if (!networkState.isConnected) {
          setNetworkStatus("offline");
          consecutiveFailuresRef.current += 1;
          return;
        }

        void checkInternetConnection(true);
      },
    );

    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange,
    );

    return () => {
      clearTimeout(initialCheck);
      clearInterval(intervalId);
      networkSubscription.remove();
      subscription.remove();
    };
  }, [
    isOfflineMode,
    checkInternetConnection,
    handleAppStateChange,
  ]);

  const effectiveStatus: NetworkStatus = isOfflineMode
    ? "offline"
    : networkStatus;
  const isConnected = effectiveStatus === "online";

  return {
    networkStatus: effectiveStatus,
    isConnected,
    isOffline: !isConnected,
    isLimited: effectiveStatus === "limited",
    isServiceUnavailable: effectiveStatus === "service-unavailable",
    isLoading,
    connectionType,

    forcedOffline,
    isEnvOfflineMode: ENV_OFFLINE_MODE,
    toggleForcedOffline,

    checkNetwork: () => checkInternetConnection(true),
    retryCount: consecutiveFailuresRef.current,
  };
};
