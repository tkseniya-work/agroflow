import { act, renderHook } from "@testing-library/react-native";

import { TechniqueOption } from "../../widgets/Work/Field/Edit/TaskTechniques.logic";
import { useTaskTechniqueForm } from "../../widgets/Work/Field/Edit/useTaskTechniqueForm";

const technique: TechniqueOption = {
  id: "technique-1",
  name: "Трактор",
  displayName: "МТЗ-82",
  machineryModelId: "model-1",
  machineryModelName: "МТЗ-82",
  raw: {},
};

const createProps = (overrides: Record<string, unknown> = {}) => ({
  currentTask: {
    id: "task-1",
    work_standard: { id: "work-1", name: "Посев" },
  } as any,
  taskType: "transportation" as const,
  transferWork: { id: "transfer-work", name: "Перегон" },
  getValidAccessToken: jest.fn().mockResolvedValue("token"),
  generateTariff: jest.fn(),
  saveGeneratedTariff: jest.fn().mockResolvedValue(undefined),
  showError: jest.fn(),
  showOtherInformation: jest.fn(),
  onAddTechnique: jest.fn().mockResolvedValue(true),
  onMoveTechnique: jest.fn().mockResolvedValue(true),
  ...overrides,
});

describe("useTaskTechniqueForm", () => {
  test("builds and submits a transportation technique payload", async () => {
    const props = createProps();
    const { result } = renderHook(() => useTaskTechniqueForm(props));

    act(() => {
      result.current.open();
      result.current.selectTechnique(technique);
      result.current.selectTariff({ id: "tariff-1" });
      result.current.changeWorkSpeed("8,5");
    });

    await act(async () => {
      await result.current.submit();
    });

    expect(props.onAddTechnique).toHaveBeenCalledWith({
      task_id: "task-1",
      technique_id: "technique-1",
      agriculture_machine_id: null,
      tariff_id: "tariff-1",
      work_speed: 8.5,
    });
    expect(props.onMoveTechnique).not.toHaveBeenCalled();
    expect(result.current.isVisible).toBe(false);
    expect(result.current.selectedTechnique).toBeNull();
  });

  test("moves a busy technique into a transportation task", async () => {
    const props = createProps();
    const busyTechnique: TechniqueOption = {
      ...technique,
      additionalInfo: {
        production_task_id: "other-task",
        task_technique_id: "task-technique-1",
      },
    };
    const { result } = renderHook(() => useTaskTechniqueForm(props));

    act(() => {
      result.current.open();
      result.current.selectTechnique(busyTechnique);
      result.current.selectTariff({ id: "tariff-1" });
      result.current.changeWorkSpeed("10");
    });

    await act(async () => {
      await result.current.submit();
    });

    expect(props.onAddTechnique).not.toHaveBeenCalled();
    expect(props.onMoveTechnique).toHaveBeenCalledWith({
      task_id: "task-1",
      technique_id: "technique-1",
      agricultural_machine_id: null,
      tariff_id: "tariff-1",
      transfer_tariff_id: undefined,
      work_speed: 10,
    });
  });

  test("generates, saves and selects a main tariff", async () => {
    const generatedTariff = { id: "generated-tariff", norm_value: 4.2 };
    const generateTariff = jest.fn().mockResolvedValue(generatedTariff);
    const saveGeneratedTariff = jest.fn().mockResolvedValue(undefined);
    const showOtherInformation = jest.fn();
    const props = createProps({
      taskType: "field",
      generateTariff,
      saveGeneratedTariff,
      showOtherInformation,
    });
    const { result } = renderHook(() => useTaskTechniqueForm(props));

    act(() => {
      result.current.selectTechnique(technique);
    });
    act(() => {
      result.current.openGenerateTariff("main");
    });

    expect(result.current.generateTariffTarget).toBe("main");

    await act(async () => {
      await result.current.generateSelectedTariff();
    });

    expect(generateTariff).toHaveBeenCalledWith({
      accessToken: "token",
      work_standard_id: "work-1",
      technique_model_id: "model-1",
      agricultural_machinery_model_id: null,
    });
    expect(saveGeneratedTariff).toHaveBeenCalledWith([
      expect.objectContaining({
        id: "generated-tariff",
        work_standard_id: "work-1",
        technique_model_id: "model-1",
        agricultural_machinery_model_id: null,
        is_deleted: false,
        deleted_at: null,
      }),
    ]);
    expect(result.current.selectedTariff?.id).toBe("generated-tariff");
    expect(result.current.generateTariffTarget).toBeNull();
    expect(showOtherInformation).toHaveBeenCalledWith(
      "Тариф создан",
      "Новый тариф автоматически выбран в форме.",
    );
  });
});
