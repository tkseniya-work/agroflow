/* eslint-disable @typescript-eslint/no-require-imports */
import {
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react-native";
import React from "react";
import { Alert } from "react-native";

import { TaskShifts } from "../../widgets/Work/Field/Detail/TaskShifts";

const mockGetValidAccessToken = jest.fn();
const mockLoadEmployeeList = jest.fn();
const mockGetGroupedParts = jest.fn();
const mockRemoveProductionTaskParts = jest.fn();
const mockLoadProductionTaskTrack = jest.fn();
const mockClearTrack = jest.fn();
const mockLoadShiftSettings = jest.fn();
const mockCompanyInfo = { company_uuid: "company-1" };
const mockTracks = [{ techniqueId: "technique-1", c: [] }];
let mockIsConnected = true;
let mockLoadingType: string | null = null;

const mockPartDetails = {
  type: "field" as const,
  title: "Выработка",
  subtitle: "Поле 1",
  color: "#12B76A",
  icon: "leaf-outline" as const,
  deleteTitle: "Удалить выработку",
  deleteIds: ["part-1"],
  rows: [],
};

jest.mock("../../entities/auth/lib/useAuth", () => ({
  useAuth: () => ({
    getValidAccessToken: mockGetValidAccessToken,
  }),
}));

jest.mock("../../features/localData/useLocalData", () => ({
  useCompanyInfo: () => mockCompanyInfo,
  useShiftSettings: () => [],
}));

jest.mock("../../entities/employee", () => ({
  useEmployeeActions: () => ({
    loadEmployeeList: mockLoadEmployeeList,
  }),
}));

jest.mock("../../shared/lib/useNetworkStatus", () => ({
  useNetworkStatus: () => ({
    isConnected: mockIsConnected,
  }),
}));

jest.mock("../../entities/productionTask/lib/useProductionTasks", () => ({
  useProductionTasks: () => ({
    getProductionFieldTaskGroupedParts: mockGetGroupedParts,
    removeProductionTaskParts: mockRemoveProductionTaskParts,
  }),
}));

jest.mock("../../entities/techniqueMonitoring", () => ({
  useTechniqueMonitoring: () => ({
    tracks: mockTracks,
    loadingType: mockLoadingType,
    loadProductionTaskTrack: mockLoadProductionTaskTrack,
    clearTrack: mockClearTrack,
  }),
}));

jest.mock(
  "../../widgets/Work/Field/Detail/task-shifts/TaskShiftGroups",
  () => {
    const React = require("react");
    const { Pressable, Text, View } = require("react-native");

    return {
      TaskShiftGroups: ({
        groups,
        employees,
        shiftSettings,
        isLoading,
        onOpenDetails,
        onEditPart,
        onDeletePart,
      }: any) => (
        <View>
          <Text>{`groups:${groups.length}`}</Text>
          <Text>{`employees:${employees.length}`}</Text>
          <Text>
            {`break:${shiftSettings?.first_shift_break_start ?? "none"}`}
          </Text>
          <Text>{`loading:${String(isLoading)}`}</Text>
          <Pressable
            accessibilityLabel="Открыть детали тестовой смены"
            onPress={() => onOpenDetails(mockPartDetails)}
          >
            <Text>details</Text>
          </Pressable>
          <Pressable
            accessibilityLabel="Редактировать тестовую смену"
            onPress={() => onEditPart(mockPartDetails)}
          >
            <Text>edit</Text>
          </Pressable>
          <Pressable
            accessibilityLabel="Удалить тестовую смену"
            onPress={() => onDeletePart(mockPartDetails)}
          >
            <Text>delete</Text>
          </Pressable>
          <Pressable
            accessibilityLabel="Удалить тестовый блок"
            onPress={() =>
              onDeletePart({
                ...mockPartDetails,
                deleteTitle: "Удаление блока",
                deleteMessage:
                  "Удалить выбранный рабочий блок?\n\nБудут удалены: работа на поле и перегон техники",
                deleteIds: ["part-1", "part-2"],
              })
            }
          >
            <Text>delete-block</Text>
          </Pressable>
        </View>
      ),
    };
  },
);

jest.mock(
  "../../widgets/Work/Field/Detail/task-shifts/ShiftPartDetailsModal",
  () => {
    const React = require("react");
    const { Pressable, Text, View } = require("react-native");

    return {
      ShiftPartDetailsModal: ({ details, onClose }: any) =>
        details ? (
          <View>
            <Text>details-open</Text>
            <Pressable accessibilityLabel="Закрыть детали" onPress={onClose}>
              <Text>close</Text>
            </Pressable>
          </View>
        ) : null,
    };
  },
);

jest.mock(
  "../../widgets/Work/Field/Detail/task-shifts/ShiftPartEditModal",
  () => {
    const React = require("react");
    const { Text } = require("react-native");

    return {
      ShiftPartEditModal: ({ visible, accessToken }: any) =>
        visible ? <Text>{`edit-open:${accessToken}`}</Text> : null,
    };
  },
);

jest.mock(
  "../../widgets/Work/Field/Detail/task-shifts/AddShiftPartModal",
  () => {
    const React = require("react");
    const { Pressable, Text, View } = require("react-native");

    return {
      AddShiftPartModal: ({
        visible,
        mode,
        accessToken,
        employees,
        onSaved,
      }: any) =>
        visible ? (
          <View>
            <Text>
              {`add-open:${mode}:${accessToken}:${employees.length}`}
            </Text>
            <Pressable
              accessibilityLabel="Сохранить тестовую смену"
              onPress={onSaved}
            >
              <Text>save</Text>
            </Pressable>
          </View>
        ) : null,
    };
  },
);

const currentTask = {
  id: "task-1",
  company_id: "company-1",
};

describe("TaskShifts", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockIsConnected = true;
    mockLoadingType = null;
    mockGetValidAccessToken.mockResolvedValue("access-token");
    mockLoadEmployeeList.mockResolvedValue([{ id: "employee-1" }]);
    mockGetGroupedParts.mockResolvedValue([]);
    mockRemoveProductionTaskParts.mockResolvedValue(true);
    mockLoadProductionTaskTrack.mockResolvedValue(undefined);
    mockLoadShiftSettings.mockResolvedValue({
      first_shift_break_start: "12:00:00",
      first_shift_break_end: "12:30:00",
    });
  });

  test("loads data and opens details, edit and add flows", async () => {
    const loadGroupedParts = jest
      .fn()
      .mockResolvedValue([{ date: "2026-07-23" }]);
    const onChanged = jest.fn();

    render(
      <TaskShifts
        currentTask={currentTask}
        loadGroupedParts={loadGroupedParts}
        loadShiftSettings={mockLoadShiftSettings}
        onChanged={onChanged}
      />,
    );

    await waitFor(() => {
      expect(screen.getByText("groups:1")).toBeTruthy();
      expect(screen.getByText("employees:1")).toBeTruthy();
      expect(screen.getByText("break:12:00:00")).toBeTruthy();
      expect(
        screen.queryByText("Смахните карточку влево для действий"),
      ).toBeNull();
    });
    expect(loadGroupedParts).toHaveBeenCalledWith({
      accessToken: "access-token",
      taskId: "task-1",
    });
    expect(mockLoadEmployeeList).toHaveBeenCalledWith(
      "access-token",
      "company-1",
    );

    fireEvent.press(
      screen.getByLabelText("Открыть детали тестовой смены"),
    );

    await waitFor(() => {
      expect(screen.getByText("details-open")).toBeTruthy();
      expect(mockLoadProductionTaskTrack).toHaveBeenCalledWith("task-1");
    });

    const clearCallsBeforeClose = mockClearTrack.mock.calls.length;
    fireEvent.press(screen.getByLabelText("Закрыть детали"));
    await waitFor(() => {
      expect(mockClearTrack.mock.calls.length).toBeGreaterThan(
        clearCallsBeforeClose,
      );
    });

    fireEvent.press(
      screen.getByLabelText("Редактировать тестовую смену"),
    );
    await waitFor(() => {
      expect(screen.getByText("edit-open:access-token")).toBeTruthy();
    });

    fireEvent.press(screen.getByLabelText("Добавить смену"));
    fireEvent.press(screen.getByLabelText("Добавить смену по факту"));
    await waitFor(() => {
      expect(
        screen.getByText("add-open:fact:access-token:1"),
      ).toBeTruthy();
    });

    fireEvent.press(screen.getByLabelText("Сохранить тестовую смену"));
    await waitFor(() => {
      expect(loadGroupedParts).toHaveBeenCalledTimes(2);
      expect(onChanged).toHaveBeenCalledTimes(1);
    });
  });

  test("deletes a shift part online and refreshes the task", async () => {
    const loadGroupedParts = jest.fn().mockResolvedValue([]);
    const onChanged = jest.fn();
    const alertSpy = jest
      .spyOn(Alert, "alert")
      .mockImplementation((title, _message, buttons) => {
        if (title === "Удалить выработку") {
          void buttons?.[1]?.onPress?.();
        }
      });

    render(
      <TaskShifts
        currentTask={currentTask}
        loadGroupedParts={loadGroupedParts}
        loadShiftSettings={mockLoadShiftSettings}
        onChanged={onChanged}
      />,
    );
    await waitFor(() => expect(loadGroupedParts).toHaveBeenCalledTimes(1));

    fireEvent.press(screen.getByLabelText("Удалить тестовую смену"));

    await waitFor(() => {
      expect(mockRemoveProductionTaskParts).toHaveBeenCalledWith({
        accessToken: "access-token",
        id: "part-1",
      });
      expect(loadGroupedParts).toHaveBeenCalledTimes(2);
      expect(onChanged).toHaveBeenCalledTimes(1);
    });

    alertSpy.mockRestore();
  });

  test("blocks shift deletion while offline", async () => {
    mockIsConnected = false;
    const loadGroupedParts = jest.fn().mockResolvedValue([]);
    const alertSpy = jest
      .spyOn(Alert, "alert")
      .mockImplementation((title, _message, buttons) => {
        if (title === "Удалить выработку") {
          void buttons?.[1]?.onPress?.();
        }
      });

    render(
      <TaskShifts
        currentTask={currentTask}
        loadGroupedParts={loadGroupedParts}
        loadShiftSettings={mockLoadShiftSettings}
      />,
    );
    await waitFor(() => expect(loadGroupedParts).toHaveBeenCalledTimes(1));

    fireEvent.press(screen.getByLabelText("Удалить тестовую смену"));

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith(
        "Нет подключения к интернету",
        "Удаление отрезка доступно только онлайн.",
      );
    });
    expect(mockRemoveProductionTaskParts).not.toHaveBeenCalled();

    alertSpy.mockRestore();
  });

  test("deletes every part in a grouped work block", async () => {
    const loadGroupedParts = jest.fn().mockResolvedValue([]);
    const alertSpy = jest
      .spyOn(Alert, "alert")
      .mockImplementation((title, message, buttons) => {
        if (title === "Удаление блока") {
          expect(message).toBe(
            "Удалить выбранный рабочий блок?\n\nБудут удалены: работа на поле и перегон техники",
          );
          void buttons?.[1]?.onPress?.();
        }
      });

    render(
      <TaskShifts
        currentTask={currentTask}
        loadGroupedParts={loadGroupedParts}
        loadShiftSettings={mockLoadShiftSettings}
      />,
    );
    await waitFor(() => expect(loadGroupedParts).toHaveBeenCalledTimes(1));

    fireEvent.press(screen.getByLabelText("Удалить тестовый блок"));

    await waitFor(() => {
      expect(mockRemoveProductionTaskParts).toHaveBeenCalledTimes(2);
      expect(mockRemoveProductionTaskParts).toHaveBeenCalledWith({
        accessToken: "access-token",
        id: "part-1",
      });
      expect(mockRemoveProductionTaskParts).toHaveBeenCalledWith({
        accessToken: "access-token",
        id: "part-2",
      });
      expect(loadGroupedParts).toHaveBeenCalledTimes(2);
    });

    alertSpy.mockRestore();
  });
});
