import { act, renderHook } from "@testing-library/react-native";
import { Alert } from "react-native";

import { useForcedShiftCloseFlow } from "../../widgets/Work/work-screen/useForcedShiftCloseFlow";

const settings = {
  first_shift_start: "07:00:00",
  first_shift_end: "19:00:00",
  second_shift_start: "19:00:00",
  second_shift_end: "07:00:00",
};

describe("useForcedShiftCloseFlow", () => {
  afterEach(() => {
    jest.useRealTimers();
  });

  test("opens the picker and closes an old online shift at selected time", async () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2026-07-21T12:00:00"));

    const closeOnlineShifts = jest.fn().mockResolvedValue(undefined);
    const onClosed = jest.fn();
    const alertSpy = jest.spyOn(Alert, "alert").mockImplementation(jest.fn());
    const shift = {
      productionShiftId: "shift-1",
      shiftType: { id: 1 },
      openAt: "2026-07-20T07:00:00",
    };
    const { result } = renderHook(() =>
      useForcedShiftCloseFlow({
        shiftSettings: settings,
        isFocused: false,
        isLoading: false,
        getExpiredPendingShifts: jest.fn().mockReturnValue([]),
        closeOfflineShifts: jest.fn().mockResolvedValue(undefined),
        closeOnlineShifts,
        showError: jest.fn(),
      }),
    );

    act(() => {
      result.current.openForcedCloseModal(
        [shift],
        onClosed,
        true,
        true,
        "online",
      );
    });

    expect(result.current.modalProps.visible).toBe(true);
    expect(result.current.modalProps.mode).toBe("online");
    expect(result.current.modalProps.needsTime).toBe(true);
    expect(result.current.modalProps.pickerVisible).toBe(true);

    act(() => {
      result.current.modalProps.onDateTimeChange({
        date: "2026-07-20",
        time: "18:30:00",
      });
    });
    act(() => {
      result.current.modalProps.onConfirm();
    });

    expect(alertSpy).toHaveBeenCalledWith(
      "Подтвердите закрытие",
      expect.stringContaining("Закрыть онлайн-смену временем"),
      expect.any(Array),
    );

    const actions = alertSpy.mock.calls[0][2] as any[];
    await act(async () => {
      actions[1].onPress();
      await Promise.resolve();
    });

    expect(closeOnlineShifts).toHaveBeenCalledWith(
      [shift],
      new Date("2026-07-20T18:30:00").toISOString(),
    );
    expect(onClosed).toHaveBeenCalledTimes(1);
    expect(result.current.modalProps.visible).toBe(false);

    alertSpy.mockRestore();
  });

  test("keeps an offline shift open when local closing fails", async () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2026-07-21T12:00:00"));

    const closeOfflineShifts = jest
      .fn()
      .mockRejectedValue(new Error("Database error"));
    const onClosed = jest.fn();
    const alertSpy = jest.spyOn(Alert, "alert").mockImplementation(jest.fn());
    const consoleSpy = jest
      .spyOn(console, "error")
      .mockImplementation(jest.fn());
    const shift = {
      id: 1,
      shiftType: { id: 1 },
      scannedAt: "2026-07-21T07:00:00",
    };
    const { result } = renderHook(() =>
      useForcedShiftCloseFlow({
        shiftSettings: settings,
        isFocused: false,
        isLoading: false,
        getExpiredPendingShifts: jest.fn().mockReturnValue([]),
        closeOfflineShifts,
        closeOnlineShifts: jest.fn().mockResolvedValue(undefined),
        showError: jest.fn(),
      }),
    );

    act(() => {
      result.current.openForcedCloseModal([shift], onClosed);
    });
    act(() => {
      result.current.modalProps.onConfirm();
    });

    const actions = alertSpy.mock.calls[0][2] as any[];
    await act(async () => {
      actions[1].onPress();
      await Promise.resolve();
    });

    expect(closeOfflineShifts).toHaveBeenCalledTimes(1);
    expect(onClosed).not.toHaveBeenCalled();
    expect(result.current.modalProps.visible).toBe(true);
    expect(result.current.modalProps.shifts).toEqual([shift]);
    expect(result.current.modalProps.isClosing).toBe(false);

    alertSpy.mockRestore();
    consoleSpy.mockRestore();
  });
});
