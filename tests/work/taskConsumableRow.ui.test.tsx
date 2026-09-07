import { fireEvent, render, screen } from "@testing-library/react-native";
import React from "react";

import { TaskConsumableRow } from "../../widgets/Work/Field/Edit/TaskConsumableRow";

describe("TaskConsumableRow", () => {
  test("shows seed data and exposes edit actions", () => {
    const onEdit = jest.fn();
    const onDelete = jest.fn();

    render(
      <TaskConsumableRow
        type="seed"
        item={{
          id: "seed-1",
          crop_variety_standard: { name: "Омская 36" },
          quantity: 125,
          unit_code: { description: "кг/га" },
        }}
        editable
        isDeleting={false}
        onEdit={onEdit}
        onDelete={onDelete}
      />,
    );

    expect(screen.getByText("Омская 36")).toBeTruthy();
    expect(screen.getByText("125 кг/га")).toBeTruthy();

    fireEvent.press(
      screen.getByLabelText("Редактировать расходник Омская 36"),
    );
    fireEvent.press(screen.getByLabelText("Удалить расходник Омская 36"));

    expect(onEdit).toHaveBeenCalledTimes(1);
    expect(onDelete).toHaveBeenCalledTimes(1);
  });

  test("hides actions for plan consumables", () => {
    render(
      <TaskConsumableRow
        type="fertilizer"
        item={{
          id: "fertilizer-1",
          fertilizer: { name: "Аммофос" },
          quantity: 40,
        }}
        editable={false}
        isDeleting={false}
        onEdit={jest.fn()}
        onDelete={jest.fn()}
      />,
    );

    expect(screen.getByText("Аммофос")).toBeTruthy();
    expect(screen.getByText("40 кг/га")).toBeTruthy();
    expect(
      screen.queryByLabelText("Редактировать расходник Аммофос"),
    ).toBeNull();
    expect(screen.queryByLabelText("Удалить расходник Аммофос")).toBeNull();
  });
});
