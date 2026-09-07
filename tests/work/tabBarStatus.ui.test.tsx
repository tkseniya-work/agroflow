import { fireEvent, render, screen } from "@testing-library/react-native";
import React from "react";

import TabBar from "../../shared/ui/TabBar";

jest.mock("@ui-kitten/components", () => {
  const { Text } = jest.requireActual("react-native");

  return {
    StyleService: { create: (styles: object) => styles },
    Text,
    useTheme: () => ({
      "background-basic-color-1": "#FFFFFF",
      "background-basic-color-3": "#F2F4F7",
      "background-basic-color-4": "#EAECF0",
      "color-basic-100": "#FFFFFF",
      "color-primary-default": "#0B9444",
    }),
  };
});

describe("work section TabBar", () => {
  test("shows active shift status only on the Shifts section", () => {
    const onChangeTab = jest.fn();

    render(
      <TabBar
        tabs={["Задания", "Смены"]}
        tabActive={0}
        indicatorIndexes={[1]}
        onChangeTab={onChangeTab}
      />,
    );

    expect(screen.getByTestId("tab-status-indicator-1")).toBeTruthy();
    expect(screen.queryByTestId("tab-status-indicator-0")).toBeNull();
    expect(
      screen.getByRole("tab", { name: "Смены, есть активная смена" }),
    ).toBeTruthy();

    fireEvent.press(screen.getByRole("tab", { name: "Задания" }));
    expect(onChangeTab).toHaveBeenCalledWith(0);
  });

  test("does not show an indicator without an active shift", () => {
    render(
      <TabBar
        tabs={["Задания", "Смены"]}
        tabActive={0}
        onChangeTab={jest.fn()}
      />,
    );

    expect(screen.queryByTestId("tab-status-indicator-1")).toBeNull();
  });
});
