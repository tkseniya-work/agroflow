import { useEffect, useRef, useState } from "react";
import { Coordinate } from "../../src/types/map.types";

export const useMapCamera = ({
  companyLocation,
  pinStartLocation,
  pinEndLocation,
}: {
  companyLocation?: Coordinate | null;
  pinStartLocation?: Coordinate | null;
  pinEndLocation?: Coordinate | null;
}) => {
  const [cameraPosition, setCameraPosition] = useState({
    centerCoordinate: null as Coordinate | null,
    zoomLevel: 11,
  });

  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;

    let center: Coordinate | null = null;
    let zoom = 11;

    if (pinEndLocation) {
      center = pinEndLocation;
      zoom = 16;
    } else if (pinStartLocation) {
      center = pinStartLocation;
      zoom = 16;
    } else if (companyLocation) {
      center = companyLocation;
      zoom = 11;
    }

    if (center) {
      setCameraPosition({
        centerCoordinate: center,
        zoomLevel: zoom,
      });
    }

    initialized.current = true;
  }, [companyLocation, pinStartLocation, pinEndLocation]);

  const focus = (coord: Coordinate, zoom = 14) => {
    setCameraPosition({
      centerCoordinate: coord,
      zoomLevel: zoom,
    });
  };

  return {
    cameraPosition,
    setCameraPosition,
    focus,
  };
};
