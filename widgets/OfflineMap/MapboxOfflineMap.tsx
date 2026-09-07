import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { View } from "react-native";
import Mapbox, { LocationPuck, UserLocation } from "@rnmapbox/maps";

import { useMapboxMap } from "./useMapboxMap";
import StartEndMarkers from "./MapComponents/StartEndMarkers";
import TechniqueMarkers from "./MapComponents/TechniqueMarkers";
import TechniqueTracks from "./MapComponents/TechniqueTracks";
import MapTooltip from "./MapComponents/MapTooltip";
import MapRegionSelector from "./MapComponents/MapRegionSelector";
import { MapboxOfflineMapProps } from "../../src/types/map.types";
import { SeasonFields } from "./MapComponents/SeasonFileds";
import MeasurementLayer from "./MapComponents/MeasurementLayer";
import {
  NdviWmsLayer,
  MAP_ANCHOR_LAYER_ID,
} from "./MapComponents/NdviWmsLayer";
import { useLocationPermissions } from "../../shared/lib/geolocation/useLocationPermissions";

Mapbox.setAccessToken(process.env.EXPO_PUBLIC_MAPBOX_KEY ?? "");

const { MapView, Camera, ShapeSource, FillLayer } = Mapbox as any;

const EMPTY_FEATURE_COLLECTION: GeoJSON.FeatureCollection = {
  type: "FeatureCollection",
  features: [],
};

let sharedLocationPermissionRequest: Promise<boolean> | null = null;

const requestMapLocationPermission = (
  requestPermission: () => Promise<boolean>,
) => {
  if (!sharedLocationPermissionRequest) {
    sharedLocationPermissionRequest = requestPermission().finally(() => {
      sharedLocationPermissionRequest = null;
    });
  }

  return sharedLocationPermissionRequest;
};

const collectCoordinatePairs = (value: any): [number, number][] => {
  if (!Array.isArray(value)) return [];

  if (
    value.length >= 2 &&
    typeof value[0] === "number" &&
    typeof value[1] === "number"
  ) {
    return [[value[0], value[1]]];
  }

  return value.flatMap(collectCoordinatePairs);
};

const normalizePoint = (value: any): [number, number] | null => {
  if (Array.isArray(value) && value.length >= 2) {
    const lng = Number(value[0]);
    const lat = Number(value[1]);

    return Number.isFinite(lng) && Number.isFinite(lat) ? [lng, lat] : null;
  }

  const lng = Number(value?.longitude ?? value?.lng);
  const lat = Number(value?.latitude ?? value?.lat);

  return Number.isFinite(lng) && Number.isFinite(lat) ? [lng, lat] : null;
};

const getCoordinateBounds = (coordinates: [number, number][]) => {
  if (!coordinates.length) return null;

  let minLng = coordinates[0][0];
  let maxLng = coordinates[0][0];
  let minLat = coordinates[0][1];
  let maxLat = coordinates[0][1];

  coordinates.forEach(([lng, lat]) => {
    minLng = Math.min(minLng, lng);
    maxLng = Math.max(maxLng, lng);
    minLat = Math.min(minLat, lat);
    maxLat = Math.max(maxLat, lat);
  });

  return {
    minLng,
    maxLng,
    minLat,
    maxLat,
  };
};

