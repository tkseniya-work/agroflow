import { useAuth } from "../../auth/lib/useAuth";
import { useNetworkStatus } from "../../../shared/lib/useNetworkStatus";
import { SeasonFieldRequest, SeasonRequest } from "../../season/model/season.interface";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  FieldImageDatesResponse,
  SeasonFieldNdviResponse,
  SessionLoginResponse,
} from "../model/sentinel.interface";
import { useSentinelActions } from "./useSentinelActions";

type UseSentinelDataParams = {
  season: SeasonRequest | null;
  selectedField: SeasonFieldRequest | null;
};

const SESSION_REFRESH_MS = 5 * 60 * 1000;

export const useSentinelData = ({ season, selectedField }: UseSentinelDataParams) => {
  const { isConnected } = useNetworkStatus();
  const { getValidAccessToken } = useAuth();

  const {
    getSessionId: getSessionIdAction,
    loadFieldImageDates: loadFieldImageDatesData,
    loadSeasonFieldNdvi: loadSeasonFieldNdviData,
  } = useSentinelActions();

  const [fieldImageDates, setFieldImageDates] = useState<string[]>([]);
  const [loadingFieldImageDates, setLoadingFieldImageDates] = useState(false);
  const [fieldImageDatesError, setFieldImageDatesError] = useState<
    string | null
  >(null);

  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const [sessionId, setSessionId] = useState<string | null>(null);
  const [loadingSessionId, setLoadingSessionId] = useState(false);
  const [sessionIdError, setSessionIdError] = useState<string | null>(null);

  const [seasonFieldNdvi, setSeasonFieldNdvi] = useState<SeasonFieldNdviResponse[]>([]);
  const [loadingSeasonFieldNdvi, setLoadingSeasonFieldNdvi] = useState(false);
  const [seasonFieldNdviError, setSeasonFieldNdviError] = useState<
    string | null
  >(null);

  const sessionIntervalRef = useRef<ReturnType<typeof setInterval> | null>(
    null,
  );

  const loadFieldImageDates = useCallback(async () => {
    if (!season) {
      setFieldImageDates([]);
      setSelectedDate(null);
      return;
    }

    try {
      setLoadingFieldImageDates(true);
      setFieldImageDatesError(null);

      if (!isConnected) {
        setFieldImageDates([]);
        setSelectedDate(null);
        setFieldImageDatesError("Нет подключения к интернету");
        return;
      }

      const accessToken = await getValidAccessToken();

      if (!accessToken) {
        setFieldImageDates([]);
        setSelectedDate(null);
        setFieldImageDatesError("Не удалось получить access token");
        return;
      }

      const data = (await loadFieldImageDatesData({
        accessToken,
        season: season.year,
        from: `${season.year}-01-01`,
        to: `${season.year}-12-31`,
      })) as FieldImageDatesResponse | null;

      const dates = data?.image_dates ?? [];

      setFieldImageDates(dates);

      setSelectedDate((prev) => {
        if (prev && dates.includes(prev)) return prev;
        return dates.length > 0 ? dates[0] : null;
      });
    } catch (e) {
      setFieldImageDates([]);
      setSelectedDate(null);
      setFieldImageDatesError(
        e instanceof Error ? e.message : "Ошибка загрузки дат снимков",
      );
    } finally {
      setLoadingFieldImageDates(false);
    }
  }, [season, isConnected, getValidAccessToken, loadFieldImageDatesData]);

  const loadSeasonFieldNdvi = useCallback(async () => {
    if (!season || !selectedField) {
      setSeasonFieldNdvi([]);
      return [];
    }

    try {
      setLoadingSeasonFieldNdvi(true);
      setSeasonFieldNdviError(null);

      if (!isConnected) {
        setSeasonFieldNdvi([]);
        setSeasonFieldNdviError("Нет подключения к интернету");
        return [];
      }

      const accessToken = await getValidAccessToken();

      if (!accessToken) {
        setSeasonFieldNdvi([]);
        setSeasonFieldNdviError("Не удалось получить access token");
        return [];
      }

      const result = await loadSeasonFieldNdviData({
        accessToken: accessToken,
        sessionFieldId: selectedField.id,
        from: `${season.year}-01-01`,
        to: `${season.year}-12-31`,
      });

      const ndvi = Array.isArray(result) ? result : (result?.data ?? []);

      setSeasonFieldNdvi(ndvi);

      return ndvi;
    } catch (e) {
      setSeasonFieldNdvi([]);
      setSeasonFieldNdviError(
        e instanceof Error ? e.message : "Ошибка загрузки NDVI",
      );
      return [];
    } finally {
      setLoadingSeasonFieldNdvi(false);
    }
  }, [
    season,
    selectedField,
    selectedDate,
    isConnected,
    getValidAccessToken,
    loadSeasonFieldNdviData,
  ]);

  const loadSessionId = useCallback(async () => {
    try {
      setLoadingSessionId(true);
      setSessionIdError(null);

      if (!isConnected) {
        setSessionId(null);
        setSessionIdError("Нет подключения к интернету");
        return null;
      }

      const accessToken = await getValidAccessToken();

      if (!accessToken) {
        setSessionId(null);
        setSessionIdError("Не удалось получить access token");
        return null;
      }

      const result = (await getSessionIdAction(
        accessToken,
      )) as SessionLoginResponse | null;

      const nextSessionId = result?.session_id ?? null;

      if (!nextSessionId) {
        setSessionId(null);
        setSessionIdError("Не удалось получить session id");
        return null;
      }

      setSessionId(nextSessionId);
      return nextSessionId;
    } catch (e) {
      setSessionId(null);
      setSessionIdError(
        e instanceof Error ? e.message : "Ошибка загрузки session id",
      );
      return null;
    } finally {
      setLoadingSessionId(false);
    }
  }, [isConnected, getValidAccessToken, getSessionIdAction]);

  const refreshSessionId = useCallback(async () => {
    return await loadSessionId();
  }, [loadSessionId]);

  const onSelectImageDate = useCallback((date: string | null) => {
    setSelectedDate(date);
  }, []);

  useEffect(() => {
    loadFieldImageDates();

    if (season) {
      loadSessionId();
    } else {
      setSessionId(null);
      setSessionIdError(null);
    }
  }, [season, loadFieldImageDates, loadSessionId]);

  useEffect(() => {
    if (!season || !selectedField) {
      setSeasonFieldNdvi([]);
      setSeasonFieldNdviError(null);
      return;
    }

    loadSeasonFieldNdvi();
  }, [season, selectedField, selectedDate, loadSeasonFieldNdvi]);

  useEffect(() => {
    if (sessionIntervalRef.current) {
      clearInterval(sessionIntervalRef.current);
      sessionIntervalRef.current = null;
    }

    if (!season || !isConnected) {
      return;
    }

    sessionIntervalRef.current = setInterval(() => {
      loadSessionId();
    }, SESSION_REFRESH_MS);

    return () => {
      if (sessionIntervalRef.current) {
        clearInterval(sessionIntervalRef.current);
        sessionIntervalRef.current = null;
      }
    };
  }, [season, isConnected, loadSessionId]);

  return {
    fieldImageDates,
    selectedDate,
    sessionId,
    seasonFieldNdvi,

    loadingFieldImageDates,
    loadingSessionId,
    loadingSeasonFieldNdvi,

    fieldImageDatesError,
    sessionIdError,
    seasonFieldNdviError,

    loadFieldImageDates,
    loadSessionId,
    refreshSessionId,
    loadSeasonFieldNdvi,

    onSelectImageDate,
  };
};
