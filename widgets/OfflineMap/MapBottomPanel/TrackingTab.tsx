import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Pressable,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import Colors from "../../../shared/styles/Colors";
import { PeriodSelector } from "./PeriodSelector/PeriodSelector";
import { TechniquePickerModal } from "./TechniquePickerModal/TechniquePickerModal";
import { TechniqueTrackPager } from "./TechniqueTrackSummary/TechniqueTrackSummary";
import {
  StandardView,
  TrackingTabProps,
} from "../../../src/types/map.types";
import { SeasonSelector } from "./SeasonSelector/SeasonSelector";
import { SeasonPickerModal } from "./SeasonSelector/SeasonPickerModal";
import TaskCardList from "./TaskCard/TaskCardList";
import { ProductionTask } from "../../../entities/productionTask";
import MainFieldInfoComponent from "../MapComponents/FieldInfo";
import MapEmptyState from "../MapEmptyState";
import {
  NativeViewGestureHandler,
  ScrollView as GestureScrollView,
} from "react-native-gesture-handler";
import { isTruckTechnique } from "../MapComponents/TechniqueMarkers";
import { SelectedFieldHeader } from "./SelectedFieldHeader";

const STANDARD_VIEW_ITEMS: {
  key: StandardView;
  label: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
}[] = [
  { key: "machines", label: "Техника", icon: "tractor-variant" },
  { key: "fields", label: "Поле", icon: "map-marker-radius-outline" },
  { key: "tasks", label: "Задания", icon: "clipboard-text-outline" },
];

