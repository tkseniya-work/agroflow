import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { isAxiosError } from "axios";
import { useAuth } from "../../../entities/auth/lib/useAuth";
import {
  SeasonFieldHarvestInfoResponse,
  SeasonFieldRequest,
  Event,
  YieldForecast,
  useSeasonActions,
} from "../../../entities/season";
import { ProductionPlanResponse } from "../../../src/types/map.types";
import Colors from "../../../shared/styles/Colors";

type Props = {
  currentSeasonFieldState: SeasonFieldRequest | null;
  evaluation?: any;
  harvestForecast?: any;
  productionPlan?: ProductionPlanResponse | null;
  forecastLoading?: boolean;
  onRefreshForecast?: () => void;
  compact?: boolean;
};

const formatDate = (dateString?: string) => {
  if (!dateString) return "—";

  try {
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return "—";

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    return `${day}-${month}-${year}`;
  } catch {
    return "—";
  }
};

const formatStageDate = (dateString?: string) => {
  if (!dateString) return "—";

  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "short",
  });
};

const formatLongDate = (dateString?: string) => {
  if (!dateString) return "—";

  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

const formatPercent = (value?: number | null) => {
  if (value == null) return "—";
  return `${value}%`;
};

const formatYield = (value?: number | null) => {
  if (value == null) return "—";

  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) return "—";

  return numericValue.toLocaleString("ru-RU", {
    maximumFractionDigits: 2,
  });
};

const getActualYield = (
  harvestInfo?: SeasonFieldHarvestInfoResponse | null,
) => {
  if (!harvestInfo) return null;
  if (harvestInfo.yield == null) return null;

  const yieldTonsPerHectare = Number(harvestInfo.yield);
  if (!Number.isFinite(yieldTonsPerHectare)) return null;

  // API отдаёт т/га, а карточка отображает ц/га.
  return yieldTonsPerHectare * 10;
};

const YIELD_FORECAST_POLL_INTERVAL_MS = 5_000;

const wait = (milliseconds: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, milliseconds));

const getGrowStageRefreshError = (error: unknown) => {
  if (!isAxiosError(error)) {
    return "Не удалось обновить стадию. Попробуйте ещё раз.";
  }

  const responseData = error.response?.data as
    | { detail?: string; title?: string }
    | string
    | undefined;
  const serverMessage =
    typeof responseData === "string"
      ? responseData
      : responseData?.detail || responseData?.title;

  if (serverMessage?.trim()) return serverMessage.trim();

  if (error.response?.status && error.response.status >= 500) {
    return "Сервис оценки стадии временно недоступен. Повторите позже.";
  }

  if (!error.response) {
    return "Нет соединения с сервером. Проверьте интернет.";
  }

  return "Не удалось обновить стадию. Попробуйте ещё раз.";
};

const getYieldRefreshError = (error: unknown) => {
  if (!isAxiosError(error)) {
    return "Не удалось обновить урожайность. Попробуйте ещё раз.";
  }

  const responseData = error.response?.data as
    | { detail?: string; title?: string }
    | string
    | undefined;
  const serverMessage =
    typeof responseData === "string"
      ? responseData
      : responseData?.detail || responseData?.title;

  if (serverMessage?.trim()) return serverMessage.trim();

  if (error.response?.status && error.response.status >= 500) {
    return "Сервис урожайности временно недоступен. Повторите позже.";
  }

  if (!error.response) {
    return "Нет соединения с сервером. Проверьте интернет.";
  }

  return "Не удалось обновить урожайность. Попробуйте ещё раз.";
};

type SectionCardProps = {
  title: string;
  children: React.ReactNode;
  rightSlot?: React.ReactNode;
};

const SectionCard: React.FC<SectionCardProps> = ({
  title,
  children,
  rightSlot,
}) => (
  <View style={styles.card}>
    <View style={styles.cardHeader}>
      <Text style={styles.title}>{title}</Text>
      {rightSlot}
    </View>
    {children}
  </View>
);

type InfoItemProps = {
  label: string;
  value?: string | number | null;
  fullWidth?: boolean;
  accent?: "default" | "success";
};

const InfoItem: React.FC<InfoItemProps> = ({
  label,
  value,
  fullWidth = false,
  accent = "default",
}) => (
  <View style={[styles.infoItem, fullWidth && styles.infoItemFull]}>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text
      style={[
        styles.infoValue,
        accent === "success" && styles.infoValueSuccess,
      ]}
      numberOfLines={2}
    >
      {value ?? "—"}
    </Text>
  </View>
);

const Chip = ({
  label,
  variant = "neutral",
}: {
  label: string;
  variant?: "neutral" | "success";
}) => (
  <View
    style={[
      styles.chip,
      variant === "success" ? styles.chipSuccess : styles.chipNeutral,
    ]}
  >
    <Text
      style={[
        styles.chipText,
        variant === "success" ? styles.chipTextSuccess : styles.chipTextNeutral,
      ]}
    >
      {label}
    </Text>
  </View>
);

