import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Text } from "@ui-kitten/components";
import React, { memo, useContext, useMemo, useState } from "react";
import { Modal, Pressable, ScrollView, View } from "react-native";
import { SafeAreaInsetsContext } from "react-native-safe-area-context";

import {
  buildShiftTimelineModel,
  type ShiftTimelineEntry,
  type ShiftTimelineSegment,
  type ShiftTimelineSegmentKind,
} from "./ShiftTimeline.helpers";
import { styles } from "./styles";

type Props = {
  entries: ShiftTimelineEntry[];
  shiftType?: any;
  shiftSettings?: any;
};

const TIMELINE_COLORS: Record<ShiftTimelineSegmentKind, string> = {
  work: "#22C55E",
  move: "#00B8D9",
  gap: "#98A2B3",
  extend: "#2E90FA",
};

const LEGEND_LABELS: Record<ShiftTimelineSegmentKind, string> = {
  work: "Выработка",
  move: "Перегон",
  gap: "Простой",
  extend: "Продление",
};

function ShiftTimelineComponent({
  entries,
  shiftType,
  shiftSettings,
}: Props) {
  const [visible, setVisible] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const insets = useContext(SafeAreaInsetsContext);
  const model = useMemo(
    () => buildShiftTimelineModel(entries, shiftType, shiftSettings),
    [entries, shiftSettings, shiftType],
  );

  if (!model) return null;

  const selectedSegment =
    model.segments.find((segment) => segment.id === selectedId) ?? null;
  const selectedIndex = selectedSegment
    ? model.segments.findIndex(
        (segment) => segment.id === selectedSegment.id,
      )
    : -1;
  const legendKinds = (
    ["work", "move", "gap", "extend"] as ShiftTimelineSegmentKind[]
  ).filter((kind) => model.segments.some((segment) => segment.kind === kind));
  const selectAdjacentSegment = (offset: number) => {
    if (!model.segments.length) return;

    const currentIndex = selectedIndex >= 0 ? selectedIndex : 0;
    const nextIndex =
      (currentIndex + offset + model.segments.length) %
      model.segments.length;

    setSelectedId(model.segments[nextIndex].id);
  };

  const renderSegment = (segment: ShiftTimelineSegment) => {
    const left = `${segment.leftPct}%` as `${number}%`;
    const width = `${Math.max(segment.widthPct, 1.5)}%` as `${number}%`;
    const selected = selectedSegment?.id === segment.id;

    return (
      <Pressable
        key={segment.id}
        accessibilityRole="button"
        accessibilityLabel={`${segment.label}: ${segment.timeRange}, ${segment.durationLabel}`}
        hitSlop={5}
        testID={`timeline-segment-touch-${segment.id}`}
        style={[
          styles.timelineSegmentTouch,
          { left, width },
          segment.kind === "move" &&
            styles.timelineMoveSegmentTouch,
          segment.kind === "extend" &&
            styles.timelineExtendSegmentTouch,
          selected && styles.timelineSegmentSelected,
        ]}
        onPress={() => setSelectedId(segment.id)}
      >
        <View
          testID={`timeline-segment-bar-${segment.id}`}
          style={[
            styles.timelineSegment,
            segment.kind === "work" && styles.timelineWorkSegment,
            segment.kind === "move" && styles.timelineMoveSegment,
            segment.kind === "gap" && styles.timelineGapSegment,
            segment.kind === "extend" && styles.timelineExtendSegment,
          ]}
        />
      </Pressable>
    );
  };

  return (
    <View style={styles.timelineWrap}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Открыть хронологию смены"
        style={styles.timelineToggle}
        onPress={() => {
          setSelectedId((current) => current ?? model.segments[0]?.id ?? null);
          setVisible(true);
        }}
      >
        <MaterialCommunityIcons
          name="chart-timeline-variant"
          size={18}
          color="#475467"
        />
        <Text style={styles.timelineToggleText}>Хронология</Text>
        <Ionicons
          name="chevron-forward"
          size={17}
          color="#667085"
        />
      </Pressable>

      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={() => setVisible(false)}
      >
        <View style={styles.timelineModalOverlay}>
          <Pressable
            accessibilityLabel="Закрыть хронологию"
            style={styles.timelineModalBackdrop}
            onPress={() => setVisible(false)}
          />

          <View
            style={[
              styles.timelineModalSheet,
              {
                paddingBottom: Math.max(
                  16,
                  (insets?.bottom ?? 0) + 16,
                ),
              },
            ]}
          >
            <View style={styles.detailsHandle} />

            <View style={styles.timelineModalHeader}>
              <View style={styles.timelineModalIcon}>
                <MaterialCommunityIcons
                  name="chart-timeline-variant"
                  size={21}
                  color="#067647"
                />
              </View>
              <Text style={styles.timelineModalTitle}>
                Хронология смены
              </Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Закрыть хронологию смены"
                style={styles.detailsCloseButton}
                onPress={() => setVisible(false)}
              >
                <Ionicons name="close" size={20} color="#667085" />
              </Pressable>
            </View>

            <ScrollView
              contentContainerStyle={styles.timelineModalContent}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.timelineCard}>
                <View style={styles.timelineSummaryRow}>
                  <Text style={styles.timelineRange}>
                    {model.startLabel} – {model.endLabel}
                  </Text>
                  <Text style={styles.timelineTotal}>
                    {model.totalDurationLabel}
                  </Text>
                </View>

                <View style={styles.timelineAxis}>
                  {model.ticks.map((tick) => (
                    <View
                      key={`${tick.label}-${tick.leftPct}`}
                      style={[
                        styles.timelineTick,
                        {
                          left: `${tick.leftPct}%` as `${number}%`,
                        },
                      ]}
                    >
                      <View style={styles.timelineTickLine} />
                      <Text style={styles.timelineTickText}>
                        {tick.label}
                      </Text>
                    </View>
                  ))}
                  <View style={styles.timelineBaseLine} />
                  {model.segments.map(renderSegment)}
                  {model.breakInterval && (
                    <>
                      <View
                        accessible
                        accessibilityLabel={`Перерыв: ${model.breakInterval.timeRange}, ${model.breakInterval.durationLabel}`}
                        pointerEvents="none"
                        style={[
                          styles.timelineBreakInterval,
                          {
                            left: `${model.breakInterval.leftPct}%` as `${number}%`,
                            width: `${model.breakInterval.widthPct}%` as `${number}%`,
                          },
                        ]}
                      />
                      <View
                        pointerEvents="none"
                        style={[
                          styles.timelineBreakBadgeAnchor,
                          {
                            left: `${
                              model.breakInterval.leftPct +
                              model.breakInterval.widthPct / 2
                            }%` as `${number}%`,
                          },
                        ]}
                      >
                        <View style={styles.timelineBreakBadge}>
                          <View style={styles.timelineBreakBadgeDot} />
                          <Text style={styles.timelineBreakBadgeText}>
                            Перерыв
                          </Text>
                        </View>
                      </View>
                    </>
                  )}
                </View>

                <View style={styles.timelineLegend}>
                  {legendKinds.map((kind) => (
                    <View key={kind} style={styles.timelineLegendItem}>
                      <View
                        style={[
                          styles.timelineLegendDot,
                          kind === "gap"
                            ? styles.timelineLegendGap
                            : kind === "extend"
                              ? styles.timelineLegendExtend
                              : kind === "move"
                                ? styles.timelineLegendMove
                                : styles.timelineLegendWork,
                        ]}
                      />
                      <Text style={styles.timelineLegendText}>
                        {LEGEND_LABELS[kind]}
                      </Text>
                    </View>
                  ))}
                  {model.breakInterval && (
                    <View style={styles.timelineLegendItem}>
                      <View style={styles.timelineLegendBreak} />
                      <Text style={styles.timelineLegendText}>Перерыв</Text>
                    </View>
                  )}
                </View>

                {(model.totalBreakLabel || model.totalExtendLabel) && (
                  <View style={styles.timelineTotals}>
                    {model.totalBreakLabel && (
                      <View style={styles.timelineBreakChip}>
                        <Text style={styles.timelineBreakText}>
                          Перерыв · {model.totalBreakLabel}
                        </Text>
                      </View>
                    )}
                    {model.totalExtendLabel && (
                      <View style={styles.timelineExtendChip}>
                        <Text style={styles.timelineExtendText}>
                          Продление · {model.totalExtendLabel}
                        </Text>
                      </View>
                    )}
                  </View>
                )}

                {selectedSegment && (
                  <View style={styles.timelineSelection}>
                    <View style={styles.timelineSelectionTop}>
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel="Предыдущий отрезок"
                        style={styles.timelineNavigatorButton}
                        onPress={() => selectAdjacentSegment(-1)}
                      >
                        <Ionicons
                          name="chevron-back"
                          size={19}
                          color="#067647"
                        />
                      </Pressable>

                      <View style={styles.timelineSelectionHeadingWrap}>
                        <Text style={styles.timelineSelectionCounter}>
                          Отрезок {selectedIndex + 1} из{" "}
                          {model.segments.length}
                        </Text>
                        <View style={styles.timelineSelectionHeading}>
                          <View
                            style={[
                              styles.timelineSelectionDot,
                              {
                                backgroundColor:
                                  TIMELINE_COLORS[selectedSegment.kind],
                              },
                            ]}
                          />
                          <Text style={styles.timelineSelectionTitle}>
                            {selectedSegment.label}
                          </Text>
                        </View>
                      </View>

                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel="Следующий отрезок"
                        style={styles.timelineNavigatorButton}
                        onPress={() => selectAdjacentSegment(1)}
                      >
                        <Ionicons
                          name="chevron-forward"
                          size={19}
                          color="#067647"
                        />
                      </Pressable>
                    </View>

                    <View style={styles.timelineSelectionDetails}>
                      <View style={styles.timelineSelectionTimeRow}>
                        <Ionicons
                          name="time-outline"
                          size={14}
                          color="#667085"
                        />
                        <Text style={styles.timelineSelectionMeta}>
                          {selectedSegment.timeRange}
                        </Text>
                        <View style={styles.timelineSelectionDuration}>
                          <Text style={styles.timelineSelectionDurationText}>
                            {selectedSegment.durationLabel}
                          </Text>
                        </View>
                      </View>
                      {!!selectedSegment.entryLabel && (
                        <Text style={styles.timelineSelectionMeta}>
                          {selectedSegment.entryLabel}
                        </Text>
                      )}
                      {!!selectedSegment.breakLabel && (
                        <Text style={styles.timelineSelectionBreak}>
                          Перерыв · {selectedSegment.breakLabel}
                        </Text>
                      )}
                    </View>
                  </View>
                )}
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

export const ShiftTimeline = memo(ShiftTimelineComponent);
