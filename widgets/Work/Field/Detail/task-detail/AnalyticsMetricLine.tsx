import { Text } from "@ui-kitten/components";
import React, { memo } from "react";
import { View } from "react-native";

import { styles } from "./TaskAnalytics.styles";

type Props = {
  label: string;
  value: string;
  caption?: string;
};

export const AnalyticsMetricLine = memo(function AnalyticsMetricLine({
  label,
  value,
  caption,
}: Props) {
  return (
    <View style={styles.metricLine}>
      <Text style={styles.metricLabel}>{label}</Text>
      <View style={styles.metricValueWrap}>
        <Text style={styles.metricValue}>{value}</Text>
        {!!caption && <Text style={styles.metricCaption}>{caption}</Text>}
      </View>
    </View>
  );
});
