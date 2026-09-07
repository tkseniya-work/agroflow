import { act, renderHook, waitFor } from "@testing-library/react-native";

import { useScanner } from "../../features/scanner";

const mockRequestLocationPermission = jest.fn().mockResolvedValue(false);
const mockGetCurrentLocation = jest.fn().mockResolvedValue(null);
const mockSaveOpenShift = jest.fn().mockResolvedValue({ id: 1 });
const mockReloadLocalData = jest.fn().mockResolvedValue(true);
const mockShowOfflineWarning = jest.fn((onContinue: () => void) => {
  onContinue();
});

jest.mock("../../shared/store/databaseBootstrap", () => ({
  useDatabaseBootstrap: () => ({
    reloadLocalData: mockReloadLocalData,
  }),
}));

jest.mock("../../features/localData/useLocalData", () => ({
  useEmployeeInfo: () => ({ employees: { id: "employee-1" } }),
  useOfflineShiftQueue: () => ({ openProductionShift: [] }),
  useProductionWorkPlaces: () => [
    {
      productionWorkPlace: {
        id: "workplace-1",
        name: "Трактор",
      },
      workplaceType: {
        description: "Мобильное",
      },
    },
  ],
  useShiftSettings: () => [{ id: "settings-1" }],
}));

jest.mock("../../entities/productionShift/lib/useProductionShiftActions", () => ({
  useProductionShiftActions: () => ({
    updateOpenShiftEndedAt: jest.fn().mockResolvedValue(undefined),
  }),
}));

jest.mock("../../entities/auth/lib/useAuth", () => ({
  useAuth: () => ({
    getValidAccessToken: jest.fn().mockResolvedValue("token"),
  }),
}));

jest.mock("../../features/dataSync/lib/useSyncOperations", () => ({
  useSyncOperations: () => ({
    syncOperations: {
      openProductionShift: mockSaveOpenShift,
    },
    push: {
      openProductionShifts: jest.fn(),
    },
  }),
}));

jest.mock("../../shared/lib/geolocation/useCurrentLocation", () => ({
  useCurrentLocation: () => ({
    getCurrentLocation: mockGetCurrentLocation,
  }),
}));

jest.mock("../../shared/lib/geolocation/useLocationPermissions", () => ({
  useLocationPermissions: () => ({
    requestLocationPermission: mockRequestLocationPermission,
  }),
}));

jest.mock("../../shared/lib/useAlerts", () => ({
  useAlerts: () => ({
    showError: jest.fn(),
    showSuccess: jest.fn(),
    showOfflineWarning: mockShowOfflineWarning,
  }),
}));

jest.mock("../../shared/lib/useNetworkStatus", () => ({
  useNetworkStatus: () => ({
    isConnected: false,
  }),
}));

jest.mock("../../entities/productionShift/lib/useProductionShiftUpdate", () => ({
  useProductionShiftUpdate: () => ({
    findLatestShift: jest.fn(),
    closeInitialPartShift: jest.fn(),
  }),
}));

jest.mock("../../features/dictionarySync/lib/useDictionaryGuard", () => ({
  useDictionaryGuard: () => ({
    ensureScannerDictionariesReady: jest.fn().mockResolvedValue(true),
    isCheckingDictionaries: false,
  }),
}));

describe("useScanner offline mode", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("opens the scanner without requesting location permission", async () => {
    const { result } = renderHook(() => useScanner({}));

    await act(async () => {
      await result.current.openScanner();
    });

    expect(mockRequestLocationPermission).not.toHaveBeenCalled();
    expect(result.current.isScannerVisible).toBe(true);
  });

  it("saves an offline shift without requesting GPS coordinates", async () => {
    const { result } = renderHook(() => useScanner({}));

    await act(async () => {
      await result.current.handleCodeScanned({
        data: "workplace-1_qr-key",
      });
    });

    await waitFor(() => {
      expect(result.current.pendingScanConfirmation).not.toBeNull();
    });

    await act(async () => {
      await result.current.confirmPendingScan();
    });

    expect(mockRequestLocationPermission).not.toHaveBeenCalled();
    expect(mockGetCurrentLocation).not.toHaveBeenCalled();
    expect(mockSaveOpenShift).toHaveBeenCalledWith(
      expect.objectContaining({
        code: "workplace-1_qr-key",
        employee_id: "employee-1",
        scanned_place: {
          type: "Point",
          coordinates: [0, 0],
        },
        sync_status: "pending",
      }),
    );
  });
});
