import { act, renderHook, waitFor } from "@testing-library/react-native";

import { useTaskDetailTrack } from "../../widgets/Work/Field/Detail/task-detail/useTaskDetailTrack";

const createTrack = (taskTechniqueId: string) =>
  ({
    task_technique_id: taskTechniqueId,
    technique: {
      technique_standard: {
        id: `standard-${taskTechniqueId}`,
        name: `Техника ${taskTechniqueId}`,
      },
      last_position: [37.6, 55.7],
    },
    lines: [],
  }) as any;

const createResponse = (tracks: any[]) =>
  ({ production_task_id: "task-1", tracks }) as any;

const createOptions = (overrides: Record<string, unknown> = {}) => ({
  taskId: "task-1",
  taskTechniques: [{ id: "technique-1" }, { id: "technique-2" }],
  getValidAccessToken: jest.fn().mockResolvedValue("access-token"),
  loadProductionTaskTrack: jest
    .fn()
    .mockResolvedValue(createResponse([createTrack("technique-1")])),
  ...overrides,
});

describe("useTaskDetailTrack", () => {
  test("loads a track only after opening the map tab and caches it", async () => {
    const options = createOptions();
    const { result, rerender } = renderHook(
      ({ isActive }) => useTaskDetailTrack({ ...options, isActive }),
      { initialProps: { isActive: false } },
    );

    expect(options.getValidAccessToken).not.toHaveBeenCalled();
    expect(options.loadProductionTaskTrack).not.toHaveBeenCalled();

    rerender({ isActive: true });
    await waitFor(() => {
      expect(options.loadProductionTaskTrack).toHaveBeenCalledWith({
        accessToken: "access-token",
        taskId: "task-1",
      });
      expect(result.current.taskTrack?.tracks).toHaveLength(1);
    });

    rerender({ isActive: false });
    rerender({ isActive: true });
    await act(async () => undefined);

    expect(options.loadProductionTaskTrack).toHaveBeenCalledTimes(1);
    expect(result.current.isTrackLoading).toBe(false);
  });

  test("retries after an empty track response", async () => {
    const options = createOptions({
      loadProductionTaskTrack: jest
        .fn()
        .mockResolvedValue(createResponse([])),
    });
    const { rerender } = renderHook(
      ({ isActive }) => useTaskDetailTrack({ ...options, isActive }),
      { initialProps: { isActive: true } },
    );

    await waitFor(() => {
      expect(options.loadProductionTaskTrack).toHaveBeenCalledTimes(1);
    });

    rerender({ isActive: false });
    rerender({ isActive: true });

    await waitFor(() => {
      expect(options.loadProductionTaskTrack).toHaveBeenCalledTimes(2);
    });
  });

  test("does not request a track without an access token", async () => {
    const options = createOptions({
      getValidAccessToken: jest.fn().mockResolvedValue(null),
    });
    const { result } = renderHook(() =>
      useTaskDetailTrack({ ...options, isActive: true }),
    );

    await waitFor(() => {
      expect(options.getValidAccessToken).toHaveBeenCalledTimes(1);
    });

    expect(options.loadProductionTaskTrack).not.toHaveBeenCalled();
    expect(result.current.isTrackLoading).toBe(false);
    expect(result.current.taskTrack).toBeNull();
  });

  test("selects a technique track and prepares its map marker", async () => {
    const options = createOptions({
      loadProductionTaskTrack: jest.fn().mockResolvedValue(
        createResponse([
          createTrack("technique-1"),
          createTrack("technique-2"),
        ]),
      ),
    });
    const { result } = renderHook(() =>
      useTaskDetailTrack({ ...options, isActive: true }),
    );

    await waitFor(() => {
      expect(result.current.selectedTrack?.task_technique_id).toBe(
        "technique-1",
      );
    });

    act(() => result.current.setSelectedTaskTechniqueId("technique-2"));

    expect(result.current.selectedTrack?.task_technique_id).toBe("technique-2");
    expect(result.current.selectedMapTechnique).toEqual([
      {
        technique_standard: expect.objectContaining({
          id: "standard-technique-2",
        }),
        last_position: [37.6, 55.7],
      },
    ]);
  });
});
