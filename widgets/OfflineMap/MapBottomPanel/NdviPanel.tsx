import React, { useMemo, useState } from "react";
import { Pressable, View, Text, StyleSheet } from "react-native";
import Colors from "../../../shared/styles/Colors";
import { NdviDatePickerModal } from "./NdviDatePickerModal/NdviDatePickerModal";
import { NdviDateSelector } from "./NdviDateSelector/NdviDateSelector";
import { NdviPanelProps } from "../../../src/types/map.types";
import {
  formatDate,
  formatNdvi,
  getNdviStatus,
  getStatusStyles,
} from "../../../src/utils/ndviUtils";
import { NdviCompactBarChart } from "./NdviReadableBarChart/NdviReadableBarChart";
import { FieldNdviPreview } from "../MapComponents/FieldNdviPreview";
import MapEmptyState from "../MapEmptyState";
import { SeasonSelector } from "./SeasonSelector/SeasonSelector";
import { SeasonPickerModal } from "./SeasonSelector/SeasonPickerModal";
import { SelectedFieldHeader } from "./SelectedFieldHeader";

const getNdviTone = (value?: number | null) => {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return {
      backgroundColor: "rgba(148, 163, 184, 0.12)",
      color: "#475569",
      label: "Нет данных",
    };
  }

  if (value < 0.1) {
    return {
      backgroundColor: "rgba(19, 43, 11, 0.14)",
      color: "#132b0b",
      label: "Очень низкий",
    };
  }

  if (value < 0.3) {
    return {
      backgroundColor: "rgba(69, 129, 0, 0.14)",
      color: "#458100",
      label: "Низкий",
    };
  }

  if (value < 0.5) {
    return {
      backgroundColor: "rgba(115, 160, 0, 0.14)",
      color: "#73a000",
      label: "Умеренный",
    };
  }

  if (value < 0.7) {
    return {
      backgroundColor: "rgba(208, 223, 0, 0.18)",
      color: "#7a8400",
      label: "Хороший",
    };
  }

  return {
    backgroundColor: "rgba(253, 254, 111, 0.22)",
    color: "#8b6b00",
    label: "Высокий",
  };
};

const formatDelta = (value?: number | null) => {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  const rounded = value.toFixed(2);
  return value > 0 ? `+${rounded}` : rounded;
};

const getDeltaTone = (value?: number | null) => {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return {
      color: Colors.grey700,
      backgroundColor: "#EEF2F6",
      label: "Нет данных",
    };
  }

  if (value > 0.03) {
    return {
      color: "#166534",
      backgroundColor: "#DCFCE7",
      label: "Рост",
    };
  }

  if (value < -0.03) {
    return {
      color: "#991B1B",
      backgroundColor: "#FEE2E2",
      label: "Снижение",
    };
  }

  return {
    color: "#92400E",
    backgroundColor: "#FEF3C7",
    label: "Стабильно",
  };
};

const SummaryTile = ({
  label,
  value,
  hint,
  valueColor,
  badgeText,
  badgeBackgroundColor,
  badgeColor,
}: {
  label: string;
  value: string;
  hint?: string;
  valueColor?: string;
  badgeText?: string;
  badgeBackgroundColor?: string;
  badgeColor?: string;
}) => {
  return (
    <View style={styles.summaryTile}>
      <View style={styles.summaryHeader}>
        <Text style={styles.summaryLabel}>{label}</Text>

        {!!badgeText && (
          <View
            style={[
              styles.summaryBadge,
              { backgroundColor: badgeBackgroundColor || "#EEF2F6" },
            ]}
          >
            <Text
              style={[
                styles.summaryBadgeText,
                { color: badgeColor || Colors.grey700 },
              ]}
            >
              {badgeText}
            </Text>
          </View>
        )}
      </View>

      <Text
        style={[styles.summaryValue, valueColor ? { color: valueColor } : null]}
      >
        {value}
      </Text>

      {!!hint && <Text style={styles.summaryHint}>{hint}</Text>}
    </View>
  );
};