const MetricTile = ({
  label,
  value,
  accent = "default",
  hint,
}: {
  label: string;
  value?: string | number | null;
  accent?: "default" | "success";
  hint?: string;
}) => (
  <View style={styles.metricTile}>
    <Text style={styles.metricLabel}>{label}</Text>
    <Text
      style={[
        styles.metricValue,
        accent === "success" && styles.metricValueSuccess,
      ]}
    >
      {value ?? "—"}
    </Text>
    {!!hint && <Text style={styles.metricHint}>{hint}</Text>}
  </View>
);

const MainInfoBlock = ({
  currentSeasonFieldState,
  compact = false,
}: {
  currentSeasonFieldState: SeasonFieldRequest | null;
  compact?: boolean;
}) => {
  const currentCropRotation = currentSeasonFieldState?.crop_rotation;
  const events = currentSeasonFieldState?.events ?? [];

  const seedEvent = events.find((el) => el.event_type?.id === 0);

  return (
    <SectionCard title="Основная информация">
      <View style={styles.grid}>
        {!compact && (
          <InfoItem
            label="Поле"
            value={currentSeasonFieldState?.name || "—"}
            fullWidth
          />
        )}

        <InfoItem
          label="Площадь"
          value={
            currentSeasonFieldState?.area != null
              ? `${currentSeasonFieldState.area} га`
              : "—"
          }
        />

        <InfoItem
          label="Культура"
          value={currentCropRotation?.crop?.name || "—"}
        />

        {!currentCropRotation?.clean_fallow && (
          <InfoItem label="Дата сева" value={formatDate(seedEvent?.date)} />
        )}

        <InfoItem
          label="Сорт / гибрид"
          value={seedEvent?.crop_variety?.name || "—"}
        />

        <InfoItem label="Год" value={currentSeasonFieldState?.year ?? "—"} />
      </View>
    </SectionCard>
  );
};

