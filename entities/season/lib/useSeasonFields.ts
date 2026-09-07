import { useCallback, useEffect, useState } from "react";
import {
  SeasonFieldRequest,
  SeasonRequest,
} from "../model/season.interface";
import { useNetworkStatus } from "../../../shared/lib/useNetworkStatus";
import { useAuth } from "../../auth/lib/useAuth";
import { useSeasonActions } from "./useSeasonActions";

type UseSeasonFieldsParams = {
  initialSeasonYear?: number | null;
  workKind?: number | string | null;
};

export const useSeasonFields = (params: UseSeasonFieldsParams = {}) => {
  const { initialSeasonYear, workKind } = params;
  const { isConnected } = useNetworkStatus();
  const { getValidAccessToken } = useAuth();

  const [seasons, setSeasons] = useState<SeasonRequest[]>([]);
  const [currentSeason, setCurrentSeason] = useState<SeasonRequest | null>(
    null,
  );
  const [fields, setFields] = useState<SeasonFieldRequest[]>([]);
  const [selectedField, setSelectedField] = useState<SeasonFieldRequest | null>(
    null,
  );
  const [loadingSeasons, setLoadingSeasons] = useState(false);
  const [loadingFields, setLoadingFields] = useState(false);
  const [error, setError] = useState<any>(null);

  const { loadSeasonFields, loadSeasons } = useSeasonActions();

  const loadFieldsBySeason = useCallback(
    async (season: SeasonRequest | null) => {
      if (!season) {
        setFields([]);
        return;
      }

      try {
        setLoadingFields(true);
        setError(null);

        if (!isConnected) {
          setFields([]);
          setError("Нет подключения к интернету");
          return;
        }

        const accessToken = await getValidAccessToken();

        const fieldsData = await loadSeasonFields({
          accessToken: accessToken,
          season: season.year.toString(),
          workKind,
        });

        setFields(fieldsData ?? []);
      } catch (e) {
        setFields([]);
        setError(e);
      } finally {
        setLoadingFields(false);
      }
    },
    [getValidAccessToken, isConnected, loadSeasonFields, workKind],
  );

  const changeSeason = useCallback(
    async (season: SeasonRequest) => {
      setCurrentSeason(season);
      await loadFieldsBySeason(season);
    },
    [loadFieldsBySeason],
  );

  const reloadCurrentSeason = useCallback(async () => {
    await loadFieldsBySeason(currentSeason);
  }, [currentSeason, loadFieldsBySeason]);

  const selectedFieldChange = useCallback(
    async (field: SeasonFieldRequest | null) => {
      setSelectedField(field);
    },
    [setSelectedField],
  );

  useEffect(() => {
    const load = async () => {
      try {
        setLoadingSeasons(true);
        setError(null);

        if (!isConnected) {
          setSeasons([]);
          setFields([]);
          setError("Нет подключения к интернету");
          return;
        }

        const accessToken = await getValidAccessToken();
        const seasonsData = await loadSeasons(accessToken);

        const preparedSeasons = seasonsData ?? [];
        setSeasons(preparedSeasons);

        if (preparedSeasons.length === 0) {
          setCurrentSeason(null);
          setFields([]);
          return;
        }

        const defaultSeason =
          preparedSeasons.find((item: any) => item?.year === initialSeasonYear) ??
          preparedSeasons.find((item: any) => item?.is_current) ??
          preparedSeasons[0];

        setCurrentSeason(defaultSeason);
        await loadFieldsBySeason(defaultSeason);
      } catch (e) {
        setSeasons([]);
        setFields([]);
        setError(e);
      } finally {
        setLoadingSeasons(false);
      }
    };

    load();
  }, [
    getValidAccessToken,
    initialSeasonYear,
    isConnected,
    loadSeasons,
    loadFieldsBySeason,
  ]);

  return {
    seasons,
    currentSeason,
    selectedField,
    fields,
    loading: loadingSeasons || loadingFields,
    loadingSeasons,
    loadingFields,
    error,
    changeSeason,
    reloadCurrentSeason,
    selectedFieldChange
  };
};
