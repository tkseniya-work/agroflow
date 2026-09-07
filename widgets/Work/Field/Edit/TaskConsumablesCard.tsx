import { Ionicons } from "@expo/vector-icons";
import { Text } from "@ui-kitten/components";
import React, { memo } from "react";
import { ActivityIndicator, Pressable, View } from "react-native";

import type { ProductionTaskField , ProductionTaskConsumableType } from "../../../../entities/productionTask";
import Colors from "../../../../shared/styles/Colors";
import {
  type ConsumableListItem,
  normTypeLabels,
} from "./TaskConsumables.logic";
import { styles } from "./TaskConsumables.styles";
import type { ConsumableTab } from "./TaskConsumables.types";
import { TaskConsumableRow } from "./TaskConsumableRow";

const CONSUMABLE_TYPES: ProductionTaskConsumableType[] = [
  "seed",
  "pesticide",
  "fertilizer",
];

type Props = {
  selectedField: ProductionTaskField | null;
  activeTab: ConsumableTab;
  items: ConsumableListItem[];
  deletingId: string | null;
  isDataLoading: boolean;
  onTabChange: (tab: ConsumableTab) => void;
  onOpenFieldPicker: () => void;
  onAdd: (type: ProductionTaskConsumableType) => void;
  onEdit: (type: ProductionTaskConsumableType, item: any) => void;
  onDelete: (type: ProductionTaskConsumableType, id: string) => void;
};

const TaskConsumablesCardComponent = ({
  selectedField,
  activeTab,
  items,
  deletingId,
  isDataLoading,
  onTabChange,
  onOpenFieldPicker,
  onAdd,
  onEdit,
  onDelete,
}: Props) => (
  <View style={styles.card}>
    <View style={styles.header}>
      <View style={styles.headerTitleWrap}>
        <Text style={styles.title}>Расходники</Text>
        <Text style={styles.subtitle}>Нормативные и плановые</Text>
      </View>

      <View style={styles.countChip}>
        <Text style={styles.countChipText}>{items.length}</Text>
      </View>
    </View>

    {isDataLoading && (
      <View style={styles.loadingNotice}>
        <ActivityIndicator size="small" color={Colors.greenColor} />
        <Text style={styles.loadingNoticeText}>
          Догружаем справочники расходников...
        </Text>
      </View>
    )}

    <Pressable
      style={styles.fieldSelector}
      onPress={onOpenFieldPicker}
      accessibilityRole="button"
      accessibilityLabel="Выбрать поле для расходников"
    >
      <View style={styles.fieldSelectorContent}>
        <Text style={styles.fieldSelectorLabel}>Поле</Text>
        <Text style={styles.fieldSelectorValue} numberOfLines={1}>
          {selectedField?.name || selectedField?.number || "Выбрать поле"}
        </Text>
      </View>
      <Ionicons name="chevron-down" size={18} color="#667085" />
    </Pressable>

    <View style={styles.tabs} accessibilityRole="tablist">
      {([
        { id: "norm", title: "Норма" },
        { id: "plan", title: "План" },
      ] as const).map((tab) => {
        const isActive = activeTab === tab.id;

        return (
          <Pressable
            key={tab.id}
            style={[styles.tab, isActive && styles.tabActive]}
            onPress={() => onTabChange(tab.id)}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
          >
            <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
              {tab.title}
            </Text>
          </Pressable>
        );
      })}
    </View>

    {activeTab === "norm" && (
      <View style={styles.addButtons}>
        {CONSUMABLE_TYPES.map((type) => (
          <Pressable
            key={type}
            style={[styles.addChip, isDataLoading && styles.addChipDisabled]}
            onPress={() => onAdd(type)}
            disabled={isDataLoading}
            accessibilityRole="button"
            accessibilityLabel={`Добавить: ${normTypeLabels[type]}`}
          >
            <Ionicons name="add" size={16} color={Colors.greenColor} />
            <Text style={styles.addChipText}>{normTypeLabels[type]}</Text>
          </Pressable>
        ))}
      </View>
    )}

    <View style={styles.list}>
      {items.length ? (
        items.map(({ type, item }, index) => (
          <TaskConsumableRow
            key={`${type}-${item.id ?? index}`}
            type={type}
            item={item}
            editable={activeTab === "norm"}
            isDeleting={deletingId === item.id}
            onEdit={() => onEdit(type, item)}
            onDelete={() => onDelete(type, item.id)}
          />
        ))
      ) : (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyText}>
            {activeTab === "norm"
              ? "Нормативные расходники отсутствуют"
              : "Плановые расходники отсутствуют"}
          </Text>
        </View>
      )}
    </View>
  </View>
);

export const TaskConsumablesCard = memo(TaskConsumablesCardComponent);
