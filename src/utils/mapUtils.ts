import { Coordinate } from "../types/map.types";

export const convertJsonStringToMapboxArray = (
  jsonString: string,
): Coordinate | null => {
  try {
    const coord = JSON.parse(jsonString);
    if (typeof coord.lat === "number" && typeof coord.lng === "number") {
      return [coord.lng, coord.lat];
    }
    if (
      typeof coord.latitude === "number" &&
      typeof coord.longitude === "number"
    ) {
      return [coord.longitude, coord.latitude];
    }
    if (typeof coord.lon === "number" && typeof coord.lat === "number") {
      return [coord.lon, coord.lat];
    }
  } catch (error) {
    console.error("Error parsing JSON:", error);
  }
  return null;
};

export const getBoundsCenter = (
  bounds: [[number, number], [number, number]],
): [number, number] => {
  const [[lng1, lat1], [lng2, lat2]] = bounds;

  const centerLng = (lng1 + lng2) / 2;
  const centerLat = (lat1 + lat2) / 2;

  return [centerLng, centerLat];
};

export const getCenterFromCoordinates = (coords: Coordinate[]) => {
  if (!coords.length) return null;

  let minLng = coords[0][0];
  let maxLng = coords[0][0];
  let minLat = coords[0][1];
  let maxLat = coords[0][1];

  for (const [lng, lat] of coords) {
    minLng = Math.min(minLng, lng);
    maxLng = Math.max(maxLng, lng);
    minLat = Math.min(minLat, lat);
    maxLat = Math.max(maxLat, lat);
  }

  return [
    (minLng + maxLng) / 2,
    (minLat + maxLat) / 2,
  ];
};

export const getPolygonCentroid = (
  coordinates: GeoJSON.Position[][],
): [number, number] | null => {
  const ring = coordinates?.[0];
  if (!ring || ring.length < 3) return null;

  let area = 0;
  let x = 0;
  let y = 0;

  for (let i = 0; i < ring.length - 1; i++) {
    const p1 = ring[i];
    const p2 = ring[i + 1];

    if (!p1 || !p2 || p1.length < 2 || p2.length < 2) continue;

    const x1 = p1[0];
    const y1 = p1[1];
    const x2 = p2[0];
    const y2 = p2[1];

    const f = x1 * y2 - x2 * y1;

    area += f;
    x += (x1 + x2) * f;
    y += (y1 + y2) * f;
  }

  area /= 2;

  // fallback если площадь ~ 0
  if (Math.abs(area) < 1e-7) {
    const first = ring[0];
    if (!first || first.length < 2) return null;

    return [first[0], first[1]];
  }

  const cx = x / (6 * area);
  const cy = y / (6 * area);

  return [cx, cy];
};

export const calculatePolygonAreaSqMeters = (
  coordinates: Coordinate[],
): number => {
  if (coordinates.length < 3) return 0;

  const earthRadius = 6378137;
  let area = 0;

  for (let index = 0; index < coordinates.length; index += 1) {
    const [longitude1, latitude1] = coordinates[index];
    const [longitude2, latitude2] =
      coordinates[(index + 1) % coordinates.length];
    const longitude1Radians = (longitude1 * Math.PI) / 180;
    const longitude2Radians = (longitude2 * Math.PI) / 180;
    const latitude1Radians = (latitude1 * Math.PI) / 180;
    const latitude2Radians = (latitude2 * Math.PI) / 180;

    area +=
      (longitude2Radians - longitude1Radians) *
      (2 + Math.sin(latitude1Radians) + Math.sin(latitude2Radians));
  }

  return Math.abs((area * earthRadius * earthRadius) / 2);
};

export const formatAreaHectares = (areaSqMeters: number): string =>
  (areaSqMeters / 10000).toLocaleString("ru-RU", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

export const calculateDistanceMeters = (
  coordinates: Coordinate[],
): number => {
  if (coordinates.length < 2) return 0;

  const earthRadius = 6378137;
  let distance = 0;

  for (let index = 1; index < coordinates.length; index += 1) {
    const [longitude1, latitude1] = coordinates[index - 1];
    const [longitude2, latitude2] = coordinates[index];
    const latitudeDelta = ((latitude2 - latitude1) * Math.PI) / 180;
    const longitudeDelta = ((longitude2 - longitude1) * Math.PI) / 180;
    const latitude1Radians = (latitude1 * Math.PI) / 180;
    const latitude2Radians = (latitude2 * Math.PI) / 180;
    const haversine =
      Math.sin(latitudeDelta / 2) ** 2 +
      Math.cos(latitude1Radians) *
        Math.cos(latitude2Radians) *
        Math.sin(longitudeDelta / 2) ** 2;

    distance +=
      2 * earthRadius * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
  }

  return distance;
};

export const formatDistance = (distanceMeters: number): string => {
  if (distanceMeters >= 1000) {
    return `${(distanceMeters / 1000).toLocaleString("ru-RU", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })} км`;
  }

  return `${distanceMeters.toLocaleString("ru-RU", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })} м`;
};
