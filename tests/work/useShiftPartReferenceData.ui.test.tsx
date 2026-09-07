import { renderHook, waitFor } from "@testing-library/react-native";

import {
  useShiftPartReferenceData,
  useShiftPartTariffs,
} from "../../widgets/Work/shared/useShiftPartReferenceData";

describe("shift part reference data", () => {
  test("loads dictionaries together and normalizes shift settings", async () => {
    const loadWorkPlaces = jest.fn().mockResolvedValue([{ id: "place-1" }]);
    const loadAgriculturalMachinery = jest
      .fn()
      .mockResolvedValue([{ id: "machine-1" }]);
    const loadShiftSettings = jest
      .fn()
      .mockResolvedValue([{ first_shift_start: "07:00:00" }]);

    const { result } = renderHook(() =>
      useShiftPartReferenceData({
        visible: true,
        accessToken: "token",
        loadWorkPlaces,
        loadAgriculturalMachinery,
        loadShiftSettings,
      }),
    );

    await waitFor(() => {
      expect(result.current.workPlaces).toEqual([{ id: "place-1" }]);
      expect(result.current.agriculturalMachinery).toEqual([
        { id: "machine-1" },
      ]);
      expect(result.current.shiftSettings).toEqual({
        first_shift_start: "07:00:00",
      });
    });

    expect(loadWorkPlaces).toHaveBeenCalledWith("token");
    expect(loadAgriculturalMachinery).toHaveBeenCalledWith("token");
    expect(loadShiftSettings).toHaveBeenCalledWith("token");
  });

  test("does not load dictionaries while the modal is hidden", () => {
    const loadWorkPlaces = jest.fn();
    const loadAgriculturalMachinery = jest.fn();
    const loadShiftSettings = jest.fn();

    renderHook(() =>
      useShiftPartReferenceData({
        visible: false,
        accessToken: "token",
        loadWorkPlaces,
        loadAgriculturalMachinery,
        loadShiftSettings,
      }),
    );

    expect(loadWorkPlaces).not.toHaveBeenCalled();
    expect(loadAgriculturalMachinery).not.toHaveBeenCalled();
    expect(loadShiftSettings).not.toHaveBeenCalled();
  });

  test("loads tariffs for selected technique and machinery", async () => {
    const searchTariffs = jest.fn().mockResolvedValue([{ id: "tariff-1" }]);
    const getTechniqueModelId = jest.fn(() => "technique-model-1");
    const technique = { id: "technique-1" };
    const agriculturalMachinery = {
      agriculturalMachinery: {
        machinery_model: { id: "agri-model-1" },
      },
    };

    const { result } = renderHook(() =>
      useShiftPartTariffs({
        visible: true,
        accessToken: "token",
        workStandardId: "work-1",
        technique,
        agriculturalMachinery,
        getTechniqueModelId,
        searchTariffs,
      }),
    );

    await waitFor(() => {
      expect(result.current.tariffs).toEqual([{ id: "tariff-1" }]);
    });

    expect(searchTariffs).toHaveBeenCalledWith({
      accessToken: "token",
      workStandardId: "work-1",
      techniqueModelId: "technique-model-1",
      agriculturalMachineryModelId: "agri-model-1",
    });
  });
});
