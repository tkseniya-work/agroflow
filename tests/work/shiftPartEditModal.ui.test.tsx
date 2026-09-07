/* eslint-disable @typescript-eslint/no-require-imports */
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react-native";
import React from "react";
import { Alert } from "react-native";

import { ShiftPartEditModal } from "../../widgets/Work/Field/Detail/task-shifts/ShiftPartEditModal";
import {
  buildMaterialQuantityRequest,
  buildShiftPartSavePlan,
} from "../../widgets/Work/Field/Detail/task-shifts/ShiftPartEditModal.helpers";

const mockUpdateShiftPart = jest.fn();
const mockUpdatePartsMaterialQuantity = jest.fn();
const mockUpdateShiftTotalsV2 = jest.fn();
const mockLoadShiftSettings = jest.fn();
const mockSearchTariffs = jest.fn();
const mockLoadAgriculturalMachinery = jest.fn();
const mockLoadWorkPlaces = jest.fn();
let mockIsConnected = true;
let mockInitialActiveTab: "part" | "materials" = "part";
let mockMaterialQuantity = "12,5";
let mockHasUnsavedChanges = false;

const mockForm = {
  date: "2026-07-23",
  startAt: "07:00:00",
  endedDate: "2026-07-23",
  endedAt: "19:00:00",
};
const mockSelectedMaterial = {
  id: "material-1",
  type: "seed",
};
const mockPartRequest = {
  accessToken: "access-token",
  id: "part-1",
  endedAt: "2026-07-23T19:00:00.000Z",
  startAt: "2026-07-23T07:00:00.000Z",
  taskFieldId: "field-1",
  productionTaskId: "task-1",
  tariffId: "tariff-1",
  workPlaceId: null,
  agriculturalMachineryId: "machine-1",
};
const mockTotalsRequest = {
  accessToken: "access-token",
  taskId: "task-1",
  shiftId: "shift-1",
  tariffId: "tariff-1",
  oldTariffId: null,
  workPlaceId: null,
  updateFieldTaskParts: {
    taskFieldId: "field-1",
    agriculturalMachineryId: "machine-1",
    outputValue: 10,
    factArea: 8,
    threshed: null,
    numberOfBins: null,
  },
};
const mockMaterialRequest = {
  accessToken: "access-token",
  data: {
    parts_ids: ["part-1"],
    material_id: "material-1",
    material_type: "seed" as const,
    parts_quantity: 12.5,
    unit_code: null,
  },
};

jest.mock("../../entities/productionTask/lib/useProductionTasks", () => ({
  useProductionTasks: () => ({
    updateShiftPart: mockUpdateShiftPart,
    updatePartsMaterialQuantity: mockUpdatePartsMaterialQuantity,
  }),
}));

jest.mock("../../shared/lib/useNetworkStatus", () => ({
  useNetworkStatus: () => ({
    isConnected: mockIsConnected,
  }),
}));

jest.mock("../../entities/productionShift/lib/useProductionShiftActions", () => ({
  useProductionShiftActions: () => ({
    loadShiftSettings: mockLoadShiftSettings,
    updateShiftTotalsV2: mockUpdateShiftTotalsV2,
  }),
}));

jest.mock("../../features/dictionarySync/lib/useDictionaryActions", () => ({
  useDictionaryActions: () => ({
    loadAgriculturalMachinery: mockLoadAgriculturalMachinery,
    loadProductionWorkPlaces: mockLoadWorkPlaces,
  }),
}));

jest.mock("../../src/hooks/database/useTariffActions", () => ({
  useTariffActions: () => ({
    searchTariffs: mockSearchTariffs,
  }),
}));

jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ bottom: 0, left: 0, right: 0, top: 0 }),
}));

jest.mock(
  "../../widgets/Work/Field/Detail/task-shifts/ShiftPartEditModal.helpers",
  () => {
    const actual = jest.requireActual(
      "../../widgets/Work/Field/Detail/task-shifts/ShiftPartEditModal.helpers",
    );

    return {
      ...actual,
      buildShiftPartSavePlan: jest.fn(),
      buildMaterialQuantityRequest: jest.fn(),
    };
  },
);

