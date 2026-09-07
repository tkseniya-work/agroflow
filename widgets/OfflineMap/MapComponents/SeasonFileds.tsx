import { useCallback, useMemo } from "react";
import Mapbox from "@rnmapbox/maps";
import { SeasonFieldsProps } from "../../../src/types/map.types";
import { getPolygonCentroid } from "../../../src/utils/mapUtils";
import { MAP_ANCHOR_LAYER_ID } from "./NdviWmsLayer";
import Colors from "../../../shared/styles/Colors";

const { ShapeSource, FillLayer, LineLayer, SymbolLayer } = Mapbox as any;

const SOURCE_ID = "season-fields-source";
const TOUCH_SOURCE_ID = "season-fields-touch-source";
const DASHED_SOURCE_ID = "season-fields-dashed-source";
const TOUCH_FILL_ID = "season-fields-touch-fill";
const FILL_ID = "season-fields-fill";
const OUTLINE_ID = "season-fields-outline";
const OUTLINE_DASHED_ID = "season-fields-outline-dashed";
const SELECTED_GLOW_ID = "season-fields-selected-glow";
const SELECTED_OUTLINE_ID = "season-fields-selected-outline";
const LABELS_SOURCE_ID = "season-fields-labels-source";
const LABELS_LAYER_ID = "season-fields-labels-layer";

const EMPTY_FEATURE_COLLECTION: GeoJSON.FeatureCollection = {
  type: "FeatureCollection",
  features: [],
};

const formatArea = (area?: number) => {
  if (!area && area !== 0) return "";

  return (
    Number(area).toLocaleString("ru-RU", {
      maximumFractionDigits: 1,
    }) + " га"
  );
};

function polygonToLineFeatures(
  coordinates: number[][][],
  properties: Record<string, any>,
): GeoJSON.Feature[] {
  if (!Array.isArray(coordinates)) return [];

  return coordinates
    .filter((ring) => Array.isArray(ring) && ring.length >= 2)
    .map((ring, index) => ({
      type: "Feature" as const,
      id: `${properties.id}-ring-${index}`,
      geometry: {
        type: "LineString" as const,
        coordinates: ring,
      },
      properties,
    }));
}

