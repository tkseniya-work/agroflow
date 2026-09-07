import React, { memo, useMemo } from "react";
import { View } from "react-native";
import { Text } from "@ui-kitten/components";
import { styles } from "../styles";

type Props = {
  value?: number | null;
  unit?: string;
};

const numberFormatter = new Intl.NumberFormat("ru-RU", {
  maximumFractionDigits: 0,
});

const TaskCostValueComponent = ({ value, unit = "р" }: Props) => {
  const amount = Number(value);
  const isLargeAmount = amount >= 100000;
  const formattedValue = useMemo(() => {
    if (!Number.isFinite(amount)) {
      return "";
    }

    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(0)} млн`;
    }

    if (isLargeAmount) {
      return `${(amount / 1000).toFixed(0)} тыс`;
    }

    return numberFormatter.format(amount);
  }, [amount, isLargeAmount]);

  if (!Number.isFinite(amount)) {
    return <Text style={styles.costMuted}>Затраты не указаны</Text>;
  }

  return (
    <View style={styles.costValueWrap}>
      <Text style={[styles.costValue, isLargeAmount && styles.costValueLarge]}>
        {formattedValue}
      </Text>
      <Text style={styles.costUnit}>{unit}</Text>
    </View>
  );
};

export const TaskCostValue = memo(TaskCostValueComponent);
