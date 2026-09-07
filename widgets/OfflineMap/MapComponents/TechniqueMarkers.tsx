import { ShapeSource, SymbolLayer, Images } from "@rnmapbox/maps";
import type { SymbolLayerStyle } from "@rnmapbox/maps";
import React, { useMemo } from "react";
import {
  MachineryType,
  Technique,
} from "../../../entities/techniqueMonitoring";

export const techniqueIcons = {
  ic_technique: require("../../../assets/images/default_icon_tractor.png"),
  default_icon_auto: require("../../../assets/images/default_icon_auto.png"),
};

const TECHNIQUE_ICON_STYLE: SymbolLayerStyle = {
  iconImage: ["get", "icon"] as const,
  iconSize: 0.15,
  iconAllowOverlap: true,
  iconIgnorePlacement: true,
  iconRotate: ["get", "bearing"] as const,
  iconRotationAlignment: "map",
};

const TECHNIQUE_LABEL_STYLE: SymbolLayerStyle = {
  textField: ["get", "label"] as const,
  textSize: 11,
  textLineHeight: 1.15,
  textColor: "#111827",

  textHaloColor: "rgba(255,255,255,0.94)",
  textHaloWidth: 1.8,
  textHaloBlur: 0.3,

  textOffset: [0, -2.2],
  textAnchor: "bottom",

  textAllowOverlap: true,
  textIgnorePlacement: true,

  textOptional: false,
  textMaxWidth: 12,
};

type Props = {
  technique?: Technique[];
  idSuffix: string;
  showLabels?: boolean;
  onPress?: (event: any) => void;
};

const normalizePoint = (value: any): [number, number] | null => {
  if (Array.isArray(value) && value.length >= 2) {
    const lng = Number(value[0]);
    const lat = Number(value[1]);

    return Number.isFinite(lng) && Number.isFinite(lat) ? [lng, lat] : null;
  }

  const lng = Number(value?.longitude ?? value?.lng);
  const lat = Number(value?.latitude ?? value?.lat);

  return Number.isFinite(lng) && Number.isFinite(lat) ? [lng, lat] : null;
};

const normalizeText = (value: any) =>
  String(value ?? "")
    .toLowerCase()
    .trim();

const firstText = (...values: any[]) => {
  for (const value of values) {
    if (typeof value !== "string" && typeof value !== "number") {
      continue;
    }

    const text = String(value).trim();

    if (text) {
      return text;
    }
  }

  return "";
};

const getTechniqueStandard = (item: any) =>
  item?.technique_standard ??
  item?.techniqueStandard ??
  item?.technique ??
  item?.productionWorkPlace?.work_place_technique?.technique ??
  item?.work_place_technique?.technique ??
  item;

const getTechniqueId = (item: any, techniqueStandard: any) =>
  firstText(
    techniqueStandard?.id,
    item?.technique_standard_id,
    item?.techniqueStandardId,
    item?.technique_id,
    item?.techniqueId,
    item?.id,
  );

const getTechniqueName = (item: any, techniqueStandard: any) =>
  firstText(
    techniqueStandard?.name,
    item?.name,
    item?.technique_name,
    item?.techniqueName,
    item?.productionWorkPlace?.name,
    techniqueStandard?.machinery_model?.name,
    techniqueStandard?.machineryModel?.name,
  );

const getTechniqueStateNumber = (item: any, techniqueStandard: any) =>
  firstText(
    techniqueStandard?.state_number,
    techniqueStandard?.stateNumber,
    item?.state_number,
    item?.stateNumber,
    item?.technique_number,
    item?.techniqueNumber,
  );

const getTechniqueLabel = (item: any, techniqueStandard: any) => {
  const name = getTechniqueName(item, techniqueStandard);
  const stateNumber = getTechniqueStateNumber(item, techniqueStandard);
  const fallback = firstText(
    stateNumber,
    name,
    techniqueStandard?.id,
    item?.id,
    "Техника",
  );

  return [name || fallback, stateNumber && stateNumber !== name ? stateNumber : ""]
    .filter(Boolean)
    .join("\n");
};

export const isTruckTechnique = (techniqueStandard: any) => {
  const model = techniqueStandard?.machinery_model;
  const typeValue = model?.type?.id ?? model?.type;
  const typeText = normalizeText(typeValue);
  const nameText = normalizeText(
    [
      techniqueStandard?.name,
      techniqueStandard?.state_number,
      model?.name,
      model?.type?.description,
    ]
      .filter(Boolean)
      .join(" "),
  );

  return (
    Number(typeValue) === MachineryType.Truck ||
    typeText === "truck" ||
    typeText === "грузовик" ||
    nameText.includes("камаз") ||
    nameText.includes("kamaz") ||
    nameText.includes("самосвал") ||
    nameText.includes("грузов")
  );
};

const TechniqueMarkers: React.FC<Props> = ({
  technique = [],
  idSuffix,
  showLabels = true,
  onPress,
}) => {
  const sourceId = `technique_source_${idSuffix}`;
  const layerId = `technique_icon_${idSuffix}`;
  const labelLayerId = `technique_label_${idSuffix}`;

  const features = useMemo(() => {
    return {
      type: "FeatureCollection" as const,
      features: technique
        .map((item: any) => {
          const techniqueStandard = getTechniqueStandard(item);
          const id = getTechniqueId(item, techniqueStandard);
          const coords = normalizePoint(item.last_position);
          const bearing = 0;
          const label = getTechniqueLabel(item, techniqueStandard);

          if (!id || !coords) return null;

          return {
            type: "Feature" as const,
            geometry: {
              type: "Point" as const,
              coordinates: coords,
            },
            properties: {
              id: String(id),
              label: showLabels ? label : "",
              tooltipLabel: label,
              bearing,
              icon: isTruckTechnique(techniqueStandard)
                ? "default_icon_auto"
                : "ic_technique",
            },
          };
        })
        .filter(
          (
            feature,
          ): feature is {
            type: "Feature";
            geometry: {
              type: "Point";
              coordinates: [number, number];
            };
            properties: {
              id: string;
              label: string;
              tooltipLabel: string;
              bearing: number;
              icon: string;
            };
          } => Boolean(feature),
        ),
    };
  }, [showLabels, technique]);

  if (!features.features.length) return null;

  return (
    <>
      <Images images={techniqueIcons} />

      <ShapeSource id={sourceId} shape={features} onPress={onPress}>
        {[
          <SymbolLayer
            key={layerId}
            id={layerId}
            style={TECHNIQUE_ICON_STYLE}
          />,
          showLabels ? (
            <SymbolLayer
              key={labelLayerId}
              id={labelLayerId}
              minZoomLevel={11}
              style={TECHNIQUE_LABEL_STYLE}
            />
          ) : null,
        ].filter(Boolean)}
      </ShapeSource>
    </>
  );
};

export default React.memo(TechniqueMarkers);