const GrowStageBlock = ({
  currentSeasonFieldState,
  evaluation,
  seedEvent,
}: {
  currentSeasonFieldState: SeasonFieldRequest | null;
  evaluation?: any;
  seedEvent?: Event;
}) => {
  const { getValidAccessToken } = useAuth();
  const {
    loadSeasonFieldGrowStageEvaluation,
    loadSeasonFields,
  } = useSeasonActions();

  const [detailsVisible, setDetailsVisible] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [refreshLoading, setRefreshLoading] = useState(false);
  const [refreshError, setRefreshError] = useState<string | null>(null);
  const [resolvedEvaluation, setResolvedEvaluation] = useState(evaluation);

  const currentStage = resolvedEvaluation?.current_stage;
  const nextStage = resolvedEvaluation?.next_stage;
  const stageName = currentStage?.name || "—";
  const hasHarvestEvent = currentSeasonFieldState?.events?.some(
    (event) => event.event_type?.id === 1,
  );
  const canRefresh =
    !!currentSeasonFieldState?.id && !!seedEvent && !hasHarvestEvent;
  const daysForecastMin = Number(nextStage?.days_forecast_min);
  const transitionProgress = Number.isFinite(daysForecastMin)
    ? Math.min(100, Math.max(0, (Math.min(30, daysForecastMin) / 30) * 100))
    : 0;

  useEffect(() => {
    setResolvedEvaluation(evaluation);
    setDetailsVisible(false);
    setConfirmVisible(false);
    setRefreshError(null);
  }, [currentSeasonFieldState?.id, evaluation]);

  const handleRefreshStage = async () => {
    const seasonFieldId = currentSeasonFieldState?.id;
    if (!seasonFieldId || !canRefresh || refreshLoading) return;

    try {
      setRefreshLoading(true);
      setRefreshError(null);

      const accessToken = await getValidAccessToken();
      if (!accessToken) throw new Error("Access token is missing");

      const evaluationFields = await loadSeasonFieldGrowStageEvaluation({
        accessToken,
        seasonFieldId,
      });
      const refreshedFields = await loadSeasonFields({
        accessToken,
        season: String(currentSeasonFieldState.year),
      });
      const updatedField =
        refreshedFields.find((field) => field.id === seasonFieldId) ??
        evaluationFields.find((field) => field.id === seasonFieldId);

      if (!updatedField?.evaluation) {
        throw new Error("Updated evaluation is missing");
      }

      setResolvedEvaluation(updatedField.evaluation);
      setConfirmVisible(false);
    } catch (error) {
      if (isAxiosError(error)) {
        console.error("loadSeasonFieldGrowStageEvaluation error:", {
          status: error.response?.status,
          data: error.response?.data,
          url: error.config?.url,
          seasonFieldId,
        });
      } else {
        console.error("loadSeasonFieldGrowStageEvaluation error:", error);
      }

      setRefreshError(getGrowStageRefreshError(error));
    } finally {
      setRefreshLoading(false);
    }
  };

  if (!resolvedEvaluation && !canRefresh) return null;

  return (
    <>
      <SectionCard
        title="Стадия развития"
        rightSlot={
          <View style={styles.stageHeaderActions}>
            {!!resolvedEvaluation && (
              <Pressable
                onPress={() => setDetailsVisible(true)}
                hitSlop={8}
                style={({ pressed }) => [
                  styles.detailsButton,
                  pressed && styles.detailsButtonPressed,
                ]}
                accessibilityRole="button"
                accessibilityLabel="Подробнее о стадии развития"
              >
                <Ionicons
                  name="information-circle-outline"
                  size={16}
                  color={Colors.greenColor}
                />
                <Text style={styles.detailsButtonText}>Подробнее</Text>
              </Pressable>
            )}

            {canRefresh && (
              <Pressable
                onPress={() => {
                  setRefreshError(null);
                  setConfirmVisible(true);
                }}
                disabled={refreshLoading}
                hitSlop={8}
                style={({ pressed }) => [
                  styles.stageRefreshButton,
                  pressed && styles.detailsButtonPressed,
                ]}
                accessibilityRole="button"
                accessibilityLabel="Обновить стадию развития"
              >
                {refreshLoading ? (
                  <ActivityIndicator size={15} color={Colors.greenColor} />
                ) : (
                  <Ionicons
                    name="refresh"
                    size={17}
                    color={Colors.greenColor}
                  />
                )}
              </Pressable>
            )}
          </View>
        }
      >
        <View style={styles.stageTopRow}>
          <View style={styles.stageInfoBlock}>
            <Text style={styles.eyebrow}>ТЕКУЩАЯ СТАДИЯ</Text>
            <Chip
              label={
                resolvedEvaluation ? stageName : "Оценка ещё не рассчитана"
              }
              variant={resolvedEvaluation ? "success" : "neutral"}
            />
          </View>
        </View>

        {!!refreshError && (
          <Text style={styles.stageRefreshError}>{refreshError}</Text>
        )}
      </SectionCard>

      <Modal
        visible={confirmVisible}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => {
          if (!refreshLoading) setConfirmVisible(false);
        }}
      >
        <View style={styles.stageConfirmOverlay}>
          <Pressable
            style={StyleSheet.absoluteFillObject}
            onPress={() => {
              if (!refreshLoading) setConfirmVisible(false);
            }}
          />

          <View style={styles.stageConfirmCard}>
            <View style={styles.stageConfirmIcon}>
              <Ionicons
                name="refresh"
                size={22}
                color={Colors.greenColor}
              />
            </View>
            <Text style={styles.stageConfirmTitle}>
              Обновить стадию развития?
            </Text>
            <Text style={styles.stageConfirmText}>
              Будет выполнена новая оценка стадии развития растения.
            </Text>

            {!!refreshError && (
              <Text style={styles.stageConfirmError}>{refreshError}</Text>
            )}

            <View style={styles.stageConfirmActions}>
              <Pressable
                onPress={() => setConfirmVisible(false)}
                disabled={refreshLoading}
                style={({ pressed }) => [
                  styles.stageConfirmCancel,
                  pressed && styles.detailsButtonPressed,
                ]}
                accessibilityRole="button"
              >
                <Text style={styles.stageConfirmCancelText}>Отмена</Text>
              </Pressable>

              <Pressable
                onPress={handleRefreshStage}
                disabled={refreshLoading}
                style={({ pressed }) => [
                  styles.stageConfirmSubmit,
                  pressed && styles.detailsButtonPressed,
                  refreshLoading && styles.stageConfirmSubmitDisabled,
                ]}
                accessibilityRole="button"
              >
                {refreshLoading && (
                  <ActivityIndicator size={15} color={Colors.white} />
                )}
                <Text style={styles.stageConfirmSubmitText}>
                  {refreshLoading ? "Обновляем..." : "Обновить"}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={detailsVisible}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setDetailsVisible(false)}
      >
        <View style={styles.stageModalOverlay}>
          <Pressable
            style={StyleSheet.absoluteFillObject}
            onPress={() => setDetailsVisible(false)}
            accessibilityRole="button"
            accessibilityLabel="Закрыть информацию о стадии развития"
          />

          <View style={styles.stageModalCard}>
            <View style={styles.stageModalHeader}>
              <View style={styles.stageModalTitleRow}>
                <View style={styles.stageModalIcon}>
                  <Ionicons
                    name="leaf-outline"
                    size={19}
                    color={Colors.greenColor}
                  />
                </View>
                <Text style={styles.stageModalTitle}>
                  Стадия развития растения
                </Text>
              </View>

              <Pressable
                onPress={() => setDetailsVisible(false)}
                hitSlop={10}
                style={({ pressed }) => [
                  styles.stageModalClose,
                  pressed && styles.detailsButtonPressed,
                ]}
                accessibilityRole="button"
                accessibilityLabel="Закрыть"
              >
                <Ionicons name="close" size={22} color={Colors.grey700} />
              </Pressable>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.stageModalContent}
            >
              <View style={styles.stageModalSectionHeader}>
                <Text style={styles.stageModalEyebrow}>ТЕКУЩАЯ СТАДИЯ</Text>
                <Chip label={stageName} variant="success" />
              </View>

              {!!currentStage?.justification && (
                <View style={styles.stageJustificationCard}>
                  <View style={styles.stageInfoLabelRow}>
                    <Ionicons
                      name="information-circle-outline"
                      size={17}
                      color={Colors.greenColor}
                    />
                    <Text style={styles.stageInfoLabel}>Обоснование</Text>
                  </View>
                  <Text style={styles.stageBodyText}>
                    {currentStage.justification}
                  </Text>
                </View>
              )}

              {!!nextStage && (
                <>
                  <View style={styles.stageDivider} />

                  <Text style={styles.stageModalEyebrow}>
                    СЛЕДУЮЩАЯ СТАДИЯ
                  </Text>
                  <Text style={styles.nextStageName}>
                    {nextStage.name || "—"}
                  </Text>

                  <View style={styles.stageForecastGrid}>
                    <View style={styles.stageForecastItem}>
                      <Text style={styles.stageForecastLabel}>До перехода</Text>
                      <Text style={styles.stageForecastValue}>
                        {nextStage.days_forecast_min ?? "—"}–
                        {nextStage.days_forecast_max ?? "—"} дней
                      </Text>
                      <View style={styles.stageProgressTrack}>
                        <View
                          style={[
                            styles.stageProgressFill,
                            { width: `${transitionProgress}%` },
                          ]}
                        />
                      </View>
                    </View>

                    <View style={styles.stageForecastItem}>
                      <View style={styles.stageInfoLabelRow}>
                        <Ionicons
                          name="calendar-outline"
                          size={15}
                          color={Colors.greenColor}
                        />
                        <Text style={styles.stageForecastLabel}>
                          Прогноз перехода
                        </Text>
                      </View>
                      <Text style={styles.stageForecastValue}>
                        {formatStageDate(nextStage.date_min)} –{" "}
                        {formatStageDate(nextStage.date_max)}
                      </Text>
                    </View>
                  </View>

                  {!!nextStage.justification && (
                    <View style={styles.nextStageJustificationCard}>
                      <View style={styles.stageInfoLabelRow}>
                        <Ionicons
                          name="information-circle-outline"
                          size={17}
                          color="#B7791F"
                        />
                        <Text style={styles.stageInfoLabel}>
                          Обоснование прогноза
                        </Text>
                      </View>
                      <Text style={styles.stageBodyText}>
                        {nextStage.justification}
                      </Text>
                    </View>
                  )}
                </>
              )}

              <Text style={styles.stageModalFootnote}>
                Данные обновляются ежедневно
              </Text>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
};

