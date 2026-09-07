import { ShapeSource, LineLayer } from "@rnmapbox/maps";
import React, { useMemo } from "react";
import { buildTrackFeatureCollection } from "../useTrackFeatures";
import { TrackItem } from "../../../entities/techniqueMonitoring";

interface TechniqueTracksProps {
  positions: TrackItem[];
  idSuffix?: string;
}

const TechniqueTracks: React.FC<TechniqueTracksProps> = ({
  positions,
  idSuffix = "default",
}) => {
  const features = useMemo(
    () => buildTrackFeatureCollection(positions),
    [positions],
  );

  if (!Array.isArray(positions) || positions.length === 0) return null;

  if (!features?.features?.length) return null;

  return (
    <ShapeSource id={`track_source_${idSuffix}`} shape={features}>
      <LineLayer
        id={`track_line_${idSuffix}`}
        style={{
          lineColor: ["get", "color"], // цвет из properties
          lineWidth: 4,
          lineOpacity: 0.7,
        }}
      />
    </ShapeSource>
  );
};

export default React.memo(TechniqueTracks);
