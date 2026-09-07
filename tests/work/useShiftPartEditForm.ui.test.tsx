import { act, renderHook } from "@testing-library/react-native";

import { useShiftPartEditForm } from "../../widgets/Work/Field/Detail/task-shifts/useShiftPartEditForm";

const mockSetTariffs = jest.fn();
const mockReferenceData = {
  workPlaces: [
    {
      id: "work-place-1",
      work_place_technique: { technique: { id: "technique-1" } },
    },
  ],
  agriculturalMachinery: [
    {
      id: "machine-1",
      name: "Сеялка",
      machinery_model: { id: "agri-model-1", name: "Модель СХМ" },
    },
  ],
  shiftSettings: {
    first_shift_start: "07:00:00",
    first_shift_end: "19:00:00",
    second_shift_start: "19:00:00",
    second_shift_end: "07:00:00",
  },
};
const mockTariffs = [{ id: "tariff-2", norm_value: 12 }];

jest.mock(
  "../../widgets/Work/shared/useShiftPartReferenceData",
  () => ({
    useShiftPartReferenceData: () => mockReferenceData,
    useShiftPartTariffs: () => ({
      tariffs: mockTariffs,
      setTariffs: mockSetTariffs,
    }),
  }),
);

const currentTask = {
  id: "task-1",
  work_standard: { id: "work-1", work_kind_id: 9 },
  field_task: {
    techniques: [
      {
        technique: {
          id: "technique-2",
          name: "Новый трактор",
          state_number: "А123АА",
          machinery_model: { id: "model-2", name: "МТЗ-82" },
        },
      },
    ],
    task_fields: [
      {
        id: "field-1",
        season_field: { name: "Поле 1", field: { name: "Контур 1" } },
      },
    ],
  },
} as any;

const details = {
  type: "field",
  title: "Поле 1",
  subtitle: "Выработка",
  shiftType: 2,
  shiftName: "Вторая смена",
  color: "#000000",
  icon: "tractor",
  deleteTitle: "Удалить",
  deleteIds: ["part-1"],
  rows: [],
  editContext: {
    productionShiftId: "shift-1",
    aggregate: {
      technique_standard: {
        id: "technique-1",
        name: "Трактор",
      },
      agricultural_machine: {
        id: "machine-1",
        name: "Сеялка",
      },
    },
    fieldGrouped: {
      task_field_id: "field-1",
      task_field_name: "Поле 1",
      area_fact: 5,
      threshed: 8,
      number_of_bins: 2,
    },
    tariffGrouped: {
      output_value_total: 10,
      shift_parts: [
        {
          id: "part-1",
          start_at: "2026-07-20T08:00:00Z",
          end_at: "2026-07-20T18:00:00Z",
        },
      ],
      tariff: { id: "tariff-1", norm_value: 5, comment: "Основной" },
      pesticides: [{ id: "pesticide-1", name: "Гербицид", quantity: 3.5 }],
    },
  },
} as any;

const loadWorkPlaces = jest.fn();
const loadAgriculturalMachinery = jest.fn();
const loadShiftSettings = jest.fn();
const searchTariffs = jest.fn();

const createOptions = (visible = true, overrides: Record<string, any> = {}) => ({
  visible,
  currentTask,
  details,
  accessToken: "token",
  loadWorkPlaces,
  loadAgriculturalMachinery,
  loadShiftSettings,
  searchTariffs,
  ...overrides,
});

