import { Tabs } from "expo-router";
import React, { useMemo } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  useEmployeeInfo,
  useOfflineShiftQueue,
  useProductionShiftData,
} from "../../features/localData/useLocalData";
import { getTabOptions, hasAccessToTab } from "../../src/utils/tabAccessUtils";
import Colors from "../../shared/styles/Colors";
import { UserRole } from "../../src/utils/config/tabsConfig";
import { AnimatedTabBar } from "../../widgets/AnimatedTabBar";
import { useTabBarHidden } from "../../shared/lib/tabBarVisibility";
import { hasActiveShift } from "../../src/utils/activeShiftStatus";

// This trimmed sample keeps only the work and map tabs (plus the login
// flow) — the original app also had a home and a profile tab.
const LIGHTWEIGHT_PRELOAD_ROUTES = ["work"];

function TabsNavigator() {
  const employeeInfo = useEmployeeInfo();
  const isTabBarHidden = useTabBarHidden();
  const insets = useSafeAreaInsets();
  const storedShifts = useProductionShiftData();
  const { closeProductionShift, openProductionShift } = useOfflineShiftQueue();
  const isShiftActive = useMemo(
    () =>
      hasActiveShift({
        storedShifts,
        pendingOpenShifts: openProductionShift,
        pendingCloseShifts: closeProductionShift,
        employeeId: employeeInfo?.id,
      }),
    [
      closeProductionShift,
      employeeInfo?.id,
      openProductionShift,
      storedShifts,
    ],
  );

  const userRole = useMemo<UserRole | null>(() => {
    return (employeeInfo?.employees?.role as UserRole) ?? null;
  }, [employeeInfo?.employees?.role]);

  const access = useMemo(
    () => ({
      work: hasAccessToTab("work", userRole),
      map: hasAccessToTab("map", userRole),
    }),
    [userRole]
  );
  const visibleRouteNames = useMemo(
    () =>
      Object.entries(access)
        .filter(([, isVisible]) => isVisible)
        .map(([routeName]) => routeName),
    [access],
  );
  const preloadRouteNames = useMemo(
    () =>
      LIGHTWEIGHT_PRELOAD_ROUTES.filter((routeName) =>
        visibleRouteNames.includes(routeName),
      ),
    [visibleRouteNames],
  );

  const screenOptions = useMemo(
    () => ({
      headerShown: true,
      tabBarActiveTintColor: Colors.greenColor,
      tabBarInactiveTintColor: "#667085",
      tabBarStyle: {
        position: "absolute" as const,
        left: 0,
        right: 0,
        bottom: 0,
        height: 64 + insets.bottom,
        backgroundColor: "transparent",
        borderTopWidth: 0,
        elevation: 0,
      },
    }),
    [insets.bottom]
  );

  return (
    <Tabs
      tabBar={(props) => (
        <AnimatedTabBar
          {...props}
          hidden={isTabBarHidden}
          preloadRouteNames={preloadRouteNames}
          visibleRouteNames={visibleRouteNames}
        />
      )}
      screenOptions={screenOptions}
    >
      <Tabs.Screen
        name="work"
        options={{
          ...getTabOptions("work", userRole, {
            showStatusIndicator: isShiftActive,
          }),
          href: access.work ? undefined : null,
        }}
      />

      <Tabs.Screen
        name="map"
        options={{
          ...getTabOptions("map", userRole),
          href: access.map ? undefined : null,
        }}
      />
    </Tabs>
  );
}

export default function TabsLayout() {
  return <TabsNavigator />;
}