export const TrackingTab: React.FC<TrackingTabProps> = ({
  technique = [],
  selectedTechnique = [],
  draftPeriod,
  trackSummary,
  view,
  setView,
  seasons,
  selectedSeason,
  selectedField,
  productionTasks,
  productionPlan,
  onSeasonChange,
  onSelectedTechniqueChange,
  onResetSelectedTechnique,
  onChangeDraftPeriod,
  onCreateTechniqueTracks,
  clearTrack,
  onShowTaskTrack,
  onHideTaskTrack,
  collapsePanel,
}) => {
  const [pickerVisible, setPickerVisible] = useState(false);
  const [seasonModalVisible, setSeasonModalVisible] = useState(false);
  const [currentTaskId, setCurrentTaskId] = useState<string | null>(null);

  const horizontalScrollRef = useRef(null);
  const nativeGestureRef = useRef(null);

  useEffect(() => {
    if (selectedField?.id) {
      setView("fields");
    }
  }, [selectedField?.id, setView]);

  const techItems = useMemo(
    () =>
      technique.map((t: any) => ({
        id: t.technique_standard.id.toString(),
        name: t.technique_standard.name,
        stateNumber: t.technique_standard.state_number,
        isTruck: isTruckTechnique(t.technique_standard),
      })),
    [technique],
  );

  const renderMachinesBlock = () => {
    const selected = (selectedTechnique || []).map(
      (item) => techItems.find((technique) => technique.id === item.id) ?? item,
    );

    return (
      <View style={styles.chipsListContainer}>
        <View style={styles.stepHeader}>
          <View style={styles.stepNumber}>
            <Text style={styles.stepNumberText}>1</Text>
          </View>
          <View style={styles.stepTextBlock}>
            <Text style={styles.stepTitle}>Выберите технику</Text>
            <Text style={styles.stepHint}>
              {selected.length > 0
                ? `Выбрано: ${selected.length}`
                : "Для построения треков на карте"}
            </Text>
          </View>
        </View>

        <NativeViewGestureHandler
          ref={nativeGestureRef}
          disallowInterruption={true}
        >
          <GestureScrollView
            ref={horizontalScrollRef}
            horizontal
            nestedScrollEnabled
            directionalLockEnabled
            bounces={false}
            showsHorizontalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            simultaneousHandlers={nativeGestureRef}
            waitFor={nativeGestureRef}
            contentContainerStyle={styles.chipsContent}
          >
            {selected.length > 0 ? (
              selected.map((item) => (
                <View key={item.id} style={styles.chip}>
                  <View style={styles.chipIcon}>
                    <MaterialCommunityIcons
                      name={item.isTruck ? "dump-truck" : "tractor-variant"}
                      size={21}
                      color={Colors.greenColor}
                    />
                  </View>
                  <View style={styles.chipTextWrap}>
                    <Text style={styles.chipText} numberOfLines={1}>
                      {item.name}
                    </Text>
                    {!!item.stateNumber && (
                      <Text style={styles.chipStateNumber} numberOfLines={1}>
                        {item.stateNumber}
                      </Text>
                    )}
                  </View>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Убрать ${item.name} из выбранной техники`}
                    onPress={() =>
                      onSelectedTechniqueChange(
                        selected.filter((i) => i.id !== item.id),
                      )
                    }
                    hitSlop={8}
                    style={styles.clearButton}
                  >
                    <MaterialCommunityIcons
                      name="close"
                      size={17}
                      color="#527260"
                    />
                  </Pressable>
                </View>
              ))
            ) : (
              <Text style={styles.emptyInlineText}>Техника не выбрана</Text>
            )}
          </GestureScrollView>
        </NativeViewGestureHandler>

        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => {
              setPickerVisible(true);
            }}
          >
            <MaterialCommunityIcons
              name="tune-variant"
              size={18}
              color={Colors.greenColor}
            />
            <Text style={styles.primaryButtonText}>
              {selected.length > 0 ? "Изменить выбор" : "Выбрать технику"}
            </Text>
          </TouchableOpacity>

          {selected.length > 0 && (
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={onResetSelectedTechnique}
            >
              <Text style={styles.secondaryButtonText}>Очистить</Text>
            </TouchableOpacity>
          )}
        </View>

        <TechniquePickerModal
          visible={pickerVisible}
          items={techItems}
          selectedItems={selected}
          onClose={(selected) => {
            onSelectedTechniqueChange(selected);
            setPickerVisible(false);
          }}
        />

        <View style={styles.stepHeader}>
          <View style={styles.stepNumber}>
            <Text style={styles.stepNumberText}>2</Text>
          </View>
          <View style={styles.stepTextBlock}>
            <Text style={styles.stepTitle}>Выберите период</Text>
            <Text style={styles.stepHint}>Затем постройте трек на карте</Text>
          </View>
        </View>

        <PeriodSelector
          draftPeriod={draftPeriod}
          isTrackActionDisabled={selected.length === 0}
          onChangeDraftPeriod={onChangeDraftPeriod}
          onCreateTechniqueTracks={onCreateTechniqueTracks}
          clearTrack={clearTrack}
          collapsePanel={collapsePanel}
        />

        <TechniqueTrackPager
          trackSummary={trackSummary || []}
          nativeGestureRef={nativeGestureRef}
        />
      </View>
    );
  };

  const renderFieldsBlock = () => (
    <View style={styles.placeholderBlock}>
      {selectedField ? (
        <>
          <View style={styles.selectedFieldSpacing}>
            <SelectedFieldHeader
              field={selectedField}
              onChange={collapsePanel}
            />
          </View>

          <MainFieldInfoComponent
            currentSeasonFieldState={selectedField}
            evaluation={selectedField.evaluation}
            harvestForecast={selectedField.yield_forecast}
            productionPlan={productionPlan}
            compact
          />
        </>
      ) : (
        <MapEmptyState
          icon="map-marker-radius-outline"
          title="Выберите поле"
          description="Панель свернётся, чтобы было удобно выбрать контур на карте."
          actionLabel="Выбрать на карте"
          onAction={collapsePanel}
        />
      )}
    </View>
  );

  const showTrack = async (task: ProductionTask) => {
    collapsePanel();

    const trackLoaded = await onShowTaskTrack?.(task);

    if (!trackLoaded) {
      return false;
    }

    setCurrentTaskId(String(task?.id));
    return true;
  };

  const hideTrack = async (task: ProductionTask) => {
    if (currentTaskId === String(task?.id)) {
      setCurrentTaskId(null);
    }

    await onHideTaskTrack?.();
  };

  const renderTasksBlock = () => (
    <View style={styles.placeholderBlock}>
      {productionTasks && (
        <TaskCardList
          tasks={productionTasks}
          onShowTrack={showTrack}
          onHideTrack={hideTrack}
        />
      )}
    </View>
  );

  const renderContent = () => {
    switch (view) {
      case "machines":
        return renderMachinesBlock();
      case "fields":
        return renderFieldsBlock();
      case "tasks":
        return renderTasksBlock();
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.containerContent}>
        <SeasonSelector
          selectedSeason={selectedSeason}
          onPress={() => setSeasonModalVisible(true)}
        />

        <SeasonPickerModal
          visible={seasonModalVisible}
          seasons={seasons}
          selectedSeason={selectedSeason}
          onClose={() => setSeasonModalVisible(false)}
          onSelect={onSeasonChange}
        />

        <View style={styles.switcher}>
          {STANDARD_VIEW_ITEMS.map((item) => {
            const active = view === item.key;

            return (
              <TouchableOpacity
                key={item.key}
                accessibilityRole="tab"
                accessibilityLabel={item.label}
                accessibilityState={{ selected: active }}
                onPress={() => setView(item.key)}
                style={[styles.switchItem, active && styles.switchItemActive]}
                activeOpacity={0.8}
              >
                <MaterialCommunityIcons
                  name={item.icon}
                  size={19}
                  color={active ? Colors.greenColor : Colors.grey500}
                />
                <Text
                  style={[
                    styles.switchItemText,
                    active && styles.switchItemTextActive,
                  ]}
                >
                  {item.label}
                </Text>
                {active && <View style={styles.switchIndicator} />}
              </TouchableOpacity>
            );
          })}
        </View>

        {renderContent()}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  containerContent: {
    padding: 12,
    paddingBottom: 24,
  },
  switcher: {
    flexDirection: "row",
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  switchItem: {
    flex: 1,
    minHeight: 50,
    paddingHorizontal: 4,
    flexDirection: "row",
    gap: 6,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  switchItemActive: {
    backgroundColor: Colors.white,
  },
  switchItemText: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.grey600,
  },
  switchItemTextActive: {
    color: Colors.greenColor,
    fontWeight: "700",
  },
  switchIndicator: {
    position: "absolute",
    left: 10,
    right: 10,
    bottom: -1,
    height: 3,
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
    backgroundColor: Colors.greenColor,
  },
  section: {
    flex: 1,
  },
  chipsListContainer: {
    minHeight: 42,
    width: "100%",
  },

  chipsContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: 8,
    paddingRight: 12,
  },
  stepHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  stepNumber: {
    width: 28,
    height: 28,
    marginRight: 10,
    borderRadius: 14,
    backgroundColor: Colors.greenColorLight,
    alignItems: "center",
    justifyContent: "center",
  },
  stepNumberText: {
    color: Colors.greenColor,
    fontSize: 13,
    fontWeight: "800",
  },
  stepTextBlock: {
    flex: 1,
  },
  stepTitle: {
    color: Colors.grey900,
    fontSize: 14,
    fontWeight: "700",
  },
  stepHint: {
    marginTop: 2,
    color: Colors.grey500,
    fontSize: 12,
  },

  chip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ECFDF3",
    borderWidth: 1,
    borderColor: "#C6F0D5",
    paddingLeft: 10,
    paddingRight: 4,
    paddingVertical: 7,
    borderRadius: 10,
    marginRight: 8,
    maxWidth: 220,
    overflow: "hidden",
  },
  chipTextWrap: {
    flexShrink: 1,
    minWidth: 0,
    maxWidth: 135,
  },
  chipIcon: {
    flexShrink: 0,
    width: 28,
    height: 28,
    marginRight: 7,
    borderRadius: 6,
    backgroundColor: Colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
  chipText: {
    color: "#175C35",
    fontSize: 13,
    fontWeight: "700",
  },
  chipStateNumber: {
    marginTop: 1,
    color: "#527260",
    fontSize: 11,
    fontWeight: "600",
  },
  clearButton: {
    flexShrink: 0,
    width: 28,
    height: 28,
    marginLeft: 6,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  actionsRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 18,
    marginTop: 4,
  },
  primaryButton: {
    flex: 1,
    minHeight: 46,
    paddingHorizontal: 14,
    flexDirection: "row",
    gap: 7,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.greenColor,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonText: {
    color: Colors.greenColor,
    fontWeight: "700",
  },
  secondaryButton: {
    paddingHorizontal: 14,
    justifyContent: "center",
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
  },
  secondaryButtonText: {
    color: Colors.grey700,
    fontWeight: "600",
  },
  placeholderBlock: {
    paddingVertical: 8,
  },
  selectedFieldSpacing: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.grey800,
    marginBottom: 8,
  },
  placeholderText: {
    fontSize: 14,
    lineHeight: 20,
    color: Colors.grey600,
  },
  emptyInlineText: {
    color: Colors.grey500,
    fontSize: 13,
  },
});
