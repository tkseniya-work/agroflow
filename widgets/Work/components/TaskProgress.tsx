import React, { memo, useMemo } from "react";
import { View } from "react-native";
import { Text } from "@ui-kitten/components";

import { ProductionTask } from "../../../entities/productionTask";
import { getProgressColor } from "../../../src/utils/taskUtils";
import { styles } from "../styles";

type Props = {
  item: ProductionTask;
};

const TaskProgressComponent = ({ item }: Props) => {
  const progress = useMemo(() => {
    const percent =
      item.area_plan > 0 ? (item.area_fact / item.area_plan) * 100 : 0;
    const progressPercent = Math.min(Math.round(percent), 100);

    return {
      percent: progressPercent,
      color: getProgressColor(progressPercent),
      factText: Number(item.area_fact || 0).toLocaleString("ru-RU"),
      planText: Number(item.area_plan || 0).toLocaleString("ru-RU"),
    };
  }, [item.area_fact, item.area_plan]);

  return (
    <View style={styles.progressSection}>
      <View style={styles.progressHeader}>
        <Text style={styles.progressLabel}>Выполнение</Text>

        <Text style={[styles.progressValue, { color: progress.color }]}>
          {progress.percent}%
        </Text>
      </View>

      <View style={styles.progressTrack}>
        <View
          style={[
            styles.progressFill,
            {
              width: `${progress.percent}%`,
              backgroundColor: progress.color,
            },
          ]}
        />
      </View>

      <View style={styles.progressInfoRow}>
        <Text style={styles.progressInfoText}>
          Факт: {progress.factText} га
        </Text>

        <Text style={styles.progressInfoText}>
          План: {progress.planText} га
        </Text>
      </View>
    </View>
  );
};

export const TaskProgress = memo(TaskProgressComponent);
