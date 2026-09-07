import { act, renderHook, waitFor } from "@testing-library/react-native";

import { useAddShiftPartForm } from "../../widgets/Work/Field/Detail/task-shifts/useAddShiftPartForm";

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
      machinery_model: { id: "model-1", name: "Модель СХМ" },
    },
  ],
  shiftSettings: {
    first_shift_start: "07:00:00",
    first_shift_end: "19:00:00",
    second_shift_start: "19:00:00",
    second_shift_end: "07:00:00",
  },
};
const mockTariffs = [{ id: "tariff-1", norm_value: 10 }];

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
  work_standard: { id: "work-1" },
  field_task: {
    techniques: [
      {
        technique: {
          id: "technique-1",
          name: "Трактор",
          state_number: "А123АА",
          machinery_model: { name: "МТЗ-82" },
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

const loadWorkPlaces = jest.fn();
const loadAgriculturalMachinery = jest.fn();
const loadShiftSettings = jest.fn();
const searchTariffs = jest.fn();

const createOptions = (mode: "online" | "fact", visible = true) => ({
  visible,
  mode,
  currentTask,
  accessToken: "token",
  employees: [{ id: "employee-1", surname: "Иванов", firstname: "Иван" }],
  loadWorkPlaces,
  loadAgriculturalMachinery,
  loadShiftSettings,
  searchTariffs,
});

describe("useAddShiftPartForm", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("initializes online and fact modes with different end times", async () => {
    const online = renderHook(() =>
      useAddShiftPartForm(createOptions("online")),
    );
    const fact = renderHook(() => useAddShiftPartForm(createOptions("fact")));

    await waitFor(() => {
      expect(online.result.current.form.startAt).toBe("07:00:00");
      expect(fact.result.current.form.startAt).toBe("07:00:00");
    });

    expect(online.result.current.form.endedAt).toBe("");
    expect(fact.result.current.form.endedAt).toBe("19:00:00");
    expect(online.result.current.isFact).toBe(false);
    expect(fact.result.current.isFact).toBe(true);
  });

  test("selecting technique clears dependent selections and tariffs", () => {
    const { result } = renderHook(() =>
      useAddShiftPartForm(createOptions("fact")),
    );

    act(() => result.current.setPicker("technique"));
    const techniqueOption = result.current.pickerConfig.data[0];
    act(() => result.current.pickerConfig.onSelect(techniqueOption.raw));

    expect(result.current.technique).toEqual(
      expect.objectContaining({ id: "work-place-1", label: "Трактор" }),
    );
    expect(result.current.agriMachine).toBeNull();
    expect(result.current.tariff).toBeNull();
    expect(mockSetTariffs).toHaveBeenLastCalledWith([]);
  });

  test("resets edited values when the modal is opened again", () => {
    const { result, rerender } = renderHook(
      ({ visible }) =>
        useAddShiftPartForm(createOptions("fact", visible)),
      { initialProps: { visible: true } },
    );

    act(() => {
      result.current.setForm((previous) => ({
        ...previous,
        outputValue: "42",
        forceLoadTrack: true,
      }));
    });
    rerender({ visible: false });
    rerender({ visible: true });

    expect(result.current.form.outputValue).toBe("");
    expect(result.current.form.forceLoadTrack).toBe(false);
    expect(result.current.picker).toBeNull();
  });
});
