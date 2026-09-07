import { act, renderHook } from "@testing-library/react-native";
import { Alert } from "react-native";

import { useTaskDetailMapFields } from "../../widgets/Work/Field/Detail/task-detail/useTaskDetailMapFields";

const fields = [
  { id: "task-field-1", season_field: { id: "field-1" } },
  { id: "task-field-2", season_field: { id: "field-2" } },
];

const createOptions = (overrides: Record<string, unknown> = {}) => ({
  taskId: "task-1",
  fields,
  getValidAccessToken: jest.fn().mockResolvedValue("access-token"),
  addProductionTaskField: jest.fn().mockResolvedValue(true),
  removeProductionTaskField: jest.fn().mockResolvedValue(true),
  onReload: jest.fn().mockResolvedValue(undefined),
  ...overrides,
});

describe("useTaskDetailMapFields", () => {
  let alertSpy: jest.SpyInstance;

  beforeEach(() => {
    alertSpy = jest.spyOn(Alert, "alert").mockImplementation(jest.fn());
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("opens the map with current fields and closes without API calls", async () => {
    const options = createOptions();
    const { result } = renderHook(() => useTaskDetailMapFields(options));

    act(() => result.current.openMap());
    expect(result.current.isMapModalVisible).toBe(true);
    expect(result.current.selectedMapFieldIds).toBeNull();
    expect(result.current.selectedFieldIds).toEqual(["field-1", "field-2"]);

    await act(async () => {
      await result.current.saveMapFields();
    });

    expect(result.current.isMapModalVisible).toBe(false);
    expect(options.getValidAccessToken).not.toHaveBeenCalled();
    expect(options.addProductionTaskField).not.toHaveBeenCalled();
    expect(options.removeProductionTaskField).not.toHaveBeenCalled();
  });

  test("removes old fields before adding new ones and reloads", async () => {
    const options = createOptions();
    const { result } = renderHook(() => useTaskDetailMapFields(options));

    act(() => {
      result.current.openMap();
      result.current.toggleMapField("field-1");
      result.current.toggleMapField("field-3");
    });
    expect(result.current.selectedMapFieldIds).toEqual(["field-2", "field-3"]);

    await act(async () => {
      await result.current.saveMapFields();
    });

    expect(options.removeProductionTaskField).toHaveBeenCalledWith({
      accessToken: "access-token",
      id: "task-field-1",
    });
    expect(options.addProductionTaskField).toHaveBeenCalledWith({
      accessToken: "access-token",
      data: {
        production_task_id: "task-1",
        season_field_id: "field-3",
        production_plan_work_id: null,
      },
    });
    expect(
      options.removeProductionTaskField.mock.invocationCallOrder[0],
    ).toBeLessThan(options.addProductionTaskField.mock.invocationCallOrder[0]);
    expect(options.onReload).toHaveBeenCalledTimes(1);
    expect(result.current.isMapModalVisible).toBe(false);
    expect(result.current.isSavingMapFields).toBe(false);
  });

  test("stops after a field removal error", async () => {
    const options = createOptions({
      removeProductionTaskField: jest.fn().mockResolvedValue(false),
    });
    const { result } = renderHook(() => useTaskDetailMapFields(options));

    act(() => {
      result.current.openMap();
      result.current.toggleMapField("field-1");
    });
    await act(async () => {
      await result.current.saveMapFields();
    });

    expect(options.addProductionTaskField).not.toHaveBeenCalled();
    expect(options.onReload).not.toHaveBeenCalled();
    expect(alertSpy).toHaveBeenLastCalledWith(
      "Ошибка",
      "Не удалось удалить поле из задания",
    );
    expect(result.current.isMapModalVisible).toBe(true);
    expect(result.current.isSavingMapFields).toBe(false);
  });

  test("keeps the map open when adding fails after a successful removal", async () => {
    const options = createOptions({
      addProductionTaskField: jest.fn().mockResolvedValue(false),
    });
    const { result } = renderHook(() => useTaskDetailMapFields(options));

    act(() => {
      result.current.openMap();
      result.current.toggleMapField("field-1");
      result.current.toggleMapField("field-3");
    });
    await act(async () => {
      await result.current.saveMapFields();
    });

    expect(options.removeProductionTaskField).toHaveBeenCalledTimes(1);
    expect(options.addProductionTaskField).toHaveBeenCalledTimes(1);
    expect(options.onReload).not.toHaveBeenCalled();
    expect(alertSpy).toHaveBeenLastCalledWith(
      "Ошибка",
      "Не удалось добавить поле в задание",
    );
    expect(result.current.isMapModalVisible).toBe(true);
  });

  test("does not start saving without an access token", async () => {
    const options = createOptions({
      getValidAccessToken: jest.fn().mockResolvedValue(null),
    });
    const { result } = renderHook(() => useTaskDetailMapFields(options));

    act(() => {
      result.current.openMap();
      result.current.toggleMapField("field-3");
    });
    await act(async () => {
      await result.current.saveMapFields();
    });

    expect(options.addProductionTaskField).not.toHaveBeenCalled();
    expect(result.current.isMapModalVisible).toBe(true);
    expect(result.current.isSavingMapFields).toBe(false);
  });
});
