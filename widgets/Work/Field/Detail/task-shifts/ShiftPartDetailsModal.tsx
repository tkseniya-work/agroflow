import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { Modal, Pressable, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Text } from "@ui-kitten/components";

import { TrackItem } from "../../../../../entities/techniqueMonitoring";
import { MiniTrackMap } from "./MiniTrackMap";
import { styles } from "./styles";
import { ShiftPartDetails } from "../../../../../src/types/task.types";

export const ShiftPartDetailsModal = ({
  details,
  tracks,
  isTrackLoading,
  showTrack = true,
  onClose,
}: {
  details: ShiftPartDetails | null;
  tracks: TrackItem[];
  isTrackLoading: boolean;
  showTrack?: boolean;
  onClose: () => void;
}) => {
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={Boolean(details)}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.detailsOverlay}>
        <Pressable style={styles.detailsBackdrop} onPress={onClose} />

        {details && (
          <View
            style={[
              styles.detailsSheet,
              { paddingBottom: Math.max(16, insets.bottom + 16) },
            ]}
          >
          <View style={styles.detailsHandle} />

          <View style={styles.detailsHeader}>
            <View
              style={[
                styles.detailsIcon,
                { backgroundColor: `${details.color}18` },
              ]}
            >
              <MaterialCommunityIcons
                name={details.icon}
                size={22}
                color={details.color}
              />
            </View>

            <View style={styles.detailsTitleWrap}>
              <Text style={styles.detailsTitle} numberOfLines={1}>
                {details.title}
              </Text>
              <Text style={styles.detailsSubtitle} numberOfLines={1}>
                {details.subtitle}
              </Text>
            </View>

            {details.shiftName && (
              <View
                style={[
                  styles.detailsShiftBadge,
                  Number(details.shiftType) === 2
                    ? styles.detailsShiftBadgeNight
                    : styles.detailsShiftBadgeDay,
                ]}
              >
                <Ionicons
                  name={
                    Number(details.shiftType) === 2
                      ? "moon-outline"
                      : "sunny-outline"
                  }
                  size={14}
                  color={
                    Number(details.shiftType) === 2 ? "#3538CD" : "#B54708"
                  }
                />
              </View>
            )}

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Закрыть подробности"
              style={styles.detailsCloseButton}
              onPress={onClose}
            >
              <Ionicons name="close" size={20} color="#667085" />
            </Pressable>
          </View>

          <ScrollView
            style={styles.detailsScroll}
            contentContainerStyle={styles.detailsContent}
            showsVerticalScrollIndicator={false}
          >
            {showTrack && (
              <MiniTrackMap tracks={tracks} loading={isTrackLoading} />
            )}

            {!!details.summary?.length && (
              <View style={styles.detailsSummaryGrid}>
                {details.summary.map((item) => (
                  <View
                    key={`${item.label}-${item.value}`}
                    style={[
                      styles.detailsSummaryItem,
                      item.accent && { borderColor: `${details.color}44` },
                    ]}
                  >
                    <Text style={styles.detailsSummaryLabel}>{item.label}</Text>
                    <Text
                      style={[
                        styles.detailsSummaryValue,
                        item.accent && { color: details.color },
                      ]}
                    >
                      {item.value}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            {(details.sections?.length
              ? details.sections
              : [{ title: "Основное", icon: details.icon, rows: details.rows }]
            ).map((section) => (
              <View key={section.title} style={styles.detailsSectionCard}>
                <View style={styles.detailsSectionHeader}>
                  <View style={styles.detailsSectionIcon}>
                    <MaterialCommunityIcons
                      name={section.icon}
                      size={17}
                      color="#667085"
                    />
                  </View>
                  <Text style={styles.detailsSectionTitle}>
                    {section.title}
                  </Text>
                </View>

                {!!section.rows?.length && (
                  <View style={styles.detailsRows}>
                    {section.rows.map((row) => (
                      <View
                        key={`${section.title}-${row.label}-${row.value}`}
                        style={styles.detailsRow}
                      >
                        <Text style={styles.detailsRowLabel}>{row.label}</Text>
                        <Text
                          style={[
                            styles.detailsRowValue,
                            row.strong && styles.detailsRowValueStrong,
                          ]}
                        >
                          {row.value}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}

                {!!section.metricGroups?.length && (
                  <View style={styles.detailsMetricGroups}>
                    {section.metricGroups.map((group) => (
                      <View
                        key={`${section.title}-${group.title}`}
                        style={styles.detailsMetricGroup}
                      >
                        <Text style={styles.detailsMetricGroupTitle}>
                          {group.title}
                        </Text>

                        <View style={styles.detailsRows}>
                          {group.rows.map((row) => (
                            <View
                              key={`${group.title}-${row.label}-${row.value}`}
                              style={styles.detailsRow}
                            >
                              <Text style={styles.detailsRowLabel}>
                                {row.label}
                              </Text>
                              <Text
                                style={[
                                  styles.detailsRowValue,
                                  row.strong && styles.detailsRowValueStrong,
                                ]}
                              >
                                {row.value}
                              </Text>
                            </View>
                          ))}
                        </View>
                      </View>
                    ))}
                  </View>
                )}

                {!!section.items?.length && (
                  <View style={styles.detailsItemsList}>
                    {section.items.map((item, index) => (
                      <Text
                        key={`${section.title}-${item}-${index}`}
                        style={styles.detailsMaterial}
                      >
                        {item}
                      </Text>
                    ))}
                  </View>
                )}

                {!!section.materialGroups?.length && (
                  <View style={styles.detailsMaterialGroups}>
                    {section.materialGroups.map((group) => (
                      <View
                        key={`${section.title}-${group.title}`}
                        style={styles.detailsMaterialGroup}
                      >
                        <View style={styles.detailsMaterialGroupHeader}>
                          <View style={styles.detailsMaterialGroupIcon}>
                            <MaterialCommunityIcons
                              name={group.icon}
                              size={16}
                              color="#667085"
                            />
                          </View>
                          <Text style={styles.detailsMaterialGroupTitle}>
                            {group.title}
                          </Text>
                        </View>

                        {group.items?.length ? (
                          <View style={styles.detailsRows}>
                            {group.items.map((item) => (
                              <View
                                key={`${group.title}-${item.label}-${item.value}`}
                                style={styles.detailsRow}
                              >
                                <Text style={styles.detailsRowLabel}>
                                  {item.label}
                                </Text>
                                <Text style={styles.detailsRowValue}>
                                  {item.value}
                                </Text>
                              </View>
                            ))}
                          </View>
                        ) : (
                          <Text style={styles.detailsMaterialEmptyText}>
                            {group.emptyText}
                          </Text>
                        )}
                      </View>
                    ))}
                  </View>
                )}
              </View>
            ))}

            {!!details.materials?.length && !details.sections?.length && (
              <View style={styles.detailsSectionCard}>
                <View style={styles.detailsSectionHeader}>
                  <View style={styles.detailsSectionIcon}>
                    <MaterialCommunityIcons
                      name="package-variant-closed"
                      size={17}
                      color="#667085"
                    />
                  </View>
                  <Text style={styles.detailsSectionTitle}>Расходники</Text>
                </View>

                <View style={styles.detailsItemsList}>
                  {details.materials.map((item, index) => (
                    <Text
                      key={`${item}-${index}`}
                      style={styles.detailsMaterial}
                    >
                      {item}
                    </Text>
                  ))}
                </View>
              </View>
            )}
          </ScrollView>

          </View>
        )}
      </View>
    </Modal>
  );
};