const mockBuildShiftPartSavePlan = jest.mocked(buildShiftPartSavePlan);
const mockBuildMaterialQuantityRequest = jest.mocked(
  buildMaterialQuantityRequest,
);

jest.mock(
  "../../widgets/Work/Field/Detail/task-shifts/useShiftPartEditForm",
  () => {
    const React = require("react");

    return {
      useShiftPartEditForm: () => {
        const [activeTab, setActiveTab] = React.useState(
          mockInitialActiveTab,
        );

        return {
          activeTab,
          setActiveTab,
          picker: null,
          setPicker: jest.fn(),
          selectedShiftType: { id: 1 },
          selectedField: { id: "field-1" },
          selectedTechnique: { id: "technique-1" },
          selectedAgriMachine: { id: "machine-1" },
          selectedTariff: { id: "tariff-1" },
          selectedMaterialIndex: 0,
          setSelectedMaterialIndex: jest.fn(),
          materialQuantity: mockMaterialQuantity,
          setMaterialQuantity: jest.fn(),
          form: mockForm,
          setField: jest.fn(),
          context: { productionShiftId: "shift-1" },
          fieldGrouped: { id: "part-1", task_field_id: "task-field-1" },
          tariffGrouped: { tariff: { id: "tariff-1" } },
          transferGrouped: null,
          materialPartIds: ["part-1"],
          editablePartIds: ["part-1"],
          originalStartAt: "2026-07-23T07:00:00",
          originalEndedAt: "2026-07-23T19:00:00",
          materialItems: [mockSelectedMaterial],
          selectedMaterial: mockSelectedMaterial,
          isHarvesting: false,
          isTransportation: false,
          isTransportOutput: false,
          workPlaces: [],
          agriOptions: [],
          pickerConfig: {
            title: "",
            data: [],
            selectedId: null,
            onSelect: jest.fn(),
          },
          hasUnsavedChanges: mockHasUnsavedChanges,
        };
      },
    };
  },
);

jest.mock(
  "../../widgets/Work/Field/Detail/task-shifts/ShiftPartEditPartForm",
  () => {
    const React = require("react");
    const { Text } = require("react-native");

    return {
      ShiftPartEditPartForm: () => <Text>part-form</Text>,
    };
  },
);

jest.mock(
  "../../widgets/Work/Field/Detail/task-shifts/ShiftPartEditMaterialsForm",
  () => {
    const React = require("react");
    const { Text } = require("react-native");

    return {
      ShiftPartEditMaterialsForm: ({ quantityError }: any) => (
        <>
          <Text>materials-form</Text>
          {!!quantityError && <Text>{quantityError}</Text>}
        </>
      ),
    };
  },
);

jest.mock("../../widgets/AppSelector/AppPickerModal", () => ({
  AppPickerModal: () => null,
}));

const details = {
  type: "field" as const,
  title: "Выработка",
  subtitle: "Поле 1",
  color: "#12B76A",
  icon: "leaf" as const,
  deleteTitle: "Удалить выработку",
  deleteIds: ["part-1"],
  rows: [],
};
const currentTask = { id: "task-1" };

const pressSave = async () => {
  await act(async () => {
    fireEvent.press(screen.getByText("Сохранить"));
    await Promise.resolve();
    await Promise.resolve();
  });
};

