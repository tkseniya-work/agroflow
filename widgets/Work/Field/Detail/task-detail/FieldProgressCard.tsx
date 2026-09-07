import { Ionicons } from "@expo/vector-icons";
import { Text } from "@ui-kitten/components";
import React, { memo, useCallback, useState } from "react";
import { Pressable, View } from "react-native";

import { AnalyticsMetricLine } from "./AnalyticsMetricLine";
import { styles } from "./TaskAnalytics.styles";
import type { AnalyticsField } from "./TaskAnalytics.types";
import {
  formatAnalyticsNumber,
  getAnalyticsPercent,
  getFieldProgressColor,
} from "./taskAnalytics.formatters";

export const FieldProgressCard = memo(function FieldProgressCard({
  field,
}: {
  field: AnalyticsField;
}) {
  const [open, setOpen] = useState(false);
  const donePercent = getAnalyticsPercent(field.factArea, field.totalArea);
  const wagePerHa = field.factArea ? field.salary / field.factArea : 0;
  const totalCostsPerHa =
    field.fuelAmountPerHa +
    field.fertilizersAmountPerHa +
    field.pesticidesAmountPerHa +
    field.seedsAmountPerHa +
    wagePerHa;
  const totalCosts = totalCostsPerHa * field.factArea;
  const donePercentRounded = Math.round(donePercent);
  const statusColor = getFieldProgressColor(donePercent);
  const toggleOpen = useCallback(() => {
    setOpen((prev) => !prev);
  }, []);

  return (
    <View style={[styles.fieldCard, { borderLeftColor: statusColor }]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Показатели поля ${field.name}`}
        accessibilityState={{ expanded: open }}
        style={styles.fieldMain}
        onPress={toggleOpen}
      >
        <View style={styles.fieldTopRow}>
          <View style={styles.fieldNameWrap}>
            <Text style={styles.fieldName} numberOfLines={1}>
              {field.name}
            </Text>

            <View style={styles.areaPillsRow}>
              <View style={styles.areaPill}>
                <Text style={styles.areaPillLabel}>Факт</Text>
                <Text style={styles.areaPillValue}>
                  {formatAnalyticsNumber(field.factArea)} га
                </Text>
              </View>
              <View style={styles.areaPill}>
                <Text style={styles.areaPillLabel}>План</Text>
                <Text style={styles.areaPillValue}>
                  {formatAnalyticsNumber(field.totalArea)} га
                </Text>
              </View>
            </View>
          </View>

          <View
            style={[
              styles.percentBadge,
              { backgroundColor: `${statusColor}1A` },
            ]}
          >
            <Text style={[styles.percentBadgeText, { color: statusColor }]}>
              {donePercentRounded}%
            </Text>
          </View>

          <Ionicons
            name={open ? "chevron-up-outline" : "chevron-down-outline"}
            size={17}
            color="#667085"
          />
        </View>

        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${donePercent}%`,
                backgroundColor: getFieldProgressColor(donePercent),
              },
            ]}
          />
        </View>

        <View style={styles.costRow}>
          <View style={styles.costChip}>
            <Ionicons name="cash-outline" size={13} color="#667085" />
            <Text style={styles.costValue}>
              {formatAnalyticsNumber(totalCosts)} ₽
            </Text>
          </View>
          <Text style={styles.costCaption}>
            {formatAnalyticsNumber(totalCostsPerHa)} ₽/га
          </Text>
        </View>
      </Pressable>

      {open && (
        <View style={styles.details}>
          <AnalyticsMetricLine
            label="Топливо"
            value={`${formatAnalyticsNumber(field.fuelPerHa)} л/га`}
            caption={`${formatAnalyticsNumber(field.fuelAmountPerHa)} ₽/га`}
          />
          <AnalyticsMetricLine
            label="Удобрения"
            value={`${formatAnalyticsNumber(field.fertilizersPerHa)} кг/га`}
            caption={`${formatAnalyticsNumber(
              field.fertilizersAmountPerHa,
            )} ₽/га`}
          />
          <AnalyticsMetricLine
            label="СЗР"
            value={`${formatAnalyticsNumber(field.pesticidesPerHa)} л/га`}
            caption={`${formatAnalyticsNumber(
              field.pesticidesAmountPerHa,
            )} ₽/га`}
          />
          <AnalyticsMetricLine
            label="Семена"
            value={
              field.seedsPerHa
                ? `${formatAnalyticsNumber(field.seedsPerHa)} ${field.seedsUnit}`
                : "—"
            }
            caption={`${formatAnalyticsNumber(field.seedsAmountPerHa)} ₽/га`}
          />
          <AnalyticsMetricLine
            label="ФОТ"
            value={`${formatAnalyticsNumber(wagePerHa)} ₽/га`}
            caption={`${formatAnalyticsNumber(field.salary)} ₽`}
          />
        </View>
      )}
    </View>
  );
});
