import { act, renderHook } from "@testing-library/react-native";

import { usePendingShiftSyncFlow } from "../../widgets/Work/work-screen/usePendingShiftSyncFlow";

const createOptions = (
  syncPendingShifts: jest.Mock,
  showError = jest.fn(),
) => ({
  pendingShifts: [{ id: 1 }],
  isSyncing: false,
  getExpiredPendingShifts: jest.fn().mockReturnValue([]),
  getSyncablePendingShifts: jest.fn().mockReturnValue([{ id: 1 }]),
  openForcedCloseModal: jest.fn(),
  syncPendingShifts,
  showError,
});

describe("usePendingShiftSyncFlow", () => {
  test("continues only after successful synchronization", async () => {
    const syncPendingShifts = jest.fn().mockResolvedValue(true);
    const onSynced = jest.fn();
    const { result } = renderHook(() =>
      usePendingShiftSyncFlow(createOptions(syncPendingShifts)),
    );

    act(() => {
      result.current.promptSyncPendingShifts(onSynced);
    });

    expect(result.current.modalProps.visible).toBe(true);
    expect(result.current.modalProps.count).toBe(1);

    await act(async () => {
      await result.current.modalProps.onSync();
    });

    expect(onSynced).toHaveBeenCalledTimes(1);
    expect(result.current.modalProps.visible).toBe(false);
    expect(result.current.modalProps.count).toBe(0);
  });

  test("keeps the confirmation open when synchronization returns false", async () => {
    const syncPendingShifts = jest.fn().mockResolvedValue(false);
    const showError = jest.fn();
    const onSynced = jest.fn();
    const { result } = renderHook(() =>
      usePendingShiftSyncFlow(
        createOptions(syncPendingShifts, showError),
      ),
    );

    act(() => {
      result.current.promptSyncPendingShifts(onSynced);
    });

    await act(async () => {
      await result.current.modalProps.onSync();
    });

    expect(showError).toHaveBeenCalledWith(
      "Не удалось синхронизировать офлайн-отрезки",
    );
    expect(onSynced).not.toHaveBeenCalled();
    expect(result.current.modalProps.visible).toBe(true);
    expect(result.current.modalProps.count).toBe(1);
  });

  test("keeps the confirmation open when synchronization throws", async () => {
    const syncPendingShifts = jest
      .fn()
      .mockRejectedValue(new Error("Network error"));
    const showError = jest.fn();
    const onSynced = jest.fn();
    const consoleSpy = jest
      .spyOn(console, "error")
      .mockImplementation(jest.fn());
    const { result } = renderHook(() =>
      usePendingShiftSyncFlow(
        createOptions(syncPendingShifts, showError),
      ),
    );

    act(() => {
      result.current.promptSyncPendingShifts(onSynced);
    });

    await act(async () => {
      await result.current.modalProps.onSync();
    });

    expect(showError).toHaveBeenCalledWith(
      "Не удалось синхронизировать офлайн-отрезки",
    );
    expect(onSynced).not.toHaveBeenCalled();
    expect(result.current.modalProps.visible).toBe(true);
    expect(result.current.modalProps.count).toBe(1);

    consoleSpy.mockRestore();
  });
});
