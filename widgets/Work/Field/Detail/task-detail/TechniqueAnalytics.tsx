import { Text } from "@ui-kitten/components";
import React, { memo } from "react";
import { View } from "react-native";

import { styles } from "./TaskAnalytics.styles";
import type { AnalyticsTechnique } from "./TaskAnalytics.types";
import { formatAnalyticsNumber } from "./taskAnalytics.formatters";

export function TechniqueAnalytics({
  techniques,
}: {
  techniques: AnalyticsTechnique[];
}) {
  if (!techniques.length) {
    return (
      <View style={styles.transferSection}>
        <Text style={styles.sectionTitle}>Техника</Text>
        <Text style={styles.emptyText}>
          Нет данных из мониторинга транспорта
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.techniqueSection}>
      <Text style={styles.sectionTitle}>Загрузка техники</Text>

      <View style={styles.techniqueList}>
        {techniques.map((item) => (
          <TechniqueLoadRow key={item.id} item={item} />
        ))}
      </View>

      <View style={styles.techniqueMetricsGrid}>
        <View style={styles.techniqueMetricCard}>
          <Text style={styles.techniqueMetricTitle}>Выработка</Text>
          {techniques.map((item) => (
            <TechniqueMetricLine
              key={`performance-${item.id}`}
              name={`${item.name} | ${item.stateNumber}`}
              value={`${formatAnalyticsNumber(item.performance)} га/час`}
            />
          ))}
        </View>

        <View style={styles.techniqueMetricCard}>
          <Text style={styles.techniqueMetricTitle}>Расход топлива</Text>
          {techniques.map((item) => (
            <TechniqueMetricLine
              key={`fuel-${item.id}`}
              name={`${item.name} | ${item.stateNumber}`}
              value={`${formatAnalyticsNumber(
                item.fuelConsumptionPerHa,
              )} л/га`}
            />
          ))}
        </View>
      </View>
    </View>
  );
}

const TechniqueLoadRow = memo(function TechniqueLoadRow({
  item,
}: {
  item: AnalyticsTechnique;
}) {
  return (
    <View style={styles.techniqueLoadRow}>
      <View style={styles.techniqueLoadHeader}>
        <Text style={styles.techniqueName} numberOfLines={1}>
          {item.name} | {item.stateNumber}
        </Text>
        <Text style={styles.techniqueLoadValue}>
          {Math.round(item.loading)}%
        </Text>
      </View>

      <View style={styles.techniqueLoadTrack}>
        <View
          style={[
            styles.techniqueLoadFill,
            { width: `${Math.min(item.loading, 100)}%` },
          ]}
        />
      </View>
    </View>
  );
});

const TechniqueMetricLine = memo(function TechniqueMetricLine({
  name,
  value,
}: {
  name: string;
  value: string;
}) {
  return (
    <View style={styles.techniqueMetricLine}>
      <Text style={styles.techniqueMetricName} numberOfLines={1}>
        {name}
      </Text>
      <Text style={styles.techniqueMetricValue}>{value}</Text>
    </View>
  );
});
