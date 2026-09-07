import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useMemo, useState } from "react";
import {
  Alert,
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
} from "react-native";
import { TaskCardListProps } from "../../../../src/types/map.types";
import Colors from "../../../../shared/styles/Colors";
import { TaskCard } from "./TaskCard";

const TaskCardList: React.FC<TaskCardListProps> = ({
  tasks,
  onShowTrack,
  onHideTrack,
}) => {
  const [activeTaskId, setActiveTaskId] = useState<number | string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTasks = useMemo(() => {
    const query = searchQuery.trim().toLocaleLowerCase("ru-RU");

    if (!query) {
      return tasks;
    }

    return tasks.filter((task) =>
      String(task?.work_standard?.name ?? "")
        .toLocaleLowerCase("ru-RU")
        .includes(query),
    );
  }, [searchQuery, tasks]);

  const handleToggleTrack = useCallback(
    async (task: any) => {
      const taskId = task?.id;

      if (taskId == null) return;

      try {
        if (activeTaskId === taskId) {
          await onHideTrack?.(task);
          setActiveTaskId(null);
          return;
        }

        const prevTask = tasks.find((item) => item?.id === activeTaskId);

        if (prevTask) {
          await onHideTrack?.(prevTask);
        }

        const trackLoaded = await onShowTrack?.(task);

        if (trackLoaded === false) {
          Alert.alert(
            "Трек не найден",
            "Для выбранного задания нет данных трека.",
          );
          return;
        }

        setActiveTaskId(taskId);
      } catch (error) {
        console.log("task track toggle error", error);
        setActiveTaskId(null);
        Alert.alert("Не удалось показать трек", "Попробуйте еще раз.");
      }
    },
    [activeTaskId, onHideTrack, onShowTrack, tasks],
  );

  if (!tasks?.length) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Нет задач для отображения</Text>
      </View>
    );
  }

  return (
    <View>
      <View style={styles.listHeader}>
        <Text style={styles.listTitle}>Все задания</Text>
        <View style={styles.countBadge}>
          <Text style={styles.countBadgeText}>{tasks.length}</Text>
        </View>
      </View>

      <View style={styles.search}>
        <Ionicons name="search-outline" size={19} color={Colors.grey600} />

        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Найти задание"
          placeholderTextColor={Colors.grey500}
          style={styles.searchInput}
          returnKeyType="search"
          autoCorrect={false}
        />

        {!!searchQuery && (
          <Pressable
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Очистить поиск"
            onPress={() => setSearchQuery("")}
            style={styles.clearSearch}
          >
            <Ionicons
              name="close-circle"
              size={19}
              color={Colors.grey500}
            />
          </Pressable>
        )}
      </View>

      {filteredTasks.length > 0 ? (
        <View style={styles.listContent}>
          {filteredTasks.map((item, index) => (
            <TaskCard
              key={String(item?.id ?? index)}
              task={item}
              isActive={activeTaskId === item?.id}
              onToggleTrack={handleToggleTrack}
            />
          ))}
        </View>
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Задания не найдены</Text>
        </View>
      )}
    </View>
  );
};

export default TaskCardList;

const styles = StyleSheet.create({
  search: {
    height: 44,
    marginBottom: 14,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: "#D0D5DD",
    borderRadius: 12,
    backgroundColor: "#F8F9FA",
  },

  listHeader: {
    minHeight: 32,
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
  },

  listTitle: {
    color: Colors.grey900,
    fontSize: 15,
    fontWeight: "700",
  },

  countBadge: {
    minWidth: 26,
    height: 24,
    marginLeft: 8,
    paddingHorizontal: 7,
    borderRadius: 12,
    backgroundColor: "#EEF1EF",
    alignItems: "center",
    justifyContent: "center",
  },

  countBadgeText: {
    color: Colors.grey700,
    fontSize: 12,
    fontWeight: "700",
  },

  searchInput: {
    flex: 1,
    minWidth: 0,
    paddingVertical: 7,
    fontSize: 14,
    color: Colors.grey800,
  },

  clearSearch: {
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
  },

  listContent: {
    paddingBottom: 20,
  },

  emptyContainer: {
    paddingVertical: 24,
    alignItems: "center",
    justifyContent: "center",
  },

  emptyText: {
    fontSize: 14,
    color: "#6B7280",
  },
});
