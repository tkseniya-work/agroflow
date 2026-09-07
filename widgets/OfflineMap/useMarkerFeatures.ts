import { useMemo } from "react";

export const useMarkerFeatures = (pinStartLocation, pinEndLocation) => {
  const markers = useMemo<GeoJSON.FeatureCollection<GeoJSON.Point>>(() => {
    const features: GeoJSON.Feature<GeoJSON.Point>[] = [];

    if (pinStartLocation) {
      features.push({
        type: "Feature",
        geometry: { type: "Point", coordinates: pinStartLocation },
        properties: {
          id: "start_marker",
          type: "start",
          label: "Начало слива",
          shortLabel: "Начало",
        },
      });
    }

    if (pinEndLocation) {
      features.push({
        type: "Feature",
        geometry: { type: "Point", coordinates: pinEndLocation },
        properties: {
          id: "end_marker",
          type: "end",
          label: "Конец слива",
          shortLabel: "Конец",
        },
      });
    }

    return { type: "FeatureCollection", features };
  }, [pinStartLocation, pinEndLocation]);

  const line = useMemo<GeoJSON.FeatureCollection<GeoJSON.LineString>>(() => {
    if (!pinStartLocation || !pinEndLocation) {
      return { type: "FeatureCollection", features: [] };
    }

    return {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          geometry: {
            type: "LineString",
            coordinates: [pinStartLocation, pinEndLocation],
          },
          properties: {
            id: "drain_marker_line",
          },
        },
      ],
    };
  }, [pinStartLocation, pinEndLocation]);

  return { markers, line };
};
