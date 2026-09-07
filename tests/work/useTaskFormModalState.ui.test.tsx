import { act, renderHook } from "@testing-library/react-native";

import { useTaskFormModalState } from "../../widgets/Work/useTaskFormModalState";

const task = (id: number) =>
  ({
    id: `task-${id}`,
    task_type: { id },
  }) as any;

describe("useTaskFormModalState", () => {
  test("opens a create form and clears it on close", () => {
    const { result } = renderHook(() => useTaskFormModalState());

    act(() => result.current.openCreate("field"));
    expect(result.current.activeType).toBe("field");
    expect(result.current.currentTask).toBeNull();

    act(() => result.current.close());
    expect(result.current.activeType).toBeNull();
    expect(result.current.currentTask).toBeNull();
  });

  test("maps task type 1 to the field edit form", () => {
    const currentTask = task(1);
    const { result } = renderHook(() => useTaskFormModalState());

    act(() => result.current.openEdit(currentTask));

    expect(result.current.activeType).toBe("field");
    expect(result.current.currentTask).toBe(currentTask);
  });

  test("ignores a task with an unsupported type", () => {
    const { result } = renderHook(() => useTaskFormModalState());

    act(() => result.current.openEdit(task(99)));

    expect(result.current.activeType).toBeNull();
  });
});
