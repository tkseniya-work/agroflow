import { Text, ViewPager } from "@ui-kitten/components";
import React, { useMemo, useState } from "react";
import { ActivityIndicator, TouchableOpacity, View } from "react-native";

import { PendingShiftsSection } from "./PendingShiftsSection";
import { ShiftGroupsList } from "./ShiftGroupsList";
import { getActivePendingShiftsByGroup } from "./ShiftsSection.logic";
import { styles } from "./ShiftsSection.styles";
import Colors from "../../shared/styles/Colors";
import type {
  ClosePendingShiftsHandler,
  PendingShift,
  SaveShiftsLocallyHandler,
  ShiftCollection,
  StopShiftsHandler,
} from "./ShiftsSection.types";

const SHIFT_FILTERS = [
  { title: "Текущие", index: 0 },
  { title: "Архивные", index: 1 },
] as const;

type Props = {
  pendingOpenShifts: ShiftCollection<PendingShift>;
  current: ShiftCollection;
  archive: ShiftCollection;
  isLoading: boolean;
  refreshing: boolean;
  loadingStatus?: string | null;
  isConnected: boolean;
  handleRefresh: () => void;
  handleStopGroupShifts: StopShiftsHandler;
  handleClosePendingShift: ClosePendingShiftsHandler;
  handleSyncPress: () => void;
  onSaveToLocal: SaveShiftsLocallyHandler;
};

export const ShiftsSection = ({
  pendingOpenShifts,
  current,
  archive,
  isLoading,
  refreshing,
  loadingStatus,
  isConnected,
  handleRefresh,
  handleStopGroupShifts,
  handleClosePendingShift,
  handleSyncPress,
  onSaveToLocal,
}: Props) => {
  const [activeTab, setActiveTab] = useState(0);
  const activePendingShiftsByGroup = useMemo(
    () => getActivePendingShiftsByGroup(pendingOpenShifts),
    [pendingOpenShifts],
  );

  const pendingShiftsHeader = (
    <PendingShiftsSection
      pendingShifts={pendingOpenShifts}
      activeShiftsByGroup={activePendingShiftsByGroup}
      onCloseShifts={handleClosePendingShift}
      onSyncPress={handleSyncPress}
    />
  );

  return (
    <>
      {!!loadingStatus && (
        <View
          style={styles.loadingStatus}
          accessibilityRole="progressbar"
          accessibilityLabel={loadingStatus}
        >
          <ActivityIndicator size="small" color={Colors.greenColor} />
          <Text style={styles.loadingStatusText}>{loadingStatus}</Text>
        </View>
      )}

      <View style={styles.shiftChips} accessibilityRole="tablist">
        {SHIFT_FILTERS.map((item) => {
          const active = activeTab === item.index;

          return (
            <TouchableOpacity
              key={item.title}
              style={[styles.shiftChip, active && styles.shiftChipActive]}
              onPress={() => setActiveTab(item.index)}
              activeOpacity={0.85}
              accessibilityRole="tab"
              accessibilityState={{ selected: active }}
            >
              <Text
                style={[
                  styles.shiftChipText,
                  active && styles.shiftChipTextActive,
                ]}
              >
                {item.title}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <ViewPager
        swipeEnabled={false}
        style={styles.viewPager}
        selectedIndex={activeTab}
        onSelect={setActiveTab}
      >
        <View style={styles.tabContainer}>
          <ShiftGroupsList
            mode="current"
            shifts={current}
            isLoading={isLoading}
            refreshing={refreshing}
            isConnected={isConnected}
            onRefresh={handleRefresh}
            pendingGroupCount={pendingOpenShifts.keys.length}
            header={pendingShiftsHeader}
            onStopShifts={handleStopGroupShifts}
            onSaveToLocal={onSaveToLocal}
          />
        </View>
        <View style={styles.tabContainer}>
          <ShiftGroupsList
            mode="archive"
            shifts={archive}
            isLoading={isLoading}
            refreshing={refreshing}
            isConnected={isConnected}
            onRefresh={handleRefresh}
          />
        </View>
      </ViewPager>
    </>
  );
};
