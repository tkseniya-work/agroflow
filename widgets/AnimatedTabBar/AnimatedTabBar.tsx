import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { Text } from "@ui-kitten/components";
import * as Haptics from "expo-haptics";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  InteractionManager,
  Keyboard,
  Platform,
  Pressable,
  StyleSheet,
  View,
  type ViewStyle,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Colors from "../../shared/styles/Colors";

type Props = BottomTabBarProps & {
  hidden?: boolean;
  preloadRouteNames?: string[];
  visibleRouteNames?: string[];
};

type TabItemProps = {
  focused: boolean;
  label: string;
  accessibilityLabel?: string;
  icon: React.ReactNode;
  badge?: string | number;
  onPress: () => void;
  onLongPress: () => void;
};

const TAB_BAR_HIDE_TRANSLATE = 120;
const ANIMATION_DURATION = 220;

const TabItem = ({
  focused,
  label,
  accessibilityLabel,
  icon,
  badge,
  onPress,
  onLongPress,
}: TabItemProps) => {
  const focusProgress = useSharedValue(focused ? 1 : 0);
  const pressProgress = useSharedValue(0);

  useEffect(() => {
    focusProgress.value = withTiming(focused ? 1 : 0, { duration: 180 });
  }, [focusProgress, focused]);

  const animatedStyle = useAnimatedStyle<ViewStyle>(() => ({
    transform: [
      { translateY: -focusProgress.value },
      {
        scale:
          1 + focusProgress.value * 0.02 - pressProgress.value * 0.035,
      },
    ] as NonNullable<ViewStyle["transform"]>,
  }));
  const activeBackgroundStyle = useAnimatedStyle<ViewStyle>(() => ({
    opacity: focusProgress.value,
    transform: [{ scale: 0.82 + focusProgress.value * 0.18 }],
  }));

  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityState={{ selected: focused }}
      accessibilityLabel={accessibilityLabel ?? label}
      android_ripple={{ color: "rgba(11, 148, 68, 0.1)" }}
      pressRetentionOffset={8}
      onPress={onPress}
      onLongPress={onLongPress}
      onPressIn={() => {
        pressProgress.value = withTiming(1, { duration: 90 });
      }}
      onPressOut={() => {
        pressProgress.value = withTiming(0, { duration: 140 });
      }}
      style={({ pressed }) => [
        styles.itemPressable,
        pressed && styles.itemPressed,
      ]}
    >
      <Animated.View style={[styles.item, animatedStyle]}>
        <View style={styles.iconContainer}>
          <Animated.View
            pointerEvents="none"
            style={[styles.activeIconBackground, activeBackgroundStyle]}
          />
          <View style={styles.iconContent}>{icon}</View>
          {badge !== undefined ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{badge}</Text>
            </View>
          ) : null}
        </View>

        <Text
          category="c2"
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.85}
          style={[styles.label, focused && styles.labelActive]}
        >
          {label}
        </Text>
      </Animated.View>
    </Pressable>
  );
};