describe("ShiftPartEditModal", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockIsConnected = true;
    mockInitialActiveTab = "part";
    mockMaterialQuantity = "12,5";
    mockHasUnsavedChanges = false;
    mockUpdateShiftPart.mockResolvedValue(true);
    mockUpdatePartsMaterialQuantity.mockResolvedValue(true);
    mockUpdateShiftTotalsV2.mockResolvedValue(true);
    mockBuildShiftPartSavePlan.mockReturnValue({
      partIds: ["part-1"],
      hasInvalidTimes: false,
      partRequests: [mockPartRequest],
      totalsRequest: mockTotalsRequest,
    });
    mockBuildMaterialQuantityRequest.mockReturnValue(mockMaterialRequest);
  });

  test("saves a shift part and tariff before refreshing", async () => {
    const onClose = jest.fn();
    const onSaved = jest.fn().mockResolvedValue(undefined);

    render(
      <ShiftPartEditModal
        visible
        currentTask={currentTask as any}
        details={details}
        accessToken="access-token"
        onClose={onClose}
        onSaved={onSaved}
      />,
    );

    expect(screen.getByText("part-form")).toBeTruthy();
    await pressSave();

    await waitFor(() => {
      expect(mockUpdateShiftPart).toHaveBeenCalledWith(mockPartRequest);
      expect(mockUpdateShiftTotalsV2).toHaveBeenCalledWith(
        mockTotalsRequest,
      );
      expect(onSaved).toHaveBeenCalledTimes(1);
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  test("saves material quantity from the materials tab", async () => {
    mockInitialActiveTab = "materials";
    const onClose = jest.fn();
    const onSaved = jest.fn().mockResolvedValue(undefined);

    render(
      <ShiftPartEditModal
        visible
        currentTask={currentTask as any}
        details={details}
        accessToken="access-token"
        onClose={onClose}
        onSaved={onSaved}
      />,
    );

    expect(screen.getByText("materials-form")).toBeTruthy();
    await pressSave();

    await waitFor(() => {
      expect(mockBuildMaterialQuantityRequest).toHaveBeenCalledWith({
        accessToken: "access-token",
        materialPartIds: ["part-1"],
        selectedMaterial: mockSelectedMaterial,
        materialQuantity: "12,5",
      });
      expect(mockUpdatePartsMaterialQuantity).toHaveBeenCalledWith(
        mockMaterialRequest,
      );
      expect(onSaved).toHaveBeenCalledTimes(1);
      expect(onClose).toHaveBeenCalledTimes(1);
    });
    expect(mockUpdateShiftPart).not.toHaveBeenCalled();
  });

  test("blocks part saving while offline", async () => {
    mockIsConnected = false;
    const onClose = jest.fn();
    const onSaved = jest.fn();
    const alertSpy = jest
      .spyOn(Alert, "alert")
      .mockImplementation(jest.fn());

    render(
      <ShiftPartEditModal
        visible
        currentTask={currentTask as any}
        details={details}
        accessToken="access-token"
        onClose={onClose}
        onSaved={onSaved}
      />,
    );

    await pressSave();

    expect(alertSpy).toHaveBeenCalledWith(
      "Нет подключения к интернету",
      "Сохранение изменений доступно только онлайн.",
    );
    expect(mockUpdateShiftPart).not.toHaveBeenCalled();
    expect(mockUpdateShiftTotalsV2).not.toHaveBeenCalled();
    expect(onSaved).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();

    alertSpy.mockRestore();
  });

  test("shows an inline error for invalid material quantity", async () => {
    mockInitialActiveTab = "materials";
    mockMaterialQuantity = "-1";
    const onClose = jest.fn();

    render(
      <ShiftPartEditModal
        visible
        currentTask={currentTask as any}
        details={details}
        accessToken="access-token"
        onClose={onClose}
        onSaved={jest.fn()}
      />,
    );

    await pressSave();

    expect(
      screen.getByText("Введите корректное неотрицательное число"),
    ).toBeTruthy();
    expect(mockUpdatePartsMaterialQuantity).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
  });

  test("asks for confirmation before discarding changes", () => {
    mockHasUnsavedChanges = true;
    const onClose = jest.fn();
    const alertSpy = jest
      .spyOn(Alert, "alert")
      .mockImplementation((_title, _message, buttons) => {
        buttons?.[1]?.onPress?.();
      });

    render(
      <ShiftPartEditModal
        visible
        currentTask={currentTask as any}
        details={details}
        accessToken="access-token"
        onClose={onClose}
        onSaved={jest.fn()}
      />,
    );

    fireEvent.press(screen.getByLabelText("Закрыть редактирование"));

    expect(alertSpy).toHaveBeenCalledWith(
      "Закрыть без сохранения?",
      "Внесённые изменения будут потеряны.",
      expect.any(Array),
    );
    expect(onClose).toHaveBeenCalledTimes(1);

    alertSpy.mockRestore();
  });
});