const HarvestForecastBlock = ({
  currentSeasonFieldState,
  forecast,
  productionPlan,
  harvestInfo,
  loading,
  harvestLoading,
  onRefresh,
}: {
  currentSeasonFieldState: SeasonFieldRequest | null;
  forecast?: YieldForecast | null;
  productionPlan?: ProductionPlanResponse | null;
  harvestInfo?: SeasonFieldHarvestInfoResponse | null;
  loading?: boolean;
  harvestLoading?: boolean;
  onRefresh?: () => void;
}) => {
  const { getValidAccessToken } = useAuth();
  const {
    loadSeasonFieldYieldForecast,
    refreshSeasonFieldYieldForecast,
  } = useSeasonActions();
  const [resolvedForecast, setResolvedForecast] = useState(forecast);
  const [forecastRequestLoading, setForecastRequestLoading] = useState(false);
  const [detailsVisible, setDetailsVisible] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [refreshLoading, setRefreshLoading] = useState(false);
  const [refreshError, setRefreshError] = useState<string | null>(null);
  const refreshRunRef = useRef(0);

  const events = currentSeasonFieldState?.events ?? [];
  const seedEvent = events.find((event) => event.event_type?.id === 0);
  const harvestEvent = events.find((event) => event.event_type?.id === 1);
  const seasonFieldId = currentSeasonFieldState?.id;
  const canRefresh = !!seasonFieldId && !!seedEvent && !harvestEvent;

  useEffect(() => {
    setResolvedForecast(forecast);
    setDetailsVisible(false);
    setConfirmVisible(false);
    setRefreshLoading(false);
    setRefreshError(null);
  }, [forecast, seasonFieldId]);

  useEffect(() => {
    return () => {
      refreshRunRef.current += 1;
    };
  }, [seasonFieldId]);

  useEffect(() => {
    let active = true;

    if (!seasonFieldId) {
      setForecastRequestLoading(false);
      return () => {
        active = false;
      };
    }

    const loadForecast = async () => {
      try {
        setForecastRequestLoading(true);
        const accessToken = await getValidAccessToken();
        if (!accessToken) return;

        const response = await loadSeasonFieldYieldForecast({
          accessToken,
          seasonFieldId,
        });

        if (active) setResolvedForecast(response);
      } catch (error) {
        console.warn("loadSeasonFieldYieldForecast error:", error);
      } finally {
        if (active) setForecastRequestLoading(false);
      }
    };

    loadForecast();

    return () => {
      active = false;
    };
  }, [
    getValidAccessToken,
    loadSeasonFieldYieldForecast,
    seasonFieldId,
  ]);

  const handleRefreshYield = async () => {
    if (
      !seasonFieldId ||
      !canRefresh ||
      refreshLoading
    ) {
      return;
    }

    const refreshRunId = ++refreshRunRef.current;
    try {
      setRefreshLoading(true);
      setRefreshError(null);

      const accessToken = await getValidAccessToken();
      if (!accessToken) throw new Error("Access token is missing");

      await refreshSeasonFieldYieldForecast({
        accessToken,
        seasonFieldId,
      });

      if (refreshRunRef.current !== refreshRunId) return;
      setConfirmVisible(false);

      while (refreshRunRef.current === refreshRunId) {
        await wait(YIELD_FORECAST_POLL_INTERVAL_MS);

        if (refreshRunRef.current !== refreshRunId) return;

        const response = await loadSeasonFieldYieldForecast({
          accessToken,
          seasonFieldId,
        });

        if (refreshRunRef.current !== refreshRunId) return;

        if (response !== null) {
          setResolvedForecast(response);
          await onRefresh?.();
          return;
        }
      }
    } catch (error) {
      if (refreshRunRef.current !== refreshRunId) return;

      if (isAxiosError(error)) {
        console.error("refreshSeasonFieldYieldForecast error:", {
          status: error.response?.status,
          data: error.response?.data,
          url: error.config?.url,
          seasonFieldId,
        });
      } else {
        console.error("refreshSeasonFieldYieldForecast error:", error);
      }

      setRefreshError(getYieldRefreshError(error));
    } finally {
      if (refreshRunRef.current === refreshRunId) {
        setRefreshLoading(false);
      }
    }
  };

  if (
    !resolvedForecast &&
    !productionPlan &&
    !harvestInfo &&
    !harvestLoading &&
    !forecastRequestLoading &&
    !canRefresh
  ) {
    return null;
  }

  const planValue = productionPlan?.planning_yield;
  const forecastValue = resolvedForecast?.harvest;
  const actualValue = getActualYield(harvestInfo);
  const forecastDescription = resolvedForecast?.description;
  const qualityParameters = Array.isArray(resolvedForecast?.quality_parameters)
    ? resolvedForecast.quality_parameters
    : [];
  const hasDetails = !!resolvedForecast || !!forecastDescription;

  return (
    <>
      <SectionCard
        title="Урожайность"
        rightSlot={
          <View style={styles.stageHeaderActions}>
            {hasDetails && (
              <Pressable
                onPress={() => setDetailsVisible(true)}
                hitSlop={8}
                style={({ pressed }) => [
                  styles.detailsButton,
                  pressed && styles.detailsButtonPressed,
                ]}
                accessibilityRole="button"
                accessibilityLabel="Обоснование прогноза урожайности"
              >
                <Ionicons
                  name="information-circle-outline"
                  size={16}
                  color={Colors.greenColor}
                />
                <Text style={styles.detailsButtonText}>Обоснование</Text>
              </Pressable>
            )}

            {canRefresh && (
              <Pressable
                onPress={() => {
                  setRefreshError(null);
                  setConfirmVisible(true);
                }}
                disabled={refreshLoading}
                hitSlop={8}
                style={({ pressed }) => [
                  styles.stageRefreshButton,
                  pressed && styles.detailsButtonPressed,
                ]}
                accessibilityRole="button"
                accessibilityLabel="Обновить урожайность"
              >
                {refreshLoading ? (
                  <ActivityIndicator size={15} color={Colors.greenColor} />
                ) : (
                  <Ionicons
                    name="refresh"
                    size={17}
                    color={Colors.greenColor}
                  />
                )}
              </Pressable>
            )}
          </View>
        }
      >
        <Text style={styles.sectionHint}>Показатели в ц/га</Text>

        <View style={styles.metricRow}>
          <MetricTile
            label="План"
            value={formatYield(planValue)}
          />
          <MetricTile
            label="Прогноз"
            value={
              loading || forecastRequestLoading || refreshLoading
                ? "..."
                : formatYield(forecastValue)
            }
            accent={forecastValue != null ? "success" : "default"}
          />
          <MetricTile
            label="Факт"
            value={
              harvestLoading
                ? "..."
                : formatYield(actualValue)
            }
            accent={actualValue != null ? "success" : "default"}
          />
        </View>

        {!!refreshError && (
          <Text style={styles.stageRefreshError}>{refreshError}</Text>
        )}
      </SectionCard>

      <Modal
        visible={confirmVisible}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => {
          if (!refreshLoading) setConfirmVisible(false);
        }}
      >
        <View style={styles.stageConfirmOverlay}>
          <Pressable
            style={StyleSheet.absoluteFillObject}
            onPress={() => {
              if (!refreshLoading) setConfirmVisible(false);
            }}
          />

          <View style={styles.stageConfirmCard}>
            <View style={styles.stageConfirmIcon}>
              <Ionicons
                name="refresh"
                size={22}
                color={Colors.greenColor}
              />
            </View>
            <Text style={styles.stageConfirmTitle}>
              Обновить оценку урожайности?
            </Text>
            <Text style={styles.stageConfirmText}>
              Актуальный прогноз будет загружен для выбранного поля.
            </Text>

            {!!refreshError && (
              <Text style={styles.stageConfirmError}>{refreshError}</Text>
            )}

            <View style={styles.stageConfirmActions}>
              <Pressable
                onPress={() => setConfirmVisible(false)}
                disabled={refreshLoading}
                style={({ pressed }) => [
                  styles.stageConfirmCancel,
                  pressed && styles.detailsButtonPressed,
                ]}
                accessibilityRole="button"
              >
                <Text style={styles.stageConfirmCancelText}>Отмена</Text>
              </Pressable>

              <Pressable
                onPress={handleRefreshYield}
                disabled={refreshLoading}
                style={({ pressed }) => [
                  styles.stageConfirmSubmit,
                  pressed && styles.detailsButtonPressed,
                  refreshLoading && styles.stageConfirmSubmitDisabled,
                ]}
                accessibilityRole="button"
              >
                {refreshLoading && (
                  <ActivityIndicator size={15} color={Colors.white} />
                )}
                <Text style={styles.stageConfirmSubmitText}>
                  {refreshLoading ? "Обновляем..." : "Обновить"}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={detailsVisible}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setDetailsVisible(false)}
      >
        <View style={styles.stageModalOverlay}>
          <Pressable
            style={StyleSheet.absoluteFillObject}
            onPress={() => setDetailsVisible(false)}
          />

          <View style={styles.stageModalCard}>
            <View style={styles.stageModalHeader}>
              <View style={styles.stageModalTitleRow}>
                <View style={styles.stageModalIcon}>
                  <Ionicons
                    name="trending-up-outline"
                    size={19}
                    color={Colors.greenColor}
                  />
                </View>
                <Text style={styles.stageModalTitle}>
                  Прогноз урожайности
                </Text>
              </View>

              <Pressable
                onPress={() => setDetailsVisible(false)}
                hitSlop={10}
                style={({ pressed }) => [
                  styles.stageModalClose,
                  pressed && styles.detailsButtonPressed,
                ]}
                accessibilityRole="button"
                accessibilityLabel="Закрыть"
              >
                <Ionicons name="close" size={22} color={Colors.grey700} />
              </Pressable>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.stageModalContent}
            >
              <Text style={styles.yieldForecastDate}>
                Прогноз от {formatLongDate(resolvedForecast?.forecast_date)}
              </Text>

              <View style={styles.yieldForecastHero}>
                <Text style={styles.stageForecastLabel}>Урожайность</Text>
                <Text style={styles.yieldForecastValue}>
                  {formatYield(forecastValue)} ц/га
                </Text>
                <View style={styles.yieldHarvestDateRow}>
                  <Ionicons
                    name="calendar-outline"
                    size={15}
                    color={Colors.grey500}
                  />
                  <Text style={styles.yieldHarvestDate}>
                    Уборка: {formatLongDate(resolvedForecast?.harvest_date)}
                  </Text>
                </View>
              </View>

              {qualityParameters.length > 0 && (
                <View style={styles.yieldQualityList}>
                  {qualityParameters.map((item: any, index: number) => (
                    <View
                      key={`${item?.name ?? "quality"}-${index}`}
                      style={styles.yieldQualityChip}
                    >
                      <Text style={styles.yieldQualityChipText}>
                        {item?.name} {item?.value}
                        {item?.UnitName ?? item?.unit_name ?? ""}
                      </Text>
                    </View>
                  ))}
                </View>
              )}

              <View style={styles.stageDivider} />

              <View style={styles.stageInfoLabelRow}>
                <Ionicons
                  name="information-circle-outline"
                  size={17}
                  color={Colors.greenColor}
                />
                <Text style={styles.stageInfoLabel}>Обоснование</Text>
              </View>
              <Text style={styles.stageBodyText}>
                {forecastDescription || "Обоснование отсутствует."}
              </Text>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
};

