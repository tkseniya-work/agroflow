import { Ionicons } from "@expo/vector-icons";
import React, { memo, useCallback, useRef, useState } from "react";
import {
  Animated,
  Keyboard,
  Pressable,
  TextInput,
  View,
} from "react-native";

import { TASK_FILTERS } from "../../src/constants/tasks";
import Colors from "../../shared/styles/Colors";
import type { TaskFilterType } from "../../src/utils/taskUtils";
import { TaskFilters } from "./components/TaskFilters";
import { styles } from "./styles";

type Props = {
  activeTaskFilter: TaskFilterType;
  searchQuery: string;
  onFilterChange: (filter: TaskFilterType) => void;
  onSearchQueryChange: (query: string) => void;
};

const TaskListControlsComponent = ({
  activeTaskFilter,
  searchQuery,
  onFilterChange,
  onSearchQueryChange,
}: Props) => {
  const searchInputRef = useRef<TextInput>(null);
  const searchAnimation = useRef(new Animated.Value(0)).current;
  const [searchVisible, setSearchVisible] = useState(false);

  const openSearch = useCallback(() => {
    if (searchVisible) return;

    setSearchVisible(true);
    Animated.timing(searchAnimation, {
      toValue: 1,
      duration: 220,
      useNativeDriver: false,
    }).start(() => {
      searchInputRef.current?.focus();
    });
  }, [searchAnimation, searchVisible]);

  const closeSearch = useCallback(() => {
    Keyboard.dismiss();
    onSearchQueryChange("");
    setSearchVisible(false);

    Animated.timing(searchAnimation, {
      toValue: 0,
      duration: 220,
      useNativeDriver: false,
    }).start();
  }, [onSearchQueryChange, searchAnimation]);

  return (
    <View style={styles.taskControls}>
      <Animated.View
        accessibilityLabel="Фильтры заданий"
        pointerEvents={searchVisible ? "none" : "auto"}
        style={[
          styles.taskFilterRow,
          {
            opacity: searchAnimation.interpolate({
              inputRange: [0, 0.5],
              outputRange: [1, 0],
            }),
            transform: [
              {
                translateX: searchAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -20],
                }),
              },
            ],
          },
        ]}
      >
        <TaskFilters
          filters={TASK_FILTERS}
          activeTaskChip={activeTaskFilter}
          onChange={onFilterChange}
          onSearch={openSearch}
        />
      </Animated.View>

      <Animated.View
        accessibilityLabel="Строка поиска заданий"
        accessibilityState={{ expanded: searchVisible }}
        pointerEvents={searchVisible ? "auto" : "none"}
        style={[
          styles.taskSearch,
          {
            opacity: searchAnimation,
            transform: [
              {
                translateX: searchAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [24, 0],
                }),
              },
            ],
          },
        ]}
      >
        <Pressable
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Закрыть поиск"
          onPress={closeSearch}
          style={styles.taskSearchAction}
        >
          <Ionicons name="arrow-back" size={20} color={Colors.grey700} />
        </Pressable>

        <TextInput
          ref={searchInputRef}
          value={searchQuery}
          onChangeText={onSearchQueryChange}
          placeholder="Название или комментарий"
          placeholderTextColor={Colors.grey600}
          style={styles.taskSearchInput}
          returnKeyType="search"
          autoCorrect={false}
        />

        {!!searchQuery && (
          <Pressable
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel="Очистить поиск"
            onPress={() => onSearchQueryChange("")}
            style={styles.taskSearchAction}
          >
            <Ionicons name="close-circle" size={20} color={Colors.grey600} />
          </Pressable>
        )}
      </Animated.View>
    </View>
  );
};

export const TaskListControls = memo(TaskListControlsComponent);
