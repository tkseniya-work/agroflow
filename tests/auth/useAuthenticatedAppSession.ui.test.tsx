import { act, renderHook, waitFor } from "@testing-library/react-native";
import * as Network from "expo-network";
import { getDefaultStore } from "jotai";
import { useAuthenticatedAppSession } from "../../entities/auth/lib/useAuthenticatedAppSession";
import { forcedOfflineAtom } from "../../shared/store/network";

const mockGetValidAccessToken = jest.fn();
let mockSession: any;

jest.mock("../../entities/auth/lib/useAuth", () => ({
  useAuth: () => mockSession,
}));

jest.mock("expo-network", () => ({
  getNetworkStateAsync: jest.fn(),
}));

const expiredAuth = {
  access_token: "expired-access-token",
  refresh_token: "refresh-token",
  expires_in: 3600,
  issued_at: Date.now() - 2 * 3600 * 1000,
  error: null,
  isLoaded: true,
};

describe("useAuthenticatedAppSession", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getDefaultStore().set(forcedOfflineAtom, false);
    mockGetValidAccessToken.mockResolvedValue("new-access-token");
    mockSession = {
      auth: expiredAuth,
      isLoading: false,
      isAuthenticated: true,
      getValidAccessToken: mockGetValidAccessToken,
    };
  });

  it("refreshes an expired token before the application becomes ready", async () => {
    jest.mocked(Network.getNetworkStateAsync).mockResolvedValue({
      isConnected: true,
    } as Network.NetworkState);

    const { result } = renderHook(() => useAuthenticatedAppSession());

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    expect(mockGetValidAccessToken).toHaveBeenCalledTimes(1);
  });

  it("keeps the offline session available without attempting refresh", async () => {
    jest.mocked(Network.getNetworkStateAsync).mockResolvedValue({
      isConnected: false,
    } as Network.NetworkState);

    const { result } = renderHook(() => useAuthenticatedAppSession());

    await act(async () => undefined);
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    expect(mockGetValidAccessToken).not.toHaveBeenCalled();
  });

  it("stops waiting for token refresh after forced offline mode is enabled", async () => {
    jest.mocked(Network.getNetworkStateAsync).mockResolvedValue({
      isConnected: true,
    } as Network.NetworkState);
    mockGetValidAccessToken.mockReturnValue(new Promise(() => undefined));

    const { result } = renderHook(() => useAuthenticatedAppSession());

    expect(result.current.isLoading).toBe(true);

    act(() => {
      getDefaultStore().set(forcedOfflineAtom, true);
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
  });
});
