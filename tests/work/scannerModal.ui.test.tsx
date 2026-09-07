import {
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react-native";
import React from "react";

import ScannerModal from "../../widgets/ScannerModal";

const mockRequestCameraPermissions = jest.fn();
const mockRequestLocationPermission = jest.fn().mockResolvedValue(true);

jest.mock("expo-haptics", () => ({
  NotificationFeedbackType: { Success: "success" },
  notificationAsync: jest.fn().mockResolvedValue(undefined),
}));

jest.mock("expo-camera", () => {
  const ReactModule = jest.requireActual("react");
  const { View } = jest.requireActual("react-native");

  return {
    Camera: {
      requestCameraPermissionsAsync: (...args: unknown[]) =>
        mockRequestCameraPermissions(...args),
    },
    CameraView: ({ children, onCameraReady, testID }: any) => {
      ReactModule.useEffect(() => {
        onCameraReady?.();
      }, [onCameraReady]);

      return <View testID={testID}>{children}</View>;
    },
    PermissionStatus: {
      GRANTED: "granted",
    },
  };
});

jest.mock("react-native-reanimated", () => {
  const { View } = jest.requireActual("react-native");

  return {
    __esModule: true,
    default: { View },
    cancelAnimation: jest.fn(),
    Easing: {
      ease: jest.fn(),
      inOut: () => jest.fn(),
    },
    useAnimatedStyle: (factory: () => object) => factory(),
    useSharedValue: (value: number) => ({ value }),
    withRepeat: (value: number) => value,
    withTiming: (value: number) => value,
  };
});

jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 24, right: 0, bottom: 20, left: 0 }),
}));

jest.mock("../../shared/lib/geolocation/useLocationPermissions", () => ({
  useLocationPermissions: () => ({
    requestLocationPermission: mockRequestLocationPermission,
  }),
}));

describe("ScannerModal", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRequestLocationPermission.mockResolvedValue(true);
  });

  test("shows the camera and scanner controls after permission is granted", async () => {
    mockRequestCameraPermissions.mockResolvedValue({ status: "granted" });

    render(
      <ScannerModal
        visible
        scanTypes={["qr"]}
        requireLocationPermission
        onClose={jest.fn()}
        onCodeScanned={jest.fn()}
      />,
    );

    expect(screen.getByText("Подготавливаем сканер")).toBeTruthy();
    expect(await screen.findByTestId("qr-camera")).toBeTruthy();
    expect(screen.getByText("Сканирование QR")).toBeTruthy();
    expect(screen.getByText("Поместите QR-код в рамку")).toBeTruthy();

    fireEvent.press(screen.getByRole("button", { name: "Вспышка" }));
    expect(screen.getByText("Вспышка включена")).toBeTruthy();

    fireEvent.press(screen.getByRole("button", { name: "Сменить камеру" }));
    expect(screen.getByText("Вспышка")).toBeTruthy();
    expect(screen.queryByText("Вспышка включена")).toBeNull();
  });

  test("explains how to restore denied camera access", async () => {
    mockRequestCameraPermissions.mockResolvedValue({ status: "denied" });

    render(
      <ScannerModal
        visible
        scanTypes={["qr"]}
        requireLocationPermission
        onClose={jest.fn()}
        onCodeScanned={jest.fn()}
      />,
    );

    expect(await screen.findByText("Нужен доступ к камере")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Открыть настройки" })).toBeTruthy();

    fireEvent.press(screen.getByRole("button", { name: "Проверить снова" }));

    await waitFor(() => {
      expect(mockRequestCameraPermissions).toHaveBeenCalledTimes(2);
    });
  });
});
