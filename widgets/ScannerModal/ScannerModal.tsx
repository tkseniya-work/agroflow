import { Ionicons } from "@expo/vector-icons";
import {
  Camera,
  CameraView,
  PermissionStatus,
  type BarcodeScanningResult,
  type BarcodeType,
  type CameraType,
} from "expo-camera";
import * as Haptics from "expo-haptics";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  AppState,
  Linking,
  Modal,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useLocationPermissions } from "../../shared/lib/geolocation/useLocationPermissions";
import Colors from "../../shared/styles/Colors";

type ScannerModalProps = {
  visible?: boolean;
  onClose?: () => void;
  onCodeScanned?: (result: BarcodeScanningResult) => void;
  scanTypes?: BarcodeType[];
  enableFlash?: boolean;
  enableCameraSwitch?: boolean;
  isProcessing?: boolean;
  requireLocationPermission?: boolean;
  onLocationPermissionDenied?: () => void;
};

type ScannerControlProps = {
  active?: boolean;
  disabled?: boolean;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
};

const OVERLAY_COLOR = "rgba(4, 12, 8, 0.68)";

const ScannerControl = ({
  active = false,
  disabled = false,
  icon,
  label,
  onPress,
}: ScannerControlProps) => (
  <TouchableOpacity
    accessibilityRole="button"
    accessibilityState={{ disabled, selected: active }}
    activeOpacity={0.8}
    disabled={disabled}
    onPress={onPress}
    style={[styles.control, active && styles.controlActive, disabled && styles.disabled]}
  >
    <View style={[styles.controlIcon, active && styles.controlIconActive]}>
      <Ionicons
        name={icon}
        size={22}
        color={active ? Colors.greenColor : Colors.white}
      />
    </View>
    <Text style={styles.controlLabel}>{label}</Text>
  </TouchableOpacity>
);

