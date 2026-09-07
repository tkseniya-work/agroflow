import { fireEvent, render, screen } from "@testing-library/react-native";
import React from "react";

import {
  TaskAnalytics,
  TechniqueAnalytics,
} from "../../widgets/Work/Field/Detail/task-detail/TaskAnalytics";
import type { AnalyticsField } from "../../widgets/Work/Field/Detail/task-detail/TaskAnalytics.types";

const createField = (
  name: string,
  factArea: number,
  totalArea = 100,
): AnalyticsField => ({
  id: name,
  name,
  factArea,
  totalArea,
  fuelPerHa: 2,
  fuelAmountPerHa: 120,
  fertilizersPerHa: 3,
  fertilizersAmountPerHa: 90,
  pesticidesPerHa: 1,
  pesticidesAmountPerHa: 40,
  seedsPerHa: 4,
  seedsAmountPerHa: 60,
  seedsUnit: "кг/га",
  salary: 1000,
});

const createAnalytics = (fields: AnalyticsField[]) => ({
  fields,
  transfer: null,
  progress: {
    completed: 250,
    needToDo: 600,
    percent: 41.7,
  },
});

describe("TaskAnalytics", () => {
  test("shows a loading state instead of unconfirmed analytics", () => {
    render(
      <TaskAnalytics
        analyticByFields={createAnalytics([createField("Северное", 50)])}
        isLoading
      />,
    );

    expect(screen.getByLabelText("Загрузка полевой аналитики")).toBeTruthy();
    expect(screen.getByText("Загружаем аналитику")).toBeTruthy();
    expect(screen.queryByText("Северное")).toBeNull();
  });

  test("sorts fields by completion and expands the collapsed list", () => {
    const fields = [
      createField("Поле 50", 50),
      createField("Поле 100", 100),
      createField("Поле 80", 80),
      createField("Поле 70", 70),
      createField("Поле 60", 60),
      createField("Поле 10", 10),
    ];
    render(<TaskAnalytics analyticByFields={createAnalytics(fields)} />);

    expect(
      screen
        .getAllByLabelText(/Показатели поля/)
        .map((item) => item.props.accessibilityLabel),
    ).toEqual([
      "Показатели поля Поле 100",
      "Показатели поля Поле 80",
      "Показатели поля Поле 70",
      "Показатели поля Поле 60",
      "Показатели поля Поле 50",
    ]);
    expect(screen.queryByText("Поле 10")).toBeNull();

    fireEvent.press(screen.getByText("Показать ещё 1 полей"));
    expect(screen.getByText("Поле 10")).toBeTruthy();
    expect(screen.getByText("Свернуть список")).toBeTruthy();

    fireEvent.press(screen.getByText("Свернуть список"));
    expect(screen.queryByText("Поле 10")).toBeNull();
  });

  test("shows an empty subtitle and expands field cost details", () => {
    const { rerender } = render(
      <TaskAnalytics analyticByFields={createAnalytics([])} />,
    );

    expect(screen.getByText("Данные по полям пока отсутствуют")).toBeTruthy();

    const field = createField("Северное", 50);
    rerender(<TaskAnalytics analyticByFields={createAnalytics([field])} />);

    expect(screen.queryByText("Удобрения")).toBeNull();
    fireEvent.press(screen.getByLabelText("Показатели поля Северное"));

    expect(screen.getByText("Удобрения")).toBeTruthy();
    expect(
      screen.getByLabelText("Показатели поля Северное").props
        .accessibilityState.expanded,
    ).toBe(true);
  });
});

describe("TechniqueAnalytics", () => {
  test("shows empty monitoring state and technique metrics", () => {
    const { rerender } = render(<TechniqueAnalytics techniques={[]} />);

    expect(
      screen.getByText("Нет данных из мониторинга транспорта"),
    ).toBeTruthy();

    rerender(
      <TechniqueAnalytics
        techniques={[
          {
            id: "technique-1",
            name: "Трактор",
            stateNumber: "А123",
            loading: 72.6,
            performance: 12.5,
            fuelConsumptionPerHa: 7.25,
          },
        ]}
      />,
    );

    expect(screen.getByText("Загрузка техники")).toBeTruthy();
    expect(screen.getByText("73%")).toBeTruthy();
    expect(screen.getByText("12,5 га/час")).toBeTruthy();
    expect(screen.getByText("7,25 л/га")).toBeTruthy();
  });
});
