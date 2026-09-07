import { act, fireEvent, render, screen } from "@testing-library/react-native";
import React from "react";
import { Alert } from "react-native";

import { useAlerts } from "../../shared/lib/useAlerts";
import { TaskConsumables } from "../../widgets/Work/Field/Edit/TaskConsumables";

jest.mock("../../shared/lib/useAlerts", () => ({
  useAlerts: jest.fn(),
}));

const firstField = {
  id: "field-1",
  name: "Поле 1",
  area: 100,
  seed_norm_consumption: {
    id: "seed-norm-1",
    crop_variety_standard: { name: "Омская 36" },
    quantity: 120,
    unit_code: { id: 1, description: "кг/га" },
  },
  pesticide_norm_consumption: [],
  fertilizer_norm_consumption: [],
  seed_plan_consumption: null,
  pesticide_plan_consumptions: [],
  fertilizer_plan_consumptions: [
    {
      id: "fertilizer-plan-1",
      fertilizer: { name: "Аммофос" },
      quantity: 40,
    },
  ],
};

const secondField = {
  id: "field-2",
  name: "Поле 2",
  area: 75,
  seed_norm_consumption: null,
  pesticide_norm_consumption: [
    {
      id: "pesticide-norm-1",
      pesticide: { name: "Раундап" },
      quantity: 2,
    },
  ],
  fertilizer_norm_consumption: [],
  seed_plan_consumption: null,
  pesticide_plan_consumptions: [],
  fertilizer_plan_consumptions: [],
};

const currentTask = {
  field_task: { task_fields: [firstField, secondField] },
} as any;

const createProps = () => ({
  currentTask,
  cropStandardsList: [{ id: "seed-1", name: "Омская 36" }],
  fertilizerStandardsList: [],
  pesticideStandardsList: [],
  sowingUnitCodeList: [{ id: 1, description: "кг/га" }],
  onSaveNorm: jest.fn().mockResolvedValue(true),
  onDeleteNorm: jest.fn().mockResolvedValue(true),
});

describe("TaskConsumables", () => {
  const showError = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(useAlerts).mockReturnValue({
      showWarning: jest.fn(),
      showError,
    } as any);
  });

  test("switches between norm and plan and keeps the selected field", async () => {
    render(<TaskConsumables {...createProps()} />);

    expect(screen.getByText("Омская 36")).toBeTruthy();
    expect(screen.queryByText("Аммофос")).toBeNull();

    fireEvent.press(screen.getByRole("tab", { name: "План" }));

    expect(screen.getByText("Аммофос")).toBeTruthy();
    expect(screen.queryByLabelText(/Редактировать расходник/)).toBeNull();

    fireEvent.press(screen.getByLabelText("Выбрать поле для расходников"));
    expect(screen.getByText("Выбор поля")).toBeTruthy();

    await act(async () => {
      fireEvent.press(screen.getByText("Поле 2"));
    });

    expect(screen.getByText("Поле 2")).toBeTruthy();
    expect(screen.getByText("Плановые расходники отсутствуют")).toBeTruthy();

    fireEvent.press(screen.getByRole("tab", { name: "Норма" }));
    expect(screen.getByText("Раундап")).toBeTruthy();
  });

  test("opens the add form and deletes a norm after confirmation", async () => {
    const props = createProps();
    const alertSpy = jest.spyOn(Alert, "alert").mockImplementation(jest.fn());
    render(<TaskConsumables {...props} />);

    fireEvent.press(screen.getByLabelText("Добавить: Семена"));
    expect(screen.getByText("Добавить семена")).toBeTruthy();
    fireEvent.press(screen.getByLabelText("Закрыть"));

    fireEvent.press(screen.getByLabelText("Удалить расходник Омская 36"));
    expect(alertSpy).toHaveBeenCalledWith(
      "Удалить расходник",
      "Вы действительно хотите удалить расходник?",
      expect.any(Array),
    );

    const actions = alertSpy.mock.calls[0][2] as any[];
    await act(async () => {
      await actions[1].onPress();
    });

    expect(props.onDeleteNorm).toHaveBeenCalledWith("seed", "seed-norm-1");
    expect(showError).not.toHaveBeenCalled();
    alertSpy.mockRestore();
  });

  test("does not render the section when the task has no fields", () => {
    const { toJSON } = render(
      <TaskConsumables
        {...createProps()}
        currentTask={{ field_task: { task_fields: [] } } as any}
      />,
    );

    expect(toJSON()).toBeNull();
  });
});
