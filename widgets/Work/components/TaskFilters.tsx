import { Ionicons } from "@expo/vector-icons";
import React, { memo, useCallback } from "react";
import { FlatList, TouchableOpacity } from "react-native";
import { Text } from "@ui-kitten/components";

import { TaskFilterType } from "../../../src/utils/taskUtils";
import Colors from "../../../shared/styles/Colors";
import { styles } from "../styles";

type Props = {
  filters: { title: string; type: TaskFilterType }[];
  activeTaskChip: TaskFilterType;
  onChange: (type: TaskFilterType) => void;
  onSearch?: () => void;
};

const TaskFiltersComponent = ({
  filters,
  activeTaskChip,
  onChange,
  onSearch,
}: Props) => {
  const keyExtractor = useCallback(
    (item: { title: string; type: TaskFilterType }) => item.type,
    [],
  );

  const renderItem = useCallback(
    ({ item }: { item: { title: string; type: TaskFilterType } }) => {
      const active = activeTaskChip === item.type;

      return (
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => {
            if (!active) {
              onChange(item.type);
            }
          }}
          style={[styles.taskChip, active && styles.taskChipActive]}
        >
          <Text
            style={[
              styles.taskChipText,
              active && styles.taskChipTextActive,
            ]}
          >
            {item.title}
          </Text>
        </TouchableOpacity>
      );
    },
    [activeTaskChip, onChange],
  );

  return (
    <FlatList
      horizontal
      data={filters}
      keyExtractor={keyExtractor}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.taskChips}
      style={styles.taskChipsWrapper}
      ListHeaderComponent={
        onSearch ? (
          <TouchableOpacity
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel="Открыть поиск"
            onPress={onSearch}
            style={styles.taskSearchChip}
          >
            <Ionicons
              name="search-outline"
              size={17}
              color={Colors.grey700}
            />
            <Text style={styles.taskSearchChipText}>Поиск</Text>
          </TouchableOpacity>
        ) : null
      }
      renderItem={renderItem}
    />
  );
};

export const TaskFilters = memo(TaskFiltersComponent);
