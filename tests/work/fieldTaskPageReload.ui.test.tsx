import { fireEvent, render, screen } from "@testing-library/react-native";
import { router } from "expo-router";
import React, { useState } from "react";
import { Pressable, Text, View } from "react-native";

import { FieldTaskPage } from "../../app/production/tasks/[id]";

let mockFieldTaskState: any;

jest.mock("expo-router", () => ({
  router: {
    back: jest.fn(),
  },
  useLocalSearchParams: () => ({ id: "task-1" }),
}));

const mockRouterBack = jest.mocked(router.back);

jest.mock("../../widgets/Work/Field/Edit/useFieldTaskEditData", () => ({
  useFieldTaskEditData: () => mockFieldTaskState,
}));

jest.mock("../../shared/lib/useReloadOnReturn", () => ({
  useReloadOnReturn: jest.fn(),
}));

jest.mock("../../widgets/Work/Field/Detail/TaskDetail", () => {
  return {
    TaskDetailScreen: MockTaskDetailScreen,
  };
});

function MockTaskDetailScreen() {
  const [activeTab, setActiveTab] = useState("Информация");

  return (
    <View>
      <Text>{activeTab}</Text>
      <Pressable onPress={() => setActiveTab("Мониторинг")}>
        <Text>Открыть мониторинг</Text>
      </Pressable>
    </View>
  );
}

jest.mock("../../widgets/Work/Field/Edit/TaskEdit", () => ({
  TaskEditScreen: () => null,
}));

describe("FieldTaskPage reload", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("keeps the detail screen and its active tab during a background reload", () => {
    const currentTask = {
      id: "task-1",
      task_type: { id: 1 },
      field_task: {
        task_fields: [{ id: "task-field-1" }],
      },
    };

    mockFieldTaskState = {
      currentTask,
      isLoading: false,
      error: null,
      reload: jest.fn(),
    };

    const view = render(<FieldTaskPage id="task-1" />);

    fireEvent.press(screen.getByText("Открыть мониторинг"));
    expect(screen.getByText("Мониторинг")).toBeTruthy();

    mockFieldTaskState = {
      ...mockFieldTaskState,
      isLoading: true,
    };
    view.rerender(<FieldTaskPage id="task-1" />);

    expect(screen.getByText("Мониторинг")).toBeTruthy();
  });

  test("shows a structured loading state with navigation back", () => {
    mockFieldTaskState = {
      currentTask: null,
      isLoading: true,
      error: null,
      reload: jest.fn(),
    };

    render(<FieldTaskPage id="task-1" />);

    expect(
      screen.getByLabelText("Загрузка страницы просмотра задания"),
    ).toBeTruthy();
    expect(screen.getByText("Загружаем задание")).toBeTruthy();

    fireEvent.press(screen.getByLabelText("Назад"));
    expect(mockRouterBack).toHaveBeenCalledTimes(1);
  });

  test("offers retry and return when loading fails", () => {
    const reload = jest.fn();
    mockFieldTaskState = {
      currentTask: null,
      isLoading: false,
      error: new Error("network"),
      reload,
    };

    render(<FieldTaskPage id="task-1" />);

    fireEvent.press(screen.getByText("Повторить"));
    fireEvent.press(screen.getByText("Назад"));

    expect(reload).toHaveBeenCalledTimes(1);
    expect(mockRouterBack).toHaveBeenCalledTimes(1);
  });
});
