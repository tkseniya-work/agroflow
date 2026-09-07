import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import Colors from "../../shared/styles/Colors";

const OFFLINE_OPTION_DELAY_MS = 5_000;

type Props = {
  onContinueOffline: () => Promise<void> | void;
};

export const StartupLoadingScreen = ({ onContinueOffline }: Props) => {
  const [showOfflineOption, setShowOfflineOption] = useState(false);
  const [switchingOffline, setSwitchingOffline] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowOfflineOption(true);
    }, OFFLINE_OPTION_DELAY_MS);

    return () => clearTimeout(timer);
  }, []);

  const handleContinueOffline = async () => {
    if (switchingOffline) return;

    setSwitchingOffline(true);

    try {
      await onContinueOffline();
    } catch (error) {
      console.warn("Failed to enable forced offline mode:", error);
      setSwitchingOffline(false);
    }
  };

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={Colors.greenColor} />
      <Text style={styles.title}>Запускаем приложение…</Text>

      {showOfflineOption ? (
        <View style={styles.offlineOption}>
          <Text style={styles.message}>
            Загрузка занимает больше времени из-за нестабильного соединения.
          </Text>

          <Pressable
            accessibilityRole="button"
            disabled={switchingOffline}
            onPress={handleContinueOffline}
            style={({ pressed }) => [
              styles.button,
              pressed && styles.buttonPressed,
              switchingOffline && styles.buttonDisabled,
            ]}
          >
            {switchingOffline ? (
              <ActivityIndicator size="small" color={Colors.white} />
            ) : (
              <Text style={styles.buttonText}>Перейти в офлайн-режим</Text>
            )}
          </Pressable>

          <Text style={styles.hint}>
            Синхронизацию можно будет продолжить после восстановления связи.
          </Text>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 28,
    backgroundColor: Colors.white,
  },
  title: {
    marginTop: 16,
    color: Colors.grey900,
    fontSize: 17,
    fontWeight: "600",
  },
  offlineOption: {
    width: "100%",
    maxWidth: 360,
    marginTop: 28,
    alignItems: "center",
  },
  message: {
    color: Colors.grey600,
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
  },
  button: {
    minHeight: 46,
    marginTop: 18,
    paddingHorizontal: 22,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    backgroundColor: Colors.greenColor,
  },
  buttonPressed: {
    opacity: 0.82,
  },
  buttonDisabled: {
    opacity: 0.65,
  },
  buttonText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: "600",
  },
  hint: {
    marginTop: 12,
    color: Colors.grey600,
    fontSize: 12,
    lineHeight: 17,
    textAlign: "center",
  },
});
