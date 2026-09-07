import { router } from "expo-router";
import React, { useMemo, useRef, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { FieldProductionTaskResponse } from "../../../../entities/productionTask/model/fieldProductionTask.interface";
import { useCompanyInfo } from "../../../../features/localData/useLocalData";
import MapboxOfflineMap from "../../../OfflineMap/MapboxOfflineMap";
import { Coordinate } from "../../../../src/types/map.types";
import { convertJsonStringToMapboxArray } from "../../../../src/utils/mapUtils";
import { useSeasonFields, SeasonFieldRequest } from "../../../../entities/season";
import { useAuth } from "../../../../entities/auth/lib/useAuth";
import { useTechniqueMonitoringActions } from "../../../../entities/techniqueMonitoring";
import { useProductionTasks } from "../../../../entities/productionTask/lib/useProductionTasks";
import { useNetworkStatus } from "../../../../shared/lib/useNetworkStatus";
import { TaskInfoCard } from "../Edit/TaskInfoCard";
import { DetailTabs, TaskDetailTab } from "./task-detail/DetailTabs";
import {
  TaskAnalytics,
  TechniqueAnalytics,
} from "./task-detail/TaskAnalytics";
import { TaskMapAndShifts } from "./task-detail/TaskMapAndShifts";
import { TaskDetailHeader } from "./task-detail/TaskDetailHeader";
import { TaskDetailMapModal } from "./task-detail/TaskDetailMapModal";
import { useTaskDetailAnalytics } from "./task-detail/useTaskDetailAnalytics";
import { useTaskDetailMapFields } from "./task-detail/useTaskDetailMapFields";
import { useTaskDetailTrack } from "./task-detail/useTaskDetailTrack";
import { useTaskStatusActions } from "./task-detail/useTaskStatusActions";

type Props = {
  currentTask: FieldProductionTaskResponse;
  onReload?: () => void | Promise<void>;
};

export const TaskDetailScreen = ({ currentTask, onReload }: Props) => {
  const insets = useSafeAreaInsets();
  const currentLocationRef = useRef<[number, number] | null>(null);
  const fullMapLocationRef = useRef<[number, number] | null>(null);
  const companyInfo = useCompanyInfo();
  const { getValidAccessToken } = useAuth();
  const { isConnected } = useNetworkStatus();
  const { loadProductionTaskTrack } = useTechniqueMonitoringActions();
  const {
    updateTaskStatus,
    getCurrentFieldTaskAnalytic,
    getProductionFieldTaskGroupedParts,
    addProductionTaskField,
    removeProductionTaskField,
  } = useProductionTasks({
    status: [],
    autoLoad: false,
  });
  const [activeTab, setActiveTab] = useState<TaskDetailTab>("info");
  const { fields: seasonFields } = useSeasonFields({
    initialSeasonYear: currentTask.season_year,
  });
  const { confirmCompleteTask, confirmResumeTask } = useTaskStatusActions({
    taskId: currentTask.id,
    isConnected,
    getValidAccessToken,
    updateTaskStatus,
    onReload,
  });

  const isActiveTask = currentTask.status?.id === 1;
  const isArchivedTask = currentTask.status?.id === 2;

  const companyLocation = useMemo(() => {
    return companyInfo
      ? (convertJsonStringToMapboxArray(companyInfo.location) as Coordinate)
      : ([0, 0] as Coordinate);
  }, [companyInfo]);

  const fields = currentTask.field_task?.task_fields ?? [];
  const taskTechniques = currentTask.field_task?.techniques ?? [];
  const { analyticByFields, isLoading: isAnalyticsLoading } =
    useTaskDetailAnalytics({
      isActive: activeTab === "analytics",
      currentTask,
      fields,
      getValidAccessToken,
      getProductionFieldTaskGroupedParts,
      getCurrentFieldTaskAnalytic,
    });
  const {
    isTrackLoading,
    selectedTaskTechniqueId,
    setSelectedTaskTechniqueId,
    selectedTrack,
    selectedTrackLines,
    selectedMapTechnique,
  } = useTaskDetailTrack({
    isActive: activeTab === "mapShifts",
    taskId: currentTask.id,
    taskTechniques,
    getValidAccessToken,
    loadProductionTaskTrack,
  });
  const {
    isMapModalVisible,
    selectedMapFieldIds,
    selectedFieldIds,
    isSavingMapFields,
    openMap,
    closeMap,
    toggleMapField,
    saveMapFields,
  } = useTaskDetailMapFields({
    taskId: currentTask.id,
    fields,
    getValidAccessToken,
    addProductionTaskField,
    removeProductionTaskField,
    onReload,
  });

  const mapFields = useMemo<SeasonFieldRequest[]>(() => {
    if (seasonFields.length > 0) return seasonFields;

    return fields.map((field) => ({
      id: field.season_field?.id ?? field.id,
      company_id: "",
      id_1c: field.id_1c ?? field.season_field?.id_1c ?? null,
      number: field.number ?? field.season_field?.number ?? "",
      name: field.name ?? field.season_field?.name ?? "",
      area: field.area ?? field.season_field?.area ?? 0,
      map_area: field.map_area ?? field.season_field?.map_area ?? 0,
      srid: field.srid ?? 4326,
      ground_type: field.ground_type ?? field.season_field?.ground_type ?? 0,
      coordinates: field.coordinates,
      origin_field_id:
        field.origin_field_id ?? field.season_field?.origin_field_id ?? "",
      crop_rotation: {
        clean_fallow: false,
        crop: null,
      },
      production_plan_id: field.plan_work?.production_plan_id ?? null,
      year: field.season_field?.year ?? field.season ?? currentTask.season_year,
      events: [],
      evaluation: null,
      yield_forecast: null,
      additional_info: null,
    }));
  }, [currentTask.season_year, fields, seasonFields]);

  const techniqueAnalytics = analyticByFields.techniques;

  const renderTaskMap = (height: number | "100%") => {
    const expanded = height === "100%" || height > 300;
    const mapSelectedFieldIds =
      expanded ? (selectedMapFieldIds ?? selectedFieldIds) : selectedFieldIds;

    return (
      <View style={[styles.mapContainer, { height }]}>
        <MapboxOfflineMap
          companyLocation={companyLocation}
          fields={mapFields}
          selectedFieldIds={mapSelectedFieldIds}
          fitToSelectedFields={!expanded || selectedMapFieldIds === null}
          fitToSelectedFieldsPadding={8}
          fieldDisplayMode="taskView"
          currentLocationRef={
            expanded ? fullMapLocationRef : currentLocationRef
          }
          selectedField={null}
          onSelectedFieldChange={(field) => {
            if (expanded && field?.id) {
              const fieldId = String(field.id);

              toggleMapField(fieldId);
            }
          }}
          viewMode="standard"
          tracks={selectedTrackLines}
          technique={selectedMapTechnique}
          showTechniqueLabels={false}
          hasLocationPermission={false}
          showUserLocation
          initZoom={10}
          captureGestures={!expanded}
        />
      </View>
    );
  };

  const renderActiveTab = () => {
    if (activeTab === "mapShifts") {
      return (
        <TaskMapAndShifts
          currentTask={currentTask}
          isTrackLoading={isTrackLoading}
          selectedTrack={selectedTrack}
          selectedTrackLines={selectedTrackLines}
          taskTechniques={taskTechniques}
          selectedTaskTechniqueId={selectedTaskTechniqueId}
          onSelectTaskTechnique={setSelectedTaskTechniqueId}
          onOpenMap={openMap}
          renderTaskMap={renderTaskMap}
        />
      );
    }

    if (activeTab === "analytics") {
      return (
        <View style={styles.analyticsStack}>
          <TaskAnalytics
            analyticByFields={analyticByFields}
            isLoading={isAnalyticsLoading}
          />
          {!isAnalyticsLoading && (
            <TechniqueAnalytics techniques={techniqueAnalytics} />
          )}
        </View>
      );
    }

    return <TaskInfoCard currentTask={currentTask} />;
  };

  return (
    <View style={styles.container}>
      <TaskDetailHeader
        isActiveTask={isActiveTask}
        isArchivedTask={isArchivedTask}
        onBack={() => router.back()}
        onEdit={() =>
          router.push({
            pathname: "/production/tasks/[id]/edit",
            params: { id: currentTask.id },
          })
        }
        onComplete={confirmCompleteTask}
        onResume={confirmResumeTask}
      />

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: Math.max(40, insets.bottom + 24) },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <DetailTabs activeTab={activeTab} onChange={setActiveTab} />

        {renderActiveTab()}
      </ScrollView>

      <TaskDetailMapModal
        visible={isMapModalVisible}
        trackLinesCount={selectedTrackLines.length}
        isSaving={isSavingMapFields}
        onClose={closeMap}
        onSave={saveMapFields}
        renderMap={() => renderTaskMap("100%")}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F6F8FA",
  },
  content: {
    padding: 16,
    paddingBottom: 40,
    gap: 14,
  },
  analyticsStack: {
    gap: 14,
  },
  mapContainer: {
    height: 250,
  },
});
