import { act, renderHook } from "@testing-library/react-native";

import { useTaskFieldSelection } from "../../widgets/Work/Field/Edit/useTaskFieldSelection";

const currentTask = {
  id: "task-1",
  field_task: {
    task_fields: [
      {
        id: "task-field-1",
        season_field: { id: "field-1" },
        plan_work: { id: "work-1" },
      },
      {
        id: "task-field-2",
        season_field: { id: "field-2" },
        plan_work: null,
      },
    ],
  },
} as any;

const createProps = (overrides: Record<string, unknown> = {}) => ({
  currentTask,
  addTaskField: jest.fn().mockResolvedValue(true),
  removeTaskField: jest.fn().mockResolvedValue(true),
  saveTask: jest.fn().mockResolvedValue(true),
  showError: jest.fn(),
  ...overrides,
});

describe("useTaskFieldSelection", () => {
  test("removes old fields and adds draft fields on save", async () => {
    const props = createProps();
    const { result } = renderHook(() => useTaskFieldSelection(props));

    expect(result.current.selectedFieldIds).toEqual(["field-1", "field-2"]);
    expect(result.current.selectedWorkIds).toEqual({
      "field-1": "work-1",
      "field-2": null,
    });

    act(() => {
      result.current.openMap();
    });
    act(() => {
      result.current.toggleDraftField({ id: "field-1" });
      result.current.toggleDraftField({ id: "field-3" });
    });

    expect(result.current.draftSelectedFieldIds).toEqual([
      "field-2",
      "field-3",
    ]);

    await act(async () => {
      await result.current.saveMap();
    });

    expect(props.removeTaskField).toHaveBeenCalledWith("task-field-1");
    expect(props.addTaskField).toHaveBeenCalledWith({
      production_task_id: "task-1",
      season_field_id: "field-3",
      production_plan_work_id: null,
    });
    expect(result.current.selectedFieldIds).toEqual(["field-2", "field-3"]);
    expect(result.current.selectedWorkIds).toEqual({
      "field-2": null,
      "field-3": null,
    });
    expect(result.current.isMapOpen).toBe(false);
  });

  test("restores the saved field selection when map changes are cancelled", () => {
    const props = createProps();
    const { result } = renderHook(() => useTaskFieldSelection(props));

    act(() => {
      result.current.openMap();
    });
    act(() => {
      result.current.toggleDraftField({ id: "field-3" });
    });
    expect(result.current.draftSelectedFieldIds).toContain("field-3");

    act(() => {
      result.current.closeMap();
    });

    expect(result.current.draftSelectedFieldIds).toEqual([
      "field-1",
      "field-2",
    ]);
    expect(result.current.isMapOpen).toBe(false);
    expect(props.addTaskField).not.toHaveBeenCalled();
    expect(props.removeTaskField).not.toHaveBeenCalled();
  });

  test("persists the complete plan work selection", async () => {
    let resolveSave!: (success: boolean) => void;
    const saveTask = jest.fn(
      () =>
        new Promise<boolean>((resolve) => {
          resolveSave = resolve;
        }),
    );
    const props = createProps({ saveTask });
    const { result } = renderHook(() => useTaskFieldSelection(props));
    let savePromise!: Promise<void>;

    act(() => {
      savePromise = result.current.toggleWork(
        { id: "field-1" },
        { id: "work-2" },
      );
    });

    expect(result.current.selectedWorkIds["field-1"]).toBe("work-2");
    expect(result.current.updatingFieldId).toBe("field-1");

    await act(async () => {
      resolveSave(true);
      await savePromise;
    });

    expect(saveTask).toHaveBeenCalledWith({
      field_work_ids: [
        {
          season_field_id: "field-1",
          production_plan_work_id: "work-2",
        },
        {
          season_field_id: "field-2",
          production_plan_work_id: null,
        },
      ],
    });
    expect(result.current.updatingFieldId).toBeNull();
  });

  test("rolls plan work selection back when saving fails", async () => {
    const saveTask = jest.fn().mockResolvedValue(false);
    const showError = jest.fn();
    const props = createProps({ saveTask, showError });
    const { result } = renderHook(() => useTaskFieldSelection(props));

    await act(async () => {
      await result.current.toggleWork(
        { id: "field-1" },
        { id: "work-2" },
      );
    });

    expect(result.current.selectedWorkIds["field-1"]).toBe("work-1");
    expect(showError).toHaveBeenCalledWith(
      "Не удалось сохранить плановую работу",
    );
    expect(result.current.updatingFieldId).toBeNull();
  });
});
