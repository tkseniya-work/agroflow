import { TrackItem } from "../../entities/techniqueMonitoring";

const getLineColor = (type: number) => {
  switch(type) {
    case 5: return "#ff0000"; // Стоянка
    case 4: return "#42a5f5"; // Выработка
    case 3: return "#ff9800"; // Перегон
    case 2: return "#1a0b6f"; // Разворот
    case 1: return "#9c27b0"; // Остановка
    default: return "#42a5f5";
  }
};

const isValidCoordinate = (value: any): value is [number, number] => {
  return (
    Array.isArray(value) &&
    value.length >= 2 &&
    Number.isFinite(Number(value[0])) &&
    Number.isFinite(Number(value[1]))
  );
};

export const buildTrackFeatureCollection = (tracks?: TrackItem[] | null) => {
  if (!Array.isArray(tracks) || tracks.length === 0) return null;

  const features = tracks.flatMap((track) => {
    const coordinates = Array.isArray(track?.c)
      ? track.c
          .filter(isValidCoordinate)
          .map((pos) => [Number(pos[0]), Number(pos[1])])
      : [];

    if (coordinates.length < 2) return [];

    return [
      {
        type: "Feature" as const,
        properties: {
          color: getLineColor(Number(track?.type)),
        },
        geometry: {
          type: "LineString" as const,
          coordinates,
        },
      },
    ];
  });

  if (features.length === 0) return null;

  return {
    type: "FeatureCollection" as const,
    features,
  };
};
