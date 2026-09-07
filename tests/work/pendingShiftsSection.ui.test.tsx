/* eslint-disable @typescript-eslint/no-require-imports */

import { fireEvent, render, screen } from "@testing-library/react-native";
import React from "react";
import { Alert } from "react-native";

import { PendingShiftsSection } from "../../widgets/Work/PendingShiftsSection";

jest.mock("../../shared/ui", () => ({
  AppIcon: () => null,
}));

jest.mock("../../widgets/PendingShiftCard/PendingShiftCard", () => {
  const React = require("react");
  const { Text } = require("react-native");

  return {
    PendingShiftCard: ({ shift }) =>
      React.createElement(Text, null, `Отрезок: ${shift.workplaceName}`),
  };
});

const groupKey = "Первая смена_2026-07-20";

const openShift = {
  id: "open",
  key: "open-key",
  shiftType: 1,
  scannedAt: "2026-07-20T10:00:00.000Z",
  openAt: "2026-07-20T10:00:00.000Z",
  workplaceName: "Поле 1",
} as any;

const closedShift = {
  id: "closed",
  key: "closed-key",
  shiftType: 1,
  scannedAt: "2026-07-20T08:00:00.000Z",
  endedAt: "2026-07-20T09:00:00.000Z",
  openAt: "2026-07-20T08:00:00.000Z",
  workplaceName: "Поле 2",
} as any;

describe("PendingShiftsSection", () => {
  test("starts synchronization and confirms closing active shifts", () => {
    const onSyncPress = jest.fn();
    const onCloseShifts = jest.fn();
    const alertSpy = jest.spyOn(Alert, "alert").mockImplementation(jest.fn());

    render(
      <PendingShiftsSection
        pendingShifts={{
          keys: [groupKey],
          grouped: { [groupKey]: [openShift, closedShift] },
        }}
        activeShiftsByGroup={{ [groupKey]: [openShift] }}
        onCloseShifts={onCloseShifts}
        onSyncPress={onSyncPress}
      />,
    );

    expect(screen.getByText("Ожидают отправки")).toBeTruthy();
    expect(screen.getByText("Отрезок: Поле 1")).toBeTruthy();
    expect(screen.getByText("Отрезок: Поле 2")).toBeTruthy();

    fireEvent.press(screen.getByText("Отправить"));
    fireEvent.press(screen.getByLabelText(/Закрыть офлайн-смену/));

    expect(onSyncPress).toHaveBeenCalledTimes(1);
    expect(alertSpy).toHaveBeenCalledWith(
      "Закрытие офлайн-отрезков",
      expect.stringContaining("Первая смена"),
      expect.any(Array),
    );

    const actions = alertSpy.mock.calls[0][2] as any[];
    actions[1].onPress();
    expect(onCloseShifts).toHaveBeenCalledWith([openShift]);

    alertSpy.mockRestore();
  });

  test("marks a group without active shifts as closed", () => {
    render(
      <PendingShiftsSection
        pendingShifts={{
          keys: [groupKey],
          grouped: { [groupKey]: [closedShift] },
        }}
        activeShiftsByGroup={{ [groupKey]: [] }}
        onCloseShifts={jest.fn()}
        onSyncPress={jest.fn()}
      />,
    );

    expect(screen.getByText("Закрыта")).toBeTruthy();
    expect(screen.queryByLabelText(/Закрыть офлайн-смену/)).toBeNull();
  });
});
