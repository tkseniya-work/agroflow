import { act, renderHook } from "@testing-library/react-native";
import { Alert } from "react-native";

import { useTaskStatusActions } from "../../widgets/Work/Field/Detail/task-detail/useTaskStatusActions";

const getActionButton = (alertSpy: jest.SpyInstance, text: string) => {
  const buttons = alertSpy.mock.calls[0][2];

  return buttons?.find((button: { text?: string }) => button.text === text);
};

const createOptions = (overrides: Record<string, unknown> = {}) => ({
  taskId: "task-1",
  isConnected: true,
  getValidAccessToken: jest.fn().mockResolvedValue("access-token"),
  updateTaskStatus: jest.fn().mockResolvedValue(true),
  onReload: jest.fn().mockResolvedValue(undefined),
  ...overrides,
});

describe("useTaskStatusActions", () => {
  let alertSpy: jest.SpyInstance;

  beforeEach(() => {
    alertSpy = jest.spyOn(Alert, "alert").mockImplementation(jest.fn());
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("completes a task and reloads its details", async () => {
    const options = createOptions();
    const { result } = renderHook(() => useTaskStatusActions(options));

    act(() => result.current.confirmCompleteTask());
    expect(alertSpy).toHaveBeenCalledWith(
      "Завершить задание",
      "Вы действительно хотите завершить это задание?",
      expect.arrayContaining([
        expect.objectContaining({ text: "Отмена", style: "cancel" }),
        expect.objectContaining({ text: "Завершить" }),
      ]),
    );

    await act(async () => {
      await getActionButton(alertSpy, "Завершить")?.onPress?.();
    });

    expect(options.updateTaskStatus).toHaveBeenCalledWith({
      accessToken: "access-token",
      productionTaskId: "task-1",
      status: 2,
    });
    expect(options.onReload).toHaveBeenCalledTimes(1);
  });

  test("resumes an archived task with status one", async () => {
    const options = createOptions();
    const { result } = renderHook(() => useTaskStatusActions(options));

    act(() => result.current.confirmResumeTask());
    await act(async () => {
      await getActionButton(alertSpy, "Возобновить")?.onPress?.();
    });

    expect(options.updateTaskStatus).toHaveBeenCalledWith(
      expect.objectContaining({ status: 1 }),
    );
  });

  test("blocks status changes while offline", async () => {
    const options = createOptions({ isConnected: false });
    const { result } = renderHook(() => useTaskStatusActions(options));

    act(() => result.current.confirmCompleteTask());
    await act(async () => {
      await getActionButton(alertSpy, "Завершить")?.onPress?.();
    });

    expect(options.getValidAccessToken).not.toHaveBeenCalled();
    expect(options.updateTaskStatus).not.toHaveBeenCalled();
    expect(alertSpy).toHaveBeenLastCalledWith(
      "Нет подключения к интернету",
      "Изменение статуса доступно только онлайн.",
    );
  });

  test("does not reload after a failed status update", async () => {
    const options = createOptions({
      updateTaskStatus: jest.fn().mockResolvedValue(false),
    });
    const { result } = renderHook(() => useTaskStatusActions(options));

    act(() => result.current.confirmCompleteTask());
    await act(async () => {
      await getActionButton(alertSpy, "Завершить")?.onPress?.();
    });

    expect(options.onReload).not.toHaveBeenCalled();
  });
});
