/* eslint-disable @typescript-eslint/no-require-imports */

import { act, fireEvent, render, screen } from "@testing-library/react-native";
import React from "react";
import { Alert } from "react-native";

import { useAuth } from "../../entities/auth/lib/useAuth";
import { useLocalDictionaries } from "../../features/localData/useLocalData";
import { useTariffActions } from "../../src/hooks/database/useTariffActions";
import { useAlerts } from "../../shared/lib/useAlerts";
import { TaskTechniques } from "../../widgets/Work/Field/Edit/TaskTechniques";

jest.mock("jotai", () => ({
  useSetAtom: () => jest.fn(),
}));

jest.mock("../../entities/tariffsList", () => ({
  addTariffsListAtom: {},
}));

jest.mock("../../entities/auth/lib/useAuth", () => ({
  useAuth: jest.fn(),
}));

jest.mock("../../features/localData/useLocalData", () => ({
  useLocalDictionaries: jest.fn(),
}));

jest.mock("../../src/hooks/database/useTariffActions", () => ({
  useTariffActions: jest.fn(),
}));

jest.mock("../../shared/lib/useAlerts", () => ({
  useAlerts: jest.fn(),
}));

jest.mock("../../widgets/Work/Field/Edit/TaskTechniqueModal", () => {
  const React = require("react");
  const { Text } = require("react-native");

  return {
    TaskTechniqueModal: ({ visible, techniqueOptions }) =>
      visible
        ? React.createElement(
            Text,
            null,
            `Открыта форма техники: ${techniqueOptions.length}`,
          )
        : null,
  };
});

const assignedTechnique = {
  id: "assigned-1",
  technique: {
    id: "technique-1",
    name: "Трактор",
    machinery_model: { id: "model-1", name: "МТЗ-82" },
  },
  agriculture_machine: { id: "machine-1", name: "Сеялка" },
  terms: [{ work_speed: 8, processing_depth: 4 }],
};

const currentTask = {
  id: "task-1",
  work_standard: { id: "work-1", name: "Посев" },
  field_task: { techniques: [assignedTechnique] },
} as any;

const createProps = () => ({
  currentTask,
  onAddTechnique: jest.fn().mockResolvedValue(true),
  onDeleteTechnique: jest.fn().mockResolvedValue(true),
  onMoveTechnique: jest.fn().mockResolvedValue(true),
});

describe("TaskTechniques", () => {
  const showError = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(useAuth).mockReturnValue({
      getValidAccessToken: jest.fn().mockResolvedValue("token"),
    } as any);
    jest.mocked(useTariffActions).mockReturnValue({
      generateTariff: jest.fn(),
    } as any);
    jest.mocked(useAlerts).mockReturnValue({
      showError,
      showOtherInformation: jest.fn(),
    } as any);
    jest.mocked(useLocalDictionaries).mockReturnValue({
      techniqueStandard: [
        assignedTechnique.technique,
        {
          id: "technique-2",
          name: "Трактор",
          machinery_model: { id: "model-2", name: "Кировец" },
        },
      ],
      agriculturalMachinery: [],
      tariffsList: [],
      workStandard: [],
    } as any);
  });

  test("renders assigned technique and opens the form with free options", () => {
    render(<TaskTechniques {...createProps()} />);

    expect(screen.getByText("МТЗ-82")).toBeTruthy();
    expect(screen.getByText("Сеялка")).toBeTruthy();
    expect(screen.getByText("Скорость: 8 км/ч · Глубина: 4 см")).toBeTruthy();

    fireEvent.press(screen.getByLabelText("Добавить технику"));

    expect(screen.getByText("Открыта форма техники: 1")).toBeTruthy();
  });

  test("deletes an assigned technique after confirmation", async () => {
    const props = createProps();
    const alertSpy = jest.spyOn(Alert, "alert").mockImplementation(jest.fn());
    render(<TaskTechniques {...props} />);

    fireEvent.press(screen.getByLabelText("Удалить технику МТЗ-82"));

    expect(alertSpy).toHaveBeenCalledWith(
      "Удалить агрегат",
      "Вы действительно хотите удалить агрегат?",
      expect.any(Array),
    );

    const actions = alertSpy.mock.calls[0][2] as any[];
    await act(async () => {
      await actions[1].onPress();
    });

    expect(props.onDeleteTechnique).toHaveBeenCalledWith("assigned-1");
    expect(showError).not.toHaveBeenCalled();
    alertSpy.mockRestore();
  });

  test("disables adding while dictionaries are loading", () => {
    render(<TaskTechniques {...createProps()} isDataLoading />);

    expect(screen.getByText("Загружаем технику...")).toBeTruthy();
    const addButton = screen.getByLabelText("Добавить технику");
    expect(addButton.props.accessibilityState.disabled).toBe(true);

    fireEvent.press(addButton);
    expect(screen.queryByText(/Открыта форма техники/)).toBeNull();
  });
});
