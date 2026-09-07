import { useEffect, useState, useCallback, useRef } from "react";
import {
  ProductionTaskTrack,
  Technique,
  TechniqueTrackResponse,
  TrackItem,
} from "../model/model.interface";
import { useNetworkStatus } from "../../../shared/lib/useNetworkStatus";
import { useAuth } from "../../auth/lib/useAuth";
import { useTechniqueMonitoringActions } from "./useTechniqueMonitoringActions";
import {
  DropdownItem,
  Period,
  TechniqueTrackSummary,
} from "../../../src/types/map.types";
import { normalizeTrackItems } from "../../../src/utils/taskUtils";

type LoadingType = "technique" | "track" | "taskTrack" | null;

const INITIAL_LOADING_MAX_MS = 4000;

export const useTechniqueMonitoring = (cameraRef: any) => {
  const { isConnected, forcedOffline, isEnvOfflineMode } = useNetworkStatus();
  const { getValidAccessToken } = useAuth();

  const [technique, setTechnique] = useState<Technique[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingType, setLoadingType] = useState<LoadingType>(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [errorTrack, setErrorTrack] = useState<string | null>(null);
  const [draftPeriod, setDraftPeriod] = useState<Period | null>(null);
  const [selectedTechnique, setSelectedTechnique] = useState<DropdownItem[]>(
    [],
  );

  const [tracks, setTracks] = useState<TrackItem[]>([]);
  const [trackSummary, setTrackSummary] = useState<TechniqueTrackSummary[]>(
    [],
  );

  const {
    loadAllTechniques,
    loadProductionTaskTrack: loadProductionTaskTrackData,
    loadTechniqueTrack: loadTechniqueTrackData,
  } = useTechniqueMonitoringActions();

  const requestInFlightRef = useRef(false);
  const hasLoadedOnceRef = useRef(false);

  const loadTechnique = useCallback(
    async (options?: { silent?: boolean }) => {
      if (requestInFlightRef.current) return;

      const silent = options?.silent ?? false;

      try {
        requestInFlightRef.current = true;
        setErrorTrack(null);

        if (!silent && !hasLoadedOnceRef.current) {
          setInitialLoading(true);
        }

        if (!silent) {
          setLoading(true);
          setLoadingType("technique");
        }

        if (!isConnected) {
          setTechnique([]);
          setErrorTrack(null);
          return;
        }

        const accessToken = await getValidAccessToken();
        const data = (await loadAllTechniques(accessToken)) || [];

        setTechnique(data);

        hasLoadedOnceRef.current = true;
      } catch (error: any) {
        console.error(error);
        setErrorTrack(error?.message || "Ошибка загрузки техники");
      } finally {
        requestInFlightRef.current = false;

        if (!silent) {
          setLoading(false);
          setLoadingType(null);
        }

        setInitialLoading(false);
      }
    },
    [isConnected, getValidAccessToken, loadAllTechniques],
  );

  const loadTechiqueTrack = useCallback(async (periodOverride?: Period) => {
    try {
      const allTracks: TrackItem[] = [];
      const summaries: TechniqueTrackSummary[] = [];
      const activePeriod = periodOverride ?? draftPeriod;

      if (
        !activePeriod ||
        !activePeriod.startDate ||
        !activePeriod.endDate ||
        selectedTechnique.length === 0
      ) {
        setTracks([]);
        setTrackSummary([]);
        setErrorTrack("Выберите период и технику");
        return;
      }

      setErrorTrack(null);
      setLoading(true);
      setLoadingType("track");

      const accessToken = await getValidAccessToken();
      const startDate = new Date(activePeriod.startDate);
      const requestedEndDate = new Date(activePeriod.endDate);
      const now = new Date();
      const endDate =
        requestedEndDate.getTime() > now.getTime() ? now : requestedEndDate;

      if (
        Number.isNaN(startDate.getTime()) ||
        Number.isNaN(endDate.getTime()) ||
        startDate.getTime() >= endDate.getTime()
      ) {
        setTracks([]);
        setTrackSummary([]);
        setErrorTrack("Выбран некорректный период");
        return;
      }

      for (const item of selectedTechnique) {
        const trackResponse = (await loadTechniqueTrackData({
          accessToken: accessToken,
          techniqueId: item.id.toString(),
          from: startDate.toISOString(),
          to: endDate.toISOString(),
        })) as TechniqueTrackResponse;

        const hasTrack = !!trackResponse?.track?.length;

        if (hasTrack) {
          allTracks.push(...trackResponse.track);
        }

        summaries.push({
          ...trackResponse,
          technique: trackResponse?.technique ?? {
            id: item.id,
            name: item.name,
          },
          track: trackResponse?.track ?? [],
          hasTrack,
        });
      }

      if (summaries.every((item) => !item.hasTrack)) {
        setTracks([]);
        setTrackSummary(summaries);
        return;
      }

      setTracks(allTracks);
      setTrackSummary(summaries);
    } catch (error: any) {
      const status = error?.response?.status;
      setErrorTrack(
        status >= 500
          ? "Сервис мониторинга временно недоступен. Попробуйте позже."
          : error?.message || "Ошибка загрузки трека техники",
      );
      setTracks([]);
      setTrackSummary([]);
    } finally {
      setLoading(false);
      setLoadingType(null);
    }
  }, [
    draftPeriod,
    selectedTechnique,
    getValidAccessToken,
    loadTechniqueTrackData,
  ]);

  const mapProductionTracksToLines = useCallback(
    (response: ProductionTaskTrack): TrackItem[] => {
      if (!Array.isArray(response?.tracks) || response.tracks.length === 0) {
        return [];
      }

      return response.tracks.flatMap((track) => {
        return normalizeTrackItems(track?.lines);
      });
    },
    [],
  );

  const loadProductionTaskTrack = useCallback(
    async (productionTaskId: string | number) => {
      try {
        setErrorTrack(null);

        if (!productionTaskId) {
          setTracks([]);
          return false;
        }

        setLoading(true);
        setLoadingType("taskTrack");

        const accessToken = await getValidAccessToken();

        const response = await loadProductionTaskTrackData({
          accessToken,
          taskId: productionTaskId.toString(),
        });

        const lines = mapProductionTracksToLines(response);

        setTracks(lines);
        setTrackSummary([]);

        if (lines.length === 0) {
          setErrorTrack("Для задания нет данных трека");
          return false;
        }

        return true;
      } catch (error: any) {
        console.error(error);
        setErrorTrack(error?.message || "Ошибка загрузки трека задачи");
        setTracks([]);
        return false;
      } finally {
        setLoading(false);
        setLoadingType(null);
      }
    },
    [
      getValidAccessToken,
      loadProductionTaskTrackData,
      mapProductionTracksToLines,
    ],
  );

  const clearTrack = useCallback(() => {
    setTracks([]);
    setTrackSummary([]);
  }, []);

  useEffect(() => {
    if (forcedOffline || isEnvOfflineMode) {
      setErrorTrack(null);
    }
  }, [forcedOffline, isEnvOfflineMode]);

  useEffect(() => {
    if (!initialLoading) return;

    const timeoutId = setTimeout(() => {
      setInitialLoading(false);
    }, INITIAL_LOADING_MAX_MS);

    return () => clearTimeout(timeoutId);
  }, [initialLoading]);

  useEffect(() => {
    loadTechnique();
  }, [loadTechnique]);

  return {
    technique,
    loading,
    loadingType,
    initialLoading,
    errorTrack,
    selectedTechnique,
    draftPeriod,
    tracks,
    trackSummary,

    loadTechnique,
    loadTechiqueTrack,
    loadProductionTaskTrack,
    clearTrack,

    setSelectedTechnique,
    setDraftPeriod,
    setTracks,
    setTrackSummary,
  };
};
