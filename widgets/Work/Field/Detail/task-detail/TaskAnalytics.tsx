import { Ionicons } from "@expo/vector-icons";
import { Text } from "@ui-kitten/components";
import React, { useCallback, useMemo, useState } from "react";
import { Pressable, View } from "react-native";

import { TaskAnalyticsLoadingCard } from "../../../shared/TaskAnalyticsLoadingCard";
import { AnalyticsMetricLine } from "./AnalyticsMetricLine";
import { FieldProgressCard } from "./FieldProgressCard";
import { styles } from "./TaskAnalytics.styles";
import type { AnalyticsByFields } from "./TaskAnalytics.types";
import { TaskProgressSummary } from "./TaskProgressSummary";
import {
  formatAnalyticsNumber,
  getAnalyticsPercent,
} from "./taskAnalytics.formatters";

export type {
  AnalyticsByFields,
  AnalyticsField,
  AnalyticsTechnique,
  AnalyticsTransfer,
} from "./TaskAnalytics.types";
export { TechniqueAnalytics } from "./TechniqueAnalytics";

const COLLAPSED_FIELDS_LIMIT = 5;

export function TaskAnalytics({
  analyticByFields,
  isLoading = false,
}: {
  analyticByFields: AnalyticsByFields;
  isLoading?: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const fields = analyticByFields.fields ?? [];
  const transfer = analyticByFields.transfer;
  const progress = analyticByFields.progress;
  const hasHiddenFields = fields.length > COLLAPSED_FIELDS_LIMIT;
  const hiddenCount = Math.max(fields.length - COLLAPSED_FIELDS_LIMIT, 0);
  const toggleExpanded = useCallback(() => {
    setExpanded((prev) => !prev);
  }, []);

  const sortedFields = useMemo(
    () =>
      [...fields].sort((a, b) => {
        const aDone = a.factArea >= a.totalArea;
        const bDone = b.factArea >= b.totalArea;

        if (aDone !== bDone) return aDone ? -1 : 1;

        return (
          getAnalyticsPercent(b.factArea, b.totalArea) -
          getAnalyticsPercent(a.factArea, a.totalArea)
        );
      }),
    [fields],
  );

  const visibleFields = expanded
    ? sortedFields
    : sortedFields.slice(0, COLLAPSED_FIELDS_LIMIT);

  if (isLoading) {
    return (
      <TaskAnalyticsLoadingCard
        title="Аналитика выполнения"
        subtitle="Загружаем данные по полям"
        accessibilityLabel="Загрузка полевой аналитики"
      />
    );
  }

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.headerTitleWrap}>
          <Text style={styles.title}>Аналитика выполнения</Text>
          <Text style={styles.subtitle}>
            {sortedFields.length
              ? `${sortedFields.length} полей`
              : "Данные по полям пока отсутствуют"}
          </Text>
        </View>
      </View>

      <TaskProgressSummary progress={progress} />

      <View style={styles.fieldList}>
        {visibleFields.map((field) => (
          <FieldProgressCard key={field.id} field={field} />
        ))}
      </View>

      {hasHiddenFields && (
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ expanded }}
          style={styles.showMoreButton}
          onPress={toggleExpanded}
        >
          <Text style={styles.showMoreText}>
            {expanded ? "Свернуть список" : `Показать ещё ${hiddenCount} полей`}
          </Text>
          <Ionicons
            name={expanded ? "chevron-up-outline" : "chevron-down-outline"}
            size={16}
            color="#667085"
          />
        </Pressable>
      )}

      {!!transfer && (
        <View style={styles.transferSection}>
          <Text style={styles.sectionTitle}>Перегоны</Text>

          <AnalyticsMetricLine
            label="Топливо"
            value={`${formatAnalyticsNumber(transfer.fuelQuantity)} л`}
          />
          <AnalyticsMetricLine
            label="Стоимость топлива"
            value={`${formatAnalyticsNumber(transfer.fuelAmount)} ₽`}
          />
          <AnalyticsMetricLine
            label="Оплата труда"
            value={`${formatAnalyticsNumber(transfer.salary)} ₽`}
          />
        </View>
      )}
    </View>
  );
}
