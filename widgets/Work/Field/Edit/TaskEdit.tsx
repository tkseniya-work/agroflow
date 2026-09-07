import React, { useMemo, useRef } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  StatusBar,
  View,
} from "react-native";
import { Text } from "@ui-kitten/components";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

import Colors from "../../../../shared/styles/Colors";
import MapboxOfflineMap from "../../../OfflineMap/MapboxOfflineMap";
import { useSeasonFields } from "../../../../entities/season";
import { convertJsonStringToMapboxArray } from "../../../../src/utils/mapUtils";
import { Coordinate } from "../../../../src/types/map.types";
import { useCompanyInfo } from "../../../../features/localData/useLocalData";
import { useFieldTaskEditData } from "./useFieldTaskEditData";
import { TaskConsumables } from "./TaskConsumables";
import { TaskSelectedFields } from "./TaskSelectedFields";
import { TaskTechniques } from "./TaskTechniques";
import { useAlerts } from "../../../../shared/lib/useAlerts";
import {
  TaskEditLoadError,
  TaskEditLoading,
} from "./TaskEditLoadState";
import { TaskFieldsMapModal } from "./TaskFieldsMapModal";
import { useTaskFieldSelection } from "./useTaskFieldSelection";

export const TaskEditScreen = ({ id }: { id: string }) => {
  const insets = useSafeAreaInsets();
  const currentLocationRef = useRef<[number, number] | null>(null);

  const companyInfo = useCompanyInfo();
  const { showError } = useAlerts();
  
  const {
    currentTask,
    productionFieldsList,
    techniqueWithAdditionalInfo,
    cropStandardsList,
    fertilizerStandardsList,
    pesticideStandardsList,
    sowingUnitCodeList,
    isLoading,
    isTechniqueDataLoading,
    isConsumableDataLoading,
    error,
    reload,
    saveTask,
    addTaskField,
    removeTaskField,
    addTaskTechnique,
    removeTaskTechnique,
    moveTechniqueToTask,
    saveTaskConsumableNorm,
    removeTaskConsumableNorm,
  } = useFieldTaskEditData(id);

  const fieldSelection = useTaskFieldSelection({
    currentTask,
    addTaskField,
    removeTaskField,
    saveTask,
    showError,
  });
  const {
    selectedFieldIds,
    draftSelectedFieldIds,
    selectedWorkIds,
    updatingFieldId,
  } = fieldSelection;

  const { fields } = useSeasonFields({
    initialSeasonYear: currentTask?.season_year,
    workKind: currentTask?.work_standard?.work_kind_id,
  });

  const productionMapFields = useMemo(
    () =>
      productionFieldsList
        .map((item) => item?.field ?? item)
        .filter((field) => field?.id),
    [productionFieldsList],
  );

  const mapFields =
    productionMapFields.length > 0 ? productionMapFields : fields;

  const companyLocation = useMemo(() => {
    return companyInfo
      ? (convertJsonStringToMapboxArray(companyInfo.location) as Coordinate)
      : ([0, 0] as Coordinate);
  }, [companyInfo]);

  const chosenFields = useMemo(() => {
    return selectedFieldIds.map((fieldId) => {
      const fieldWithWorks = productionFieldsList.find(
        (item) => String(item?.field?.id ?? item?.id) === fieldId,
      );
      const seasonField =
        fieldWithWorks?.field ??
        fields.find((field) => String(field.id) === fieldId);
      const taskField = currentTask?.field_task?.task_fields?.find(
        (field) => String(field.season_field?.id ?? field.id) === fieldId,
      );
      const works =
        fieldWithWorks?.works ??
        (seasonField as any)?.works ??
        (taskField?.plan_work ? [taskField.plan_work] : []);

      if (seasonField) {
        return {
          ...seasonField,
          serverSelectedWorkId: taskField?.plan_work?.id ?? null,
          serverPlanWork: taskField?.plan_work ?? null,
          taskField,
          works,
        };
      }

      return {
        id: fieldId,
        name: taskField?.name ?? taskField?.season_field?.name,
        area: taskField?.area ?? taskField?.season_field?.area,
        serverSelectedWorkId: taskField?.plan_work?.id ?? null,
        serverPlanWork: taskField?.plan_work ?? null,
        taskField,
        works,
      };
    });
  }, [currentTask, fields, productionFieldsList, selectedFieldIds]);

  if (isLoading && !currentTask) {
    return (
      <View style={styles.container}>
        <TaskEditHeader />
        <TaskEditLoading bottomInset={insets.bottom} />
      </View>
    );
  }

  if (error || !currentTask) {
    return (
      <View style={styles.container}>
        <TaskEditHeader />
        <TaskEditLoadError
          bottomInset={insets.bottom}
          onRetry={() => void reload()}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TaskEditHeader />

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: Math.max(40, insets.bottom + 24) },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.mapCard}>
          <View style={styles.mapContainer}>
            <MapboxOfflineMap
              companyLocation={companyLocation}
              fields={mapFields}
              selectedFieldIds={selectedFieldIds}
              fitToSelectedFields
              fitToSelectedFieldsPadding={8}
              currentLocationRef={currentLocationRef}
              selectedField={null}
              onSelectedFieldChange={fieldSelection.openMap}
              viewMode="standard"
              showTechniqueLabels={false}
              hasLocationPermission={false}
              showUserLocation
              initZoom={10}
            />
          </View>

          <Pressable style={styles.mapButton} onPress={fieldSelection.openMap}>
            <Ionicons name="map-outline" size={18} color={Colors.greenColor} />
            <Text style={styles.mapButtonText}>Выбрать поля на карте</Text>
            {selectedFieldIds.length > 0 && (
              <Text style={styles.mapButtonCounter}>{selectedFieldIds.length}</Text>
            )}
          </Pressable>
        </View>

        <TaskSelectedFields
          currentTask={currentTask}
          chosenFields={chosenFields}
          selectedWorkIds={selectedWorkIds}
          updatingFieldId={updatingFieldId}
          onDeleteField={fieldSelection.deleteField}
          onToggleWork={fieldSelection.toggleWork}
        />

        <TaskTechniques
          currentTask={currentTask}
          techniqueWithAdditionalInfo={techniqueWithAdditionalInfo}
          isDataLoading={isTechniqueDataLoading}
          onAddTechnique={addTaskTechnique}
          onDeleteTechnique={removeTaskTechnique}
          onMoveTechnique={moveTechniqueToTask}
        />

        <TaskConsumables
          currentTask={currentTask}
          cropStandardsList={cropStandardsList}
          fertilizerStandardsList={fertilizerStandardsList}
          pesticideStandardsList={pesticideStandardsList}
          sowingUnitCodeList={sowingUnitCodeList}
          isDataLoading={isConsumableDataLoading}
          onSaveNorm={saveTaskConsumableNorm}
          onDeleteNorm={removeTaskConsumableNorm}
        />
      </ScrollView>

      <TaskFieldsMapModal
        visible={fieldSelection.isMapOpen}
        selectedCount={draftSelectedFieldIds.length}
        isSaving={fieldSelection.isSaving}
        onClose={fieldSelection.closeMap}
        onSave={fieldSelection.saveMap}
        renderMap={() => (
          <MapboxOfflineMap
            companyLocation={companyLocation}
            fields={mapFields}
            selectedFieldIds={draftSelectedFieldIds}
            fitToSelectedFields
            fitToSelectedFieldsPadding={12}
            currentLocationRef={currentLocationRef}
            selectedField={null}
            onSelectedFieldChange={fieldSelection.toggleDraftField}
            viewMode="standard"
            showTechniqueLabels={false}
            hasLocationPermission={false}
            showUserLocation
            initZoom={10}
          />
        )}
      />
    </View>
  );
};

