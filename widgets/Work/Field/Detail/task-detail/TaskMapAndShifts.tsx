import { Ionicons } from "@expo/vector-icons";
import React, { memo, useCallback } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { Text } from "@ui-kitten/components";

import { FieldProductionTaskResponse } from "../../../../../entities/productionTask";
import { Track, TrackItem } from "../../../../../entities/techniqueMonitoring";
import Colors from "../../../../../shared/styles/Colors";
import { TaskShifts } from "../TaskShifts";

export function TaskMapAndShifts({
  currentTask,
  isTrackLoading,
  selectedTrack,
  selectedTrackLines,
  taskTechniques,
  selectedTaskTechniqueId,
  onSelectTaskTechnique,
  onOpenMap,
  renderTaskMap,
}: {
  currentTask: FieldProductionTaskResponse;
  isTrackLoading: boolean;
  selectedTrack: Track | null;
  selectedTrackLines: TrackItem[];
  taskTechniques: any[];
  selectedTaskTechniqueId: string | null;
  onSelectTaskTechnique: (id: string) => void;
  onOpenMap: () => void;
  renderTaskMap: (height: number | "100%") => React.ReactNode;
}) {
  return (
    <>
      <View style={styles.mapCard}>
        <View style={styles.mapHeader}>
          <View style={styles.mapHeaderTextWrap}>
            <Text style={styles.mapTitle}>Карта задания</Text>
          </View>

          {isTrackLoading && (
            <ActivityIndicator size="small" color={Colors.greenColor} />
          )}

          <Pressable style={styles.mapOpenButton} onPress={onOpenMap}>
            <Ionicons
              name="expand-outline"
              size={18}
              color={Colors.greenColor}
            />
          </Pressable>
        </View>

        {taskTechniques.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.techniqueTabs}
          >
            {taskTechniques.map((item: any) => {
              const active = selectedTaskTechniqueId === item.id;

              return (
                <TechniqueTab
                  key={item.id}
                  item={item}
                  active={active}
                  onSelect={onSelectTaskTechnique}
                />
              );
            })}
          </ScrollView>
        )}

        {renderTaskMap(250)}
      </View>

      <TaskShifts currentTask={currentTask} />
    </>
  );
}

const TechniqueTab = memo(function TechniqueTab({
  item,
  active,
  onSelect,
}: {
  item: any;
  active: boolean;
  onSelect: (id: string) => void;
}) {
  const handlePress = useCallback(() => {
    onSelect(item.id);
  }, [item.id, onSelect]);

  return (
    <Pressable
      style={[styles.techniqueTab, active && styles.techniqueTabActive]}
      onPress={handlePress}
    >
      <Text
        style={[
          styles.techniqueTabText,
          active && styles.techniqueTabTextActive,
        ]}
        numberOfLines={1}
      >
        {item.technique?.name ?? "Техника"}
      </Text>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  mapCard: {
    borderRadius: 22,
    backgroundColor: Colors.white,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#EAECF0",
  },
  mapHeader: {
    minHeight: 58,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#EAECF0",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  mapHeaderTextWrap: {
    flex: 1,
    minWidth: 0,
  },
  mapTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#101828",
  },
  mapSubtitle: {
    marginTop: 2,
    fontSize: 12,
    color: "#667085",
  },
  mapOpenButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#ECFDF3",
    alignItems: "center",
    justifyContent: "center",
  },
  techniqueTabs: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  techniqueTab: {
    maxWidth: 180,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#D0D5DD",
    backgroundColor: "#F9FAFB",
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  techniqueTabActive: {
    borderColor: Colors.greenColor,
    backgroundColor: "#ECFDF3",
  },
  techniqueTabText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#667085",
  },
  techniqueTabTextActive: {
    color: Colors.greenColor,
  },
});
