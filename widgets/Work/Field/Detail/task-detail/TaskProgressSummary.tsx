import { Text } from "@ui-kitten/components";
import React, { memo } from "react";
import { View } from "react-native";

import { getProgressColor } from "../../../../../src/utils/taskUtils";
import { styles } from "./TaskAnalytics.styles";
import type { AnalyticsByFields } from "./TaskAnalytics.types";
import { formatAnalyticsNumber } from "./taskAnalytics.formatters";

export const TaskProgressSummary = memo(function TaskProgressSummary({
  progress,
}: {
  progress: AnalyticsByFields["progress"];
}) {
  return (
    <View style={styles.totalProgressSection}>
      <View style={styles.totalProgressHeader}>
        <Text style={styles.totalProgressLabel}>Прогресс выполнения</Text>
        <Text style={styles.totalProgressValue}>
          {Math.round(progress.percent)}%
        </Text>
      </View>

      <View style={styles.totalProgressTrack}>
        <View
          style={[
            styles.totalProgressFill,
            {
              width: `${Math.min(progress.percent, 100)}%`,
              backgroundColor: getProgressColor(progress.percent),
            },
          ]}
        />
      </View>

      <View style={styles.totalProgressFooter}>
        <Text style={styles.totalProgressMeta}>
          {formatAnalyticsNumber(progress.completed, 0)} га выполнено
        </Text>
        <Text style={styles.totalProgressMeta}>
          {formatAnalyticsNumber(progress.needToDo, 0)} га всего
        </Text>
      </View>
    </View>
  );
});
