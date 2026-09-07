import { useDataSync } from "../../features/dataSync/lib/useDataSync";
import React from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import Colors from "styles/Colors";

export const SyncStatus: React.FC = () => {
  const { isSyncing, syncProgress, syncStatus, lastSyncDate, error } =
    useDataSync();

  if (syncStatus === "idle" && !lastSyncDate) {
    return null;
  }

  return (
    <View style={styles.container}>
      {isSyncing ? (
        <View style={styles.syncing}>
          <ActivityIndicator size="small" color={Colors.blue} />
          <Text style={styles.text}>Синхронизация... {syncProgress}%</Text>
        </View>
      ) : error ? (
        <View style={styles.error}>
          <Text style={styles.errorText}>Ошибка синхронизации: {error}</Text>
        </View>
      ) : lastSyncDate ? (
        <Text style={styles.successText}>
          Данные обновлены: {lastSyncDate.toLocaleTimeString()}
        </Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 8,
    alignItems: "center",
  },
  syncing: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  text: {
    fontSize: 12,
    color: Colors.darkGrayText,
  },
  error: {
    backgroundColor: Colors.grey400,
    padding: 8,
    borderRadius: 4,
  },
  errorText: {
    color: Colors.error,
    fontSize: 12,
  },
  successText: {
    color: Colors.greenColor,
    fontSize: 12,
  },
});
