/* eslint-disable @typescript-eslint/no-require-imports */

import { fireEvent, render, screen } from "@testing-library/react-native";
import React from "react";

import { ShiftsSection } from "../../widgets/Work/ShiftsSection";

jest.mock("@ui-kitten/components", () => {
  const React = require("react");
  const { Text, View } = require("react-native");

  return {
    Text,
    ViewPager: ({ children }) => React.createElement(View, null, children),
  };
});

jest.mock("../../widgets/Work/PendingShiftsSection", () => ({
  PendingShiftsSection: () => null,
}));

jest.mock("../../widgets/Work/ShiftGroupsList", () => {
  const React = require("react");
  const { Text } = require("react-native");

  return {
    ShiftGroupsList: ({ mode }) =>
      React.createElement(Text, null, `Список: ${mode}`),
  };
});

const emptyCollection = { keys: [], grouped: {} };

describe("ShiftsSection", () => {
  test("switches the selected current and archive tabs", () => {
    render(
      <ShiftsSection
        pendingOpenShifts={emptyCollection as any}
        current={emptyCollection}
        archive={emptyCollection}
        isLoading={false}
        refreshing={false}
        isConnected
        handleRefresh={jest.fn()}
        handleStopGroupShifts={jest.fn()}
        handleClosePendingShift={jest.fn()}
        handleSyncPress={jest.fn()}
        onSaveToLocal={jest.fn()}
      />,
    );

    const currentTab = screen.getByRole("tab", { name: "Текущие" });
    const archiveTab = screen.getByRole("tab", { name: "Архивные" });

    expect(currentTab.props.accessibilityState.selected).toBe(true);
    expect(archiveTab.props.accessibilityState.selected).toBe(false);
    expect(screen.getByText("Список: current")).toBeTruthy();
    expect(screen.getByText("Список: archive")).toBeTruthy();

    fireEvent.press(archiveTab);

    expect(currentTab.props.accessibilityState.selected).toBe(false);
    expect(archiveTab.props.accessibilityState.selected).toBe(true);
  });

  test("shows offline sync status inside the shifts section", () => {
    render(
      <ShiftsSection
        pendingOpenShifts={emptyCollection as any}
        current={emptyCollection}
        archive={emptyCollection}
        isLoading
        refreshing={false}
        loadingStatus="Синхронизируем офлайн-смены…"
        isConnected
        handleRefresh={jest.fn()}
        handleStopGroupShifts={jest.fn()}
        handleClosePendingShift={jest.fn()}
        handleSyncPress={jest.fn()}
        onSaveToLocal={jest.fn()}
      />,
    );

    expect(screen.getByText("Синхронизируем офлайн-смены…")).toBeTruthy();
    expect(
      screen.getByLabelText("Синхронизируем офлайн-смены…"),
    ).toBeTruthy();
  });
});
