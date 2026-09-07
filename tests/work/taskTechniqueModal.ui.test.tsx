import {
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react-native";
import React from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { TaskTechniqueModal } from "../../widgets/Work/Field/Edit/TaskTechniqueModal";
import { TechniqueOption } from "../../widgets/Work/Field/Edit/TaskTechniques.logic";

const technique: TechniqueOption = {
  id: "technique-1",
  name: "Трактор",
  displayName: "МТЗ-82 · А123БВ",
  machineryModelId: "model-1",
  machineryModelName: "МТЗ-82",
  machineryModelPower: 81,
  raw: {},
};

const renderModal = (
  props: Partial<React.ComponentProps<typeof TaskTechniqueModal>> = {},
) => {
  const defaultProps: React.ComponentProps<typeof TaskTechniqueModal> = {
    visible: true,
    workName: "Посев",
    transferWorkName: "Перегон",
    isTransportationTask: false,
    isTransportLikeTask: false,
    requiresTransferTariff: false,
    selectedTechnique: null,
    selectedMachinery: null,
    selectedTariff: null,
    selectedTransferTariff: null,
    workSpeed: "",
    processingDepth: "",
    soluteFlowRate: "",
    techniqueOptions: [
      {
        id: technique.id,
        title: technique.displayName,
        raw: technique,
      },
    ],
    machineryOptions: [],
    tariffOptions: [],
    transferTariffOptions: [],
    generateTariffTarget: null,
    isSubmitting: false,
    isGeneratingTariff: false,
    onClose: jest.fn(),
    onSelectTechnique: jest.fn(),
    onSelectMachinery: jest.fn(),
    onSelectTariff: jest.fn(),
    onSelectTransferTariff: jest.fn(),
    onChangeWorkSpeed: jest.fn(),
    onChangeProcessingDepth: jest.fn(),
    onChangeSoluteFlowRate: jest.fn(),
    onOpenGenerateTariff: jest.fn(),
    onCloseGenerateTariff: jest.fn(),
    onGenerateTariff: jest.fn(),
    onSubmit: jest.fn(),
  };
  const mergedProps = { ...defaultProps, ...props };

  return {
    props: mergedProps,
    ...render(
      <SafeAreaProvider
        initialMetrics={{
          frame: { x: 0, y: 0, width: 390, height: 844 },
          insets: { top: 44, left: 0, right: 0, bottom: 34 },
        }}
      >
        <TaskTechniqueModal {...mergedProps} />
      </SafeAreaProvider>,
    ),
  };
};

describe("TaskTechniqueModal", () => {
  test("selects technique, edits parameters and submits the form", async () => {
    const { props } = renderModal();

    expect(screen.getByText("Добавить технику")).toBeTruthy();
    expect(screen.getByText("Посев")).toBeTruthy();
    expect(screen.getByText("Агротехнические параметры")).toBeTruthy();

    fireEvent.press(screen.getByText("Выбрать технику"));
    fireEvent.press(screen.getByText(technique.displayName));
    await waitFor(() => {
      expect(props.onSelectTechnique).toHaveBeenCalledWith(technique);
    });

    fireEvent.changeText(screen.getByPlaceholderText("Введите скорость"), "8,5");
    expect(props.onChangeWorkSpeed).toHaveBeenCalledWith("8,5");

    fireEvent.press(screen.getByText("Сохранить"));
    fireEvent.press(screen.getByText("Отменить"));

    expect(props.onSubmit).toHaveBeenCalledTimes(1);
    expect(props.onClose).toHaveBeenCalledTimes(1);
  });

  test("shows busy technique state and requests both field tariffs", () => {
    const busyTechnique: TechniqueOption = {
      ...technique,
      additionalInfo: {
        work_standard: { name: "Культивация" },
        field: { name: "Поле 12" },
      },
    };
    const onOpenGenerateTariff = jest.fn();
    const onClose = jest.fn();

    renderModal({
      selectedTechnique: busyTechnique,
      requiresTransferTariff: true,
      onOpenGenerateTariff,
      onClose,
    });

    expect(screen.getByText("Занята")).toBeTruthy();
    expect(screen.getByText("Перенести")).toBeTruthy();
    expect(screen.getByText(/Культивация/)).toBeTruthy();

    fireEvent.press(screen.getByText("Сгенерировать основной тариф"));
    fireEvent.press(screen.getByText("Сгенерировать тариф на перегон"));
    fireEvent.press(screen.getByLabelText("Закрыть добавление техники"));

    expect(onOpenGenerateTariff).toHaveBeenNthCalledWith(1, "main");
    expect(onOpenGenerateTariff).toHaveBeenNthCalledWith(2, "transfer");
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test("selects machinery and tariffs in transportation mode", async () => {
    const machinery = {
      id: "machinery-1",
      name: "Сеялка",
      raw: {},
    };
    const mainTariff = { id: "tariff-1", norm_value: 12 };
    const transferTariff = { id: "tariff-2", norm_value: 8 };
    const onSelectMachinery = jest.fn();
    const onSelectTariff = jest.fn();
    const onSelectTransferTariff = jest.fn();

    renderModal({
      selectedTechnique: technique,
      isTransportLikeTask: true,
      requiresTransferTariff: true,
      machineryOptions: [
        { id: machinery.id, title: machinery.name, raw: machinery },
      ],
      tariffOptions: [
        { id: mainTariff.id, title: "Основной тариф 12", raw: mainTariff },
      ],
      transferTariffOptions: [
        {
          id: transferTariff.id,
          title: "Тариф на перегон 8",
          raw: transferTariff,
        },
      ],
      onSelectMachinery,
      onSelectTariff,
      onSelectTransferTariff,
    });

    expect(screen.getByText("Параметры транспортировки")).toBeTruthy();
    expect(screen.queryByPlaceholderText("Введите глубину")).toBeNull();
    expect(screen.queryByPlaceholderText("Введите норму")).toBeNull();

    fireEvent.press(screen.getByText("Выбрать сельхозмашину"));
    fireEvent.press(screen.getByText("Сеялка"));
    fireEvent.press(screen.getByText("Выбрать тариф"));
    fireEvent.press(screen.getByText("Основной тариф 12"));
    fireEvent.press(screen.getByText("Выбрать тариф на перегон"));
    fireEvent.press(screen.getByText("Тариф на перегон 8"));

    await waitFor(() => {
      expect(onSelectMachinery).toHaveBeenCalledWith(machinery);
      expect(onSelectTariff).toHaveBeenCalledWith(mainTariff);
      expect(onSelectTransferTariff).toHaveBeenCalledWith(transferTariff);
    });
  });
});