export const SeasonFields: React.FC<SeasonFieldsProps> = ({
  fields,
  visible = true,
  isNdviMode = false,
  selectedField,
  selectedFieldIds,
  displayMode = "default",
  isInteractionDisabled = false,
  onPressField,
}) => {
  const selectedIds = useMemo(() => {
    const ids = new Set<string>();

    if (selectedField?.id) {
      ids.add(String(selectedField.id));
    }

    selectedFieldIds?.forEach((id) => ids.add(String(id)));

    return ids;
  }, [selectedField?.id, selectedFieldIds]);

  const layerVisibility = visible ? "visible" : "none";
  const isTaskView = displayMode === "taskView";
  const isStationaryZone = displayMode === "stationaryZone";
  const stationaryZoneColor = "#00AEEF";
  const fillVisibility =
    visible && !isNdviMode && (!isTaskView || isStationaryZone)
      ? "visible"
      : "none";
  const labelsVisibility =
    visible && !isNdviMode && !isStationaryZone ? "visible" : "none";
  const touchFillVisibility = visible ? "visible" : "none";
  const selectedColor =
    isStationaryZone
      ? stationaryZoneColor
      : isTaskView || (selectedFieldIds?.length ?? 0) > 0
      ? Colors.greenColor
      : "#00b0ff";

  const fieldById = useMemo(() => {
    if (!fields?.length) {
      return new Map<
        string,
        NonNullable<SeasonFieldsProps["fields"]>[number]
      >();
    }

    return new Map(fields.map((field) => [String(field.id), field]));
  }, [fields]);

  const geojson = useMemo<GeoJSON.FeatureCollection>(() => {
    if (!visible || !fields?.length) return EMPTY_FEATURE_COLLECTION;

    const features = fields.map((el) => {
      const crop = el.crop_rotation?.crop;
      const isFallow = el.crop_rotation?.clean_fallow === true;
      const color = isStationaryZone
        ? stationaryZoneColor
        : !isFallow && crop?.color
          ? crop.color
          : "#000000";

      return {
        type: "Feature" as const,
        id: String(el.id),
        geometry: {
          type: "Polygon" as const,
          coordinates: el.coordinates.coordinates,
        },
        properties: {
          id: String(el.id),
          color,
          isNoPlan: el.production_plan_id === null,
          isSelected: selectedIds.has(String(el.id)),
          areaLabel: formatArea(el.area),
        },
      };
    });

    return {
      type: "FeatureCollection" as const,
      features,
    };
  }, [fields, isStationaryZone, selectedIds, visible]);

  const dashedLines = useMemo<GeoJSON.FeatureCollection>(() => {
    if (!visible || !fields?.length) return EMPTY_FEATURE_COLLECTION;

    const features = fields.flatMap((el) => {
      const crop = el.crop_rotation?.crop;
      const isFallow = el.crop_rotation?.clean_fallow === true;
      const color = !isFallow && crop?.color ? crop.color : "#000000";
      const isNoPlan = el.production_plan_id === null;
      const isSelected = selectedIds.has(String(el.id));

      if (isStationaryZone) return [];

      if (isTaskView) {
        if (isSelected) return [];

        return polygonToLineFeatures(el.coordinates.coordinates, {
          id: String(el.id),
          color: "#ffffff",
          isNoPlan,
          isSelected,
        });
      }

      if (!isNoPlan || isSelected) return [];

      return polygonToLineFeatures(el.coordinates.coordinates, {
        id: String(el.id),
        color,
        isNoPlan,
        isSelected,
      });
    });

    return {
      type: "FeatureCollection",
      features,
    };
  }, [fields, isStationaryZone, isTaskView, selectedIds, visible]);

  const labels = useMemo<GeoJSON.FeatureCollection>(() => {
    if (labelsVisibility === "none" || !fields?.length) {
      return EMPTY_FEATURE_COLLECTION;
    }

    const features = fields
      .map((el) => {
        const center = getPolygonCentroid(el.coordinates.coordinates);
        if (!center) return null;

        return {
          type: "Feature" as const,
          id: `label-${el.id}`,
          geometry: {
            type: "Point" as const,
            coordinates: center,
          },
          properties: {
            areaLabel: formatArea(el.area),
          },
        };
      })
      .filter(Boolean) as GeoJSON.Feature[];

    return {
      type: "FeatureCollection" as const,
      features,
    };
  }, [fields, labelsVisibility]);

  const handlePressField = useCallback((event: any) => {
    if (isInteractionDisabled || !visible || !fields?.length) return;

    const id = event.features?.[0]?.properties?.id;
    const field = fieldById.get(String(id));

    if (field) {
      onPressField?.(field);
    }
  }, [
    fieldById,
    fields?.length,
    isInteractionDisabled,
    onPressField,
    visible,
  ]);

  return (
    <>
      <ShapeSource id={SOURCE_ID} shape={geojson}>
        <FillLayer
          id={FILL_ID}
          aboveLayerID={MAP_ANCHOR_LAYER_ID}
          style={{
            visibility: fillVisibility,
            fillColor: ["get", "color"],
            fillOpacity: isStationaryZone ? 0.25 : isTaskView ? 0 : 0.3,
          }}
        />

        <LineLayer
          id={OUTLINE_ID}
          aboveLayerID={FILL_ID}
          filter={[
            "all",
            ["==", ["get", "isNoPlan"], false],
            ["==", ["get", "isSelected"], false],
          ]}
          style={{
            visibility: isTaskView && !isStationaryZone ? "none" : layerVisibility,
            lineColor: isNdviMode ? "#ffffff" : ["get", "color"],
            lineWidth: isStationaryZone ? 2 : isNdviMode ? 3 : 1,
            lineOpacity: 1,
          }}
        />

        <LineLayer
          id={SELECTED_GLOW_ID}
          aboveLayerID={OUTLINE_ID}
          filter={["==", ["get", "isSelected"], true]}
          style={{
            visibility: layerVisibility,
            lineColor: isNdviMode ? Colors.blue : selectedColor,
            lineWidth: isStationaryZone ? 5 : isNdviMode ? 4 : 8,
            lineOpacity: isStationaryZone ? 0.16 : isNdviMode ? 0.25 : 0.2,
          }}
        />

        <LineLayer
          id={SELECTED_OUTLINE_ID}
          aboveLayerID={SELECTED_GLOW_ID}
          filter={["==", ["get", "isSelected"], true]}
          style={{
            visibility: layerVisibility,
            lineColor: isNdviMode ? Colors.blue : selectedColor,
            lineWidth: isStationaryZone ? 2.5 : isNdviMode ? 2.5 : 3,
            lineOpacity: 1,
          }}
        />
      </ShapeSource>

      <ShapeSource id={DASHED_SOURCE_ID} shape={dashedLines}>
        <LineLayer
          id={OUTLINE_DASHED_ID}
          aboveLayerID={SELECTED_OUTLINE_ID}
          style={{
            visibility: layerVisibility,
            lineColor: isNdviMode ? "#ffffff" : ["get", "color"],
            lineWidth: isNdviMode ? 3 : 2,
            lineDasharray: [2, 2],
            lineOpacity: 1,
            lineCap: "butt",
            lineJoin: "round",
          }}
        />
      </ShapeSource>

      <ShapeSource id={LABELS_SOURCE_ID} shape={labels}>
        <SymbolLayer
          id={LABELS_LAYER_ID}
          aboveLayerID={MAP_ANCHOR_LAYER_ID}
          minZoomLevel={12}
          style={{
            visibility: labelsVisibility,
            textField: ["get", "areaLabel"],
            textSize: 13,
            textFont: ["Open Sans Bold"],
            textColor: "#111",
            textHaloWidth: 1,
            textHaloColor: "#ffffff",
            textAnchor: "center",
            textOpacity: visible && !isNdviMode ? 1 : 0,
          }}
        />
      </ShapeSource>

      <ShapeSource
        id={TOUCH_SOURCE_ID}
        shape={geojson}
        hitbox={{ width: 32, height: 32 }}
        onPress={isInteractionDisabled ? undefined : handlePressField}
      >
        <FillLayer
          id={TOUCH_FILL_ID}
          style={{
            visibility: touchFillVisibility,
            fillColor: "#000000",
            fillOpacity: 0.01,
          }}
        />
      </ShapeSource>
    </>
  );
};
