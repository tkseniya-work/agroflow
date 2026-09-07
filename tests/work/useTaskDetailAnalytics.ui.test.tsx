import { renderHook, waitFor } from "@testing-library/react-native";

import { useTaskDetailAnalytics } from "../../widgets/Work/Field/Detail/task-detail/useTaskDetailAnalytics";

const fields: any[] = [];

const createTask = (id = "task-1") =>
  ({
    id,
    field_task: { task_fields: [] },
  }) as any;

const createOptions = (overrides: Record<string, unknown> = {}) => ({
  currentTask: createTask(),
  fields,
  getValidAccessToken: jest.fn().mockResolvedValue("access-token"),
  getProductionFieldTaskGroupedParts: jest
    .fn()
    .mockResolvedValue({ data: [{ id: "group-1" }] }),
  getCurrentFieldTaskAnalytic: jest
    .fn()
    .mockResolvedValue({ completed: 12, need_to_do: 20 }),
  ...overrides,
});

describe("useTaskDetailAnalytics", () => {
  test("loads both analytics sources only after opening the tab", async () => {
    const options = createOptions();
    const { result, rerender } = renderHook(
      ({ isActive }) => useTaskDetailAnalytics({ ...options, isActive }),
      { initialProps: { isActive: false } },
    );

    expect(options.getValidAccessToken).not.toHaveBeenCalled();
    expect(options.getProductionFieldTaskGroupedParts).not.toHaveBeenCalled();
    expect(options.getCurrentFieldTaskAnalytic).not.toHaveBeenCalled();

    rerender({ isActive: true });
    await waitFor(() => {
      expect(result.current.isLoading).toBe(true);
    });

    await waitFor(() => {
      expect(options.getProductionFieldTaskGroupedParts).toHaveBeenCalledWith({
        accessToken: "access-token",
        taskId: "task-1",
      });
      expect(options.getCurrentFieldTaskAnalytic).toHaveBeenCalledWith({
        accessToken: "access-token",
        id: "task-1",
      });
      expect(result.current.groupedParts).toEqual([{ id: "group-1" }]);
      expect(result.current.currentTaskAnalytic).toEqual({
        completed: 12,
        need_to_do: 20,
      });
      expect(result.current.isLoading).toBe(false);
    });

    rerender({ isActive: false });
    rerender({ isActive: true });

    expect(options.getProductionFieldTaskGroupedParts).toHaveBeenCalledTimes(1);
    expect(options.getCurrentFieldTaskAnalytic).toHaveBeenCalledTimes(1);
  });

  test("starts grouped parts and backend analytics requests in parallel", async () => {
    let resolveGroupedParts: (value: unknown) => void = () => undefined;
    let resolveAnalytics: (value: unknown) => void = () => undefined;
    const getProductionFieldTaskGroupedParts = jest.fn(
      () =>
        new Promise((resolve) => {
          resolveGroupedParts = resolve;
        }),
    );
    const getCurrentFieldTaskAnalytic = jest.fn(
      () =>
        new Promise((resolve) => {
          resolveAnalytics = resolve;
        }),
    );
    const options = createOptions({
      getProductionFieldTaskGroupedParts,
      getCurrentFieldTaskAnalytic,
    });
    const { result } = renderHook(() =>
      useTaskDetailAnalytics({ ...options, isActive: true }),
    );

    await waitFor(() => {
      expect(getProductionFieldTaskGroupedParts).toHaveBeenCalledTimes(1);
      expect(getCurrentFieldTaskAnalytic).toHaveBeenCalledTimes(1);
      expect(result.current.isLoading).toBe(true);
    });

    resolveGroupedParts([]);
    resolveAnalytics(null);
    await waitFor(() => {
      expect(result.current.groupedParts).toEqual([]);
      expect(result.current.isLoading).toBe(false);
    });
  });

  test("does not request analytics without an access token", async () => {
    const options = createOptions({
      getValidAccessToken: jest.fn().mockResolvedValue(null),
    });
    renderHook(() =>
      useTaskDetailAnalytics({ ...options, isActive: true }),
    );

    await waitFor(() => {
      expect(options.getValidAccessToken).toHaveBeenCalledTimes(1);
    });

    expect(options.getProductionFieldTaskGroupedParts).not.toHaveBeenCalled();
    expect(options.getCurrentFieldTaskAnalytic).not.toHaveBeenCalled();
  });

  test("resets and loads analytics for a different task", async () => {
    const options = createOptions();
    const { rerender } = renderHook(
      ({ currentTask }) =>
        useTaskDetailAnalytics({
          ...options,
          currentTask,
          isActive: true,
        }),
      { initialProps: { currentTask: createTask("task-1") } },
    );

    await waitFor(() => {
      expect(options.getCurrentFieldTaskAnalytic).toHaveBeenCalledTimes(1);
    });

    rerender({ currentTask: createTask("task-2") });
    await waitFor(() => {
      expect(options.getCurrentFieldTaskAnalytic).toHaveBeenLastCalledWith({
        accessToken: "access-token",
        id: "task-2",
      });
      expect(options.getCurrentFieldTaskAnalytic).toHaveBeenCalledTimes(2);
    });
  });
});
