import { Text } from "@ui-kitten/components";
import React, { ReactElement, useCallback } from "react";
import {
  ActivityIndicator,
  FlatList,
  Platform,
  RefreshControl,
  View,
  useWindowDimensions,
} from "react-native";

import { ShiftGroup } from "../ShiftGroup/ShiftGroup";
import { EMPTY_MESSAGES } from "../../src/constants/work";
import Colors from "../../shared/styles/Colors";
import { getGroupDisplayTitle } from "../../src/utils/shiftDataUtils";
import { styles } from "./ShiftsSection.styles";
import type {
  SaveShiftsLocallyHandler,
  ShiftCollection,
  StopShiftsHandler,
} from "./ShiftsSection.types";

type Props = {
  mode: "current" | "archive";
  shifts: ShiftCollection;
  isLoading: boolean;
  refreshing: boolean;
  isConnected: boolean;
  onRefresh: () => void;
  pendingGroupCount?: number;
  header?: ReactElement | null;
  onStopShifts?: StopShiftsHandler;
  onSaveToLocal?: SaveShiftsLocallyHandler;
};

export const ShiftGroupsList = ({
  mode,
  shifts,
  isLoading,
  refreshing,
  isConnected,
  onRefresh,
  pendingGroupCount = 0,
  header,
  onStopShifts,
  onSaveToLocal,
}: Props) => {
  const { height } = useWindowDimensions();
  const minContentHeight = height - 250;
  const isCurrent = mode === "current";

  const renderLoading = useCallback(
    () => (
      <View style={[styles.loadingEmptyState, { minHeight: minContentHeight }]}>
        <ActivityIndicator color={Colors.greenColor} />
        <Text style={styles.loadingEmptyTitle}>
          {isCurrent ? "Загрузка смен..." : "Загрузка архива..."}
        </Text>
      </View>
    ),
    [isCurrent, minContentHeight],
  );

  const renderEmpty = useCallback(
    () => (
      <View style={[styles.emptyState, { minHeight: minContentHeight }]}>
        <Text appearance="hint">
          {isCurrent ? EMPTY_MESSAGES.current : EMPTY_MESSAGES.archive}
        </Text>
      </View>
    ),
    [isCurrent, minContentHeight],
  );

  const renderItem = useCallback(
    ({ item: groupKey }: { item: string }) => (
      <ShiftGroup
        groupKey={groupKey}
        shifts={shifts.grouped[groupKey] ?? []}
        getGroupDisplayTitle={getGroupDisplayTitle}
        onStopShift={isCurrent ? onStopShifts : undefined}
        onSaveToLocal={isCurrent ? onSaveToLocal : undefined}
        showStopButton={isCurrent && isConnected}
        isConnected={isConnected}
      />
    ),
    [
      isConnected,
      isCurrent,
      onSaveToLocal,
      onStopShifts,
      shifts.grouped,
    ],
  );

  const renderEmptyState = useCallback(() => {
    if (isLoading) return renderLoading();
    if (isCurrent && pendingGroupCount > 0) return null;

    return renderEmpty();
  }, [isCurrent, isLoading, pendingGroupCount, renderEmpty, renderLoading]);

  return (
    <FlatList
      data={shifts.keys}
      keyExtractor={(item) => item}
      renderItem={renderItem}
      ListHeaderComponent={header}
      ListEmptyComponent={renderEmptyState}
      contentContainerStyle={[
        styles.listContent,
        shifts.keys.length === 0 &&
        (!isCurrent || pendingGroupCount === 0) &&
        styles.emptyListContent,
      ]}
      showsVerticalScrollIndicator={!isCurrent}
      keyboardShouldPersistTaps={isCurrent ? "handled" : undefined}
      removeClippedSubviews={Platform.OS === "android"}
      initialNumToRender={6}
      maxToRenderPerBatch={6}
      windowSize={7}
      updateCellsBatchingPeriod={50}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[Colors.greenColor]}
          tintColor={Colors.greenColor}
          progressBackgroundColor={Colors.white}
          progressViewOffset={
            isCurrent ? (Platform.OS === "ios" ? 0 : 10) : undefined
          }
        />
      }
    />
  );
};
