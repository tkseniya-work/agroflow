import { fireEvent, render, screen } from "@testing-library/react-native";
import React from "react";
import { Animated } from "react-native";

import { TaskListControls } from "../../widgets/Work/TaskListControls";

const animationTimingSpy = jest
  .spyOn(Animated, "timing")
  .mockImplementation(
    () =>
      ({
        start: (callback?: (result: { finished: boolean }) => void) =>
          callback?.({ finished: true }),
        stop: jest.fn(),
        reset: jest.fn(),
      }) as any,
  );

afterAll(() => {
  animationTimingSpy.mockRestore();
});

const renderControls = (searchQuery = "") => {
  const onFilterChange = jest.fn();
  const onSearchQueryChange = jest.fn();
  const view = render(
    <TaskListControls
      activeTaskFilter="all"
      searchQuery={searchQuery}
      onFilterChange={onFilterChange}
      onSearchQueryChange={onSearchQueryChange}
    />,
  );

  return { onFilterChange, onSearchQueryChange, ...view };
};

describe("TaskListControls", () => {
  test("opens search and forwards the entered query", () => {
    const { onSearchQueryChange } = renderControls();

    expect(
      screen.getByLabelText("Строка поиска заданий").props
        .accessibilityState.expanded,
    ).toBe(false);

    fireEvent.press(screen.getByLabelText("Открыть поиск"));
    expect(
      screen.getByLabelText("Строка поиска заданий").props
        .accessibilityState.expanded,
    ).toBe(true);

    fireEvent.changeText(
      screen.getByPlaceholderText("Название или комментарий"),
      "посев",
    );
    expect(onSearchQueryChange).toHaveBeenCalledWith("посев");
  });

  test("clears the query and closes search", () => {
    const { onSearchQueryChange } = renderControls("посев");

    fireEvent.press(screen.getByLabelText("Открыть поиск"));
    fireEvent.press(screen.getByLabelText("Очистить поиск"));
    expect(onSearchQueryChange).toHaveBeenLastCalledWith("");

    onSearchQueryChange.mockClear();
    fireEvent.press(screen.getByLabelText("Закрыть поиск"));

    expect(onSearchQueryChange).toHaveBeenCalledWith("");
    expect(
      screen.getByLabelText("Строка поиска заданий").props
        .accessibilityState.expanded,
    ).toBe(false);
  });

  test("forwards a selected task type", () => {
    const { onFilterChange } = renderControls();

    fireEvent.press(screen.getByText("Полевые"));

    expect(onFilterChange).toHaveBeenCalledWith("field");
  });
});
