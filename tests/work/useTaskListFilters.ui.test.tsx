import { act, renderHook } from "@testing-library/react-native";

import { useTaskListFilters } from "../../widgets/Work/useTaskListFilters";

describe("useTaskListFilters", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test("debounces server filters and maps the selected task type", () => {
    const onFiltersChange = jest.fn();
    const { result } = renderHook(() =>
      useTaskListFilters({
        productionTasks: [],
        serverFiltering: true,
        onFiltersChange,
      }),
    );

    act(() => {
      jest.advanceTimersByTime(180);
    });
    expect(onFiltersChange).toHaveBeenLastCalledWith({
      search: "",
      taskTypes: [1, 2, 3, 4],
    });

    onFiltersChange.mockClear();
    act(() => {
      result.current.setActiveTaskChip("transport");
      result.current.setSearchQuery("зерно");
    });
    act(() => {
      jest.advanceTimersByTime(349);
    });
    expect(onFiltersChange).not.toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(1);
    });
    expect(onFiltersChange).toHaveBeenCalledWith({
      search: "зерно",
      taskTypes: [2],
    });
  });

  test("does not notify the server while filtering locally", () => {
    const onFiltersChange = jest.fn();

    renderHook(() =>
      useTaskListFilters({
        productionTasks: [],
        serverFiltering: false,
        onFiltersChange,
      }),
    );
    act(() => {
      jest.runAllTimers();
    });

    expect(onFiltersChange).not.toHaveBeenCalled();
  });
});
