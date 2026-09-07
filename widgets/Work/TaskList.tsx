import { Text } from "@ui-kitten/components";
import React, {
  forwardRef,
  memo,
  useCallback,
  useMemo,
} from "react";
import {
  ActivityIndicator,
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  RefreshControl,
  View,
} from "react-native";

import type { ProductionTask } from "../../entities/productionTask";
import Colors from "../../shared/styles/Colors";
import { TaskCard } from "./components/TaskCard";
import { styles } from "./styles";

type Props = {
  tasks: ProductionTask[];
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  refreshing: boolean;
  searchQuery: string;
  onRefresh?: () => void;
  onLoadMore?: () => void;
  onEdit: (item: ProductionTask) => void;
  onDelete: (item: ProductionTask) => void;
  onOpenZones: (zones: string[]) => void;
  onOpenCosts: (item: ProductionTask) => void;
  onOpenTask: (item: ProductionTask) => void;
  onScrollStart?: () => void;
  onScrollEnd?: () => void;
};

const TaskListComponent = forwardRef<FlatList<ProductionTask>, Props>(
  (
    {
      tasks,
      isLoading,
      isLoadingMore,
      hasMore,
      refreshing,
      searchQuery,
      onRefresh,
      onLoadMore,
      onEdit,
      onDelete,
      onOpenZones,
      onOpenCosts,
      onOpenTask,
      onScrollStart,
      onScrollEnd,
    },
    ref,
  ) => {
    const renderTaskItem = useCallback(
      ({ item }: { item: ProductionTask }) => (
        <TaskCard
          item={item}
          onEdit={onEdit}
          onDelete={onDelete}
          onOpenZones={onOpenZones}
          onOpenCosts={onOpenCosts}
          onOpenTask={onOpenTask}
        />
      ),
      [onDelete, onEdit, onOpenCosts, onOpenTask, onOpenZones],
    );

    const emptyComponent = useMemo(() => {
      if (isLoading) {
        return (
          <View style={styles.tasksEmptyState}>
            <ActivityIndicator color={Colors.greenColor} />
            <Text style={styles.tasksEmptyTitle}>Загрузка заданий...</Text>
          </View>
        );
      }

      return (
        <View style={styles.tasksEmptyState}>
          <Text style={styles.tasksEmptyTitle}>
            {searchQuery.trim()
              ? "По вашему запросу заданий не найдено"
              : "Заданий пока нет"}
          </Text>
        </View>
      );
    }, [isLoading, searchQuery]);

    const keyExtractor = useCallback(
      (item: ProductionTask, index: number) => String(item?.id ?? index),
      [],
    );

    const loadMore = useCallback(() => {
      if (hasMore && !isLoadingMore) {
        onLoadMore?.();
      }
    }, [hasMore, isLoadingMore, onLoadMore]);
    const handleScrollEndDrag = useCallback(
      (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const velocity = Math.abs(event.nativeEvent.velocity?.y ?? 0);

        if (velocity < 0.1) {
          onScrollEnd?.();
        }
      },
      [onScrollEnd],
    );

    return (
      <FlatList
        ref={ref}
        style={styles.tasksList}
        data={tasks}
        keyExtractor={keyExtractor}
        renderItem={renderTaskItem}
        ListEmptyComponent={emptyComponent}
        contentContainerStyle={[
          styles.listContent,
          tasks.length === 0 && styles.emptyListContent,
        ]}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews
        initialNumToRender={8}
        maxToRenderPerBatch={8}
        windowSize={7}
        updateCellsBatchingPeriod={50}
        keyboardShouldPersistTaps="handled"
        onScrollBeginDrag={onScrollStart}
        onScrollEndDrag={handleScrollEndDrag}
        onMomentumScrollBegin={onScrollStart}
        onMomentumScrollEnd={onScrollEnd}
        onEndReachedThreshold={0.35}
        onEndReached={loadMore}
        ListFooterComponent={
          isLoadingMore ? (
            <View style={styles.tasksFooterLoader}>
              <ActivityIndicator color={Colors.greenColor} />
            </View>
          ) : null
        }
        refreshControl={
          onRefresh ? (
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[Colors.greenColor]}
              tintColor={Colors.greenColor}
              progressBackgroundColor={Colors.white}
            />
          ) : undefined
        }
      />
    );
  },
);

TaskListComponent.displayName = "TaskList";

export const TaskList = memo(TaskListComponent);
