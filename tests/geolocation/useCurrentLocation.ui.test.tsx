import { act, renderHook } from "@testing-library/react-native";
import { Platform } from "react-native";
import { useCurrentLocation } from "../../shared/lib/geolocation/useCurrentLocation";

const mockRequestLocationPermission = jest.fn();
const mockCheckGmsAvailability = jest.fn();
const mockCheckHmsAvailability = jest.fn();
const mockGetGmsLocation = jest.fn();
const mockGetHmsLocation = jest.fn();
const mockGetIosLocation = jest.fn();

jest.mock("../../shared/lib/geolocation/useLocationPermissions", () => ({
  useLocationPermissions: () => ({
    requestLocationPermission: mockRequestLocationPermission,
  }),
}));

jest.mock("../../shared/lib/geolocation/useLocationServices", () => ({
  useLocationServices: () => ({
    checkGmsAvailability: mockCheckGmsAvailability,
    checkHmsAvailability: mockCheckHmsAvailability,
  }),
}));

jest.mock("../../shared/lib/geolocation/useLocationProviders", () => ({
  useLocationProviders: () => ({
    getGmsLocation: mockGetGmsLocation,
    getHmsLocation: mockGetHmsLocation,
    getIosLocation: mockGetIosLocation,
  }),
}));

describe("useCurrentLocation", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Object.defineProperty(Platform, "OS", {
      configurable: true,
      value: "android",
    });
    mockRequestLocationPermission.mockResolvedValue(true);
    mockGetGmsLocation.mockResolvedValue({
      type: "Point",
      coordinates: [37.62, 55.75],
    });
    mockGetHmsLocation.mockResolvedValue({
      type: "Point",
      coordinates: [30.31, 59.94],
    });
  });

  it("uses GMS without calling HMS when both services are installed", async () => {
    mockCheckGmsAvailability.mockResolvedValue(true);
    mockCheckHmsAvailability.mockResolvedValue(true);
    const { result } = renderHook(() => useCurrentLocation());

    let location;
    await act(async () => {
      location = await result.current.getCurrentLocation();
    });

    expect(location).toEqual({
      type: "Point",
      coordinates: [37.62, 55.75],
    });
    expect(mockGetGmsLocation).toHaveBeenCalledTimes(1);
    expect(mockGetHmsLocation).not.toHaveBeenCalled();
    expect(mockCheckHmsAvailability).not.toHaveBeenCalled();
  });

  it("uses HMS on an HMS-only Android device", async () => {
    mockCheckGmsAvailability.mockResolvedValue(false);
    mockCheckHmsAvailability.mockResolvedValue(true);
    const { result } = renderHook(() => useCurrentLocation());

    let location;
    await act(async () => {
      location = await result.current.getCurrentLocation();
    });

    expect(location).toEqual({
      type: "Point",
      coordinates: [30.31, 59.94],
    });
    expect(mockGetHmsLocation).toHaveBeenCalledTimes(1);
    expect(mockGetGmsLocation).not.toHaveBeenCalled();
  });
});
