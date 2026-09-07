import { Ionicons } from "@expo/vector-icons";
import { Text } from "@ui-kitten/components";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, StyleSheet, View } from "react-native";

import Colors from "../../../../shared/styles/Colors";
import { TaskSelectedFieldItem } from "./TaskSelectedFieldItem";
import { getTaskFieldId } from "./taskFieldWorks.logic";

type Props = {
  currentTask: any;
  chosenFields: any[];
  selectedWorkIds: Record<string, string | null>;
  updatingFieldId?: string | null;
  onDeleteField: (field: any) => void;
  onToggleWork: (field: any, work: any) => void;
};

export const TaskSelectedFields = ({
  currentTask,
  chosenFields,
  selectedWorkIds,
  updatingFieldId,
  onDeleteField,
  onToggleWork,
}: Props) => {
  const [expandedFieldIds, setExpandedFieldIds] = useState<string[]>([]);
  const chosenFieldIds = useMemo(
    () => chosenFields.map((field) => getTaskFieldId(field)),
    [chosenFields],
  );
  const totalArea = useMemo(
    () => chosenFields.reduce((sum, field) => sum + (field.area ?? 0), 0),
    [chosenFields],
  );

  const handleToggleField = useCallback((fieldId: string) => {
    setExpandedFieldIds((previous) =>
      previous.includes(fieldId)
        ? previous.filter((id) => id !== fieldId)
        : [...previous, fieldId],
    );
  }, []);

  useEffect(() => {
    setExpandedFieldIds((previous) => {
      const existingIds = previous.filter((id) =>
        chosenFieldIds.includes(id),
      );
      const newIds = chosenFieldIds.filter((id) => !previous.includes(id));
      const next = [...existingIds, ...newIds];

      if (
        next.length === previous.length &&
        next.every((id, index) => id === previous[index])
      ) {
        return previous;
      }

      return next;
    });
  }, [chosenFieldIds]);

  const confirmDeleteField = (field: any) => {
    Alert.alert(
      "Удалить поле",
      "Вы действительно хотите удалить это поле из задачи?",
      [
        { text: "Отмена", style: "cancel" },
        {
          text: "Удалить",
          style: "destructive",
          onPress: () => onDeleteField(field),
        },
      ],
    );
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.titleWrap}>
          <Text style={styles.title}>Выбранные поля</Text>
          <Text style={styles.subtitle}>Поля и плановые работы</Text>
        </View>

        <View style={styles.chips}>
          <View style={styles.areaChip}>
            <Text style={styles.areaChipText}>
              {totalArea.toLocaleString("ru-RU", {
                maximumFractionDigits: 2,
              })}{" "}
              га
            </Text>
          </View>
          <View style={styles.countChip}>
            <Text style={styles.countChipText}>{chosenFields.length}</Text>
          </View>
        </View>
      </View>

      <View style={styles.divider} />

      {chosenFields.length > 0 ? (
        <View style={styles.list}>
          {chosenFields.map((field) => {
            const fieldId = getTaskFieldId(field);

            return (
              <TaskSelectedFieldItem
                key={fieldId}
                currentTask={currentTask}
                field={field}
                expanded={expandedFieldIds.includes(fieldId)}
                selectedWorkId={selectedWorkIds[fieldId] ?? null}
                isUpdating={updatingFieldId === fieldId}
                onToggle={() => handleToggleField(fieldId)}
                onDelete={() => confirmDeleteField(field)}
                onToggleWork={onToggleWork}
              />
            );
          })}
        </View>
      ) : (
        <View style={styles.emptyBox}>
          <Ionicons name="map-outline" size={22} color="#98A2B3" />
          <Text style={styles.emptyText}>Выберите поля на карте</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 22,
    backgroundColor: Colors.white,
    padding: 16,
    borderWidth: 1,
    borderColor: "#EAECF0",
    gap: 12,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  titleWrap: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    fontSize: 17,
    fontWeight: "800",
    color: "#101828",
  },
  subtitle: {
    marginTop: 2,
    fontSize: 12,
    color: "#667085",
  },
  chips: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  areaChip: {
    minHeight: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.greenColor,
    paddingHorizontal: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  areaChipText: {
    fontSize: 12,
    fontWeight: "800",
    color: Colors.greenColor,
  },
  countChip: {
    minWidth: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#F2F4F7",
    alignItems: "center",
    justifyContent: "center",
  },
  countChipText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#344054",
  },
  divider: {
    height: 1,
    backgroundColor: "#EAECF0",
  },
  emptyBox: {
    minHeight: 96,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#D0D5DD",
    backgroundColor: "#F9FAFB",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  emptyText: {
    fontSize: 14,
    color: "#667085",
  },
  list: {
    gap: 8,
  },
});
