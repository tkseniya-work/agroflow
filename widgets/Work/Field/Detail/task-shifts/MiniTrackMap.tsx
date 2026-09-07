import { MaterialCommunityIcons } from "@expo/vector-icons";
import Mapbox from "@rnmapbox/maps";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { Text } from "@ui-kitten/components";

import { TrackItem } from "../../../../../entities/techniqueMonitoring";
import Colors from "../../../../../shared/styles/Colors";
import { buildTrackFeatureCollection, getTrackCoordinates } from "../../../../../src/utils/taskUtils";
import { styles } from "./styles";

Mapbox.setAccessToken(process.env.EXPO_PUBLIC_MAPBOX_KEY ?? "");

const { MapView, Camera, ShapeSource, LineLayer } = Mapbox as any;

export const MiniTrackMap = ({
  tracks,
  loading,
}: {
  tracks: TrackItem[];
  loading: boolean;
}) => {
  const cameraRef = useRef<any>(null);
  const [isMapReady, setIsMapReady] = useState(false);
  const coordinates = useMemo(() => getTrackCoordinates(tracks), [tracks]);
  const features = useMemo(() => buildTrackFeatureCollection(tracks), [tracks]);
  const trackBounds = useMemo(() => {
    if (!coordinates.length) return null;
    const lngValues = coordinates.map((item) => Number(item[0]));
    const latValues = coordinates.map((item) => Number(item[1]));
    const minLng = Math.min(...lngValues);
    const maxLng = Math.max(...lngValues);
    const minLat = Math.min(...latValues);
    const maxLat = Math.max(...latValues);
    const lngPadding = Math.max((maxLng - minLng) * 0.08, 0.0008);
    const latPadding = Math.max((maxLat - minLat) * 0.08, 0.0008);

    return {
      northEast: [maxLng + lngPadding, maxLat + latPadding] as [number, number],
      southWest: [minLng - lngPadding, minLat - latPadding] as [number, number],
      center: [(minLng + maxLng) / 2, (minLat + maxLat) / 2] as [
        number,
        number,
      ],
    };
  }, [coordinates]);
  const centerCoordinate = trackBounds?.center ?? [37.6173, 55.7558];

  const fitTrack = useCallback(() => {
    if (!trackBounds || !cameraRef.current) return;

    cameraRef.current.fitBounds(
      trackBounds.northEast,
      trackBounds.southWest,
      22,
      400,
    );
  }, [trackBounds]);

  useEffect(() => {
    setIsMapReady(false);
  }, [tracks]);

  useEffect(() => {
    if (!isMapReady) return;

    fitTrack();
  }, [fitTrack, isMapReady]);

  return (
    <View style={styles.miniMapCard}>
      <View style={styles.miniMapFrame}>
        {loading ? (
          <View style={styles.miniMapState}>
            <ActivityIndicator size="small" color={Colors.greenColor} />
            <Text style={styles.miniMapStateText}>Загружаем трек</Text>
          </View>
        ) : coordinates.length ? (
          <MapView
            style={styles.miniMap}
            styleURL={Mapbox.StyleURL.Satellite}
            logoEnabled={false}
            compassEnabled={false}
            scaleBarEnabled={false}
            attributionEnabled={false}
            rotateEnabled={false}
            pitchEnabled={false}
            scrollEnabled
            zoomEnabled
            requestDisallowInterceptTouchEvent
            onDidFinishLoadingMap={() => {
              setIsMapReady(true);
              requestAnimationFrame(fitTrack);
            }}
          >
            <Camera
              ref={cameraRef}
              defaultSettings={{
                centerCoordinate,
                zoomLevel: 13,
              }}
              animationDuration={0}
            />

            <ShapeSource id="shift-detail-track-source" shape={features}>
              <LineLayer
                id="shift-detail-track-line"
                style={{
                  lineColor: ["get", "color"],
                  lineWidth: 4,
                  lineOpacity: 0.82,
                  lineJoin: "round",
                  lineCap: "round",
                }}
              />
            </ShapeSource>
          </MapView>
        ) : (
          <View style={styles.miniMapState}>
            <MaterialCommunityIcons
              name="map-marker-off-outline"
              size={22}
              color="#98A2B3"
            />
            <Text style={styles.miniMapStateText}>Нет данных трека</Text>
          </View>
        )}
      </View>
    </View>
  );
};
