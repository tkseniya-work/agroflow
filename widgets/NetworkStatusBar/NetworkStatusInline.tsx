import React from "react";
import { StyleSheet, Text, View } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import { useNetworkStatusUI } from "./useNetworkStatusUI";

export const NetworkStatusInline = () => {
  const { isOffline, forcedOffline, isEnvOfflineMode, inlineText } =
    useNetworkStatusUI();

  if (!isOffline || !inlineText) return null;

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={
          forcedOffline || isEnvOfflineMode
            ? ["#F79009", "#FDB022"]
            : ["#FF5F6D", "#FF8A80"]
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.strip}
      />

      <Text style={styles.text} numberOfLines={1}>
        {inlineText}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 6,
    gap: 8,
    backgroundColor: "#FFF8F8",
  },

  strip: {
    width: 24,
    height: 3,
    borderRadius: 999,
  },

  text: {
    fontSize: 11,
    fontWeight: "600",
    color: "#B42318",
    flexShrink: 1,
  },
});