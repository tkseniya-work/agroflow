import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
} from "react";
import { ActivityIndicator, StyleSheet, View, Text } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import Colors from "../../shared/styles/Colors";
import { useAlerts } from "../../shared/lib/useAlerts";
import {
  MapboxOfflineMap,
  MapBottomPanel,
  MapFloatingControls,
  MeasurementPanel,
  MapDataStatusBanner,
  type MapDataStatusTone,
} from "../../widgets/OfflineMap";
import { useCompanyInfo } from "../../features/localData/useLocalData";
import {
  calculateDistanceMeters,
  calculatePolygonAreaSqMeters,
  convertJsonStringToMapboxArray,
  formatAreaHectares,
  formatDistance,
  getCenterFromCoordinates,
} from "../../src/utils/mapUtils";
import { useOfflineRegions } from "../../widgets/OfflineMap/useOfflineRegions";
import { useTechniqueMonitoring } from "../../entities/techniqueMonitoring";
import {
  Coordinate,
  DropdownItem,
  MapInteractionMode,
  MapViewMode,
  MeasurementMode,
  Period,
} from "../../src/types/map.types";
import { useSeasonFields, SeasonFieldRequest } from "../../entities/season";
import { useProductionTask } from "../../entities/productionTask/lib/useProductionTask";
import { ProductionTask } from "../../entities/productionTask/model/productionTask.types";
import { useSentinelData } from "../../entities/sentinel";
import { useCurrentLocation } from "../../shared/lib/geolocation/useCurrentLocation";
import BottomSheet from "@gorhom/bottom-sheet";
import { useTabBarVisibility } from "../../shared/lib/tabBarVisibility";
import { useIsFocused } from "@react-navigation/native";
import { useNetworkStatus } from "../../shared/lib/useNetworkStatus";

type UserLocationPoint = {
  type: "Point";
  coordinates: [number, number];
};

type MapDataFeedback = {
  tone: MapDataStatusTone;
  title: string;
  message?: string;
  onRetry?: () => void;
  actionLabel?: string;
  actionAccessibilityLabel?: string;
  onDismiss?: () => void;
};

const FIELD_INFO_HINT_DURATION_MS = 6_000;

const isConnectionError = (error: unknown) => {
  const message =
    typeof error === "string"
      ? error
      : error instanceof Error
        ? error.message
        : "";

  return /интернет|подключен|network|offline/i.test(message);
};