export const AnimatedTabBar = ({
  hidden = false,
  preloadRouteNames,
  visibleRouteNames,
  state,
  descriptors,
  navigation,
}: Props) => {
  const insets = useSafeAreaInsets();
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const shouldHide = hidden || isKeyboardVisible;
  const progress = useSharedValue(shouldHide ? 1 : 0);
  const hasPreloadedRoutesRef = useRef(false);

  useEffect(() => {
    if (!preloadRouteNames?.length || hasPreloadedRoutesRef.current) return;

    const currentRouteName = state.routes[state.index]?.name;
    const interactionTask = InteractionManager.runAfterInteractions(() => {
      hasPreloadedRoutesRef.current = true;

      preloadRouteNames.forEach((routeName) => {
        if (routeName === currentRouteName) return;

        const route = state.routes.find((item) => item.name === routeName);

        if (route) {
          navigation.preload(route.name, route.params);
        }
      });
    });

    return () => interactionTask.cancel();
  }, [navigation, preloadRouteNames, state.index, state.routes]);

  useEffect(() => {
    const keyboardShowEvent =
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const keyboardHideEvent =
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";
    const showSubscription = Keyboard.addListener(keyboardShowEvent, () => {
      setIsKeyboardVisible(true);
    });
    const hideSubscription = Keyboard.addListener(keyboardHideEvent, () => {
      setIsKeyboardVisible(false);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  useEffect(() => {
    progress.value = withTiming(shouldHide ? 1 : 0, {
      duration: ANIMATION_DURATION,
    });
  }, [progress, shouldHide]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: TAB_BAR_HIDE_TRANSLATE * progress.value,
      },
    ],
    opacity: 1 - progress.value,
  }));

  const routes = visibleRouteNames
    ? state.routes.filter((route) => visibleRouteNames.includes(route.name))
    : state.routes;

  const handleTabPress = useCallback(
    (routeKey: string, routeName: string, routeParams: object | undefined) => {
      const isFocused = state.routes[state.index]?.key === routeKey;
      const event = navigation.emit({
        type: "tabPress",
        target: routeKey,
        canPreventDefault: true,
      });

      if (!isFocused && !event.defaultPrevented) {
        void Haptics.selectionAsync().catch(() => undefined);
        navigation.navigate(routeName, routeParams);
      }
    },
    [navigation, state.index, state.routes],
  );

  return (
    <Animated.View
      testID="animated-tab-bar"
      pointerEvents={shouldHide ? "none" : "box-none"}
      style={[
        styles.positioner,
        animatedStyle,
      ]}
    >
      <View
        style={[
          styles.container,
          {
            height: 64 + insets.bottom,
            paddingBottom: insets.bottom,
            paddingLeft: 10 + insets.left,
            paddingRight: 10 + insets.right,
          },
        ]}
      >
        {routes.map((route) => {
          const descriptor = descriptors[route.key];
          const options = descriptor.options;
          const focused = state.routes[state.index]?.key === route.key;
          const activeColor = options.tabBarActiveTintColor ?? Colors.greenColor;
          const inactiveColor = options.tabBarInactiveTintColor ?? "#667085";
          const label =
            typeof options.tabBarLabel === "string"
              ? options.tabBarLabel
              : options.title ?? route.name;
          const icon = options.tabBarIcon?.({
            focused,
            color: focused ? activeColor : inactiveColor,
            size: 22,
          });

          return (
            <TabItem
              key={route.key}
              focused={focused}
              label={label}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              icon={icon}
              badge={options.tabBarBadge}
              onPress={() =>
                handleTabPress(route.key, route.name, route.params)
              }
              onLongPress={() =>
                navigation.emit({
                  type: "tabLongPress",
                  target: route.key,
                })
              }
            />
          );
        })}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  positioner: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 100,
  },
  container: {
    borderTopWidth: 1,
    borderColor: "#F2F4F7",
    backgroundColor: Colors.white,
    paddingTop: 5,
    flexDirection: "row",
    alignItems: "stretch",
    shadowColor: "#101828",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 6,
  },
  itemPressable: {
    flex: 1,
    minWidth: 0,
    minHeight: 48,
    borderRadius: 14,
    overflow: "hidden",
  },
  itemPressed: {
    opacity: 0.86,
  },
  item: {
    flex: 1,
    minWidth: 0,
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
  },
  iconContainer: {
    position: "relative",
    width: 34,
    height: 28,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  activeIconBackground: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 10,
    backgroundColor: "#F0F9F4",
  },
  iconContent: {
    zIndex: 1,
  },
  label: {
    maxWidth: "100%",
    paddingHorizontal: 3,
    color: "#667085",
    fontSize: 12,
    lineHeight: 15,
    fontWeight: "500",
    textAlign: "center",
  },
  labelActive: {
    color: Colors.greenColor,
    fontWeight: "700",
  },
  badge: {
    position: "absolute",
    top: -5,
    right: -10,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    paddingHorizontal: 4,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.error,
    borderWidth: 1.5,
    borderColor: Colors.white,
    zIndex: 2,
  },
  badgeText: {
    color: Colors.white,
    fontSize: 9,
    fontWeight: "800",
  },
});