const MapboxOfflineMap: React.FC<MapboxOfflineMapProps> = ({
  companyLocation,
  pinStartLocation,
  pinEndLocation,
  technique = [],
  tracks = [],
  fields,
  selectedField,
  selectedFieldIds,
  fitToSelectedFields,
  fitToTracks,
  fitToSelectedFieldsPadding = 10,
  fieldDisplayMode,
  viewMode,
  interactionMode,
  selectedDate,
  sessionId,
  cameraRef,
  currentLocationRef,
  showTechniqueLabels,
  initZoom,
  captureGestures = false,
  isMeasurementActive = false,
  measurementMode = "area",
  measurementPoints = [],
  onAddMeasurementPoint,
  onMoveMeasurementPoint,
  onSelectedFieldChange,
  setInteractionMode,
  onRegionSaved,
  hasLocationPermission = false,
  showUserLocation = false,
  userLocation = null,
}) => {
  const mapRef = useRef<any>(null);
  const internalCameraRef = useRef<any>(null);

  const [selectedPin, setSelectedPin] = useState<any>(null);
  const [showTooltip, setShowTooltip] = useState(false);
  const [isMapReady, setIsMapReady] = useState(false);
  const [isSavingRegion, setIsSavingRegion] = useState(false);
  const [regionSaveError, setRegionSaveError] = useState<string | null>(null);
  const [taskMapLocationPermission, setTaskMapLocationPermission] =
    useState(false);
  const tooltipTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { requestLocationPermission } = useLocationPermissions();

  const { cameraPosition, saveRegion } = useMapboxMap({
    companyLocation,
    pinStartLocation,
    pinEndLocation,
  });

  const isStandardMode = viewMode === "standard";
  const isNdviMode = viewMode === "ndvi";
  const isOfflineMode = viewMode === "offline";
  const isSelectingRegion = interactionMode === "selectRegion";
  const shouldRenderNdviLayer = isNdviMode && !!sessionId && !!selectedDate;
  const resolvedCameraRef = cameraRef ?? internalCameraRef;
  const canShowUserLocation =
    hasLocationPermission ||
    (showUserLocation && taskMapLocationPermission);

  useEffect(() => {
    if (!showUserLocation || hasLocationPermission) return;

    let active = true;

    void requestMapLocationPermission(requestLocationPermission).then(
      (granted) => {
        if (active) setTaskMapLocationPermission(granted);
      },
    );

    return () => {
      active = false;
    };
  }, [
    hasLocationPermission,
    requestLocationPermission,
    showUserLocation,
  ]);

  const selectedFieldsBounds = useMemo(() => {
    if (!fitToSelectedFields || !selectedFieldIds?.length || !fields?.length) {
      return null;
    }

    const selectedIds = new Set(selectedFieldIds.map(String));
    const selectedCoordinates = fields.flatMap((field: any) => {
      if (!selectedIds.has(String(field.id))) return [];

      return collectCoordinatePairs(field.coordinates?.coordinates);
    });

    const bounds = getCoordinateBounds(selectedCoordinates);

    if (!bounds) return null;

    const lngPadding = Math.max(
      (bounds.maxLng - bounds.minLng) * 0.06,
      0.0005,
    );
    const latPadding = Math.max(
      (bounds.maxLat - bounds.minLat) * 0.06,
      0.0005,
    );

    return {
      northEast: [
        bounds.maxLng + lngPadding,
        bounds.maxLat + latPadding,
      ] as [number, number],
      southWest: [
        bounds.minLng - lngPadding,
        bounds.minLat - latPadding,
      ] as [number, number],
    };
  }, [fields, fitToSelectedFields, selectedFieldIds]);

  const tracksBounds = useMemo(() => {
    if (!fitToTracks) return null;

    const trackCoordinates = collectCoordinatePairs(
      tracks.map((track) => track.c),
    );
    const techniqueCoordinates = technique
      .map((item: any) => normalizePoint(item.last_position))
      .filter(Boolean) as [number, number][];
    const coordinates = [...trackCoordinates, ...techniqueCoordinates];
    const bounds = getCoordinateBounds(coordinates);

    if (!bounds) return null;

    const lngPadding = Math.max(
      (bounds.maxLng - bounds.minLng) * 0.08,
      0.0008,
    );
    const latPadding = Math.max(
      (bounds.maxLat - bounds.minLat) * 0.08,
      0.0008,
    );

    return {
      northEast: [
        bounds.maxLng + lngPadding,
        bounds.maxLat + latPadding,
      ] as [number, number],
      southWest: [
        bounds.minLng - lngPadding,
        bounds.minLat - latPadding,
      ] as [number, number],
    };
  }, [fitToTracks, technique, tracks]);

  const handleConfirmRegion = useCallback(async () => {
    if (!mapRef.current || isSavingRegion) return;

    setIsSavingRegion(true);
    setRegionSaveError(null);

    try {
      const center = await mapRef.current.getCenter();
      const zoom = await mapRef.current.getZoom();
      const delta = 0.3 / Math.pow(2, zoom);

      const bounds: [[number, number], [number, number]] = [
        [center[0] - delta, center[1] - delta],
        [center[0] + delta, center[1] + delta],
      ];

      if (onRegionSaved) {
        await onRegionSaved(bounds);
      } else {
        await saveRegion(bounds);
      }

      setInteractionMode?.("none");
    } catch (error) {
      console.error("Error saving offline map region:", error);
      setRegionSaveError(
        "Не удалось сохранить область. Проверьте подключение и попробуйте снова.",
      );
    } finally {
      setIsSavingRegion(false);
    }
  }, [
    isSavingRegion,
    onRegionSaved,
    saveRegion,
    setInteractionMode,
  ]);

  const handleCancelRegion = useCallback(() => {
    if (isSavingRegion) return;

    setRegionSaveError(null);
    setInteractionMode?.("none");
  }, [isSavingRegion, setInteractionMode]);

  const hideTooltipLater = useCallback(() => {
    if (tooltipTimeoutRef.current) {
      clearTimeout(tooltipTimeoutRef.current);
    }

    setShowTooltip(true);

    tooltipTimeoutRef.current = setTimeout(() => {
      setShowTooltip(false);
    }, 3000);
  }, []);

  const handleShapeSourcePress = useCallback(
    (event: any) => {
      if (!event.features?.length) return;

      const feature = event.features[0];
      if (feature.geometry.type !== "Point") return;

      const coordinates = feature.geometry.coordinates;
      const label = feature.properties?.label;

      setSelectedPin({
        coordinates,
        label,
        type: "drain",
      });

      hideTooltipLater();
    },
    [hideTooltipLater],
  );

  const handleTechniquePress = useCallback((event: any) => {
    if (!event.features?.length) return;

    const feature = event.features[0];
    if (feature.geometry.type !== "Point") return;

    const coordinates = (feature.geometry as GeoJSON.Point).coordinates;
    const label = feature.properties?.tooltipLabel ?? feature.properties?.label;

    setSelectedPin({
      coordinates,
      label,
      type: "technique",
    });

    hideTooltipLater();
  }, [hideTooltipLater]);

  const handleFieldPress = useCallback(
    (field: any) => {
      if (isMeasurementActive) return;
      onSelectedFieldChange?.(field);
    },
    [isMeasurementActive, onSelectedFieldChange],
  );

  const handleMapPress = useCallback(
    (event: any) => {
      if (!isMeasurementActive) return;

      const coordinates = event?.geometry?.coordinates;
      if (
        !Array.isArray(coordinates) ||
        coordinates.length < 2 ||
        !Number.isFinite(coordinates[0]) ||
        !Number.isFinite(coordinates[1])
      ) {
        return;
      }

      onAddMeasurementPoint?.([coordinates[0], coordinates[1]]);
    },
    [isMeasurementActive, onAddMeasurementPoint],
  );

  const fitSelectedFields = useCallback(() => {
    if (!selectedFieldsBounds) return;

    resolvedCameraRef.current?.fitBounds(
      selectedFieldsBounds.northEast,
      selectedFieldsBounds.southWest,
      fitToSelectedFieldsPadding,
      500,
    );
  }, [
    fitToSelectedFieldsPadding,
    resolvedCameraRef,
    selectedFieldsBounds,
  ]);

  const fitTracks = useCallback(() => {
    if (!tracksBounds) return;

    resolvedCameraRef.current?.fitBounds(
      tracksBounds.northEast,
      tracksBounds.southWest,
      fitToSelectedFieldsPadding,
      500,
    );
  }, [fitToSelectedFieldsPadding, resolvedCameraRef, tracksBounds]);

  useEffect(() => {
    if (!isMapReady) return;

    fitSelectedFields();
    fitTracks();
  }, [fitSelectedFields, fitTracks, isMapReady]);

  useEffect(() => {
    return () => {
      if (tooltipTimeoutRef.current) {
        clearTimeout(tooltipTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (isSelectingRegion) return;

    setRegionSaveError(null);
    setIsSavingRegion(false);
  }, [isSelectingRegion]);

  const anchorShape = useMemo(() => EMPTY_FEATURE_COLLECTION, []);

  return (
    <View style={{ flex: 1 }}>
      <MapView
        ref={mapRef}
        styleURL={Mapbox.StyleURL.Satellite}
        style={{ flex: 1 }}
        logoEnabled
        compassEnabled
        compassFadeWhenNorth
        compassPosition={{ top: 72, left: 12 }}
        scaleBarEnabled={false}
        attributionEnabled
        rotateEnabled
        pitchEnabled
        scrollEnabled
        zoomEnabled
        {...(captureGestures
          ? { requestDisallowInterceptTouchEvent: true }
          : {})}
        onDidFinishLoadingMap={() => {
          setIsMapReady(true);
        }}
        onPress={handleMapPress}
      >
        <Camera
          ref={resolvedCameraRef}
          followUserLocation={false}
          defaultSettings={{
            centerCoordinate: cameraPosition.centerCoordinate,
            zoomLevel: initZoom ? initZoom : cameraPosition.zoomLevel,
          }}
          animationDuration={0}
        />

        {canShowUserLocation && (
          <>
            <UserLocation
              visible={false}
              minDisplacement={1}
              androidRenderMode="gps"
              onUpdate={(location) => {
                if (!currentLocationRef) return;

                currentLocationRef.current = [
                  location.coords.longitude,
                  location.coords.latitude,
                ];
              }}
            />

            <LocationPuck
              visible
              puckBearing="course"
              puckBearingEnabled
              scale={0.6}
              pulsing={{
                isEnabled: true,
                radius: 25,
              }}
            />
          </>
        )}

        <ShapeSource
          id="map-anchor-source"
          shape={anchorShape}
        >
          <FillLayer
            id={MAP_ANCHOR_LAYER_ID}
            style={{
              fillOpacity: 0,
            }}
          />
        </ShapeSource>

        {(isStandardMode || isNdviMode) && (
          <>
            <StartEndMarkers
              pinStartLocation={pinStartLocation}
              pinEndLocation={pinEndLocation}
              onPress={handleShapeSourcePress}
            />

            {tracks.length > 0 && (
              <TechniqueTracks positions={tracks} idSuffix="history" />
            )}
            <TechniqueMarkers
              technique={technique}
              idSuffix="monitoring"
              showLabels={showTechniqueLabels}
              onPress={handleTechniquePress}
            />
          </>
        )}

        {shouldRenderNdviLayer && (
          <NdviWmsLayer
            key={`${sessionId ?? "no-session"}-${selectedDate ?? "no-date"}`}
            sessionId={sessionId}
            selectedImageDate={selectedDate}
            opacity={0.85}
          />
        )}

        <SeasonFields
          fields={fields}
          visible={isStandardMode || isNdviMode}
          isNdviMode={isNdviMode}
          selectedField={selectedField}
          selectedFieldIds={selectedFieldIds}
          displayMode={fieldDisplayMode}
          isInteractionDisabled={isMeasurementActive}
          onPressField={handleFieldPress}
        />

        <MeasurementLayer
          visible={isMeasurementActive}
          mode={measurementMode}
          points={measurementPoints}
          onMovePoint={onMoveMeasurementPoint}
        />

        {isOfflineMode && <></>}

        {selectedPin && showTooltip && (
          <Mapbox.MarkerView
            id="selected-pin-tooltip"
            coordinate={selectedPin.coordinates}
            anchor={{ x: 0.5, y: 1.35 }}
          >
            <MapTooltip pin={selectedPin} />
          </Mapbox.MarkerView>
        )}
      </MapView>

      <MapRegionSelector
        mapMode={isSelectingRegion ? "selectRegion" : "normal"}
        isSaving={isSavingRegion}
        error={regionSaveError}
        onConfirm={handleConfirmRegion}
        onCancel={handleCancelRegion}
      />
    </View>
  );
};

export default MapboxOfflineMap;
