import { useEffect } from "react";
import { useMapCamera } from "./useMapCamera";
import { useOfflineRegions } from "./useOfflineRegions";
import { useCompanyRegion } from "./useCompanyRegion";

export const useMapboxMap = ({
  companyLocation,
  pinStartLocation,
  pinEndLocation,
}: any) => {
  const camera = useMapCamera({
    companyLocation,
    pinStartLocation,
    pinEndLocation,
  });

  const regions = useOfflineRegions();
  const companyRegion = useCompanyRegion();

  useEffect(() => {
    regions.loadRegions();
  }, []);

  useEffect(() => {
    if (companyLocation) {
      companyRegion.createCompanyRegion(companyLocation);
    }
  }, [companyLocation]);

  return {
    cameraPosition: camera.cameraPosition,
    setCameraPosition: camera.setCameraPosition,

    focus: camera.focus,

    offlineRegions: regions.regions,

    saveRegion: regions.saveRegion,
    deleteRegion: regions.deleteRegion,
  };
};