export default function MapPage() {
  const cameraRef = useRef<any>(null);
  const bottomSheetRef = useRef<BottomSheet>(null);
  const mountedRef = useRef(true);
  const currentLocationRef = useRef<[number, number] | null>(null);
  const fieldInfoHintTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const isFocused = useIsFocused();

  const [hasLocationPermission, setHasLocationPermission] = useState(false);
  const [userLocation, setUserLocation] = useState<UserLocationPoint | null>(
    null,
  );
  const [viewMode, setViewMode] = useState<MapViewMode>("standard");
  const [interactionMode, setInteractionMode] =
    useState<MapInteractionMode>("none");
  const [sheetIndex, setSheetIndex] = useState(0);
  const [showTechniqueLabels, setShowTechniqueLabels] = useState(true);
  const [isMeasurementActive, setIsMeasurementActive] = useState(false);
  const [measurementMode, setMeasurementMode] =
    useState<MeasurementMode>("area");
  const [areaMeasurementPoints, setAreaMeasurementPoints] = useState<
    Coordinate[]
  >([]);
  const [distanceMeasurementPoints, setDistanceMeasurementPoints] = useState<
    Coordinate[]
  >([]);
  const [locationNotice, setLocationNotice] = useState<string | null>(null);
  const [showFieldInfoHint, setShowFieldInfoHint] = useState(false);

  const { setTabBarHidden } = useTabBarVisibility();

  const companyInfo = useCompanyInfo();
  const { showOtherInformation } = useAlerts();
  const { getCurrentLocation } = useCurrentLocation();
  const { forcedOffline, isEnvOfflineMode } = useNetworkStatus();

  const { regions, downloadStates, loadRegions, saveRegion, deleteRegion } =
    useOfflineRegions();

  const {
    loading,
    initialLoading,
    technique,
    selectedTechnique,
    draftPeriod,
    tracks,
    trackSummary,
    errorTrack,
    loadingType,
    loadTechnique,
    loadTechiqueTrack,
    setSelectedTechnique,
    setDraftPeriod,
    setTracks,
    setTrackSummary,
    loadProductionTaskTrack,
    clearTrack,
  } = useTechniqueMonitoring(cameraRef);

  const {
    seasons,
    currentSeason,
    fields,
    selectedField,
    loading: fieldsLoading,
    error: fieldsError,
    changeSeason,
    reloadCurrentSeason,
    selectedFieldChange,
  } = useSeasonFields();

  const { productionTasks } = useProductionTask({
    season: currentSeason,
  });

  const {
    fieldImageDates,
    selectedDate,
    sessionId,
    seasonFieldNdvi,
    loadingFieldImageDates,
    loadingSessionId,
    loadingSeasonFieldNdvi,
    fieldImageDatesError,
    sessionIdError,
    seasonFieldNdviError,
    loadFieldImageDates,
    loadSessionId,
    loadSeasonFieldNdvi,
    onSelectImageDate,
  } = useSentinelData({
    season: currentSeason,
    selectedField,
  });

  // The original app fetched this from `entities/productionPlan`, which
  // this trimmed sample removes; FieldInfo degrades gracefully when null.
  const productionPlan = null;

  const companyLocation = useMemo(() => {
    return companyInfo
      ? (convertJsonStringToMapboxArray(companyInfo.location) as Coordinate)
      : ([0, 0] as Coordinate);
  }, [companyInfo]);

  const canUpdate = useCallback(() => {
    return mountedRef.current && isFocused;
  }, [isFocused]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (fieldInfoHintTimerRef.current) {
        clearTimeout(fieldInfoHintTimerRef.current);
        fieldInfoHintTimerRef.current = null;
      }
    };
  }, []);

  const loadingLabel = useMemo(() => {
    switch (loadingType) {
      case "technique":
        return "Обновляем технику...";
      case "track":
        return "Строим треки...";
      case "taskTrack":
        return "Загружаем трек задачи...";
      default:
        return "";
    }
  }, [loadingType]);

  const handleSetDraftPeriod = useCallback(
    (period: Period | null) => {
      if (!canUpdate()) return;
      setDraftPeriod(period);
    },
    [canUpdate, setDraftPeriod],
  );

  const handleSelectedTechniqueChange = useCallback(
    (techniques: DropdownItem[]) => {
      if (!canUpdate()) return;

      const unique = techniques.filter(
        (item, index, self) =>
          index === self.findIndex((i) => i.id === item.id),
      );

      setSelectedTechnique(unique);
    },
    [canUpdate, setSelectedTechnique],
  );

  const handleResetSelectedTechnique = useCallback(() => {
    if (!canUpdate()) return;
    setSelectedTechnique([]);
    setTracks([]);
    setTrackSummary([]);
  }, [canUpdate, setSelectedTechnique, setTracks, setTrackSummary]);

  const handleCreateTracks = useCallback((period?: Period) => {
    if (!canUpdate()) return;
    void loadTechiqueTrack(period);
  }, [canUpdate, loadTechiqueTrack]);

  const handleShowTaskTrack = useCallback(
    async (task: ProductionTask) => {
      if (!mountedRef.current) return false;

      const taskId =
        task?.id ??
        (task as any)?.production_task_id ??
        (task as any)?.productionTaskId ??
        (task as any)?.task_id;

      if (!taskId) return false;

      return loadProductionTaskTrack(taskId);
    },
    [loadProductionTaskTrack],
  );

  const handleHideTaskTrack = useCallback(() => {
    if (!mountedRef.current) return;
    clearTrack();
  }, [clearTrack]);

  const handleMoveToCompany = useCallback(() => {
    if (!cameraRef.current || !mountedRef.current) return;

    cameraRef.current.setCamera({
      centerCoordinate: companyLocation,
      zoomLevel: 15,
      animationDuration: 1000,
    });
  }, [companyLocation]);

  const moveCameraToUser = useCallback((coords: [number, number]) => {
    if (!cameraRef.current || !mountedRef.current) return;

    cameraRef.current.setCamera({
      centerCoordinate: coords,
      zoomLevel: 15,
      animationDuration: 1000,
    });
  }, []);

  const handleMyLocation = useCallback(async () => {
    setLocationNotice(null);

    try {
      if (userLocation?.coordinates) {
        moveCameraToUser(userLocation.coordinates);
        return;
      }

      const location = await getCurrentLocation();

      if (!mountedRef.current) return;

      if (!location?.coordinates) {
        setHasLocationPermission(false);
        setLocationNotice(
          "Разрешите доступ к геолокации и убедитесь, что службы определения местоположения включены.",
        );
        return;
      }

      setUserLocation(location);
      setHasLocationPermission(true);
      moveCameraToUser(location.coordinates as [number, number]);
    } catch (error: any) {
      if (!mountedRef.current) return;

      console.error("handleMyLocation error:", error);
      setHasLocationPermission(false);
      setLocationNotice(
        error?.message === "Location services are disabled"
          ? "Включите геолокацию на устройстве и попробуйте снова."
          : "Не удалось определить позицию. Попробуйте ещё раз через несколько секунд.",
      );
    }
  }, [getCurrentLocation, moveCameraToUser, userLocation]);

  const retryMapData = useCallback(async () => {
    const requests: Promise<unknown>[] = [];

    if (fieldsError && viewMode !== "offline") {
      requests.push(reloadCurrentSeason());
    }

    if (viewMode === "ndvi") {
      if (fieldImageDatesError) {
        requests.push(loadFieldImageDates());
      }
      if (sessionIdError) {
        requests.push(loadSessionId());
      }
      if (seasonFieldNdviError && selectedField) {
        requests.push(loadSeasonFieldNdvi());
      }
    }

    await Promise.all(requests);
  }, [
    fieldImageDatesError,
    fieldsError,
    loadFieldImageDates,
    loadSeasonFieldNdvi,
    loadSessionId,
    reloadCurrentSeason,
    seasonFieldNdviError,
    selectedField,
    sessionIdError,
    viewMode,
  ]);

  const mapDataFeedback = useMemo<MapDataFeedback | null>(() => {
    const activeFieldsError = viewMode !== "offline" ? fieldsError : null;
    const activeNdviError =
      viewMode === "ndvi"
        ? fieldImageDatesError || sessionIdError || seasonFieldNdviError
        : null;

    if (activeFieldsError || activeNdviError) {
      const offline =
        isConnectionError(activeFieldsError) ||
        isConnectionError(activeNdviError);

      return {
        tone: "error",
        title: activeFieldsError
          ? "Не удалось загрузить поля"
          : "Не удалось загрузить данные NDVI",
        message: offline
          ? "Проверьте подключение к интернету и повторите загрузку."
          : "Повторите загрузку. Данные на карте обновятся автоматически.",
        onRetry: () => {
          void retryMapData();
        },
      };
    }

    if (initialLoading) {
      return {
        tone: "loading",
        title: "Подготавливаем карту",
        message: "Загружаем технику и актуальные данные.",
      };
    }

    const isLoadingFields = viewMode !== "offline" && fieldsLoading;
    const isLoadingNdvi =
      viewMode === "ndvi" &&
      (loadingFieldImageDates ||
        loadingSessionId ||
        loadingSeasonFieldNdvi);

    if (isLoadingFields || isLoadingNdvi) {
      return {
        tone: "loading",
        title: isLoadingFields
          ? "Загружаем поля"
          : "Обновляем данные NDVI",
        message: "Картой уже можно пользоваться.",
      };
    }

    if (locationNotice) {
      return {
        tone: "info",
        title: "Местоположение недоступно",
        message: locationNotice,
        onRetry: () => {
          void handleMyLocation();
        },
        onDismiss: () => setLocationNotice(null),
      };
    }

    if (showFieldInfoHint && selectedField && viewMode !== "offline") {
      return {
        tone: "info",
        title: selectedField.name || "Поле выбрано",
        message: "Откройте нижнюю панель, чтобы посмотреть информацию о поле.",
        actionLabel: "Открыть",
        actionAccessibilityLabel: "Открыть информацию о выбранном поле",
        onRetry: () => {
          if (fieldInfoHintTimerRef.current) {
            clearTimeout(fieldInfoHintTimerRef.current);
            fieldInfoHintTimerRef.current = null;
          }
          setShowFieldInfoHint(false);
          bottomSheetRef.current?.snapToIndex(1);
        },
        onDismiss: () => {
          if (fieldInfoHintTimerRef.current) {
            clearTimeout(fieldInfoHintTimerRef.current);
            fieldInfoHintTimerRef.current = null;
          }
          setShowFieldInfoHint(false);
        },
      };
    }

    return null;
  }, [
    fieldImageDatesError,
    fieldsError,
    fieldsLoading,
    handleMyLocation,
    initialLoading,
    loadingFieldImageDates,
    loadingSeasonFieldNdvi,
    loadingSessionId,
    locationNotice,
    retryMapData,
    seasonFieldNdviError,
    selectedField,
    sessionIdError,
    showFieldInfoHint,
    viewMode,
  ]);

  const handleSeasonChange = useCallback(
    async (season: any) => {
      if (!canUpdate()) return;
      if (currentSeason?.id === season.id) return;

      setSelectedTechnique([]);
      setTracks([]);
      setTrackSummary([]);

      await changeSeason(season);
    },
    [
      canUpdate,
      currentSeason?.id,
      changeSeason,
      setSelectedTechnique,
      setTracks,
      setTrackSummary,
    ],
  );

  const handleSelectedFieldChange = useCallback(
    (field: SeasonFieldRequest | null) => {
      if (!canUpdate()) return;
      selectedFieldChange(field);

      if (field && viewMode !== "offline" && sheetIndex <= 1) {
        setShowFieldInfoHint(true);

        if (fieldInfoHintTimerRef.current) {
          clearTimeout(fieldInfoHintTimerRef.current);
        }
        fieldInfoHintTimerRef.current = setTimeout(() => {
          setShowFieldInfoHint(false);
          fieldInfoHintTimerRef.current = null;
        }, FIELD_INFO_HINT_DURATION_MS);
      } else {
        setShowFieldInfoHint(false);
      }
    },
    [canUpdate, selectedFieldChange, sheetIndex, viewMode],
  );

  const handleViewModeChange = useCallback(
    (mode: MapViewMode) => {
      if (!canUpdate()) return;
      setViewMode(mode);
      selectedFieldChange(null);
    },
    [canUpdate, selectedFieldChange],
  );

  const handleSheetChange = useCallback(
    (index: number) => {
      if (!canUpdate()) return;
      setSheetIndex(index);

      if (index >= 2) {
        if (fieldInfoHintTimerRef.current) {
          clearTimeout(fieldInfoHintTimerRef.current);
          fieldInfoHintTimerRef.current = null;
        }
        setShowFieldInfoHint(false);
      }
    },
    [canUpdate],
  );

  const handlePanelStateChange = useCallback(
    (expanded: boolean) => {
      if (!canUpdate()) return;
      setTabBarHidden(expanded);
    },
    [canUpdate, setTabBarHidden],
  );

  const toggleTechniqueLabels = useCallback(() => {
    setShowTechniqueLabels((prev) => !prev);
  }, []);

  const openMeasurement = useCallback(() => {
    setIsMeasurementActive(true);
    selectedFieldChange(null);
  }, [selectedFieldChange]);

  const closeMeasurement = useCallback(() => {
    setIsMeasurementActive(false);
  }, []);

  const addMeasurementPoint = useCallback(
    (coordinate: Coordinate) => {
      if (measurementMode === "area") {
        setAreaMeasurementPoints((previous) => [...previous, coordinate]);
      } else {
        setDistanceMeasurementPoints((previous) => [...previous, coordinate]);
      }
    },
    [measurementMode],
  );

  const resetMeasurement = useCallback(() => {
    if (measurementMode === "area") {
      setAreaMeasurementPoints([]);
    } else {
      setDistanceMeasurementPoints([]);
    }
  }, [measurementMode]);

  const undoMeasurementPoint = useCallback(() => {
    if (measurementMode === "area") {
      setAreaMeasurementPoints((previous) => previous.slice(0, -1));
    } else {
      setDistanceMeasurementPoints((previous) => previous.slice(0, -1));
    }
  }, [measurementMode]);

  const moveMeasurementPoint = useCallback(
    (index: number, coordinate: Coordinate) => {
      const movePoint = (points: Coordinate[]) =>
        points.map((point, pointIndex) =>
          pointIndex === index ? coordinate : point,
        );

      if (measurementMode === "area") {
        setAreaMeasurementPoints(movePoint);
      } else {
        setDistanceMeasurementPoints(movePoint);
      }
    },
    [measurementMode],
  );

  const measuredArea = useMemo(() => {
    if (areaMeasurementPoints.length < 3) return null;

    return formatAreaHectares(
      calculatePolygonAreaSqMeters(areaMeasurementPoints),
    );
  }, [areaMeasurementPoints]);

  const measuredDistance = useMemo(() => {
    if (distanceMeasurementPoints.length < 2) return null;

    return formatDistance(calculateDistanceMeters(distanceMeasurementPoints));
  }, [distanceMeasurementPoints]);

  const activeMeasurementPoints =
    measurementMode === "area"
      ? areaMeasurementPoints
      : distanceMeasurementPoints;

  const measurementValue =
    measurementMode === "area"
      ? measuredArea && `${measuredArea} га`
      : measuredDistance;

  useEffect(() => {
    if (!cameraRef.current) return;
    if (!tracks || tracks.length === 0) return;
    if (!mountedRef.current) return;

    const trackItem = tracks[tracks.length - 1];
    const center = getCenterFromCoordinates(trackItem.c);

    cameraRef.current?.setCamera({
      centerCoordinate: center,
      zoomLevel: 12,
      animationDuration: 1000,
    });
  }, [tracks]);

  useEffect(() => {
    if (!errorTrack) return;
    if (errorTrack === "Нет подключения к интернету") return;
    if (forcedOffline || isEnvOfflineMode) return;
    if (!mountedRef.current) return;

    showOtherInformation("Треки", errorTrack);
  }, [
    errorTrack,
    forcedOffline,
    isEnvOfflineMode,
    showOtherInformation,
  ]);

  useEffect(() => {
    if (!isFocused) return;
    if (!mountedRef.current) return;

    setTabBarHidden(sheetIndex > 0);
  }, [isFocused, sheetIndex, setTabBarHidden]);

  useEffect(() => {
    if (isFocused) return;
    if (!mountedRef.current) return;

    bottomSheetRef.current?.snapToIndex(0);
    setSheetIndex(0);
    setTabBarHidden(false);
  }, [isFocused, setTabBarHidden]);

  const shouldShowMapControls = useMemo(() => {
    return interactionMode === "none" && sheetIndex <= 0;
  }, [interactionMode, sheetIndex]);

  return (
    <GestureHandlerRootView style={styles.flex}>
      <View style={styles.container}>
        <MapboxOfflineMap
          companyLocation={companyLocation}
          userLocation={userLocation?.coordinates ?? null}
          hasLocationPermission={hasLocationPermission}
          viewMode={viewMode}
          interactionMode={interactionMode}
          setInteractionMode={setInteractionMode}
          cameraRef={cameraRef}
          currentLocationRef={currentLocationRef}
          showTechniqueLabels={showTechniqueLabels}
          technique={technique}
          fields={fields}
          selectedField={selectedField}
          draftPeriod={draftPeriod}
          seasons={seasons}
          selectedSeason={currentSeason}
          selectedDate={selectedDate}
          sessionId={sessionId}
          onSelectSeason={handleSeasonChange}
          onSelectedFieldChange={handleSelectedFieldChange}
          onPressCompany={handleMoveToCompany}
          tracks={tracks}
          onRegionSaved={async (
            bounds: [[number, number], [number, number]],
          ) => {
            await saveRegion(bounds);

            if (!mountedRef.current) return;

            setInteractionMode("none");
            setViewMode("offline");
          }}
          loadTechnique={loadTechnique}
          onChangeDraftPeriod={handleSetDraftPeriod}
          isMeasurementActive={isMeasurementActive}
          measurementMode={measurementMode}
          measurementPoints={activeMeasurementPoints}
          onAddMeasurementPoint={addMeasurementPoint}
          onMoveMeasurementPoint={moveMeasurementPoint}
        />

        {!!mapDataFeedback && (
          <MapDataStatusBanner {...mapDataFeedback} />
        )}

        {shouldShowMapControls && !isMeasurementActive && (
          <View pointerEvents="box-none" style={StyleSheet.absoluteFill}>
            <MapFloatingControls
              showTechniqueLabels={showTechniqueLabels}
              onPressCompany={handleMoveToCompany}
              onPressMyLocation={handleMyLocation}
              onToggleLabels={toggleTechniqueLabels}
              onToggleMeasurement={openMeasurement}
              isMeasurementActive={isMeasurementActive}
            />
          </View>
        )}

        {isMeasurementActive && shouldShowMapControls && (
          <MeasurementPanel
            mode={measurementMode}
            value={measurementValue}
            pointsCount={activeMeasurementPoints.length}
            onChangeMode={setMeasurementMode}
            onUndo={undoMeasurementPoint}
            onReset={resetMeasurement}
            onClose={closeMeasurement}
          />
        )}

        {loading &&
          !initialLoading &&
          loadingType &&
          !mapDataFeedback && (
            <View pointerEvents="none" style={styles.statusContainer}>
              <ActivityIndicator size="small" color="#fff" />
              <Text style={styles.statusText}>{loadingLabel}</Text>
            </View>
          )}

        <MapBottomPanel
          viewMode={viewMode}
          setViewMode={handleViewModeChange}
          interactionMode={interactionMode}
          setInteractionMode={setInteractionMode}
          companyInfo={companyInfo}
          cameraRef={cameraRef}
          regions={regions}
          downloadStates={downloadStates}
          technique={technique}
          draftPeriod={draftPeriod}
          trackSummary={trackSummary}
          selectedTechnique={selectedTechnique}
          seasons={seasons}
          selectedField={selectedField}
          selectedSeason={currentSeason}
          productionTasks={productionTasks}
          productionPlan={productionPlan}
          fieldImageDates={fieldImageDates}
          selectedDate={selectedDate}
          sessionId={sessionId}
          currentSeasonFieldNdvi={seasonFieldNdvi}
          onSelectImageDate={onSelectImageDate}
          onSeasonChange={handleSeasonChange}
          loadRegions={loadRegions}
          saveRegion={saveRegion}
          deleteRegion={deleteRegion}
          onChangeDraftPeriod={handleSetDraftPeriod}
          onSelectedTechniqueChange={handleSelectedTechniqueChange}
          onResetSelectedTechnique={handleResetSelectedTechnique}
          onCreateTechniqueTracks={handleCreateTracks}
          clearTrack={handleHideTaskTrack}
          onShowTaskTrack={handleShowTaskTrack}
          onHideTaskTrack={handleHideTaskTrack}
          onChangeSheet={handleSheetChange}
          onSelectField={handleSelectedFieldChange}
          bottomSheetRef={bottomSheetRef}
          onPanelStateChange={handlePanelStateChange}
        />
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  statusContainer: {
    position: "absolute",
    top: 56,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: "rgba(0,0,0,0.82)",
    zIndex: 30,
    gap: 8,
  },
  statusText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "500",
  },
});