const ScannerModal = ({
  visible = false,
  onClose,
  onCodeScanned,
  scanTypes,
  enableFlash = true,
  enableCameraSwitch = true,
  isProcessing = false,
  requireLocationPermission = false,
  onLocationPermissionDenied,
}: ScannerModalProps) => {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const frameSize = Math.max(220, Math.min(width - 48, height * 0.4, 320));
  const bottomControlsPadding =
    Platform.OS === "android"
      ? Math.max(insets.bottom + 20, 36)
      : Math.max(insets.bottom, 20);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [hasLocationPermission, setHasLocationPermission] = useState<
    boolean | null
  >(requireLocationPermission ? null : true);
  const [isScanning, setIsScanning] = useState(true);
  const [torchEnabled, setTorchEnabled] = useState(false);
  const [cameraType, setCameraType] = useState<CameraType>("back");
  const [cameraReady, setCameraReady] = useState(false);
  const [lastScannedData, setLastScannedData] = useState<string | null>(null);
  const [lastScannedTime, setLastScannedTime] = useState(0);
  const scanProgress = useSharedValue(0);
  const { requestLocationPermission } = useLocationPermissions();

  const handleClose = useCallback(() => {
    setIsScanning(false);
    setTorchEnabled(false);
    onClose?.();
  }, [onClose]);

  const requestCameraPermission = useCallback(async () => {
    try {
      const { status } = await Camera.requestCameraPermissionsAsync();
      return status === PermissionStatus.GRANTED;
    } catch (error) {
      console.error("Camera permission error:", error);
      return false;
    }
  }, []);

  const requestScannerPermissions = useCallback(async () => {
    const cameraPermissionGranted = await requestCameraPermission();
    setHasPermission(cameraPermissionGranted);

    if (!cameraPermissionGranted) {
      setHasLocationPermission(requireLocationPermission ? null : true);
      return;
    }

    if (!requireLocationPermission) {
      setHasLocationPermission(true);
      return;
    }

    const locationPermissionGranted = await requestLocationPermission();
    setHasLocationPermission(locationPermissionGranted);

    if (!locationPermissionGranted) {
      setIsScanning(false);
      onLocationPermissionDenied?.();
      onClose?.();
    }
  }, [
    onClose,
    onLocationPermissionDenied,
    requestCameraPermission,
    requestLocationPermission,
    requireLocationPermission,
  ]);

  useEffect(() => {
    if (!visible) return;

    setIsScanning(true);
    setCameraReady(false);
    setHasPermission(null);
    setHasLocationPermission(requireLocationPermission ? null : true);
    setLastScannedData(null);
    setLastScannedTime(0);
    setTorchEnabled(false);
    setCameraType("back");
    void requestScannerPermissions();
  }, [visible, requestScannerPermissions, requireLocationPermission]);

  useEffect(() => {
    if (!visible || hasPermission !== false) return;

    const subscription = AppState.addEventListener("change", (nextState) => {
      if (nextState === "active") {
        void requestScannerPermissions();
      }
    });

    return () => subscription.remove();
  }, [hasPermission, requestScannerPermissions, visible]);

  useEffect(() => {
    if (!visible || !cameraReady) return;

    setIsScanning(
      !isProcessing &&
        hasPermission === true &&
        hasLocationPermission === true,
    );
  }, [
    cameraReady,
    hasLocationPermission,
    hasPermission,
    isProcessing,
    visible,
  ]);

  useEffect(() => {
    const shouldAnimate =
      visible && cameraReady && isScanning && !isProcessing;

    cancelAnimation(scanProgress);
    scanProgress.value = 0;

    if (shouldAnimate) {
      scanProgress.value = withRepeat(
        withTiming(1, {
          duration: 1_700,
          easing: Easing.inOut(Easing.ease),
        }),
        -1,
        true,
      );
    }

    return () => cancelAnimation(scanProgress);
  }, [cameraReady, isProcessing, isScanning, scanProgress, visible]);

  const scanLineStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: (frameSize - 28) * scanProgress.value }],
  }));

  const handleBarCodeScanned = useCallback(
    (result: BarcodeScanningResult) => {
      const { data } = result;

      if (
        !isScanning ||
        isProcessing ||
        !visible ||
        !data ||
        hasLocationPermission !== true
      ) {
        return;
      }

      const now = Date.now();

      if (data === lastScannedData && now - lastScannedTime < 1_000) {
        return;
      }

      setLastScannedData(data);
      setLastScannedTime(now);
      setIsScanning(false);

      void Haptics.notificationAsync(
        Haptics.NotificationFeedbackType.Success,
      ).catch(() => undefined);
      onCodeScanned?.(result);
    },
    [
      hasLocationPermission,
      isProcessing,
      isScanning,
      lastScannedData,
      lastScannedTime,
      onCodeScanned,
      visible,
    ],
  );

  const status = useMemo(() => {
    if (isProcessing) {
      return {
        icon: "hourglass-outline" as const,
        title: "Обрабатываем код",
        subtitle: "Это займёт несколько секунд",
      };
    }

    if (!cameraReady) {
      return {
        icon: "camera-outline" as const,
        title: "Подготавливаем камеру",
        subtitle: "Сканирование начнётся автоматически",
      };
    }

    if (isScanning) {
      return {
        icon: "scan-outline" as const,
        title: "Поместите QR-код в рамку",
        subtitle: "Держите телефон неподвижно",
      };
    }

    return {
      icon: "checkmark-circle-outline" as const,
      title: "Код распознан",
      subtitle: "Переходим к проверке данных",
    };
  }, [cameraReady, isProcessing, isScanning]);

  const handleOpenSettings = useCallback(async () => {
    try {
      await Linking.openSettings();
    } catch {
      await requestScannerPermissions();
    }
  }, [requestScannerPermissions]);

  const handleCameraSwitch = useCallback(() => {
    setTorchEnabled(false);
    setCameraType((type) => (type === "back" ? "front" : "back"));
  }, []);

  const renderStateScreen = (
    icon: keyof typeof Ionicons.glyphMap,
    title: string,
    description: string,
    denied = false,
  ) => (
    <Modal
      visible={visible}
      animationType="fade"
      presentationStyle="fullScreen"
      statusBarTranslucent
      onRequestClose={handleClose}
    >
      <View
        style={[
          styles.stateScreen,
          {
            paddingTop: Math.max(insets.top, 16),
            paddingBottom: Math.max(insets.bottom, 20),
          },
        ]}
      >
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

        <View style={styles.stateHeader}>
          <TouchableOpacity
            accessibilityLabel="Закрыть сканер"
            accessibilityRole="button"
            activeOpacity={0.8}
            onPress={handleClose}
            style={styles.headerButton}
          >
            <Ionicons name="close" size={24} color={Colors.white} />
          </TouchableOpacity>
        </View>

        <View style={styles.stateContent}>
          <View style={[styles.stateIcon, denied && styles.stateIconDenied]}>
            <Ionicons
              name={icon}
              size={32}
              color={denied ? "#F97066" : "#6CE9A6"}
            />
          </View>

          <Text style={styles.stateTitle}>{title}</Text>
          <Text style={styles.stateDescription}>{description}</Text>

          {denied ? (
            <View style={styles.stateActions}>
              <TouchableOpacity
                accessibilityRole="button"
                activeOpacity={0.82}
                onPress={() => void handleOpenSettings()}
                style={styles.settingsButton}
              >
                <Ionicons name="settings-outline" size={19} color={Colors.white} />
                <Text style={styles.settingsButtonText}>Открыть настройки</Text>
              </TouchableOpacity>

              <TouchableOpacity
                accessibilityRole="button"
                activeOpacity={0.8}
                onPress={() => void requestScannerPermissions()}
                style={styles.checkPermissionButton}
              >
                <Text style={styles.checkPermissionButtonText}>Проверить снова</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <ActivityIndicator
              size="small"
              color="#6CE9A6"
              style={styles.stateLoader}
            />
          )}
        </View>
      </View>
    </Modal>
  );

  if (hasPermission === false) {
    return renderStateScreen(
      "camera-outline",
      "Нужен доступ к камере",
      "Разрешите использование камеры в настройках устройства, чтобы сканировать QR-коды",
      true,
    );
  }

  if (hasPermission === null || hasLocationPermission === null) {
    return renderStateScreen(
      "shield-checkmark-outline",
      "Подготавливаем сканер",
      "Проверяем доступ к камере и геопозиции",
    );
  }

  return (
    <Modal
      visible={visible}
      animationType="fade"
      presentationStyle="fullScreen"
      statusBarTranslucent
      onRequestClose={handleClose}
    >
      <View style={styles.modalContainer}>
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

        <CameraView
          testID="qr-camera"
          style={styles.camera}
          active={visible}
          enableTorch={torchEnabled}
          facing={cameraType}
          onBarcodeScanned={isScanning ? handleBarCodeScanned : undefined}
          onCameraReady={() => setCameraReady(true)}
          barcodeScannerSettings={{ barcodeTypes: scanTypes }}
        >
          <View style={styles.overlay}>
            <View
              style={[
                styles.topScrim,
                { paddingTop: Math.max(insets.top, 12) + 4 },
              ]}
            >
              <View style={styles.header}>
                <TouchableOpacity
                  accessibilityLabel="Закрыть сканер"
                  accessibilityRole="button"
                  activeOpacity={0.8}
                  disabled={isProcessing}
                  onPress={handleClose}
                  style={[styles.headerButton, isProcessing && styles.disabled]}
                >
                  <Ionicons name="close" size={24} color={Colors.white} />
                </TouchableOpacity>

                <View style={styles.headerTitleWrap}>
                  <Text style={styles.title}>Сканирование QR</Text>
                  <Text style={styles.headerSubtitle}>Рабочее место</Text>
                </View>

                <View style={styles.headerButtonSpacer} />
              </View>
            </View>

            <View style={styles.scanRow}>
              <View style={styles.sideScrim} />

              <View
                style={[
                  styles.scanFrame,
                  { width: frameSize, height: frameSize },
                ]}
              >
                <View style={[styles.corner, styles.cornerTopLeft]} />
                <View style={[styles.corner, styles.cornerTopRight]} />
                <View style={[styles.corner, styles.cornerBottomLeft]} />
                <View style={[styles.corner, styles.cornerBottomRight]} />

                {isScanning && cameraReady && !isProcessing ? (
                  <Animated.View style={[styles.scanLine, scanLineStyle]} />
                ) : null}

                {!cameraReady || isProcessing ? (
                  <View style={styles.frameStateOverlay}>
                    <ActivityIndicator size="large" color="#6CE9A6" />
                    <Text style={styles.frameStateText}>
                      {isProcessing ? "Обрабатываем…" : "Запускаем камеру…"}
                    </Text>
                  </View>
                ) : null}
              </View>

              <View style={styles.sideScrim} />
            </View>

            <View
              style={[
                styles.bottomScrim,
                { paddingBottom: bottomControlsPadding },
              ]}
            >
              <View style={styles.statusCard}>
                <View style={styles.statusIcon}>
                  <Ionicons name={status.icon} size={21} color="#6CE9A6" />
                </View>
                <View style={styles.statusTextWrap}>
                  <Text style={styles.statusTitle}>{status.title}</Text>
                  <Text style={styles.statusSubtitle}>{status.subtitle}</Text>
                </View>
              </View>

              <View style={styles.controls}>
                {enableFlash ? (
                  <ScannerControl
                    active={torchEnabled}
                    disabled={isProcessing}
                    icon={torchEnabled ? "flash" : "flash-off-outline"}
                    label={torchEnabled ? "Вспышка включена" : "Вспышка"}
                    onPress={() => setTorchEnabled((enabled) => !enabled)}
                  />
                ) : null}

                {enableCameraSwitch ? (
                  <ScannerControl
                    disabled={isProcessing}
                    icon="camera-reverse-outline"
                    label="Сменить камеру"
                    onPress={handleCameraSwitch}
                  />
                ) : null}
              </View>
            </View>
          </View>
        </CameraView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: "#06100A",
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
  },
  topScrim: {
    backgroundColor: OVERLAY_COLOR,
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  header: {
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.12)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  headerButtonSpacer: {
    width: 44,
    height: 44,
  },
  headerTitleWrap: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 8,
  },
  title: {
    color: Colors.white,
    fontSize: 17,
    lineHeight: 22,
    fontWeight: "800",
  },
  headerSubtitle: {
    marginTop: 1,
    color: "rgba(255,255,255,0.66)",
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "500",
  },
  scanRow: {
    flexDirection: "row",
  },
  sideScrim: {
    flex: 1,
    backgroundColor: OVERLAY_COLOR,
  },
  scanFrame: {
    position: "relative",
    overflow: "hidden",
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.22)",
  },
  corner: {
    position: "absolute",
    zIndex: 3,
    width: 34,
    height: 34,
    borderColor: "#6CE9A6",
  },
  cornerTopLeft: {
    top: -1,
    left: -1,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 22,
  },
  cornerTopRight: {
    top: -1,
    right: -1,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 22,
  },
  cornerBottomLeft: {
    bottom: -1,
    left: -1,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 22,
  },
  cornerBottomRight: {
    right: -1,
    bottom: -1,
    borderRightWidth: 4,
    borderBottomWidth: 4,
    borderBottomRightRadius: 22,
  },
  scanLine: {
    position: "absolute",
    top: 13,
    left: 14,
    right: 14,
    height: 2,
    borderRadius: 1,
    backgroundColor: "#6CE9A6",
    shadowColor: "#32D583",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 8,
    elevation: 5,
  },
  frameStateOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(4,12,8,0.46)",
  },
  frameStateText: {
    marginTop: 12,
    color: Colors.white,
    fontSize: 14,
    lineHeight: 19,
    fontWeight: "600",
  },
  bottomScrim: {
    flex: 1,
    justifyContent: "space-between",
    backgroundColor: OVERLAY_COLOR,
    paddingTop: 22,
    paddingHorizontal: 20,
  },
  statusCard: {
    width: "100%",
    maxWidth: 380,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: "rgba(255,255,255,0.11)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  statusIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(108,233,166,0.14)",
  },
  statusTextWrap: {
    flex: 1,
    minWidth: 0,
  },
  statusTitle: {
    color: Colors.white,
    fontSize: 14,
    lineHeight: 19,
    fontWeight: "700",
  },
  statusSubtitle: {
    marginTop: 2,
    color: "rgba(255,255,255,0.62)",
    fontSize: 12,
    lineHeight: 16,
  },
  controls: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "center",
    gap: 28,
    paddingTop: 18,
  },
  control: {
    width: 96,
    alignItems: "center",
  },
  controlActive: {
    opacity: 1,
  },
  controlIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.12)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
  },
  controlIconActive: {
    backgroundColor: "#ECFDF3",
    borderColor: "#A6F4C5",
  },
  controlLabel: {
    marginTop: 7,
    color: "rgba(255,255,255,0.78)",
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "600",
    textAlign: "center",
  },
  disabled: {
    opacity: 0.45,
  },
  stateScreen: {
    flex: 1,
    backgroundColor: "#07120C",
    paddingHorizontal: 20,
  },
  stateHeader: {
    minHeight: 48,
    alignItems: "flex-end",
  },
  stateContent: {
    flex: 1,
    width: "100%",
    maxWidth: 380,
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 48,
  },
  stateIcon: {
    width: 68,
    height: 68,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(50,213,131,0.14)",
    borderWidth: 1,
    borderColor: "rgba(108,233,166,0.18)",
  },
  stateIconDenied: {
    backgroundColor: "rgba(249,112,102,0.12)",
    borderColor: "rgba(249,112,102,0.18)",
  },
  stateTitle: {
    marginTop: 22,
    color: Colors.white,
    fontSize: 22,
    lineHeight: 28,
    fontWeight: "800",
    textAlign: "center",
  },
  stateDescription: {
    maxWidth: 320,
    marginTop: 8,
    color: "rgba(255,255,255,0.62)",
    fontSize: 14,
    lineHeight: 21,
    textAlign: "center",
  },
  stateLoader: {
    marginTop: 24,
  },
  stateActions: {
    width: "100%",
    marginTop: 28,
    gap: 10,
  },
  settingsButton: {
    minHeight: 50,
    borderRadius: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: Colors.greenColor,
  },
  settingsButtonText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: "700",
  },
  checkPermissionButton: {
    minHeight: 48,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
    backgroundColor: "rgba(255,255,255,0.07)",
  },
  checkPermissionButtonText: {
    color: "rgba(255,255,255,0.82)",
    fontSize: 14,
    fontWeight: "700",
  },
});

export default ScannerModal;
