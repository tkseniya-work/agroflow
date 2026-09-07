import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, View } from "react-native";

import { getTabConfig, getTabTitle, UserRole } from "./config/tabsConfig";
import Colors from "../../shared/styles/Colors";

const DefaultTabIcon = ({
  activeIcon,
  color,
  focused,
  icon,
  showStatusIndicator,
  size,
}: {
  activeIcon: keyof typeof Ionicons.glyphMap;
  color: string;
  focused: boolean;
  icon: keyof typeof Ionicons.glyphMap;
  showStatusIndicator: boolean;
  size: number;
}) => (
  <View style={styles.defaultIconContainer}>
    <Ionicons
      name={focused ? activeIcon : icon}
      size={size}
      color={color}
    />
    {showStatusIndicator ? (
      <View
        accessible={false}
        testID="active-shift-indicator"
        style={styles.statusIndicator}
      />
    ) : null}
  </View>
);

type TabOptionsState = {
  showStatusIndicator?: boolean;
};

export const hasAccessToTab = (tabName: string, role: UserRole): boolean => {
  const config = getTabConfig(tabName);
  if (!config) return false;

  return config.roles.includes(role);
};

export const getTabOptions = (
  tabName: string,
  role: UserRole,
  state: TabOptionsState = {},
) => {
  const config = getTabConfig(tabName);

  if (!config) {
    return {};
  }

  return {
    title: getTabTitle(tabName, role),
    tabBarLabel: getTabTitle(tabName, role),
    tabBarAccessibilityLabel:
      tabName === "work" && state.showStatusIndicator
        ? `${getTabTitle(tabName, role)}, есть активная смена`
        : getTabTitle(tabName, role),
    tabBarIcon: ({
      color,
      focused,
      size,
    }: {
      color: string;
      focused: boolean;
      size: number;
    }) => (
      <DefaultTabIcon
        activeIcon={config.activeIcon}
        color={color}
        focused={focused}
        icon={config.icon}
        showStatusIndicator={Boolean(state.showStatusIndicator)}
        size={size}
      />
    ),
  };
};

const styles = StyleSheet.create({
  defaultIconContainer: {
    position: "relative",
  },
  statusIndicator: {
    position: "absolute",
    top: -1,
    right: -4,
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: Colors.white,
    backgroundColor: Colors.greenColor,
  },
});
