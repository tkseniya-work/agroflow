/* eslint-disable @typescript-eslint/no-require-imports */
import { render, screen } from "@testing-library/react-native";
import React from "react";

import ShiftWorkItem from "../../widgets/ShiftWorkItem";
import { WorkType } from "../../entities/productionShift";

jest.mock("../../shared/ui", () => {
  const React = require("react");
  const { Text, View } = require("react-native");

  return {
    AppIcon: () => null,
    LayoutCustom: ({ children, ...props }: any) => (
      <View {...props}>{children}</View>
    ),
    Text: ({ children, ...props }: any) => (
      <Text {...props}>{children}</Text>
    ),
  };
});
jest.mock("@ui-kitten/components", () => {
  const React = require("react");
  const { Text } = require("react-native");

  return {
    Icon: () => null,
    Text: ({ children, ...props }: any) => (
      <Text {...props}>{children}</Text>
    ),
  };
});
jest.mock("../../widgets/DonutChart/DonutChart", () => () => null);
jest.mock(
  "../../widgets/TimeDetailsModal/TimeDetailsModal",
  () => () => null,
);

const createShift = (workPlaceName: string, workName: string) =>
  ({
    key: "shift-row-1",
    workType: WorkType.Field,
    workPlaceName,
    workName,
    agriculturalMachineryName: "",
    iconLink: "",
    shiftType: { id: 1 },
    startAt: "2026-07-28T07:00:00.000Z",
    endAt: "2026-07-28T08:00:00.000Z",
    time: 60,
    timeString: "1ч",
    smallStops: 0,
    smallStopsString: "0м",
    longStops: 0,
    longStopsString: "0м",
    tariffValue: "0",
    baseTariffPrice: "0",
    tariffPrice: "0",
    overtimeBonus: "0",
    experienceBonus: "0",
  }) as any;

test("shift card replaces dictionary placeholders after dictionaries load", () => {
  const view = render(
    <ShiftWorkItem
      item={createShift("Техника не указана", "Работа не указана")}
    />,
  );

  expect(screen.getByText("Техника не указана")).toBeTruthy();
  expect(screen.getByText("Работа не указана")).toBeTruthy();

  view.rerender(
    <ShiftWorkItem item={createShift("Кировец К-744", "Дискование")} />,
  );

  expect(screen.getByText("Кировец К-744")).toBeTruthy();
  expect(screen.getByText("Дискование")).toBeTruthy();
  expect(screen.queryByText("Техника не указана")).toBeNull();
  expect(screen.queryByText("Работа не указана")).toBeNull();
});
