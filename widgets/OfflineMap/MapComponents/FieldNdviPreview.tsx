import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image as NativeImage,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Svg, { ClipPath, Defs, Image, Path } from "react-native-svg";

import { SeasonFieldRequest } from "../../../entities/season";
import Colors from "../../../shared/styles/Colors";

type Props = {
  field: SeasonFieldRequest;
  sessionId?: string | null;
  selectedDate?: string | null;
};

type Bounds = {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
};

const WMS_LAYER_NAME = process.env.EXPO_PUBLIC_SENTINEL_WMS_LAYER_NAME ?? "";
const BASE_URL = process.env.EXPO_PUBLIC_SENTINEL_BASE_URL ?? "";
const INSTANCE_ID = process.env.EXPO_PUBLIC_SENTINEL_INSTANCE_ID ?? "";
const WIDTH = 640;
const HEIGHT = 360;
const EARTH_RADIUS = 6378137;
const MAX_LATITUDE = 85.05112878;

const toMercator = ([lng, lat]: number[]) => {
  const safeLat = Math.max(-MAX_LATITUDE, Math.min(MAX_LATITUDE, lat));
  const longitude = (lng * Math.PI) / 180;
  const latitude = (safeLat * Math.PI) / 180;

  return {
    x: EARTH_RADIUS * longitude,
    y: EARTH_RADIUS * Math.log(Math.tan(Math.PI / 4 + latitude / 2)),
  };
};

const getBounds = (rings: number[][][]): Bounds | null => {
  const points = rings.flat().map(toMercator);

  if (!points.length) return null;

  return points.reduce<Bounds>(
    (bounds, point) => ({
      minX: Math.min(bounds.minX, point.x),
      minY: Math.min(bounds.minY, point.y),
      maxX: Math.max(bounds.maxX, point.x),
      maxY: Math.max(bounds.maxY, point.y),
    }),
    {
      minX: Infinity,
      minY: Infinity,
      maxX: -Infinity,
      maxY: -Infinity,
    },
  );
};

const buildClipPath = (rings: number[][][], bounds: Bounds) => {
  const boundsWidth = Math.max(bounds.maxX - bounds.minX, 1);
  const boundsHeight = Math.max(bounds.maxY - bounds.minY, 1);

  return rings
    .map((ring) =>
      ring
        .map((coordinate, index) => {
          const point = toMercator(coordinate);
          const x = ((point.x - bounds.minX) / boundsWidth) * WIDTH;
          const y = ((bounds.maxY - point.y) / boundsHeight) * HEIGHT;

          return `${index === 0 ? "M" : "L"} ${x} ${y}`;
        })
        .join(" ")
        .concat(" Z"),
    )
    .join(" ");
};

const buildWmsUrl = (
  sessionId: string,
  selectedDate: string,
  bounds: Bounds,
) => {
  const time = `${selectedDate}/${selectedDate}`;

  return (
    `${BASE_URL}/${INSTANCE_ID}/${sessionId}` +
    `?SERVICE=WMS` +
    `&REQUEST=GetMap` +
    `&VERSION=1.1.1` +
    `&LAYERS=${encodeURIComponent(WMS_LAYER_NAME)}` +
    `&STYLES=` +
    `&FORMAT=${encodeURIComponent("image/png")}` +
    `&TRANSPARENT=true` +
    `&TIME=${encodeURIComponent(time)}` +
    `&WIDTH=${WIDTH}` +
    `&HEIGHT=${HEIGHT}` +
    `&SRS=${encodeURIComponent("EPSG:3857")}` +
    `&BBOX=${bounds.minX},${bounds.minY},${bounds.maxX},${bounds.maxY}`
  );
};

export const FieldNdviPreview: React.FC<Props> = ({
  field,
  sessionId,
  selectedDate,
}) => {
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const rings = field.coordinates?.coordinates ?? [];
  const bounds = useMemo(() => getBounds(rings), [rings]);
  const clipPath = useMemo(
    () => (bounds ? buildClipPath(rings, bounds) : ""),
    [bounds, rings],
  );
  const imageUrl = useMemo(
    () =>
      bounds && sessionId && selectedDate
        ? buildWmsUrl(sessionId, selectedDate, bounds)
        : null,
    [bounds, selectedDate, sessionId],
  );

  useEffect(() => {
    let active = true;

    setLoading(true);
    setHasError(false);

    if (!imageUrl) {
      setLoading(false);
      return () => {
        active = false;
      };
    }

    NativeImage.prefetch(imageUrl)
      .then(() => {
        if (active) {
          setLoading(false);
        }
      })
      .catch(() => {
        if (active) {
          setLoading(false);
          setHasError(true);
        }
      });

    return () => {
      active = false;
    };
  }, [imageUrl]);

  if (!imageUrl || !clipPath || !selectedDate) {
    return null;
  }

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Спутниковый снимок</Text>
        </View>
      </View>

      <View style={styles.preview}>
        {!loading && !hasError && (
          <Svg width="100%" height="100%" viewBox={`0 0 ${WIDTH} ${HEIGHT}`}>
            <Defs>
              <ClipPath id="field-ndvi-clip">
                <Path d={clipPath} fillRule="evenodd" />
              </ClipPath>
            </Defs>

            <Image
              href={{ uri: imageUrl }}
              width={WIDTH}
              height={HEIGHT}
              preserveAspectRatio="none"
              clipPath="url(#field-ndvi-clip)"
            />
          </Svg>
        )}

        {loading && !hasError && (
          <View style={styles.state}>
            <ActivityIndicator color={Colors.greenColor} />
          </View>
        )}

        {hasError && (
          <View style={styles.state}>
            <Text style={styles.errorText}>Не удалось загрузить снимок</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 12,
    borderWidth: 1,
    borderColor: "#E7ECF2",
    borderRadius: 20,
    backgroundColor: Colors.white,
  },
  header: {
    marginBottom: 9,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "700",
    color: "#101828",
  },
  preview: {
    height: 150,
    overflow: "hidden",
    borderRadius: 12,
    backgroundColor: "#EEF2F6",
  },
  state: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
  errorText: {
    fontSize: 13,
    color: Colors.grey600,
  },
});
