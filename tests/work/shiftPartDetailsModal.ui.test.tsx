/* eslint-disable @typescript-eslint/no-require-imports */

import { render, screen } from "@testing-library/react-native";
import React from "react";

import { ShiftPartDetailsModal } from "../../widgets/Work/Field/Detail/task-shifts/ShiftPartDetailsModal";
import type { ShiftPartDetails } from "../../src/types/task.types";

jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ bottom: 0, left: 0, right: 0, top: 0 }),
}));

jest.mock(
  "../../widgets/Work/Field/Detail/task-shifts/MiniTrackMap",
  () => {
    const React = require("react");
    const { Text } = require("react-native");

    return {
      MiniTrackMap: () => React.createElement(Text, null, "track-map"),
    };
  },
);

const details: ShiftPartDetails = {
  type: "field",
  title: "Поле 1",
  subtitle: "08:00–18:00",
  color: "#1B8F4D",
  icon: "tractor",
  deleteTitle: "Удалить отрезок",
  deleteIds: ["part-1"],
  rows: [{ label: "Сотрудник", value: "Иванов И.И." }],
};

describe("ShiftPartDetailsModal", () => {
  test("shows read-only details without edit and delete actions", () => {
    render(
      <ShiftPartDetailsModal
        details={details}
        tracks={[]}
        isTrackLoading={false}
        onClose={jest.fn()}
      />,
    );

    expect(screen.queryByText("Изменить")).toBeNull();
    expect(screen.queryByLabelText("Изменить: Поле 1")).toBeNull();
    expect(screen.queryByText("Удалить")).toBeNull();
    expect(screen.queryByLabelText("Удалить: Поле 1")).toBeNull();
    expect(screen.getByLabelText("Закрыть подробности")).toBeTruthy();
  });
});
