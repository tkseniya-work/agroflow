import React, {
  useMemo,
  useRef,
  useState,
  useImperativeHandle,
  forwardRef,
  useCallback,
  useEffect,
} from "react";
import { View, StyleSheet, TouchableOpacity, Text } from "react-native";
import BottomSheet, { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { MaterialIcons } from "@expo/vector-icons";

import Colors from "../../../shared/styles/Colors";
import { TrackingTab } from "./TrackingTab";
import { OfflineTab } from "./OfflineTab";
import { NdviPanel } from "./NdviPanel";
import {
  MapBottomPanelProps,
  MapViewMode,
  StandardView,
} from "../../../src/types/map.types";

export interface MapBottomPanelRef {
  collapsePanel: () => void;
  expandPanel: () => void;
  snapToIndex: (index: number) => void;
}

interface ExtendedMapBottomPanelProps extends MapBottomPanelProps {
  bottomSheetRef?: any;
  onPanelStateChange?: (expanded: boolean) => void;
}

const MODE_ITEMS: {
  key: MapViewMode;
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
}[] = [
  { key: "standard", icon: "agriculture", label: "Работа" },
  { key: "ndvi", icon: "show-chart", label: "NDVI" },
  { key: "offline", icon: "download", label: "Офлайн" },
];

const MapBottomPanel = forwardRef<
  MapBottomPanelRef,
  ExtendedMapBottomPanelProps
>(
  function MapBottomPanel(
    {
      viewMode,
      setViewMode,
      interactionMode,
      setInteractionMode,
      companyInfo,
      cameraRef,
      regions,
      downloadStates,
      technique,
      draftPeriod,
      selectedTechnique,
      trackSummary,
      seasons,
      selectedSeason,
      selectedField,
      sessionId,
      productionTasks,
      productionPlan,
      fieldImageDates,
      selectedDate,
      currentSeasonFieldNdvi,
      loadRegions,
      saveRegion,
      deleteRegion,
      onChangeDraftPeriod,
      onSelectedTechniqueChange,
      onResetSelectedTechnique,
      onCreateTechniqueTracks,
      onPanelStateChange,
      onSeasonChange,
      onShowTaskTrack,
      clearTrack,
      onHideTaskTrack,
      onChangeSheet,
      onSelectImageDate,
      onSelectField,
      bottomSheetRef,
    },
    ref,
  ) {
    const [standardView, setStandardView] = useState<StandardView>("machines");
    const [sheetIndex, setSheetIndex] = useState(0);
    const mountedRef = useRef(true);

    const snapPoints = useMemo(() => [190, "45%", "85%"], []);

    useEffect(() => {
      return () => {
        mountedRef.current = false;
      };
    }, []);

    const handleSheetChange = useCallback(
      (index: number) => {
        if (!mountedRef.current) return;
        setSheetIndex(index);

        onPanelStateChange?.(index > 0);
        onChangeSheet?.(index);
      },
      [onChangeSheet, onPanelStateChange],
    );

    const handleAnimate = useCallback(
      (_fromIndex: number, toIndex: number) => {
        if (!mountedRef.current || toIndex <= 0) return;

        onPanelStateChange?.(true);
        onChangeSheet?.(toIndex);
      },
      [onChangeSheet, onPanelStateChange],
    );

    useImperativeHandle(ref, () => ({
      collapsePanel: () => {
        bottomSheetRef.current?.snapToIndex(0);
      },
      expandPanel: () => {
        bottomSheetRef.current?.snapToIndex(2);
      },
      snapToIndex: (index: number) => {
        bottomSheetRef.current?.snapToIndex(index);
      },
    }));

    const collapsePanel = useCallback(() => {
      bottomSheetRef.current?.snapToIndex(0);
    }, [bottomSheetRef]);

    const handleChangeMode = useCallback(
      (mode: MapViewMode) => {
        setViewMode(mode);

        if (sheetIndex === 0) {
          bottomSheetRef.current?.snapToIndex(1);
        }

        if (mode !== "offline" && interactionMode === "selectRegion") {
          setInteractionMode("none");
        }
      },
      [
        bottomSheetRef,
        interactionMode,
        setInteractionMode,
        setViewMode,
        sheetIndex,
      ],
    );

    const renderContent = () => {
      if (viewMode === "standard") {
        return (
          <TrackingTab
            cameraRef={cameraRef}
            technique={technique}
            selectedTechnique={selectedTechnique}
            draftPeriod={draftPeriod}
            trackSummary={trackSummary}
            view={standardView}
            setView={setStandardView}
            seasons={seasons}
            selectedSeason={selectedSeason}
            selectedField={selectedField}
            productionTasks={productionTasks}
            productionPlan={productionPlan}
            onSeasonChange={onSeasonChange}
            onSelectedTechniqueChange={onSelectedTechniqueChange}
            onResetSelectedTechnique={onResetSelectedTechnique}
            onChangeDraftPeriod={onChangeDraftPeriod}
            onCreateTechniqueTracks={onCreateTechniqueTracks}
            onShowTaskTrack={onShowTaskTrack}
            clearTrack={clearTrack}
            onHideTaskTrack={onHideTaskTrack}
            collapsePanel={collapsePanel}
          />
        );
      }

      if (viewMode === "ndvi") {
        return (
          <NdviPanel
            dates={fieldImageDates}
            selectedDate={selectedDate}
            seasons={seasons}
            selectedSeason={selectedSeason}
            sessionId={sessionId}
            onSelectImageDate={onSelectImageDate}
            selectedField={selectedField}
            currentSeasonFieldNdvi={currentSeasonFieldNdvi}
            onSelectField={onSelectField}
            onSeasonChange={onSeasonChange}
            collapsePanel={collapsePanel}
          />
        );
      }

      return (
        <OfflineTab
          companyInfo={companyInfo}
          regions={regions}
          downloadStates={downloadStates}
          cameraRef={cameraRef}
          setInteractionMode={setInteractionMode}
          collapsePanel={collapsePanel}
          loadRegions={loadRegions}
          saveRegion={saveRegion}
          deleteRegion={deleteRegion}
        />
      );
    };

    return (
      <BottomSheet
        ref={bottomSheetRef}
        index={0}
        snapPoints={snapPoints}
        enableDynamicSizing={false}
        onAnimate={handleAnimate}
        onChange={handleSheetChange}
        bottomInset={0}
        enablePanDownToClose={false}
        animateOnMount
        detached={false}
        style={styles.sheet}
        backgroundStyle={styles.background}
        handleIndicatorStyle={styles.handleIndicator}
      >
        <BottomSheetScrollView
          showsVerticalScrollIndicator={false}
          style={styles.contentContainer}
          contentContainerStyle={styles.scrollContent}
          stickyHeaderIndices={[0]}
          nestedScrollEnabled
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.panelHeader}>
              <View style={styles.modeSwitch}>
                {MODE_ITEMS.map((item) => {
                  const active = viewMode === item.key;

                  return (
                    <TouchableOpacity
                      key={item.key}
                      accessibilityRole="tab"
                      accessibilityLabel={item.label}
                      accessibilityState={{ selected: active }}
                      onPress={() => handleChangeMode(item.key)}
                      style={[
                        styles.modeButton,
                        active && styles.modeButtonActive,
                      ]}
                      activeOpacity={0.8}
                    >
                      <MaterialIcons
                        name={item.icon}
                        size={20}
                        color={active ? Colors.white : Colors.grey500}
                      />
                      <Text
                        style={[
                          styles.modeButtonText,
                          active && styles.modeButtonTextActive,
                        ]}
                      >
                        {item.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

          <View style={styles.contentWrapper}>{renderContent()}</View>
        </BottomSheetScrollView>
      </BottomSheet>
    );
  },
);

export default MapBottomPanel;

const styles = StyleSheet.create({
  sheet: {
    zIndex: 30,
    elevation: 30,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 16,
  },
  background: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 5,
  },
  handleIndicator: {
    width: 40,
    height: 4,
    backgroundColor: "#C4C4C4",
    borderRadius: 2,
    marginVertical: 8,
  },
  panelHeader: {
    paddingHorizontal: 12,
    paddingBottom: 12,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: "#E8EBE8",
  },
  modeSwitch: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },
  modeButton: {
    flex: 1,
    minHeight: 44,
    borderRadius: 12,
    backgroundColor: "#F5F5F5",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 6,
    paddingHorizontal: 8,
  },
  modeButtonActive: {
    backgroundColor: Colors.greenColor,
  },
  modeButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.grey600,
  },
  modeButtonTextActive: {
    color: Colors.white,
  },
  contentWrapper: {
    flex: 1,
    minHeight: 0,
    paddingTop: 8,
  },
});
