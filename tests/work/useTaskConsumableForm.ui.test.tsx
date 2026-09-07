import { act, renderHook } from "@testing-library/react-native";

import { useTaskConsumableForm } from "../../widgets/Work/Field/Edit/useTaskConsumableForm";

const createProps = (overrides: Record<string, unknown> = {}) => ({
  selectedField: { id: "field-1", name: "Поле 1" },
  showWarning: jest.fn(),
  showError: jest.fn(),
  onSaveNorm: jest.fn().mockResolvedValue(true),
  ...overrides,
});

describe("useTaskConsumableForm", () => {
  afterEach(() => {
    jest.useRealTimers();
  });

  test("builds, saves and resets a pesticide consumable", async () => {
    jest.useFakeTimers();
    const props = createProps();
    const { result } = renderHook(() => useTaskConsumableForm(props));

    act(() => {
      result.current.openEdit("pesticide");
      result.current.selectSource({ id: "pesticide-1", quantity: 2.5 });
      jest.runAllTimers();
    });

    await act(async () => {
      await result.current.save();
    });

    expect(props.onSaveNorm).toHaveBeenCalledWith("pesticide", {
      id: null,
      production_task_field_id: "field-1",
      pesticide_id: "pesticide-1",
      unit_code: null,
      quantity: 2.5,
      weight: null,
    });
    expect(result.current.isEditVisible).toBe(false);
    expect(result.current.selectedSource).toBeNull();
    expect(result.current.quantity).toBe("");
  });

  test("returns from source and unit pickers with the selected values", () => {
    jest.useFakeTimers();
    const props = createProps();
    const { result } = renderHook(() => useTaskConsumableForm(props));

    act(() => {
      result.current.openEdit("seed", {
        id: "seed-norm-1",
        quantity: 3,
        unit_code: { id: 7, description: "кг/га" },
      });
    });

    expect(result.current.selectedUnit).toEqual(
      expect.objectContaining({ type: 7, name: "кг/га" }),
    );

    act(() => {
      result.current.openSource();
      jest.runAllTimers();
    });
    expect(result.current.isSourceVisible).toBe(true);
    expect(result.current.isEditVisible).toBe(false);

    act(() => {
      result.current.selectSource({ id: "seed-1", norm_value: 4 });
      jest.runAllTimers();
    });
    expect(result.current.isSourceVisible).toBe(false);
    expect(result.current.isEditVisible).toBe(true);
    expect(result.current.quantity).toBe("4");

    act(() => {
      result.current.openUnit();
      jest.runAllTimers();
    });
    expect(result.current.isUnitVisible).toBe(true);

    act(() => {
      result.current.selectUnit({ id: 9, name: "шт/га" });
      jest.runAllTimers();
    });
    expect(result.current.isUnitVisible).toBe(false);
    expect(result.current.isEditVisible).toBe(true);
    expect(result.current.selectedUnit).toEqual({ id: 9, name: "шт/га" });
  });
});
