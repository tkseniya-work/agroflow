import { fireEvent, render, screen } from "@testing-library/react-native";
import React from "react";

import { ConsumableEditModal } from "../../widgets/Work/Field/Edit/ConsumableEditModal";

describe("ConsumableEditModal", () => {
  test("new seed form selects source and unit, edits quantity and submits", () => {
    const onOpenSource = jest.fn();
    const onOpenUnit = jest.fn();
    const onQuantityChange = jest.fn();
    const onSubmit = jest.fn();

    render(
      <ConsumableEditModal
        visible
        type="seed"
        editingItem={null}
        selectedSource={{ name: "Омская 36" }}
        selectedUnit={{ name: "кг/га" }}
        sourceOptionsCount={1}
        quantity="12,5"
        isSubmitting={false}
        onQuantityChange={onQuantityChange}
        onOpenSource={onOpenSource}
        onOpenUnit={onOpenUnit}
        onClose={jest.fn()}
        onSubmit={onSubmit}
      />,
    );

    expect(screen.getByText("Добавить семена")).toBeTruthy();
    fireEvent.press(screen.getByText("Омская 36"));
    fireEvent.press(screen.getByText("кг/га"));
    fireEvent.changeText(screen.getByPlaceholderText("Введите норму"), "15");
    fireEvent.press(screen.getByText("Добавить"));

    expect(onOpenSource).toHaveBeenCalledTimes(1);
    expect(onOpenUnit).toHaveBeenCalledTimes(1);
    expect(onQuantityChange).toHaveBeenCalledWith("15");
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  test("edit form hides dictionary selectors and closes", () => {
    const onClose = jest.fn();

    render(
      <ConsumableEditModal
        visible
        type="fertilizer"
        editingItem={{ id: "norm-1" }}
        selectedSource={null}
        selectedUnit={null}
        sourceOptionsCount={0}
        quantity="20"
        isSubmitting={false}
        onQuantityChange={jest.fn()}
        onOpenSource={jest.fn()}
        onOpenUnit={jest.fn()}
        onClose={onClose}
        onSubmit={jest.fn()}
      />,
    );

    expect(screen.getByText("Редактировать удобрения")).toBeTruthy();
    expect(screen.queryByText("Расходник")).toBeNull();
    expect(screen.queryByText("Ед.")).toBeNull();

    fireEvent.press(screen.getByText("Изменить"));
    fireEvent.press(screen.getByLabelText("Закрыть"));

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(screen.queryByText("В справочнике нет расходников этого типа.")).toBeNull();
  });
});