export const NdviPanel: React.FC<NdviPanelProps> = ({
  dates,
  selectedDate,
  seasons = [],
  selectedSeason,
  selectedField,
  sessionId,
  currentSeasonFieldNdvi = [],
  onSelectImageDate,
  onSeasonChange,
  collapsePanel,
}) => {
  const [dateModalVisible, setDateModalVisible] = useState(false);
  const [seasonModalVisible, setSeasonModalVisible] = useState(false);
  const [historyExpanded, setHistoryExpanded] = useState(false);

  const history = useMemo(() => {
    return [...currentSeasonFieldNdvi]
      .filter((item) => item?.image_date)
      .sort(
        (a, b) =>
          new Date(a.image_date || "").getTime() -
          new Date(b.image_date || "").getTime(),
      );
  }, [currentSeasonFieldNdvi]);

  const firstNdvi = history.length ? history[0] : null;
  const lastNdvi = history.length ? history[history.length - 1] : null;
  const selectedNdvi = useMemo(() => {
    if (!selectedDate) {
      return lastNdvi;
    }

    const selectedDay = selectedDate.slice(0, 10);

    return (
      history.find((item) => item.image_date?.slice(0, 10) === selectedDay) ??
      null
    );
  }, [history, lastNdvi, selectedDate]);

  const ndviStatus = getNdviStatus(selectedNdvi?.avg);
  const ndviStatusStyles = getStatusStyles(ndviStatus.tone);

  const delta = useMemo(() => {
    if (
      firstNdvi?.avg === null ||
      firstNdvi?.avg === undefined ||
      lastNdvi?.avg === null ||
      lastNdvi?.avg === undefined
    ) {
      return null;
    }

    return Number(lastNdvi.avg) - Number(firstNdvi.avg);
  }, [firstNdvi, lastNdvi]);

  const deltaTone = getDeltaTone(delta);

  const minAvg = useMemo(() => {
    const values = history
      .map((item) => item?.avg)
      .filter(
        (v): v is number =>
          v !== null && v !== undefined && !Number.isNaN(Number(v)),
      )
      .map(Number);

    if (!values.length) return null;
    return Math.min(...values);
  }, [history]);

  const maxAvg = useMemo(() => {
    const values = history
      .map((item) => item?.avg)
      .filter(
        (v): v is number =>
          v !== null && v !== undefined && !Number.isNaN(Number(v)),
      )
      .map(Number);

    if (!values.length) return null;
    return Math.max(...values);
  }, [history]);

  const cloudCoverageText =
    selectedNdvi?.cloud_coverage !== null &&
    selectedNdvi?.cloud_coverage !== undefined
      ? `${selectedNdvi.cloud_coverage}%`
      : "—";

  const recentHistory = useMemo(() => {
    return [...history].reverse();
  }, [history]);
  const visibleHistory = historyExpanded
    ? recentHistory
    : recentHistory.slice(0, 5);

  const handleSelectDate = async (date: string | null) => {
    await onSelectImageDate(date);
  };

  return (
    <View style={styles.container}>
      {!!onSeasonChange && (
        <>
          <SeasonSelector
            selectedSeason={selectedSeason ?? null}
            onPress={() => setSeasonModalVisible(true)}
          />
          <SeasonPickerModal
            visible={seasonModalVisible}
            seasons={seasons}
            selectedSeason={selectedSeason ?? null}
            onClose={() => setSeasonModalVisible(false)}
            onSelect={onSeasonChange}
          />
        </>
      )}

      <View style={styles.selectorWrap}>
        <NdviDateSelector
          selectedDate={selectedDate}
          onPress={() => setDateModalVisible(true)}
          onSelectImageDate={handleSelectDate}
        />
      </View>

      {!selectedDate && (
        <MapEmptyState
          icon={dates.length > 0 ? "calendar-search" : "image-off-outline"}
          title={
            dates.length > 0 ? "Выберите дату снимка" : "Нет доступных снимков"
          }
          description={
            dates.length > 0
              ? "Выберите дату, чтобы отобразить снимок и данные NDVI."
              : "Для текущего сезона пока нет спутниковых снимков."
          }
        />
      )}

      {!!selectedDate && !selectedField && (
        <MapEmptyState
          icon="map-marker-radius-outline"
          title="Выберите поле"
          description="Панель свернётся, чтобы было удобно выбрать контур на карте."
          actionLabel="Выбрать на карте"
          onAction={collapsePanel}
        />
      )}

      {selectedField && selectedDate && (
        <View style={styles.content}>
          {!!collapsePanel && (
            <SelectedFieldHeader
              field={selectedField}
              onChange={collapsePanel}
            />
          )}

          <FieldNdviPreview
            field={selectedField}
            sessionId={sessionId}
            selectedDate={selectedDate}
          />

          {history.length > 0 ? (
            <>
              <View style={styles.card}>
                <View style={styles.topRow}>
                  <View style={styles.valueBlock}>
                    <Text style={styles.overline}>Текущий NDVI</Text>
                    <Text style={styles.mainValue}>
                      {formatNdvi(selectedNdvi?.avg)}
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: ndviStatusStyles.backgroundColor },
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        { color: ndviStatusStyles.color },
                      ]}
                    >
                      {ndviStatus.label}
                    </Text>
                  </View>
                </View>

                <View style={styles.metricsRow}>
                  <View style={styles.metricCard}>
                    <Text style={styles.metricLabel}>Дата снимка</Text>
                    <Text style={styles.metricValue}>
                      {formatDate(selectedNdvi?.image_date ?? selectedDate)}
                    </Text>
                  </View>

                  <View style={styles.metricCard}>
                    <Text style={styles.metricLabel}>Облачность</Text>
                    {cloudCoverageText !== "—" ? (
                      <View style={styles.cloudBadge}>
                        <Text style={styles.cloudBadgeText}>
                          {cloudCoverageText}
                        </Text>
                      </View>
                    ) : (
                      <Text style={styles.metricValue}>—</Text>
                    )}
                  </View>
                </View>
              </View>

              <View style={styles.card}>
                <View style={styles.sectionHeader}>
                  <View>
                    <Text style={styles.sectionTitle}>Динамика NDVI</Text>
                    <Text style={styles.sectionSubtitle}>
                      Изменение состояния поля по доступным датам
                    </Text>
                  </View>
                </View>

                <View style={styles.summaryGrid}>
                  <SummaryTile
                    label="Δ NDVI"
                    value={formatDelta(delta)}
                    hint="за весь период"
                    valueColor={deltaTone.color}
                    badgeText={deltaTone.label}
                    badgeBackgroundColor={deltaTone.backgroundColor}
                    badgeColor={deltaTone.color}
                  />

                  <SummaryTile
                    label="Снимков"
                    value={String(history.length)}
                    hint="доступно дат"
                  />

                  <SummaryTile
                    label="Минимум"
                    value={minAvg !== null ? minAvg.toFixed(2) : "—"}
                    hint="средний NDVI"
                  />

                  <SummaryTile
                    label="Максимум"
                    value={maxAvg !== null ? maxAvg.toFixed(2) : "—"}
                    hint="средний NDVI"
                  />
                </View>

                <NdviCompactBarChart data={history} />
              </View>

              <View style={styles.card}>
                <View style={styles.sectionHeader}>
                  <View>
                    <Text style={styles.sectionTitle}>Последние снимки</Text>
                  </View>
                </View>

                <View style={styles.historyList}>
                  {visibleHistory.map((item, index) => {
                    const tone = getNdviTone(item?.avg);

                    return (
                      <View
                        key={`${item.image_date}-${index}`}
                        style={styles.historyRow}
                      >
                        <View style={styles.historyMain}>
                          <Text style={styles.historyDate}>
                            {formatDate(item.image_date)}
                          </Text>
                          <Text style={styles.historyMeta}>
                            Облачность:{" "}
                            {item.cloud_coverage !== null &&
                            item.cloud_coverage !== undefined
                              ? `${item.cloud_coverage}%`
                              : "—"}
                          </Text>
                        </View>

                        <View style={styles.historyRight}>
                          <Text
                            style={[styles.historyValue, { color: tone.color }]}
                          >
                            {item.avg !== null && item.avg !== undefined
                              ? Number(item.avg).toFixed(2)
                              : "—"}
                          </Text>

                          <View
                            style={[
                              styles.historyStatusBadge,
                              { backgroundColor: tone.backgroundColor },
                            ]}
                          >
                            <Text
                              style={[
                                styles.historyStatusText,
                                { color: tone.color },
                              ]}
                            >
                              {tone.label}
                            </Text>
                          </View>
                        </View>
                      </View>
                    );
                  })}
                </View>

                {recentHistory.length > 5 && (
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => setHistoryExpanded((previous) => !previous)}
                    style={({ pressed }) => [
                      styles.historyToggle,
                      pressed && styles.historyTogglePressed,
                    ]}
                  >
                    <Text style={styles.historyToggleText}>
                      {historyExpanded
                        ? "Показать меньше"
                        : `Показать все · ${recentHistory.length}`}
                    </Text>
                  </Pressable>
                )}
              </View>
            </>
          ) : (
            <MapEmptyState
              icon="image-off-outline"
              title="Нет данных NDVI"
              description="Для выбранного поля и даты показатели пока недоступны."
            />
          )}
        </View>
      )}

      <NdviDatePickerModal
        visible={dateModalVisible}
        dates={dates}
        selectedDate={selectedDate}
        onClose={() => setDateModalVisible(false)}
        onSelect={async (date) => {
          await handleSelectDate(date);
          setDateModalVisible(false);
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },

  content: {
    gap: 12,
    paddingBottom: 24,
  },

  selectorWrap: {
    marginTop: 2,
    marginBottom: 2,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E7ECF2",
  },

  topRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 16,
    gap: 12,
  },

  valueBlock: {
    flex: 1,
  },

  overline: {
    fontSize: 12,
    lineHeight: 16,
    color: Colors.grey500,
    marginBottom: 6,
  },

  mainValue: {
    fontSize: 32,
    lineHeight: 36,
    fontWeight: "700",
    color: Colors.grey800,
    letterSpacing: -0.4,
  },

  statusBadge: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
    alignSelf: "flex-start",
  },

  statusText: {
    fontSize: 12,
    lineHeight: 14,
    fontWeight: "700",
  },

  metricsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 2,
  },

  metricCard: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E8EDF3",
    minHeight: 72,
    justifyContent: "space-between",
  },

  metricLabel: {
    fontSize: 11,
    lineHeight: 14,
    color: Colors.grey500,
    marginBottom: 8,
  },

  metricValue: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "600",
    color: Colors.grey800,
  },

  cloudBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: "#EEF2F6",
  },

  cloudBadgeText: {
    fontSize: 12,
    lineHeight: 14,
    fontWeight: "700",
    color: Colors.grey700,
  },

  sectionHeader: {
    marginBottom: 14,
  },

  sectionTitle: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: "700",
    color: Colors.grey800,
    marginBottom: 4,
  },

  sectionSubtitle: {
    fontSize: 12,
    lineHeight: 16,
    color: Colors.grey500,
  },

  summaryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 16,
  },

  summaryTile: {
    width: "48%",
    backgroundColor: "#F8FAFC",
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E8EDF3",
    minHeight: 92,
  },

  summaryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 8,
    marginBottom: 8,
  },

  summaryLabel: {
    flex: 1,
    fontSize: 11,
    lineHeight: 14,
    color: Colors.grey500,
  },

  summaryValue: {
    fontSize: 20,
    lineHeight: 24,
    fontWeight: "700",
    color: Colors.grey800,
    marginBottom: 6,
  },

  summaryHint: {
    fontSize: 12,
    lineHeight: 16,
    color: Colors.grey600,
  },

  summaryBadge: {
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },

  summaryBadgeText: {
    fontSize: 10,
    lineHeight: 12,
    fontWeight: "700",
  },

  historyList: {
    gap: 10,
  },

  historyRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#E8EDF3",
    borderRadius: 14,
    padding: 12,
    backgroundColor: "#F8FAFC",
    gap: 12,
  },

  historyMain: {
    flex: 1,
  },

  historyDate: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "700",
    color: Colors.grey800,
    marginBottom: 4,
  },

  historyMeta: {
    fontSize: 12,
    lineHeight: 16,
    color: Colors.grey500,
  },

  historyRight: {
    alignItems: "flex-end",
    gap: 6,
  },

  historyValue: {
    fontSize: 16,
    lineHeight: 20,
    fontWeight: "700",
  },

  historyStatusBadge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },

  historyStatusText: {
    fontSize: 11,
    lineHeight: 13,
    fontWeight: "700",
  },
  historyToggle: {
    minHeight: 44,
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#DDE2DF",
    borderRadius: 12,
    backgroundColor: "#F7F8F7",
    alignItems: "center",
    justifyContent: "center",
  },
  historyTogglePressed: {
    opacity: 0.7,
  },
  historyToggleText: {
    color: Colors.grey800,
    fontSize: 13,
    fontWeight: "700",
  },
});
