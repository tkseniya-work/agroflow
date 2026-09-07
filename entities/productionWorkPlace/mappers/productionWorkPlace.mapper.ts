import type {
  Coordinates,
  ProductionWorkPlace,
  WorkplaceType,
  WorkplaceZone,
} from "../../../db/schema";
import type {
  GeoPolygonDto,
  ProductionWorkPlaceDto,
} from "../../dictionaries/model/dictionary.interface";
import type { ProductionWorkPlaceRow } from "../repo/productionWorkPlace.repository";

export type LocalProductionWorkPlace = ProductionWorkPlaceDto & {
  productionWorkPlace: ProductionWorkPlace;
  workplaceType: WorkplaceType | null;
  workplaceZone: WorkplaceZone | null;
  coordinate: Coordinates | null;
};

const parseCoordinates = (
  value: Coordinates["coordinates"],
): GeoPolygonDto["coordinates"] | null => {
  if (!value) return null;

  if (Array.isArray(value)) {
    return value;
  }

  if (typeof value !== "string") {
    return null;
  }

  try {
    const parsed = JSON.parse(value) as GeoPolygonDto["coordinates"];
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
};

const toIsoDateTime = (value: number | null) => {
  if (!value) return null;

  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? null : date.toISOString();
};

export const mapProductionWorkPlaceRowToLocal = (
  row: ProductionWorkPlaceRow,
): LocalProductionWorkPlace => {
  const coordinates = parseCoordinates(row.coordinate?.coordinates ?? null);

  return {
    id: row.productionWorkPlace.id,
    name: row.productionWorkPlace.name,
    code: row.productionWorkPlace.code,
    work_place_type: row.workplaceType
      ? {
          id: row.workplaceType.id,
          description: row.workplaceType.description,
        }
      : null,
    work_place_zone: row.workplaceZone
      ? {
          coordinates: coordinates
            ? {
                type: "Polygon",
                coordinates,
              }
            : null,
        }
      : null,
    work_place_technique: null,
    is_deleted: Boolean(row.productionWorkPlace.is_deleted),
    deleted_at: toIsoDateTime(row.productionWorkPlace.deleted_at),
    comapny_id: row.productionWorkPlace.comapny_id,
    productionWorkPlace: row.productionWorkPlace,
    workplaceType: row.workplaceType,
    workplaceZone: row.workplaceZone,
    coordinate: row.coordinate,
  };
};

export const mapProductionWorkPlaceRowsToLocal = (
  rows: ProductionWorkPlaceRow[],
): LocalProductionWorkPlace[] => rows.map(mapProductionWorkPlaceRowToLocal);
