import { fireEvent, render, screen } from "@testing-library/react-native";
import React from "react";
import { Text } from "react-native";

import { ShiftPartActions } from "../../widgets/Work/Field/Detail/task-shifts/ShiftPartActions";
import type { ShiftPartDetails } from "../../src/types/task.types";

describe("ShiftPartActions", () => {
  test("opens the bottom menu with edit and delete actions", () => {
    const onEdit = jest.fn();
    const onDelete = jest.fn();
    const details: ShiftPartDetails = {
      type: "field",
      title: "Поле 1",
      subtitle: "08:00–18:00",
      color: "#1B8F4D",
      icon: "tractor",
      deleteTitle: "Удалить отрезок",
      deleteIds: ["part-1"],
      rows: [],
    };

    render(
      <ShiftPartActions
        details={details}
        onEdit={onEdit}
        onDelete={onDelete}
      >
        <Text>Отрезок</Text>
      </ShiftPartActions>,
    );

    expect(screen.queryByText("Редактировать")).toBeNull();

    fireEvent.press(screen.getByLabelText("Открыть действия: Поле 1"));

    expect(screen.getByText("Действия со сменой")).toBeTruthy();
    expect(screen.getByText("Редактировать")).toBeTruthy();
    expect(screen.getByText("Удалить")).toBeTruthy();

    fireEvent.press(screen.getByLabelText("Редактировать: Поле 1"));
    expect(onEdit).toHaveBeenCalledWith(details);

    fireEvent.press(screen.getByLabelText("Открыть действия: Поле 1"));
    fireEvent.press(screen.getByLabelText("Удалить: Поле 1"));
    expect(onDelete).toHaveBeenCalledWith(details);
  });
});
