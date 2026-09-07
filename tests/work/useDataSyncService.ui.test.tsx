import { act, renderHook } from "@testing-library/react-native";

import { useDataSyncService } from "../../features/dataSync/lib/useDataSyncService";

const operationNames = [
  "technique",
  "agriculturalMachinery",
  "productionWorkPlaces",
  "workStandard",
  "productionTask",
  "unitOfMeasure",
  "productionShift",
  "productionShiftByDate",
  "settingsProductionShift",
  "tariffsList",
  "employee",
  "company",
  "openProductionShift",
  "closeProductionShift",
] as const;

const mockSyncOperations = Object.fromEntries(
  operationNames.map((name) => [name, jest.fn().mockResolvedValue([])]),
) as Record<(typeof operationNames)[number], jest.Mock>;

const mockClearOperations = Object.fromEntries(
  operationNames.map((name) => [name, jest.fn().mockResolvedValue(true)]),
) as Record<(typeof operationNames)[number] | "allProductionShift", jest.Mock>;
mockClearOperations.allProductionShift = jest.fn().mockResolvedValue(true);

const mockSyncState = {
  startSync: jest.fn(),
  updateProgress: jest.fn(),
  completeSync: jest.fn(),
  setSyncError: jest.fn(),
  isSyncing: false,
  syncProgress: 0,
  syncError: null,
};

jest.mock("../../features/dataSync/lib/useSyncOperations", () => ({
  useSyncOperations: () => ({
    syncOperations: mockSyncOperations,
    clearOperations: mockClearOperations,
  }),
}));

jest.mock("../../features/dataSync/lib/useSyncState", () => ({
  useSyncState: () => mockSyncState,
}));

describe("useDataSyncService dictionary refresh", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    for (const operation of Object.values(mockSyncOperations)) {
      operation.mockResolvedValue([]);
    }
  });

  test("upserts dictionaries without clearing local offline data", async () => {
    const { result } = renderHook(() => useDataSyncService());
    let synced = false;

    await act(async () => {
      synced = await result.current.smartSyncAllDictionaries("token");
    });

    expect(synced).toBe(true);
    expect(mockSyncOperations.productionWorkPlaces).toHaveBeenCalledWith("token");
    expect(mockSyncOperations.settingsProductionShift).toHaveBeenCalledWith(
      "token",
    );
    for (const clearOperation of Object.values(mockClearOperations)) {
      expect(clearOperation).not.toHaveBeenCalled();
    }
  });

  test("returns failure when any dictionary request fails", async () => {
    mockSyncOperations.productionWorkPlaces.mockRejectedValueOnce(
      new Error("Network error"),
    );
    const { result } = renderHook(() => useDataSyncService());
    let synced = true;

    await act(async () => {
      synced = await result.current.smartSyncAllDictionaries("token");
    });

    expect(synced).toBe(false);
    expect(mockSyncState.completeSync).toHaveBeenLastCalledWith(false);
  });

  test("clears both offline shift queues during account cleanup", async () => {
    const { result } = renderHook(() => useDataSyncService());

    await act(async () => {
      await result.current.clearOfflineShiftQueue();
    });

    expect(mockClearOperations.openProductionShift).toHaveBeenCalledTimes(1);
    expect(mockClearOperations.closeProductionShift).toHaveBeenCalledTimes(1);
  });
});
