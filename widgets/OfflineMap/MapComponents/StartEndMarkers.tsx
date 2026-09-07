import { ShapeSource, CircleLayer, LineLayer, SymbolLayer } from "@rnmapbox/maps";
import React from "react";
import { useMarkerFeatures } from "../useMarkerFeatures";
import { Coordinate } from "../../../src/types/map.types";

type StartEndMarkersProps = {
  pinStartLocation: Coordinate;
  pinEndLocation: Coordinate;
  onPress?: (event: unknown) => void;
};

const StartEndMarkers = ({
  pinStartLocation,
  pinEndLocation,
  onPress,
}: StartEndMarkersProps) => {
  const { markers, line } = useMarkerFeatures(pinStartLocation, pinEndLocation);

  if (!markers.features.length) return null;

  return (
    <>
      {!!line.features.length && (
        <ShapeSource id="drain_markers_line_source" shape={line}>
          <LineLayer
            id="drain_markers_line"
            style={{
              lineColor: "#111827",
              lineWidth: 3,
              lineOpacity: 0.75,
              lineDasharray: [2, 2],
            }}
          />
        </ShapeSource>
      )}

      <ShapeSource id="markers_source" shape={markers} onPress={onPress}>
        <CircleLayer
          id="hitbox"
          style={{ circleRadius: 24, circleOpacity: 0 }}
        />

        <CircleLayer
          id="main"
          style={{
            circleColor: [
              "match",
              ["get", "type"],
              "start",
              "#16A34A",
              "end",
              "#DC2626",
              "#F44336",
            ],
            circleRadius: 18,
            circleStrokeWidth: 3,
            circleStrokeColor: "#fff",
          }}
        />

        <CircleLayer
          id="inner"
          style={{ circleColor: "#fff", circleRadius: 5 }}
        />

        <SymbolLayer
          id="labels"
          style={{
            textField: ["get", "shortLabel"],
            textSize: 13,
            textColor: "#111827",
            textHaloColor: "#fff",
            textHaloWidth: 1.5,
            textAnchor: "top",
            textOffset: [0, 1.5],
            textAllowOverlap: true,
            textIgnorePlacement: true,
          }}
        />
      </ShapeSource>
    </>
  );
};

export default React.memo(StartEndMarkers);
