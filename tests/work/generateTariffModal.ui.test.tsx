import { fireEvent, render, screen } from "@testing-library/react-native";
import React from "react";

import { GenerateTariffModal } from "../../widgets/Work/Field/Edit/GenerateTariffModal";

const technique = {
  id: "technique-1",
  name: "Трактор",
  displayName: "МТЗ-82",
  machineryModelName: "МТЗ-82",
  machineryModelPower: 81,
  raw: {},
};

describe("GenerateTariffModal", () => {
  test("shows tariff data and confirms generation", () => {
    const onClose = jest.fn();
    const onConfirm = jest.fn();

    render(
      <GenerateTariffModal
        target="main"
        workName="Посев"
        transferWorkName="Перегон"
        technique={technique}
        machinery={{
          id: "machinery-1",
          name: "Сеялка",
          machineryModelName: "СЗ-5,4",
          raw: {},
        }}
        isGenerating={false}
        onClose={onClose}
        onConfirm={onConfirm}
      />,
    );

    expect(screen.getByText("Основной тариф")).toBeTruthy();
    expect(screen.getByText("Посев")).toBeTruthy();
    expect(screen.getByText("МТЗ-82")).toBeTruthy();
    expect(screen.getByText("Мощность: 81 л.с.")).toBeTruthy();
    expect(screen.getByText("СЗ-5,4")).toBeTruthy();

    fireEvent.press(screen.getByText("Создать и выбрать"));
    fireEvent.press(screen.getByText("Отмена"));

    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test("shows transfer work and blocks cancellation while generating", () => {
    const onClose = jest.fn();
    const onConfirm = jest.fn();

    render(
      <GenerateTariffModal
        target="transfer"
        workName="Посев"
        transferWorkName="Доставка техники"
        technique={technique}
        machinery={null}
        isGenerating
        onClose={onClose}
        onConfirm={onConfirm}
      />,
    );

    expect(screen.getByText("Тариф на перегон")).toBeTruthy();
    expect(screen.getByText("Доставка техники")).toBeTruthy();

    fireEvent.press(screen.getByText("Отмена"));

    expect(onClose).not.toHaveBeenCalled();
    expect(onConfirm).not.toHaveBeenCalled();
  });
});
