import { act, renderHook } from "@testing-library/react-native";
import { Alert } from "react-native";

import { useTaskDeletion } from "../../widgets/Work/useTaskDeletion";

const productionTask = { id: "task-1" } as any;

const getDeleteButton = (alertSpy: jest.SpyInstance) => {
  const buttons = alertSpy.mock.calls[0][2];

  return buttons?.find((button: { text?: string }) => button.text === "Удалить");
};

describe("useTaskDeletion", () => {
  let alertSpy: jest.SpyInstance;

  beforeEach(() => {
    alertSpy = jest.spyOn(Alert, "alert").mockImplementation(jest.fn());
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("shows a cancellable confirmation before deletion", () => {
    const { result } = renderHook(() =>
      useTaskDeletion({
        isConnected: true,
        getValidAccessToken: jest.fn().mockResolvedValue("token"),
        onDeleteTask: jest.fn().mockResolvedValue(true),
      }),
    );

    act(() => result.current(productionTask));

    expect(alertSpy).toHaveBeenCalledWith(
      "Удалить задание?",
      "Это действие нельзя отменить.",
      expect.arrayContaining([
        expect.objectContaining({ text: "Отмена", style: "cancel" }),
        expect.objectContaining({ text: "Удалить", style: "destructive" }),
      ]),
      { cancelable: true },
    );
  });

  test("blocks deletion while offline", async () => {
    const getValidAccessToken = jest.fn();
    const onDeleteTask = jest.fn();
    const { result } = renderHook(() =>
      useTaskDeletion({
        isConnected: false,
        getValidAccessToken,
        onDeleteTask,
      }),
    );

    act(() => result.current(productionTask));
    await act(async () => {
      await getDeleteButton(alertSpy)?.onPress?.();
    });

    expect(getValidAccessToken).not.toHaveBeenCalled();
    expect(onDeleteTask).not.toHaveBeenCalled();
    expect(alertSpy).toHaveBeenLastCalledWith(
      "Нет подключения к интернету",
      "Удаление задания доступно только онлайн.",
    );
  });

  test("deletes the selected task with a valid token", async () => {
    const getValidAccessToken = jest.fn().mockResolvedValue("access-token");
    const onDeleteTask = jest.fn().mockResolvedValue(true);
    const { result } = renderHook(() =>
      useTaskDeletion({
        isConnected: true,
        getValidAccessToken,
        onDeleteTask,
      }),
    );

    act(() => result.current(productionTask));
    await act(async () => {
      await getDeleteButton(alertSpy)?.onPress?.();
    });

    expect(onDeleteTask).toHaveBeenCalledWith({
      accessToken: "access-token",
      productionTaskId: "task-1",
    });
    expect(alertSpy).toHaveBeenCalledTimes(1);
  });

  test("shows an error when the server rejects deletion", async () => {
    const { result } = renderHook(() =>
      useTaskDeletion({
        isConnected: true,
        getValidAccessToken: jest.fn().mockResolvedValue("token"),
        onDeleteTask: jest.fn().mockResolvedValue(false),
      }),
    );

    act(() => result.current(productionTask));
    await act(async () => {
      await getDeleteButton(alertSpy)?.onPress?.();
    });

    expect(alertSpy).toHaveBeenLastCalledWith(
      "Не удалось удалить задание",
      "Сервер вернул ошибку. Попробуйте еще раз.",
    );
  });

  test("handles token and request exceptions", async () => {
    const error = new Error("token failed");
    const consoleSpy = jest.spyOn(console, "error").mockImplementation();
    const { result } = renderHook(() =>
      useTaskDeletion({
        isConnected: true,
        getValidAccessToken: jest.fn().mockRejectedValue(error),
        onDeleteTask: jest.fn(),
      }),
    );

    act(() => result.current(productionTask));
    await act(async () => {
      await getDeleteButton(alertSpy)?.onPress?.();
    });

    expect(consoleSpy).toHaveBeenCalledWith("delete task error", error);
    expect(alertSpy).toHaveBeenLastCalledWith(
      "Не удалось удалить задание",
      "Сервер вернул ошибку. Попробуйте еще раз.",
    );
  });
});
