import {
  act,
  fireEvent,
  render,
  screen,
} from "@testing-library/react-native";
import * as Haptics from "expo-haptics";
import React from "react";
import {
  InteractionManager,
  Keyboard,
  Platform,
  Text,
  View,
} from "react-native";

import { AnimatedTabBar } from "../../widgets/AnimatedTabBar";

jest.mock("expo-haptics", () => ({
  selectionAsync: jest.fn().mockResolvedValue(undefined),
}));

jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 24, left: 0 }),
}));

jest.mock("react-native-reanimated", () => {
  const { View: NativeView } = jest.requireActual("react-native");

  return {
    __esModule: true,
    default: { View: NativeView },
    useSharedValue: (value: number) => ({ value }),
    withTiming: (value: number) => value,
    useAnimatedStyle: (factory: () => object) => factory(),
  };
});

const routes = [
  { key: "index-key", name: "index", params: undefined },
  { key: "work-key", name: "work", params: undefined },
  { key: "map-key", name: "map", params: undefined },
  { key: "profile-key", name: "profile", params: undefined },
];

const labels: Record<string, string> = {
  index: "Главная",
  work: "Смены",
  map: "Карта",
  profile: "Профиль",
};

const createProps = () => {
  const navigation = {
    emit: jest.fn(() => ({ defaultPrevented: false })),
    navigate: jest.fn(),
    preload: jest.fn(),
  };
  const descriptors = Object.fromEntries(
    routes.map((route) => [
      route.key,
      {
        options: {
          title: labels[route.name],
          tabBarIcon: () => (
            <View>
              <Text>{`${route.name}-icon`}</Text>
            </View>
          ),
        },
      },
    ]),
  );

  return {
    navigation,
    props: {
      state: {
        index: 0,
        routes,
      },
      descriptors,
      navigation,
      insets: { top: 0, right: 0, bottom: 24, left: 0 },
    } as any,
  };
};

describe("AnimatedTabBar", () => {
  const keyboardListeners = new Map<string, () => void>();

  beforeEach(() => {
    jest.clearAllMocks();
    keyboardListeners.clear();
    jest.spyOn(Keyboard, "addListener").mockImplementation((event, callback) => {
      keyboardListeners.set(event, callback as () => void);

      return { remove: jest.fn() } as any;
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("shows only routes available to the current role", () => {
    const { props } = createProps();

    render(
      <AnimatedTabBar
        {...props}
        visibleRouteNames={["index", "work", "profile"]}
      />,
    );

    expect(screen.getByRole("tab", { name: "Главная" })).toBeTruthy();
    expect(screen.getByRole("tab", { name: "Смены" })).toBeTruthy();
    expect(screen.getByRole("tab", { name: "Профиль" })).toBeTruthy();
    expect(screen.queryByRole("tab", { name: "Карта" })).toBeNull();
  });

  test("navigates with haptic feedback when another tab is selected", () => {
    const { navigation, props } = createProps();

    render(<AnimatedTabBar {...props} />);
    fireEvent.press(screen.getByRole("tab", { name: "Смены" }));

    expect(navigation.emit).toHaveBeenCalledWith({
      type: "tabPress",
      target: "work-key",
      canPreventDefault: true,
    });
    expect(navigation.navigate).toHaveBeenCalledWith("work", undefined);
    expect(Haptics.selectionAsync).toHaveBeenCalledTimes(1);
  });

  test("hides while the keyboard is open and returns after it closes", () => {
    const { props } = createProps();
    const showEvent =
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent =
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    render(<AnimatedTabBar {...props} />);

    expect(screen.getByTestId("animated-tab-bar").props.pointerEvents).toBe(
      "box-none",
    );

    act(() => keyboardListeners.get(showEvent)?.());

    expect(screen.getByTestId("animated-tab-bar").props.pointerEvents).toBe(
      "none",
    );

    act(() => keyboardListeners.get(hideEvent)?.());

    expect(screen.getByTestId("animated-tab-bar").props.pointerEvents).toBe(
      "box-none",
    );
  });

  test("preloads only configured lightweight routes after interactions", () => {
    const { navigation, props } = createProps();
    const cancel = jest.fn();
    jest
      .spyOn(InteractionManager, "runAfterInteractions")
      .mockImplementation((callback) => {
        if (typeof callback === "function") {
          callback();
        } else {
          void callback?.gen();
        }

        return { cancel } as any;
      });

    const { unmount } = render(
      <AnimatedTabBar
        {...props}
        preloadRouteNames={["index", "profile"]}
      />,
    );

    expect(navigation.preload).toHaveBeenCalledTimes(1);
    expect(navigation.preload).toHaveBeenCalledWith("profile", undefined);
    expect(navigation.preload).not.toHaveBeenCalledWith("map", undefined);

    unmount();
    expect(cancel).toHaveBeenCalledTimes(1);
  });
});
