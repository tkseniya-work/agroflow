import { useEffect, useRef, useState } from "react";
import { useNetworkStatus } from "../../shared/lib/useNetworkStatus";

type ToastType = "offline" | "online" | null;

const TOAST_DURATION = 2200;

export const useNetworkStatusUI = () => {
  const {
    isConnected,
    isOffline,
    networkStatus,
    forcedOffline,
    isEnvOfflineMode,
  } = useNetworkStatus();

  const prevOfflineRef = useRef<boolean | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [toastType, setToastType] = useState<ToastType>(null);
  const [toastVisible, setToastVisible] = useState(false);

  useEffect(() => {
    const prevOffline = prevOfflineRef.current;

    if (prevOffline === null) {
      prevOfflineRef.current = isOffline;
      return;
    }

    if (prevOffline !== isOffline) {
      const nextType: ToastType = isOffline ? "offline" : "online";

      setToastType(nextType);
      setToastVisible(true);

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        setToastVisible(false);
        timeoutRef.current = null;
      }, TOAST_DURATION);

      prevOfflineRef.current = isOffline;
    }
  }, [isOffline]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const inlineText = forcedOffline
    ? "Принудительный оффлайн режим"
    : isEnvOfflineMode
      ? "Оффлайн режим сборки"
      : networkStatus === "limited"
        ? "Сеть ограничена"
        : networkStatus === "service-unavailable"
          ? "Сервис временно недоступен"
          : !isConnected
            ? "Нет сети"
            : null;

  const toastText =
    toastType === "offline"
      ? forcedOffline
        ? "Включен оффлайн режим"
        : networkStatus === "limited"
          ? "Сеть ограничена"
          : networkStatus === "service-unavailable"
            ? "Сервис временно недоступен"
            : "Нет сети"
      : toastType === "online"
        ? "Подключение восстановлено"
        : null;

  return {
    isConnected,
    isOffline,
    networkStatus,
    forcedOffline,
    isEnvOfflineMode,

    toastVisible,
    toastType,
    toastText,
    inlineText,
  };
};