const EconomicsBlock = ({ plan }: { plan?: ProductionPlanResponse | null }) => {
  if (!plan) return null;

  const economics = plan?.analytic?.economics;

  return (
    <SectionCard title="Экономика">
      <View style={styles.grid}>
        <InfoItem
          label="Плановая маржинальная рентабельность"
          value={formatPercent(economics?.marginal_profitability)}
          accent={
            economics?.marginal_profitability != null ? "success" : "default"
          }
        />

        <InfoItem
          label="Плановая чистая рентабельность"
          value={formatPercent(economics?.profitability)}
          accent={economics?.profitability != null ? "success" : "default"}
        />
      </View>
    </SectionCard>
  );
};

/* ---------------- MAIN COMPONENT ---------------- */

export default function MainFieldInfoComponent({
  currentSeasonFieldState,
  evaluation,
  harvestForecast,
  productionPlan,
  forecastLoading = false,
  onRefreshForecast,
  compact = false,
}: Props) {
  const events = currentSeasonFieldState?.events ?? [];
  const { getValidAccessToken } = useAuth();
  const { loadSeasonFieldHarvestInfo } = useSeasonActions();
  const [harvestInfo, setHarvestInfo] =
    useState<SeasonFieldHarvestInfoResponse | null>(null);
  const [harvestInfoLoading, setHarvestInfoLoading] = useState(false);

  const seedEvent = useMemo(() => {
    return events.find((el) => el.event_type?.id === 0);
  }, [events]);

  useEffect(() => {
    let active = true;
    const seasonFieldId = currentSeasonFieldState?.id;

    setHarvestInfo(null);

    if (!seasonFieldId) {
      setHarvestInfoLoading(false);
      return () => {
        active = false;
      };
    }

    setHarvestInfoLoading(true);

    const loadHarvestInfo = async () => {
      try {
        const accessToken = await getValidAccessToken();
        const result = await loadSeasonFieldHarvestInfo({
          accessToken,
          seasonFieldId,
        });

        if (active) setHarvestInfo(result);
      } catch (error) {
        console.error("loadSeasonFieldHarvestInfo error:", error);
        if (active) setHarvestInfo(null);
      } finally {
        if (active) setHarvestInfoLoading(false);
      }
    };

    loadHarvestInfo();

    return () => {
      active = false;
    };
  }, [
    currentSeasonFieldState?.id,
    getValidAccessToken,
    loadSeasonFieldHarvestInfo,
  ]);

  return (
    <View style={styles.container}>
      <MainInfoBlock
        currentSeasonFieldState={currentSeasonFieldState}
        compact={compact}
      />

      <GrowStageBlock
        currentSeasonFieldState={currentSeasonFieldState}
        evaluation={evaluation}
        seedEvent={seedEvent}
      />

      <HarvestForecastBlock
        currentSeasonFieldState={currentSeasonFieldState}
        forecast={harvestForecast}
        productionPlan={productionPlan}
        harvestInfo={harvestInfo}
        loading={forecastLoading}
        harvestLoading={harvestInfoLoading}
        onRefresh={onRefreshForecast}
      />

      <EconomicsBlock plan={productionPlan} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
    paddingBottom: 8,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E7ECF2",
    padding: 14,
  },

  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
    gap: 10,
  },

  title: {
    flex: 1,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "700",
    color: "#101828",
  },

  sectionHint: {
    fontSize: 11,
    lineHeight: 14,
    color: "#98A2B3",
    marginBottom: 10,
  },

  eyebrow: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.6,
    color: "#98A2B3",
    marginBottom: 6,
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    rowGap: 12,
    columnGap: 10,
  },

  infoItem: {
    width: "47%",
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#EEF2F6",
    flexDirection: "column",
    justifyContent: "space-between",
    minHeight: 68,
  },

  infoItemFull: {
    width: "100%",
  },

  infoLabel: {
    fontSize: 11,
    lineHeight: 14,
    color: "#98A2B3",
    marginBottom: 4,
  },

  infoValue: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "600",
    color: "#101828",
    marginTop: "auto",
  },

  infoValueSuccess: {
    color: "#167C3D",
  },

  chip: {
    alignSelf: "flex-start",
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
  },

  chipNeutral: {
    backgroundColor: "#F8FAFC",
    borderColor: "#D0D5DD",
  },

  chipSuccess: {
    backgroundColor: Colors.greenColor,
    borderColor: Colors.greenColor,
  },

  chipText: {
    fontSize: 11,
    fontWeight: "600",
  },

  chipTextNeutral: {
    color: "#344054",
  },

  chipTextSuccess: {
    color: "#FFFFFF",
  },

  metricRow: {
    flexDirection: "row",
    gap: 8,
  },

  stageTopRow: {
    flexDirection: "row",
    alignItems: "stretch",
    gap: 10,
  },

  stageInfoBlock: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "#F8FAFC",
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#EEF2F6",
    minHeight: 72,
  },

  detailsButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 10,
    backgroundColor: Colors.greenColorLight,
  },

  stageHeaderActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  stageRefreshButton: {
    width: 30,
    height: 30,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.greenColorLight,
  },

  detailsButtonPressed: {
    opacity: 0.65,
  },

  detailsButtonText: {
    color: Colors.greenColor,
    fontSize: 11,
    fontWeight: "600",
  },

  stageRefreshError: {
    marginTop: 10,
    color: Colors.error,
    fontSize: 11,
    lineHeight: 15,
  },

  stageConfirmOverlay: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    backgroundColor: "rgba(16, 24, 40, 0.45)",
  },

  stageConfirmCard: {
    width: "100%",
    maxWidth: 380,
    alignItems: "center",
    padding: 20,
    borderRadius: 20,
    backgroundColor: Colors.white,
  },

  stageConfirmIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    backgroundColor: Colors.greenColorLight,
  },

  stageConfirmTitle: {
    color: Colors.grey900,
    fontSize: 17,
    lineHeight: 22,
    fontWeight: "700",
    textAlign: "center",
  },

  stageConfirmText: {
    marginTop: 7,
    color: Colors.grey600,
    fontSize: 13,
    lineHeight: 18,
    textAlign: "center",
  },

  stageConfirmError: {
    marginTop: 10,
    color: Colors.error,
    fontSize: 12,
    lineHeight: 17,
    textAlign: "center",
  },

  stageConfirmActions: {
    width: "100%",
    flexDirection: "row",
    gap: 10,
    marginTop: 18,
  },

  stageConfirmCancel: {
    flex: 1,
    minHeight: 42,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.grey300,
    backgroundColor: Colors.white,
  },

  stageConfirmCancelText: {
    color: Colors.grey700,
    fontSize: 13,
    fontWeight: "600",
  },

  stageConfirmSubmit: {
    flex: 1,
    minHeight: 42,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    borderRadius: 12,
    backgroundColor: Colors.greenColor,
  },

  stageConfirmSubmitDisabled: {
    opacity: 0.72,
  },

  stageConfirmSubmitText: {
    color: Colors.white,
    fontSize: 13,
    fontWeight: "700",
  },

  stageModalOverlay: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingVertical: 44,
    backgroundColor: "rgba(16, 24, 40, 0.45)",
  },

  stageModalCard: {
    maxHeight: "86%",
    borderRadius: 22,
    backgroundColor: Colors.white,
    overflow: "hidden",
  },

  stageModalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    paddingHorizontal: 18,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.grey200,
  },

  stageModalTitleRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  stageModalIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.greenColorLight,
  },

  stageModalTitle: {
    flex: 1,
    color: Colors.grey900,
    fontSize: 16,
    lineHeight: 21,
    fontWeight: "700",
  },

  stageModalClose: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.grey100,
  },

  stageModalContent: {
    padding: 18,
  },

  stageModalSectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 12,
  },

  stageModalEyebrow: {
    color: Colors.grey500,
    fontSize: 10,
    lineHeight: 14,
    fontWeight: "700",
    letterSpacing: 0.6,
  },

  stageJustificationCard: {
    padding: 13,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(11, 148, 68, 0.12)",
    backgroundColor: "rgba(11, 148, 68, 0.05)",
  },

  stageInfoLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  stageInfoLabel: {
    color: Colors.grey600,
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "600",
  },

  stageBodyText: {
    marginTop: 8,
    color: Colors.grey800,
    fontSize: 13,
    lineHeight: 19,
  },

  stageDivider: {
    height: StyleSheet.hairlineWidth,
    marginVertical: 18,
    backgroundColor: Colors.grey200,
  },

  nextStageName: {
    marginTop: 5,
    marginBottom: 12,
    color: "#167C3D",
    fontSize: 18,
    lineHeight: 24,
    fontWeight: "700",
  },

  stageForecastGrid: {
    gap: 9,
  },

  stageForecastItem: {
    padding: 12,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: Colors.grey200,
    backgroundColor: Colors.grey50,
  },

  stageForecastLabel: {
    color: Colors.grey500,
    fontSize: 11,
    lineHeight: 15,
  },

  stageForecastValue: {
    marginTop: 5,
    color: Colors.grey900,
    fontSize: 14,
    lineHeight: 19,
    fontWeight: "600",
  },

  stageProgressTrack: {
    height: 6,
    marginTop: 10,
    borderRadius: 3,
    backgroundColor: Colors.grey200,
    overflow: "hidden",
  },

  stageProgressFill: {
    height: "100%",
    borderRadius: 3,
    backgroundColor: Colors.greenColor,
  },

  nextStageJustificationCard: {
    marginTop: 12,
    padding: 13,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(183, 121, 31, 0.16)",
    backgroundColor: "rgba(251, 192, 45, 0.07)",
  },

  stageModalFootnote: {
    marginTop: 18,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.grey200,
    color: Colors.grey500,
    fontSize: 11,
    textAlign: "center",
  },

  yieldForecastDate: {
    color: Colors.grey500,
    fontSize: 11,
    lineHeight: 15,
    marginBottom: 12,
  },

  yieldForecastHero: {
    padding: 14,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "rgba(11, 148, 68, 0.14)",
    backgroundColor: "rgba(11, 148, 68, 0.05)",
  },

  yieldForecastValue: {
    marginTop: 4,
    color: Colors.greenColor,
    fontSize: 22,
    lineHeight: 28,
    fontWeight: "700",
  },

  yieldHarvestDateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 10,
  },

  yieldHarvestDate: {
    color: Colors.grey600,
    fontSize: 12,
    lineHeight: 16,
  },

  yieldQualityList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 7,
    marginTop: 12,
  },

  yieldQualityChip: {
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.grey300,
    backgroundColor: Colors.white,
  },

  yieldQualityChipText: {
    color: Colors.grey600,
    fontSize: 11,
    lineHeight: 14,
  },

  metricTile: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: "#EEF2F6",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 72,
  },

  metricLabel: {
    fontSize: 11,
    lineHeight: 14,
    color: "#98A2B3",
    marginBottom: 6,
    textAlign: "center",
  },

  metricValue: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: "700",
    color: "#101828",
    textAlign: "center",
  },

  metricValueSuccess: {
    color: "#167C3D",
  },

  metricHint: {
    marginTop: 4,
    fontSize: 10,
    lineHeight: 13,
    color: "#98A2B3",
    textAlign: "center",
  },

  refreshButton: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 10,
    backgroundColor: "#F5F7FA",
    borderWidth: 1,
    borderColor: "#E4E7EC",
  },

  refreshButtonPressed: {
    opacity: 0.7,
  },

  refreshButtonText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#344054",
  },
});
