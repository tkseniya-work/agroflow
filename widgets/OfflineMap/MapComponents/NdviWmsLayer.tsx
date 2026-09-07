import React, { useEffect, useMemo } from "react";
import Mapbox from "@rnmapbox/maps";

type Props = {
  sessionId?: string | null;
  selectedImageDate?: string | null;
  opacity?: number;
  visible?: boolean;
  onLoadStart?: () => void;
};

const WMS_LAYER_NAME = process.env.EXPO_PUBLIC_SENTINEL_WMS_LAYER_NAME ?? "";
const BASE_URL = process.env.EXPO_PUBLIC_SENTINEL_BASE_URL ?? "";
const INSTANCE_ID = process.env.EXPO_PUBLIC_SENTINEL_INSTANCE_ID ?? "";

export const NDVI_SOURCE_ID = "ndvi-source";
export const NDVI_LAYER_ID = "ndvi-layer";
export const MAP_ANCHOR_LAYER_ID = "map-anchor-layer";

const { RasterSource, RasterLayer } = Mapbox as any;

export const NdviWmsLayer: React.FC<Props> = ({
  sessionId,
  selectedImageDate,
  opacity = 0.75,
  visible = true,
  onLoadStart,
}) => {
  const isReady = !!sessionId && !!selectedImageDate && visible;

  const tileUrl = useMemo(() => {
    if (!isReady) return null;

    const time = `${selectedImageDate}/${selectedImageDate}`;

    return (
      `${BASE_URL}/${INSTANCE_ID}/${sessionId}` +
      `?SERVICE=WMS` +
      `&REQUEST=GetMap` +
      `&VERSION=1.1.1` +
      `&LAYERS=${encodeURIComponent(WMS_LAYER_NAME)}` +
      `&STYLES=` +
      `&FORMAT=${encodeURIComponent("image/png")}` +
      `&TRANSPARENT=true` +
      `&EXCEPTIONS=${encodeURIComponent("application/vnd.ogc.se_inimage")}` +
      `&TIME=${encodeURIComponent(time)}` +
      `&WIDTH=256` +
      `&HEIGHT=256` +
      `&SRS=${encodeURIComponent("EPSG:3857")}` +
      `&BBOX={bbox-epsg-3857}`
    );
  }, [isReady, sessionId, selectedImageDate]);

  const tileUrlTemplates = useMemo(() => {
    return tileUrl ? [tileUrl] : [];
  }, [tileUrl]);

  const layerStyle = useMemo(
    () => ({
      rasterOpacity: opacity,
      rasterResampling: "linear",
      visibility: visible ? "visible" : "none",
    }),
    [opacity, visible],
  );

  useEffect(() => {
    if (tileUrl) {
      onLoadStart?.();
    }
  }, [tileUrl, onLoadStart]);

  if (!tileUrl) {
    return null;
  }

  return (
    <RasterSource
      id={NDVI_SOURCE_ID}
      tileUrlTemplates={tileUrlTemplates}
      tileSize={256}
    >
      <RasterLayer
        id={NDVI_LAYER_ID}
        belowLayerID={MAP_ANCHOR_LAYER_ID}
        style={layerStyle}
      />
    </RasterSource>
  );
};
