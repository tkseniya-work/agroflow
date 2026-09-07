import { Ionicons } from "@expo/vector-icons";
import React, { memo, useCallback } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Text } from "@ui-kitten/components";

import Colors from "../../../../../shared/styles/Colors";

export type TaskDetailTab = "info" | "mapShifts" | "analytics";

const tabs: {
  id: TaskDetailTab;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}[] = [
  {
    id: "info",
    label: "Информация",
    icon: "information-circle-outline",
  },
  {
    id: "mapShifts",
    label: "Мониторинг",
    icon: "map-outline",
  },
  {
    id: "analytics",
    label: "Аналитика",
    icon: "analytics-outline",
  },
];

export function DetailTabs({
  activeTab,
  onChange,
}: {
  activeTab: TaskDetailTab;
  onChange: (tab: TaskDetailTab) => void;
}) {
  return (
    <View style={styles.tabs}>
      {tabs.map((tab) => (
        <DetailTabButton
          key={tab.id}
          tab={tab}
          active={activeTab === tab.id}
          onChange={onChange}
        />
      ))}
    </View>
  );
}

const DetailTabButton = memo(function DetailTabButton({
  tab,
  active,
  onChange,
}: {
  tab: (typeof tabs)[number];
  active: boolean;
  onChange: (tab: TaskDetailTab) => void;
}) {
  const handlePress = useCallback(() => {
    onChange(tab.id);
  }, [onChange, tab.id]);

  return (
    <Pressable
      style={[styles.tabButton, active && styles.tabButtonActive]}
      onPress={handlePress}
    >
      <Ionicons
        name={tab.icon}
        size={16}
        color={active ? Colors.greenColor : "#667085"}
      />
      <Text
        style={[
          styles.tabButtonText,
          active && styles.tabButtonTextActive,
        ]}
        numberOfLines={1}
      >
        {tab.label}
      </Text>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  tabs: {
    flexDirection: "row",
    gap: 8,
    padding: 4,
    borderRadius: 18,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: "#EAECF0",
  },
  tabButton: {
    flex: 1,
    minHeight: 42,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    paddingHorizontal: 6,
  },
  tabButtonActive: {
    backgroundColor: "#ECFDF3",
  },
  tabButtonText: {
    flexShrink: 1,
    fontSize: 11,
    fontWeight: "800",
    color: "#667085",
  },
  tabButtonTextActive: {
    color: Colors.greenColor,
  },
});
