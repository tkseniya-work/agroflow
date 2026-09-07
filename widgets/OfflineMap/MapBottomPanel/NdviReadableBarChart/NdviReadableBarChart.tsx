import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Colors from "../../../../shared/styles/Colors";
import { formatShortDate, getNdviTone } from "../../../../src/utils/ndviUtils";
import { NativeViewGestureHandler, ScrollView } from "react-native-gesture-handler";

const CHART_HEIGHT = 176;
const LABELS_HEIGHT = 34;
const BAR_WIDTH = 34;
const BAR_GAP = 10;
const CHART_SIDE_PADDING = 10;
const FADE_WIDTH = 28;

type NdviChartItem = {
  image_date?: string;
  avg?: number | null;
};

type Props = {
  data: NdviChartItem[];
  title?: string;
  subtitle?: string;
};

export const NdviCompactBarChart: React.FC<Props> = ({
  data,
  title = "График NDVI",
  subtitle = "История состояния поля",
}) => {
  const scrollRef = useRef<ScrollView>(null);
  const nativeGestureRef = useRef(null);

  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [showLeftFade, setShowLeftFade] = useState(true);
  const [showRightFade, setShowRightFade] = useState(false);

  const visibleData = useMemo(() => {
    return data.filter(
      (item) =>
        item?.avg !== null &&
        item?.avg !== undefined &&
        !Number.isNaN(Number(item.avg)),
    );
  }, [data]);

  const yTicks = [1, 0.75, 0.5, 0.25, 0];

  useEffect(() => {
    const timeout = setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: false });
      setShowLeftFade(visibleData.length > 6);
      setShowRightFade(false);
    }, 0);

    return () => clearTimeout(timeout);
  }, [visibleData.length]);

  if (!visibleData.length) return null;

  const lastIndex = visibleData.length - 1;
  const currentIndex = activeIndex ?? lastIndex;
  const currentItem = visibleData[currentIndex];
  const currentValue = Number(currentItem?.avg ?? 0);
  const currentTone = getNdviTone(currentValue);

  const values = visibleData.map((i) => Number(i.avg));
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const chartContentWidth =
    visibleData.length * BAR_WIDTH +
    Math.max(0, visibleData.length - 1) * BAR_GAP +
    CHART_SIDE_PADDING * 2;

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { contentOffset, layoutMeasurement, contentSize } = e.nativeEvent;

    const atStart = contentOffset.x <= 8;
    const atEnd =
      contentOffset.x + layoutMeasurement.width >= contentSize.width - 8;

    setShowLeftFade(!atStart);
    setShowRightFade(!atEnd);
  };

  return (
    <View style={styles.chartCard}>
      <View style={styles.chartHeaderRow}>
        <View style={styles.chartHeaderContent}>
          <Text style={styles.chartTitle}>{title}</Text>
          <Text style={styles.chartHint}>{subtitle}</Text>
        </View>

        <View
          style={[
            styles.chartCurrentBadge,
            { backgroundColor: currentTone.backgroundColor },
          ]}
        >
          <Text
            style={[styles.chartCurrentBadgeText, { color: currentTone.color }]}
          >
            {currentValue.toFixed(2)}
          </Text>
        </View>
      </View>

      {visibleData.length > 6 && (
        <View style={styles.scrollHintRow}>
          <Text style={styles.scrollHint}>← История</Text>
        </View>
      )}

      <View style={styles.chartContainer}>
        <NativeViewGestureHandler
          ref={nativeGestureRef}
          disallowInterruption={true}
        >
          <ScrollView
            ref={scrollRef}
            horizontal
            nestedScrollEnabled
            directionalLockEnabled
            showsHorizontalScrollIndicator={false}
            style={styles.scroll}
            contentContainerStyle={[
              styles.scrollContent,
              { minWidth: chartContentWidth },
            ]}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            decelerationRate="fast"
            bounces={false}
            keyboardShouldPersistTaps="handled"
            simultaneousHandlers={nativeGestureRef}
            waitFor={nativeGestureRef}
          >
            <View style={[styles.chartPlotWrap, { width: chartContentWidth }]}>
              <View style={styles.chartArea}>
                {yTicks.map((tick) => {
                  const bottom = tick * CHART_HEIGHT;

                  return (
                    <View
                      key={`grid-${tick}`}
                      style={[styles.chartGridLineWrap, { bottom }]}
                      pointerEvents="none"
                    >
                      <View style={styles.chartGridLine} />
                    </View>
                  );
                })}

                <View style={styles.chartBarsRow}>
                  {visibleData.map((item, index) => {
                    const value = Number(item.avg);
                    const normalized = (value - min) / range;

                    const barHeight = Math.max(
                      12,
                      normalized * (CHART_HEIGHT - 14),
                    );

                    const tone = getNdviTone(value);
                    const isLast = index === lastIndex;
                    const isActive = currentIndex === index;

                    return (
                      <Pressable
                        key={`${item.image_date}-${index}`}
                        style={styles.chartBarItem}
                        onPress={() => setActiveIndex(index)}
                        hitSlop={6}
                      >
                        <Text
                          style={[
                            styles.chartBarValue,
                            { color: isActive ? tone.color : Colors.grey500 },
                            isActive && styles.chartBarValueActive,
                          ]}
                          numberOfLines={1}
                        >
                          {value.toFixed(2)}
                        </Text>

                        <View
                          style={[
                            styles.chartBarTrack,
                            isActive && styles.chartBarTrackActive,
                          ]}
                        >
                          <View
                            style={[
                              styles.chartBarFill,
                              {
                                height: barHeight,
                                backgroundColor: isActive
                                  ? tone.solidColor
                                  : tone.backgroundColor,
                                borderColor: isActive
                                  ? tone.solidColor
                                  : "transparent",
                              },
                            ]}
                          />
                          {isActive && (
                            <>
                              <View
                                style={[
                                  styles.chartBarGlow,
                                  { backgroundColor: tone.solidColor },
                                ]}
                              />
                              <View
                                style={[
                                  styles.activeMarker,
                                  { backgroundColor: tone.solidColor },
                                ]}
                              />
                            </>
                          )}
                        </View>

                        <Text
                          style={[
                            styles.chartBarDate,
                            isLast && styles.chartBarDateCurrent,
                          ]}
                          numberOfLines={1}
                        >
                          {formatShortDate(item.image_date)}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            </View>
          </ScrollView>
        </NativeViewGestureHandler>

        {showLeftFade && (
          <LinearGradient
            pointerEvents="none"
            colors={["#F8FAFC", "rgba(248,250,252,0)"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.fadeLeft}
          />
        )}

        {showRightFade && (
          <LinearGradient
            pointerEvents="none"
            colors={["rgba(248,250,252,0)", "#F8FAFC"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.fadeRight}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  chartCard: {
    backgroundColor: "#F8FAFC",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#E8EDF3",
    paddingTop: 14,
    paddingBottom: 12,
    paddingHorizontal: 12,
  },

  chartHeaderRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 10,
  },

  chartHeaderContent: {
    flex: 1,
  },

  chartTitle: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "700",
    color: Colors.grey800,
    marginBottom: 4,
  },

  chartHint: {
    fontSize: 12,
    lineHeight: 16,
    color: Colors.grey500,
  },

  chartCurrentBadge: {
    minWidth: 68,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  chartCurrentBadgeText: {
    fontSize: 15,
    lineHeight: 18,
    fontWeight: "800",
  },

  scrollHintRow: {
    marginBottom: 8,
  },

  scrollHint: {
    fontSize: 11,
    lineHeight: 14,
    color: Colors.grey500,
    fontWeight: "600",
  },

  chartContainer: {
    width: "100%",
    position: "relative",
  },

  scroll: {
    width: "100%",
  },

  scrollContent: {
    flexGrow: 1,
  },

  chartPlotWrap: {
    paddingHorizontal: CHART_SIDE_PADDING,
  },

  chartArea: {
    position: "relative",
    height: CHART_HEIGHT + LABELS_HEIGHT,
  },

  chartGridLineWrap: {
    position: "absolute",
    left: 0,
    right: 0,
  },

  chartGridLine: {
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
    borderStyle: "dashed",
  },

  chartBarsRow: {
    height: CHART_HEIGHT + LABELS_HEIGHT,
    flexDirection: "row",
    alignItems: "flex-end",
    gap: BAR_GAP,
  },

  chartBarItem: {
    width: BAR_WIDTH,
    height: CHART_HEIGHT + LABELS_HEIGHT,
    alignItems: "center",
    justifyContent: "flex-end",
  },

  chartBarValue: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "700",
    marginBottom: 8,
  },

  chartBarValueActive: {
    fontSize: 12,
  },

  chartBarTrack: {
    width: BAR_WIDTH,
    height: CHART_HEIGHT,
    borderRadius: 12,
    justifyContent: "flex-end",
    backgroundColor: "#E9EEF4",
    overflow: "visible",
    marginBottom: 8,
  },

  chartBarTrackActive: {
    transform: [{ scaleX: 1.02 }],
  },

  chartBarFill: {
    width: "100%",
    borderRadius: 12,
    borderWidth: 1,
  },

  chartBarGlow: {
    position: "absolute",
    bottom: -2,
    left: -4,
    right: -4,
    height: 18,
    borderRadius: 20,
    opacity: 0.18,
  },

  activeMarker: {
    position: "absolute",
    top: -6,
    alignSelf: "center",
    width: 8,
    height: 8,
    borderRadius: 999,
  },

  chartBarDate: {
    height: LABELS_HEIGHT - 6,
    fontSize: 10,
    lineHeight: 12,
    color: Colors.grey500,
    textAlign: "center",
  },

  chartBarDateCurrent: {
    fontWeight: "700",
    color: Colors.grey700,
  },

  fadeLeft: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: LABELS_HEIGHT,
    width: FADE_WIDTH,
  },

  fadeRight: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: LABELS_HEIGHT,
    width: FADE_WIDTH,
  },
});
