import { fireEvent, render, screen } from "@testing-library/react-native";
import React from "react";

import {
  TaskEditLoadError,
  TaskEditLoading,
} from "../../widgets/Work/Field/Edit/TaskEditLoadState";

describe("Task edit load state", () => {
  test("shows the page structure and explains what is loading", () => {
    render(<TaskEditLoading bottomInset={24} />);

    expect(
      screen.getByLabelText("Загрузка страницы редактирования задания"),
    ).toBeTruthy();
    expect(screen.getByText("Подготавливаем задание")).toBeTruthy();
    expect(
      screen.getByText("Загружаем поля, технику и расходники"),
    ).toBeTruthy();
  });

  test("offers retry when the task cannot be loaded", () => {
    const onRetry = jest.fn();

    render(<TaskEditLoadError bottomInset={0} onRetry={onRetry} />);

    expect(screen.getByText("Не удалось загрузить задание")).toBeTruthy();
    fireEvent.press(
      screen.getByRole("button", { name: "Повторить загрузку" }),
    );

    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  test("offers return from the detailed error state", () => {
    const onBack = jest.fn();

    render(
      <TaskEditLoadError
        bottomInset={0}
        onRetry={jest.fn()}
        onBack={onBack}
      />,
    );

    fireEvent.press(screen.getByRole("button", { name: "Назад" }));

    expect(onBack).toHaveBeenCalledTimes(1);
  });
});
