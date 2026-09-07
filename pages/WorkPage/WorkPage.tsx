import { Ionicons } from "@expo/vector-icons";
import { useIsFocused } from "@react-navigation/native";
import { Text } from "@ui-kitten/components";
import { useNavigation } from "expo-router";
import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from "react";
import {
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

import { AppIcon, TabBar } from "../../shared/ui";
import { LoadingIndicator } from "../../widgets/LoadingIndicator";
import { NetworkStatusInline } from "../../widgets/NetworkStatusBar";
import {
  ForcedCloseShiftModal,
  PendingSyncModal,
  TasksSection,
  ShiftsSection,
  DateRangeModal,
  ScanConfirmationModal,
  useForcedShiftCloseFlow,
  usePendingShiftSyncFlow,
  useScannerLaunchFlow,
  canRoleManageTasks,
  flattenPendingShifts,
  getShiftLoadingStatus,
  getWorkSectionState,
} from "../../widgets/Work";

import { useDateRange } from "../../shared/lib/useDateRange";
import { useModalScanner } from "../../shared/lib/useModalScanner";
import { useScanner } from "../../features/scanner";
import { useNetworkStatus } from "../../shared/lib/useNetworkStatus";
import { useWorkData } from "../../widgets/Work/work-screen/useWorkData";
import { useAuth } from "../../entities/auth/lib/useAuth";
import { useDataSyncService } from "../../features/dataSync";
import { useAlerts } from "../../shared/lib/useAlerts";

import Colors from "../../shared/styles/Colors";
import EvaIcons from "../../src/types/eva-icon-enum";
import { UserRole } from "../../src/utils/config/tabsConfig";
import {
  formatPickerDate,
  isShiftPastPlannedEnd,
  parsePickerDate,
  shouldRequestOnlineShiftCloseTime,
} from "../../src/utils/workShiftUtils";

import { useDatabaseBootstrap } from "../../shared/store/databaseBootstrap";
import {
  useEmployeeInfo,
  useLocalDictionaries,
  useOfflineShiftQueue,
  useProductionShiftData,
  useShiftSettings,
} from "../../features/localData/useLocalData";
import { useProductionShiftActions } from "../../entities/productionShift/lib/useProductionShiftActions";
import ScannerModal from "../../widgets/ScannerModal";
import { useProductionTasks } from "../../entities/productionTask/lib/useProductionTasks";
import { useSeasonFields } from "../../entities/season";
import { SeasonPickerModal } from "../../widgets/OfflineMap/MapBottomPanel/SeasonSelector/SeasonPickerModal";
import { hasActiveShift } from "../../src/utils/activeShiftStatus";

const WORK_SECTIONS = ["Задания", "Смены"];
export default function WorkPage() {
  const { reloadLocalData } = useDatabaseBootstrap();
  const employeeInfo = useEmployeeInfo();
  const productionShift = useProductionShiftData();
  const {
    closeProductionShift: queuedCloseProductionShifts,
    openProductionShift: queuedOpenProductionShifts,
  } = useOfflineShiftQueue();
  const settingsProductionShift = useShiftSettings();
  const {
    agriculturalMachinery,
    productionWorkPlaces,
    techniqueStandard,
    unitOfMeasure,
    workStandard,
  } = useLocalDictionaries();
  const { loadProductionShifts: productionShiftLoader } =
    useProductionShiftActions();
  const { getValidAccessToken } = useAuth();
  const { smartSyncAllDictionaries } = useDataSyncService();
  const { showError } = useAlerts();

  const { isConnected, forcedOffline, toggleForcedOffline } =
    useNetworkStatus();

  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const [activeWorkSection, setActiveWorkSection] = useState(0);
  const [isShiftsSectionMounted, setIsShiftsSectionMounted] = useState(false);

  const handleWorkSectionChange = useCallback((index: number) => {
    setActiveWorkSection(index);

    if (index === 1) {
      setIsShiftsSectionMounted(true);
    }
  }, []);

  const { range, setRange } = useDateRange();
  const { visible, toggle } = useModalScanner();
  const [rangeStartDate, setRangeStartDate] = useState("");
  const [rangeEndDate, setRangeEndDate] = useState("");
  useEffect(() => {
    if (!visible) return;

    setRangeStartDate(formatPickerDate(range.startDate));
    setRangeEndDate(formatPickerDate(range.endDate));
  }, [range.endDate, range.startDate, visible]);

  const parsedRangeStartDate = useMemo(
    () => parsePickerDate(rangeStartDate),
    [rangeStartDate],
  );
  const parsedRangeEndDate = useMemo(
    () => parsePickerDate(rangeEndDate),
    [rangeEndDate],
  );
  const isRangeValid = Boolean(
    parsedRangeStartDate &&
      parsedRangeEndDate &&
      parsedRangeStartDate <= parsedRangeEndDate,
  );

  const applyDateRange = useCallback(() => {
    if (!parsedRangeStartDate || !parsedRangeEndDate || !isRangeValid) return;

    setRange({
      startDate: parsedRangeStartDate,
      endDate: parsedRangeEndDate,
    });
    toggle();
  }, [
    isRangeValid,
    parsedRangeEndDate,
    parsedRangeStartDate,
    setRange,
    toggle,
  ]);

  const userRole = useMemo<UserRole | null>(() => {
    return (employeeInfo?.employees?.role as UserRole) ?? null;
  }, [employeeInfo?.employees?.role]);
  const hasActiveWorkShift = useMemo(
    () =>
      hasActiveShift({
        storedShifts: productionShift,
        pendingOpenShifts: queuedOpenProductionShifts,
        pendingCloseShifts: queuedCloseProductionShifts,
        employeeId: employeeInfo?.id,
      }),
    [
      employeeInfo?.id,
      productionShift,
      queuedCloseProductionShifts,
      queuedOpenProductionShifts,
    ],
  );

  const canManageTasks = useMemo(
    () => canRoleManageTasks(userRole),
    [userRole],
  );

  useEffect(() => {
    if (employeeInfo?.employees?.id && !canManageTasks) {
      setIsShiftsSectionMounted(true);
    }
  }, [canManageTasks, employeeInfo?.employees?.id]);

  const {
    pendingOpenShifts,
    current,
    archive,
    isLoading,
    refreshing,
    isSyncing,
    loadingPhase,
    handleRefresh,
    handleStopGroupShifts,
    handleClosePendingShift,
    handleSyncPress,
    onSaveToLocal,
  } = useWorkData(range, isFocused);

  const shiftLoadingStatus = getShiftLoadingStatus(loadingPhase);

  const pendingShifts = useMemo(
    () => flattenPendingShifts(pendingOpenShifts),
    [pendingOpenShifts],
  );

  const activePendingShifts = useMemo(() => {
    return pendingShifts.filter((shift: any) => !shift.endedAt);
  }, [pendingShifts]);

  const shiftSettings = Array.isArray(settingsProductionShift)
    ? settingsProductionShift[0]
    : settingsProductionShift;

  const getExpiredPendingShifts = useCallback(() => {
    const now = new Date();

    return activePendingShifts.filter((shift: any) =>
      isShiftPastPlannedEnd(shift, shiftSettings, now),
    );
  }, [activePendingShifts, shiftSettings]);

  const closedPendingShifts = useMemo(() => {
    return pendingShifts.filter((shift: any) => Boolean(shift.endedAt));
  }, [pendingShifts]);

  const getSyncablePendingShifts = useCallback(() => {
    const now = new Date();
    const activeWithinCurrentShift = activePendingShifts.filter(
      (shift: any) => !isShiftPastPlannedEnd(shift, shiftSettings, now),
    );

    return [...closedPendingShifts, ...activeWithinCurrentShift];
  }, [activePendingShifts, closedPendingShifts, shiftSettings]);

  const { openForcedCloseModal, modalProps: forcedCloseModalProps } =
    useForcedShiftCloseFlow({
      shiftSettings,
      isFocused,
      isLoading,
      getExpiredPendingShifts,
      closeOfflineShifts: handleClosePendingShift,
      closeOnlineShifts: handleStopGroupShifts,
      showError,
    });

  const {
    promptSyncPendingShifts,
    handlePendingSyncRequest,
    modalProps: pendingSyncModalProps,
  } = usePendingShiftSyncFlow({
    pendingShifts,
    isSyncing,
    getExpiredPendingShifts,
    getSyncablePendingShifts,
    openForcedCloseModal,
    syncPendingShifts: handleSyncPress,
    showError,
  });

  const {
    isScannerVisible,
    isOpeningScanner,
    isGettingLocation,
    isProcessing,
    isCheckingDictionaries,
    pendingScanConfirmation,
    handleCodeScanned,
    confirmPendingScan,
    cancelPendingScan,
    setPendingScanShiftType,
    openScanner,
    closeScanner,
    getDisplayShift,
  } = useScanner({
    onDataUpdated: handleRefresh,
    productionShiftsCurrentData: current.data,
  });

  const handleScannerOpen = useScannerLaunchFlow({
    isConnected,
    forcedOffline,
    employeeId: employeeInfo?.employees?.id,
    pendingShiftsCount: pendingShifts.length,
    productionShifts: productionShift || [],
    currentShifts: current,
    shiftSettings,
    techniqueStandard,
    agriculturalMachinery,
    unitOfMeasure,
    productionWorkPlaces,
    workStandard,
    reloadLocalData,
    getValidAccessToken,
    loadProductionShifts: productionShiftLoader,
    getExpiredPendingShifts,
    getSyncablePendingShifts,
    openForcedCloseModal,
    promptSyncPendingShifts,
    openScanner,
  });

  const { seasons, currentSeason, changeSeason } = useSeasonFields();

  const {
    productionTasks,

    isLoadingTask,
    refreshingTask,
    isLoadingMoreTasks,
    hasMoreTasks,

    isCreatingTask,
    isUpdatingTask,
    isDeletingTask,
    isActionLoading,

    taskActionError,

    refreshTasks,
    loadMoreTasks,
    applyTaskPageFilters,
    updateAllProductionTask,
    createFieldTask,
    deleteTask,
  } = useProductionTasks({
    season: currentSeason,
    status: [1, 2],
    paginated: true,
    pageSize: 10,
  });

  const [seasonModalVisible, setSeasonModalVisible] = useState(false);
  const [isRefreshingTasks, setIsRefreshingTasks] = useState(false);

  const { isTasksSection, isShiftsSection } = getWorkSectionState(
    canManageTasks,
    activeWorkSection,
  );

  const handleTasksRefresh = useCallback(async () => {
    if (isRefreshingTasks || refreshingTask) return;

    try {
      setIsRefreshingTasks(true);

      if (isConnected) {
        const token = await getValidAccessToken();

        await smartSyncAllDictionaries(token);
      }

      await refreshTasks();
    } catch (error) {
      console.error("Tasks refresh error:", error);
      showError("Ошибка обновления");
    } finally {
      setIsRefreshingTasks(false);
    }
  }, [
    isRefreshingTasks,
    refreshingTask,
    isConnected,
    getValidAccessToken,
    smartSyncAllDictionaries,
    refreshTasks,
    showError,
  ]);

  const handlePendingShiftCloseRequest = useCallback(
    (shiftOrShifts: any | any[]) => {
      const shifts = Array.isArray(shiftOrShifts)
        ? shiftOrShifts
        : [shiftOrShifts];

      openForcedCloseModal(shifts, undefined, true);
    },
    [openForcedCloseModal],
  );

  const handleOnlineShiftCloseRequest = useCallback(
    async (shifts: any[]) => {
      if (
        shouldRequestOnlineShiftCloseTime(shifts, shiftSettings)
      ) {
        const opened = openForcedCloseModal(
          shifts,
          undefined,
          true,
          true,
          "online",
        );

        if (opened) return;
      }

      await handleStopGroupShifts(shifts);
    },
    [handleStopGroupShifts, openForcedCloseModal, shiftSettings],
  );

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={styles.headerActions}>
          <TouchableOpacity
            onPress={() => toggleForcedOffline()}
            activeOpacity={0.75}
            style={[
              styles.offlineHeaderButton,
              forcedOffline && styles.offlineHeaderButtonActive,
            ]}
          >
            <Ionicons
              name={forcedOffline ? "cloud-offline" : "cloud-outline"}
              size={18}
              color={Colors.white}
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleScannerOpen}
            disabled={isCheckingDictionaries || isOpeningScanner}
            style={[
              styles.scannerButton,
              (isCheckingDictionaries || isOpeningScanner) &&
                styles.scannerButtonDisabled,
            ]}
          >
            {isCheckingDictionaries || isOpeningScanner ? (
              <ActivityIndicator size="small" color={Colors.icon.success} />
            ) : (
              <Ionicons
                name="qr-code-outline"
                size={22}
                color={Colors.icon.success}
              />
            )}
          </TouchableOpacity>
        </View>
      ),
    });
  }, [
    navigation,
    forcedOffline,
    isCheckingDictionaries,
    isOpeningScanner,
    handleScannerOpen,
    toggleForcedOffline,
  ]);

  return (
    <View style={styles.mainContainer}>
      <NetworkStatusInline />

      <View style={styles.topActionsRow}>
        {isTasksSection && (
          <TouchableOpacity
            activeOpacity={0.75}
            onPress={() => {
              setSeasonModalVisible(true);
            }}
            style={styles.seasonButton}
          >
            <AppIcon name={EvaIcons.LayersOutline} />

            <Text category="c1" status="grey">
              Сезон {currentSeason?.year}
            </Text>

            <Ionicons
              name="chevron-down-outline"
              size={14}
              color={Colors.grey500}
            />
          </TouchableOpacity>
        )}

        {isShiftsSection && (
          <TouchableOpacity
            activeOpacity={0.75}
            onPress={toggle}
            style={styles.seasonButton}
          >
            <AppIcon name={EvaIcons.CalendarOutline} />

            <Text category="c1" status="grey">
              Выберите интервал
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.container}>
        {canManageTasks && (
          <TabBar
            onChangeTab={handleWorkSectionChange}
            tabActive={activeWorkSection}
            tabs={WORK_SECTIONS}
            indicatorIndexes={hasActiveWorkShift ? [1] : undefined}
            style={styles.workTabs}
            tabStyle={styles.workTab}
            backgroundTabActive={Colors.greenColor}
          />
        )}

        <View style={[styles.workSection, !isTasksSection && styles.hiddenWorkSection]}>
          <TasksSection
            productionTasks={productionTasks}
            isConnected={isConnected}
            isLoading={isLoadingTask}
            refreshing={isRefreshingTasks || refreshingTask}
            isLoadingMore={isLoadingMoreTasks}
            hasMore={hasMoreTasks}
            serverFiltering
            isCreatingTask={isCreatingTask}
            isUpdatingTask={isUpdatingTask}
            isDeletingTask={isDeletingTask}
            isActionLoading={isActionLoading}
            taskActionError={taskActionError}
            onRefresh={handleTasksRefresh}
            onLoadMore={loadMoreTasks}
            onFiltersChange={applyTaskPageFilters}
            onCreateFieldTask={createFieldTask}
            onUpdateAllProductionTask={updateAllProductionTask}
            onDeleteTask={deleteTask}
          />
        </View>

        {isShiftsSectionMounted ? (
          <View style={[styles.workSection, !isShiftsSection && styles.hiddenWorkSection]}>
            <ShiftsSection
              pendingOpenShifts={pendingOpenShifts}
              current={current}
              archive={archive}
              isLoading={isLoading}
              refreshing={refreshing}
              loadingStatus={shiftLoadingStatus}
              isConnected={isConnected}
              handleRefresh={handleRefresh}
              handleStopGroupShifts={handleOnlineShiftCloseRequest}
              handleClosePendingShift={handlePendingShiftCloseRequest}
              handleSyncPress={handlePendingSyncRequest}
              onSaveToLocal={onSaveToLocal}
            />
          </View>
        ) : isShiftsSection ? (
          <View style={styles.sectionLoadingStatus}>
            <ActivityIndicator size="small" color={Colors.greenColor} />
            <Text appearance="hint">Загрузка смен…</Text>
          </View>
        ) : null}
      </View>

      <ForcedCloseShiftModal {...forcedCloseModalProps} />

      <PendingSyncModal {...pendingSyncModalProps} />

      <DateRangeModal
        visible={visible}
        startDate={rangeStartDate}
        endDate={rangeEndDate}
        parsedStartDate={parsedRangeStartDate}
        parsedEndDate={parsedRangeEndDate}
        isRangeValid={isRangeValid}
        onStartDateChange={setRangeStartDate}
        onEndDateChange={setRangeEndDate}
        onClose={toggle}
        onApply={applyDateRange}
      />

      <ScannerModal
        visible={isScannerVisible}
        onClose={closeScanner}
        onCodeScanned={handleCodeScanned}
        isProcessing={isProcessing}
        scanTypes={["qr"]}
        enableFlash
        enableCameraSwitch
      />

      <ScanConfirmationModal
        pendingScan={pendingScanConfirmation}
        isProcessing={isProcessing}
        getDisplayShift={getDisplayShift}
        onShiftTypeChange={setPendingScanShiftType}
        onCancel={cancelPendingScan}
        onConfirm={confirmPendingScan}
      />

      <SeasonPickerModal
        visible={seasonModalVisible}
        seasons={seasons}
        selectedSeason={currentSeason}
        onClose={() => setSeasonModalVisible(false)}
        onSelect={(season) => {
          changeSeason(season);
          setSeasonModalVisible(false);
        }}
      />

      <LoadingIndicator visible={isGettingLocation} text="Создаем смену" />

      <LoadingIndicator
        visible={isCheckingDictionaries}
        text="Проверяем справочники"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: Colors.white,
    position: "relative",
  },
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  topNavigation: {
    backgroundColor: Colors.white,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  workTabs: {
    borderRadius: 16,
    borderWidth: 0,
    padding: 4,
    marginBottom: 14,
    marginHorizontal: 12,
    backgroundColor: "#F3F4F6",
  },
  workTab: {
    borderRadius: 12,
  },
  workSection: {
    flex: 1,
  },
  hiddenWorkSection: {
    display: "none",
  },
  sectionLoadingStatus: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 12,
    gap: 10,
  },
  offlineHeaderButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#BDBDBD",
  },
  offlineHeaderButtonActive: {
    backgroundColor: "#F79009",
  },
  scannerButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  scannerButtonDisabled: {
    opacity: 0.4,
  },
  topActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  seasonModal: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 16,
    width: 220,
  },
  seasonItem: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
  },
  seasonItemActive: {
    backgroundColor: Colors.greenColor + "20",
  },
  seasonItemText: {
    fontSize: 16,
    color: Colors.black,
    fontWeight: "500",
  },
  seasonItemTextActive: {
    color: Colors.greenColor,
    fontWeight: "700",
  },
  topActionsRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 6,
    paddingTop: 6,
    backgroundColor: Colors.white,
  },

  seasonButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
});
