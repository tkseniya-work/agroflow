import { act, renderHook, waitFor } from "@testing-library/react-native";

import { useFieldTaskEditData } from "../../widgets/Work/Field/Edit/useFieldTaskEditData";

type Deferred<T> = {
  promise: Promise<T>;
  resolve: (value: T) => void;
  reject: (reason?: unknown) => void;
};

const createDeferred = <T,>(): Deferred<T> => {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });

  return { promise, resolve, reject };
};

let mockTechniqueRequest: Deferred<any[]>;
let mockCropRequest: Deferred<any[]>;
let mockFertilizerRequest: Deferred<any[]>;
let mockPesticideRequest: Deferred<any[]>;
let mockUnitRequest: Deferred<any[]>;

const mockDictionaryActions = {
  loadTechniqueWithAdditionalInfo: jest.fn(() => mockTechniqueRequest.promise),
  loadCropStandards: jest.fn(() => mockCropRequest.promise),
  loadFertilizerStandards: jest.fn(() => mockFertilizerRequest.promise),
  loadPesticideStandards: jest.fn(() => mockPesticideRequest.promise),
};

const mockTask = {
  id: "task-1",
  season_year: 2026,
  work_standard: { id: "work-1", work_kind_id: 4 },
  field_task: { task_fields: [{ id: "field-1" }] },
};

const mockProductionTasks = {
  updateAllProductionTask: jest.fn(),
  getFieldTaskById: jest.fn(async () => mockTask),
  getSeasonFieldWorks: jest.fn(async () => []),
  getSowingUnitCodes: jest.fn(() => mockUnitRequest.promise),
  addProductionTaskField: jest.fn(),
  removeProductionTaskField: jest.fn(),
  addProductionFieldTaskTechnique: jest.fn(),
  moveProductionFieldTaskTechnique: jest.fn(),
  removeProductionFieldTaskTechnique: jest.fn(),
  saveTaskConsumable: jest.fn(),
  removeTaskConsumable: jest.fn(),
};

const mockGetValidAccessToken = jest.fn(async () => "token");

jest.mock("../../entities/auth/lib/useAuth", () => ({
  useAuth: () => ({ getValidAccessToken: mockGetValidAccessToken }),
}));

jest.mock("../../shared/lib/useNetworkStatus", () => ({
  useNetworkStatus: () => ({ isConnected: true }),
}));

jest.mock("../../features/dictionarySync/lib/useDictionaryActions", () => ({
  useDictionaryActions: () => mockDictionaryActions,
}));

jest.mock("../../entities/productionTask/lib/useProductionTasks", () => ({
  useProductionTasks: () => mockProductionTasks,
}));

describe("useFieldTaskEditData progressive loading", () => {
  beforeEach(() => {
    mockTechniqueRequest = createDeferred<any[]>();
    mockCropRequest = createDeferred<any[]>();
    mockFertilizerRequest = createDeferred<any[]>();
    mockPesticideRequest = createDeferred<any[]>();
    mockUnitRequest = createDeferred<any[]>();
    jest.clearAllMocks();
  });

  test("shows the task before dictionaries finish and keeps partial results", async () => {
    const { result } = renderHook(() => useFieldTaskEditData("task-1"));

    await waitFor(() => expect(result.current.currentTask).toBe(mockTask));

    expect(result.current.isLoading).toBe(false);
    expect(result.current.isTechniqueDataLoading).toBe(true);
    expect(result.current.isConsumableDataLoading).toBe(true);
    expect(result.current.productionFieldsList).toEqual([{ id: "field-1" }]);

    act(() => {
      mockTechniqueRequest.resolve([{ id: "technique-1" }]);
    });
    await waitFor(() =>
      expect(result.current.isTechniqueDataLoading).toBe(false),
    );
    expect(result.current.techniqueWithAdditionalInfo).toEqual([
      { id: "technique-1" },
    ]);

    act(() => {
      mockCropRequest.resolve({ data: [{ id: "crop-1" }] } as any);
      mockFertilizerRequest.reject(new Error("fertilizers unavailable"));
      mockPesticideRequest.resolve([{ id: "pesticide-1" }]);
      mockUnitRequest.resolve([{ id: "unit-1" }]);
    });
    await waitFor(() =>
      expect(result.current.isConsumableDataLoading).toBe(false),
    );

    expect(result.current.currentTask).toBe(mockTask);
    expect(result.current.error).toBeNull();
    expect(result.current.cropStandardsList).toEqual([{ id: "crop-1" }]);
    expect(result.current.fertilizerStandardsList).toEqual([]);
    expect(result.current.pesticideStandardsList).toEqual([
      { id: "pesticide-1" },
    ]);
  });
});