describe("useShiftPartEditForm", () => {
  beforeEach(() => jest.clearAllMocks());

  test("initializes the form and selections from shift details", () => {
    const { result } = renderHook(() =>
      useShiftPartEditForm(createOptions()),
    );

    expect(result.current.form).toEqual(
      expect.objectContaining({
        startAt: "2026-07-20T08:00:00Z",
        endedAt: "2026-07-20T18:00:00Z",
        outputValue: "10",
        factArea: "5",
        threshed: "8",
        numberOfBins: "2",
      }),
    );
    expect(result.current.selectedShiftType).toEqual(
      expect.objectContaining({ id: 2, label: "Вторая смена" }),
    );
    expect(result.current.selectedField).toEqual(
      expect.objectContaining({ id: "field-1", label: "Поле 1" }),
    );
    expect(result.current.selectedTechnique).toEqual(
      expect.objectContaining({ id: "technique-1", label: "Трактор" }),
    );
    expect(result.current.selectedAgriMachine).toEqual(
      expect.objectContaining({ id: "machine-1", label: "Сеялка" }),
    );
    expect(result.current.selectedTariff).toEqual(
      expect.objectContaining({ id: "tariff-1" }),
    );
    expect(result.current.materialPartIds).toEqual(["part-1"]);
    expect(result.current.selectedMaterial).toEqual(
      expect.objectContaining({ id: "pesticide-1", value: 3.5 }),
    );
    expect(result.current.materialQuantity).toBe("3.5");
    expect(result.current.isHarvesting).toBe(true);
    expect(result.current.hasUnsavedChanges).toBe(false);
  });

  test("restores source values when the modal is opened again", () => {
    const { result, rerender } = renderHook(
      ({ visible }) => useShiftPartEditForm(createOptions(visible)),
      { initialProps: { visible: true } },
    );

    act(() => {
      result.current.setActiveTab("materials");
      result.current.setPicker("tariff");
      result.current.setField("outputValue", "42");
      result.current.setMaterialQuantity("99");
    });
    rerender({ visible: false });
    rerender({ visible: true });

    expect(result.current.activeTab).toBe("part");
    expect(result.current.picker).toBeNull();
    expect(result.current.form.outputValue).toBe("10");
    expect(result.current.materialQuantity).toBe("3.5");
  });

  test("clears dependent selections when technique changes", () => {
    const { result } = renderHook(() =>
      useShiftPartEditForm(createOptions()),
    );

    act(() => result.current.setPicker("technique"));
    const techniqueOption = result.current.pickerConfig.data[0];
    act(() => result.current.pickerConfig.onSelect(techniqueOption.raw));

    expect(result.current.selectedTechnique).toEqual(
      expect.objectContaining({ id: "technique-2", label: "Новый трактор" }),
    );
    expect(result.current.selectedAgriMachine).toBeNull();
    expect(result.current.selectedTariff).toBeNull();
    expect(mockSetTariffs).toHaveBeenLastCalledWith([]);
  });

  test("tracks unsaved part and material changes", () => {
    const { result } = renderHook(() =>
      useShiftPartEditForm(createOptions()),
    );

    act(() => result.current.setField("outputValue", "42"));
    expect(result.current.hasUnsavedChanges).toBe(true);

    act(() => result.current.setField("outputValue", "10"));
    expect(result.current.hasUnsavedChanges).toBe(false);

    act(() => result.current.setMaterialQuantity("4,5"));
    expect(result.current.hasUnsavedChanges).toBe(true);

    act(() => result.current.setMaterialQuantity("3,5"));
    expect(result.current.hasUnsavedChanges).toBe(false);
  });

  test.each([
    ["transport", 2, 84.5],
    ["transportation", 4, 63.25],
  ])(
    "initializes %s output from production kilometers when grouped total is zero",
    (_label, taskTypeId, productionKilometers) => {
      const transportDetails = {
        ...details,
        editContext: {
          ...details.editContext,
          fieldGrouped: {
            ...details.editContext.fieldGrouped,
            production_kilometers: productionKilometers,
          },
          tariffGrouped: {
            ...details.editContext.tariffGrouped,
            output_value_total: 0,
          },
        },
      };
      const transportTask = {
        ...currentTask,
        task_type: { id: taskTypeId },
      };
      const { result } = renderHook(() =>
        useShiftPartEditForm(
          createOptions(true, {
            currentTask: transportTask,
            details: transportDetails,
          }),
        ),
      );

      expect(result.current.form.outputValue).toBe(
        String(productionKilometers),
      );
    },
  );
});
