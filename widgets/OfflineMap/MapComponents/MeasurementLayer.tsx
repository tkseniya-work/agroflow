import React, { useMemo } from "react";
import { StyleSheet, View } from "react-native";
import Mapbox from "@rnmapbox/maps";

import {
  Coordinate,
  MeasurementMode,
} from "../../../src/types/map.types";

const { ShapeSource, FillLayer, LineLayer, PointAnnotation } = Mapbox as any;

type MeasurementLayerProps = {
  visible: boolean;
  mode: MeasurementMode;
  points: Coordinate[];
  onMovePoint?: (index: number, coordinate: Coordinate) => void;
};

const EMPTY_FEATURE_COLLECTION: GeoJSON.FeatureCollection = {
  type: "FeatureCollection",
  features: [],
};

const MeasurementLayer: React.FC<MeasurementLayerProps> = ({
  visible,
  mode,
  points,
  onMovePoint,
}) => {
  const color = mode === "area" ? "#FF6B00" : "#00B0FF";

  const polygon = useMemo<GeoJSON.FeatureCollection>(() => {
    if (!visible || mode !== "area" || points.length < 3) {
      return EMPTY_FEATURE_COLLECTION;
    }

    return {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          geometry: {
            type: "Polygon",
            coordinates: [[...points, points[0]]],
          },
          properties: {},
        },
      ],
    };
  }, [mode, points, visible]);

  const line = useMemo<GeoJSON.FeatureCollection>(() => {
    if (!visible || points.length < 2) return EMPTY_FEATURE_COLLECTION;

    return {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          geometry: {
            type: "LineString",
            coordinates:
              mode === "area" && points.length >= 3
                ? [...points, points[0]]
                : points,
          },
          properties: {},
        },
      ],
    };
  }, [mode, points, visible]);

  const movePoint = (index: number, payload: any) => {
    const coordinate = payload?.geometry?.coordinates;

    if (
      Array.isArray(coordinate) &&
      coordinate.length >= 2 &&
      Number.isFinite(coordinate[0]) &&
      Number.isFinite(coordinate[1])
    ) {
      onMovePoint?.(index, [coordinate[0], coordinate[1]]);
    }
  };

  if (!visible) return null;

  return (
    <>
      <ShapeSource id="measurement-polygon-source" shape={polygon}>
        <FillLayer
          id="measurement-fill"
          style={{ fillColor: color, fillOpacity: 0.22 }}
        />
      </ShapeSource>

      <ShapeSource id="measurement-line-source" shape={line}>
        <LineLayer
          id="measurement-line"
          style={{
            lineColor: color,
            lineWidth: mode === "area" ? 3 : 4,
            ...(mode === "area" ? { lineDasharray: [2, 1.5] } : {}),
            lineCap: "round",
            lineJoin: "round",
          }}
        />
      </ShapeSource>

      {points.map((coordinate, index) => (
        <PointAnnotation
          key={`measurement-${mode}-point-${index}`}
          id={`measurement-${mode}-point-${index}`}
          coordinate={coordinate}
          draggable
          onDrag={(payload: any) => movePoint(index, payload)}
          onDragEnd={(payload: any) => movePoint(index, payload)}
        >
          <View
            collapsable={false}
            style={[
              styles.pointHalo,
              { borderColor: color },
            ]}
          >
            <View style={[styles.point, { backgroundColor: color }]} />
          </View>
        </PointAnnotation>
      ))}
    </>
  );
};

export default React.memo(MeasurementLayer);

const styles = StyleSheet.create({
  pointHalo: {
    width: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    borderWidth: 2,
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  point: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
});
