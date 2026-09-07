import { Text } from "@ui-kitten/components";
import React from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";

import Colors from "../../../shared/styles/Colors";

type Props = {
  title?: string;
  subtitle: string;
  accessibilityLabel: string;
};

export function TaskAnalyticsLoadingCard({
  title = "Аналитика",
  subtitle,
  accessibilityLabel,
}: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>

      <View accessibilityLabel={accessibilityLabel} style={styles.loadingState}>
        <ActivityIndicator size="small" color={Colors.greenColor} />
        <Text style={styles.loadingText}>Загружаем аналитику</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 22,
    backgroundColor: Colors.white,
    padding: 16,
    borderWidth: 1,
    borderColor: "#EAECF0",
    gap: 14,
  },
  header: {
    minWidth: 0,
  },
  title: {
    fontSize: 16,
    fontWeight: "800",
    color: "#101828",
  },
  subtitle: {
    marginTop: 3,
    fontSize: 12,
    color: "#667085",
  },
  loadingState: {
    minHeight: 108,
    borderRadius: 16,
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#EAECF0",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
  },
  loadingText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#667085",
  },
});
