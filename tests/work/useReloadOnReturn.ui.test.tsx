import { act, renderHook } from "@testing-library/react-native";

import { useReloadOnReturn } from "../../shared/lib/useReloadOnReturn";

let mockFocusCallback: (() => void) | null = null;

jest.mock("@react-navigation/native", () => ({
  useFocusEffect: (callback: () => void) => {
    mockFocusCallback = callback;
  },
}));

describe("useReloadOnReturn", () => {
  beforeEach(() => {
    mockFocusCallback = null;
  });

  test("skips initial focus and reloads after returning to the screen", () => {
    const reload = jest.fn();

    renderHook(() => useReloadOnReturn(reload));

    act(() => mockFocusCallback?.());
    expect(reload).not.toHaveBeenCalled();

    act(() => mockFocusCallback?.());
    expect(reload).toHaveBeenCalledTimes(1);
  });

  test("uses the latest reload function without resetting focus history", () => {
    const firstReload = jest.fn();
    const secondReload = jest.fn();
    const { rerender } = renderHook(
      ({ reload }) => useReloadOnReturn(reload),
      { initialProps: { reload: firstReload } },
    );

    act(() => mockFocusCallback?.());
    rerender({ reload: secondReload });
    act(() => mockFocusCallback?.());

    expect(firstReload).not.toHaveBeenCalled();
    expect(secondReload).toHaveBeenCalledTimes(1);
  });
});
