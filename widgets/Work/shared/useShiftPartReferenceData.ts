import { useCallback, useEffect, useState } from "react";

type TokenLoader = (accessToken: string) => Promise<any>;

type ReferenceDataParams = {
  visible: boolean;
  accessToken: string | null;
  loadWorkPlaces: TokenLoader;
  loadAgriculturalMachinery: TokenLoader;
  loadShiftSettings: TokenLoader;
};

export const useShiftPartReferenceData = ({
  visible,
  accessToken,
  loadWorkPlaces,
  loadAgriculturalMachinery,
  loadShiftSettings,
}: ReferenceDataParams) => {
  const [workPlaces, setWorkPlaces] = useState<any[]>([]);
  const [agriculturalMachinery, setAgriculturalMachinery] = useState<any[]>([]);
  const [shiftSettings, setShiftSettings] = useState<any>(null);

  useEffect(() => {
    if (!visible || !accessToken) return;

    let mounted = true;

    const loadData = async () => {
      const [workPlacesResponse, agriculturalResponse, settingsResponse] =
        await Promise.all([
          loadWorkPlaces(accessToken),
          loadAgriculturalMachinery(accessToken),
          loadShiftSettings(accessToken),
        ]);

      if (!mounted) return;

      setWorkPlaces(Array.isArray(workPlacesResponse) ? workPlacesResponse : []);
      setAgriculturalMachinery(
        Array.isArray(agriculturalResponse) ? agriculturalResponse : [],
      );
      setShiftSettings(
        Array.isArray(settingsResponse) ? settingsResponse[0] : settingsResponse,
      );
    };

    void loadData();

    return () => {
      mounted = false;
    };
  }, [
    accessToken,
    loadAgriculturalMachinery,
    loadShiftSettings,
    loadWorkPlaces,
    visible,
  ]);

  return { workPlaces, agriculturalMachinery, shiftSettings };
};

type TariffSearchParams = {
  visible: boolean;
  accessToken: string | null;
  workStandardId?: string | number | null;
  technique: any;
  agriculturalMachinery: any;
  getTechniqueModelId: (technique: any) => string | number | null | undefined;
  searchTariffs: (request: any) => Promise<any>;
};

export const useShiftPartTariffs = ({
  visible,
  accessToken,
  workStandardId,
  technique,
  agriculturalMachinery,
  getTechniqueModelId,
  searchTariffs,
}: TariffSearchParams) => {
  const [tariffs, setTariffs] = useState<any[]>([]);

  const loadTariffs = useCallback(async () => {
    if (!visible || !accessToken || !technique) return;

    const response = await searchTariffs({
      accessToken,
      workStandardId,
      techniqueModelId: getTechniqueModelId(technique),
      agriculturalMachineryModelId:
        agriculturalMachinery?.agriculturalMachinery?.machinery_model?.id,
    });

    setTariffs(Array.isArray(response) ? response : []);
  }, [
    accessToken,
    agriculturalMachinery,
    getTechniqueModelId,
    searchTariffs,
    technique,
    visible,
    workStandardId,
  ]);

  useEffect(() => {
    void loadTariffs();
  }, [loadTariffs]);

  return { tariffs, setTariffs };
};
