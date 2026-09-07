import { render, screen } from "@testing-library/react-native";
import React from "react";

import { getTabOptions } from "../../src/utils/tabAccessUtils";

describe("work tab status", () => {
  test("shows an indicator only when a shift is active", () => {
    const activeOptions = getTabOptions("work", null, {
      showStatusIndicator: true,
    });
    expect(activeOptions.tabBarAccessibilityLabel).toBe(
      "Смены, есть активная смена",
    );
    const activeIcon = activeOptions.tabBarIcon?.({
      color: "#667085",
      focused: false,
      size: 22,
    });
    const { unmount } = render(activeIcon as React.ReactElement);

    expect(screen.getByTestId("active-shift-indicator")).toBeTruthy();

    unmount();

    const inactiveOptions = getTabOptions("work", null);
    const inactiveIcon = inactiveOptions.tabBarIcon?.({
      color: "#667085",
      focused: false,
      size: 22,
    });
    render(inactiveIcon as React.ReactElement);

    expect(screen.queryByTestId("active-shift-indicator")).toBeNull();
  });
});