function TaskEditHeader() {
  return (
    <View style={styles.header}>
      <Pressable onPress={() => router.back()} style={styles.backButton}>
        <Ionicons name="chevron-back" size={21} color={Colors.black} />
      </Pressable>

      <Text style={styles.title}>Редактировать задание</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F6F8FA",
  },
  header: {
    paddingTop:
      Platform.OS === "android" ? (StatusBar.currentHeight ?? 24) + 12 : 56,
    paddingHorizontal: 16,
    paddingBottom: 14,
    backgroundColor: Colors.white,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  backButton: {
    width: 38,
    height: 38,
    // borderRadius: 19,
    // backgroundColor: "#F2F4F7",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.black,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
    gap: 14,
  },
  mapCard: {
    borderRadius: 22,
    backgroundColor: Colors.white,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#EAECF0",
  },
  mapContainer: {
    height: 210,
  },
  mapButton: {
    height: 48,
    paddingHorizontal: 14,
    borderTopWidth: 1,
    borderTopColor: "#EAECF0",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  mapButtonText: {
    flex: 1,
    color: Colors.greenColor,
    fontSize: 14,
    fontWeight: "700",
  },
  mapButtonCounter: {
    minWidth: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#ECFDF3",
    color: Colors.greenColor,
    textAlign: "center",
    lineHeight: 26,
    fontSize: 13,
    fontWeight: "800",
  },
});
