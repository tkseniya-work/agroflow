import React, { useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from "react-native";
import {
  NativeViewGestureHandler,
  ScrollView,
} from "react-native-gesture-handler";
import { TechniqueTrackPagerProps } from "../../../../src/types/map.types";

const { width } = Dimensions.get("window");

const ITEM_WIDTH = width * 0.85;
const SPACING = 10;
const PAGE_WIDTH = ITEM_WIDTH + SPACING;

export const TechniqueTrackPager: React.FC<TechniqueTrackPagerProps> = ({
  trackSummary,
  nativeGestureRef
}) => {
  const [activeIndex, setActiveIndex] = useState(0);

  const pagerGestureRef = useRef(null);
  const pagerScrollRef = useRef(null);

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const rawIndex = Math.round(e.nativeEvent.contentOffset.x / PAGE_WIDTH);

    const safeIndex = Math.max(
      0,
      Math.min(rawIndex, (trackSummary?.length || 1) - 1),
    );

    setActiveIndex(safeIndex);
  };

  if (!trackSummary || trackSummary.length === 0) {
    return (
      <View style={styles.emptyWrapper}>
        <Text style={styles.emptyText}>
          Данные за выбранный период не найдены
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.wrapper}>
      <Text style={styles.header}>Краткая статистика</Text>

      <NativeViewGestureHandler
        ref={pagerGestureRef}
        disallowInterruption={true}
      >
        <ScrollView
          ref={pagerScrollRef}
          horizontal
          nestedScrollEnabled
          directionalLockEnabled
          bounces={false}
          showsHorizontalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          simultaneousHandlers={pagerGestureRef}
          waitFor={nativeGestureRef}
          snapToInterval={PAGE_WIDTH}
          decelerationRate="fast"
          disableIntervalMomentum
          onScroll={onScroll}
          scrollEventThrottle={16}
          contentContainerStyle={styles.scrollContent}
        >
          {trackSummary.map((item, index) => {
            const hasTrack = item.hasTrack ?? !!item.track?.length;

            return (
              <View
                key={String(item.technique.id)}
                style={[
                  styles.card,
                  { width: ITEM_WIDTH },
                  index === trackSummary.length - 1 && styles.lastCard,
                ]}
              >
                <View style={styles.techniqueHeader}>
                  <Text style={styles.title} numberOfLines={1}>
                    {item.technique.name}
                  </Text>

                  {!!item.technique.state_number && (
                    <View style={styles.stateNumberBadge}>
                      <Text style={styles.stateNumberText}>
                        {item.technique.state_number}
                      </Text>
                    </View>
                  )}
                </View>

                {!hasTrack ? (
                  <View style={styles.emptyTechniqueState}>
                    <Text style={styles.emptyTechniqueTitle}>Нет данных</Text>
                    <Text style={styles.emptyTechniqueText}>
                      По этой технике трек за выбранный период не найден
                    </Text>
                  </View>
                ) : (
                  <>
                    <View style={styles.section}>
                      <Text style={styles.sectionTitle}>Пробег</Text>
                      <Text style={styles.bigValue}>
                        {item.track_length_km} км
                      </Text>
                    </View>

                    <View style={styles.section}>
                      <Text style={styles.sectionTitle}>Скорость</Text>
                      <View style={styles.row}>
                        <Text style={styles.label}>Средняя</Text>
                        <Text style={styles.value}>{item.avg_speed}</Text>
                      </View>
                      <View style={styles.row}>
                        <Text style={styles.label}>Макс</Text>
                        <Text style={styles.value}>{item.max_speed}</Text>
                      </View>
                    </View>

                    <View style={styles.section}>
                      <Text style={styles.sectionTitle}>Остановки</Text>
                      <View style={styles.row}>
                        <Text style={styles.label}>Короткие</Text>
                        <Text style={styles.value}>
                          {item.small_stops_duration}
                        </Text>
                      </View>
                      <View style={styles.row}>
                        <Text style={styles.label}>Долгие</Text>
                        <Text style={styles.value}>
                          {item.long_stops_duration}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.section}>
                      <Text style={styles.sectionTitle}>Топливо</Text>
                      <Text style={styles.bigValue}>
                        {item.fuel_consumed} л
                      </Text>
                    </View>
                  </>
                )}
              </View>
            );
          })}
        </ScrollView>
      </NativeViewGestureHandler>

      <View style={styles.dots}>
        {trackSummary.map((_, index) => (
          <View
            key={index}
            style={[styles.dot, activeIndex === index && styles.activeDot]}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginTop: 16,
  },

  header: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 10,
    paddingHorizontal: 10,
  },

  scrollContent: {
    paddingHorizontal: (width - ITEM_WIDTH) / 2,
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginRight: SPACING,
  },

  lastCard: {
    marginRight: 0,
  },

  techniqueHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },

  title: {
    flex: 1,
    minWidth: 0,
    fontSize: 16,
    fontWeight: "700",
    color: "#1D2939",
  },

  stateNumberBadge: {
    flexShrink: 0,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#D0D5DD",
    backgroundColor: "#F9FAFB",
  },

  stateNumberText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#475467",
  },

  section: {
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },

  sectionTitle: {
    fontSize: 12,
    color: "#888",
    marginBottom: 4,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 2,
  },

  label: {
    color: "#666",
    fontSize: 13,
  },

  value: {
    fontSize: 13,
    fontWeight: "500",
  },

  bigValue: {
    fontSize: 16,
    fontWeight: "600",
  },

  dots: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 10,
  },

  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#ccc",
    marginHorizontal: 4,
  },

  activeDot: {
    backgroundColor: "#333",
    width: 8,
    height: 8,
  },

  emptyWrapper: {
    marginTop: 16,
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    marginHorizontal: 10,
    borderRadius: 16,
  },

  emptyText: {
    fontSize: 14,
    color: "#888",
    textAlign: "center",
  },

  emptyTechniqueState: {
    flex: 1,
    minHeight: 180,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 24,
  },

  emptyTechniqueTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#374151",
    marginBottom: 6,
    textAlign: "center",
  },

  emptyTechniqueText: {
    fontSize: 13,
    lineHeight: 18,
    color: "#6B7280",
    textAlign: "center",
  },
});
