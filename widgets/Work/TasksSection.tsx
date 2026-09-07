import React, { useCallback, useEffect, useRef, useState } from "react";
import { Alert, FlatList, View } from "react-native";

import { ProductionTask } from "../../entities/productionTask";
import { useAuth } from "../../entities/auth/lib/useAuth";

import { ZonesModal } from "././components/ZonesModal";
import { CostsModal } from "././components/CostsModal";
import { CreateTaskButton } from "././components/CreateTaskButton";
import { styles } from "./styles";
import { router } from "expo-router";
import { TaskFormModals } from "./TaskFormModals";
import { TaskList } from "./TaskList";
import { TaskListControls } from "./TaskListControls";
import { useTaskFormModalState } from "./useTaskFormModalState";
import { useTaskDeletion } from "./useTaskDeletion";
import { useTaskListFilters } from "./useTaskListFilters";

type Props = {
  productionTasks: ProductionTask[];
  isConnected: boolean;

  isLoading: boolean;
  refreshing: boolean;
  isLoadingMore?: boolean;
  hasMore?: boolean;
  serverFiltering?: boolean;

  isCreatingTask?: boolean;
  isUpdatingTask?: boolean;
  isDeletingTask?: boolean;
  isActionLoading?: boolean;

  taskActionError?: string | null;

  onRefresh?: () => void;
  onLoadMore?: () => void;
  onFiltersChange?: (filters: {
    search: string;
    taskTypes: number[];
  }) => void;

  onCreateFieldTask?: (data: any) => Promise<boolean>;
  onUpdateAllProductionTask?: (data: any) => Promise<boolean>;
  onDeleteTask?: (data: any) => Promise<boolean>;
};

export const TasksSection = ({
  productionTasks,
  isConnected,

  isLoading,
  refreshing,
  isLoadingMore = false,
  hasMore = false,
  serverFiltering = false,

  isCreatingTask = false,
  isUpdatingTask = false,
  isDeletingTask = false,
  isActionLoading = false,

  taskActionError,

  onRefresh,
  onLoadMore,
  onFiltersChange,
  onCreateFieldTask,
  onUpdateAllProductionTask,
  onDeleteTask,
}: Props) => {
  const tasksListRef = useRef<FlatList<ProductionTask>>(null);
  const lastShownActionErrorRef = useRef<string | null>(null);
  const {
    activeTaskChip,
    setActiveTaskChip,
    searchQuery,
    setSearchQuery,
    filteredTasks,
  } = useTaskListFilters({
    productionTasks,
    serverFiltering,
    onFiltersChange,
  });

  const [zonesModalVisible, setZonesModalVisible] = useState(false);
  const [selectedZones, setSelectedZones] = useState<string[]>([]);

  const [costsModalVisible, setCostsModalVisible] = useState(false);
  const [selectedCosts, setSelectedCosts] = useState<{
    costs_per_ha?: number | null;
    total_costs?: number | null;
  } | null>(null);

  const [isTaskListScrolling, setIsTaskListScrolling] = useState(false);
  const {
    activeType: activeTaskFormType,
    currentTask: taskFormCurrentTask,
    openCreate: openCreateTaskForm,
    openEdit: openEditTask,
    close: closeTaskForm,
  } = useTaskFormModalState();

  useEffect(() => {
    if (!taskActionError) {
      lastShownActionErrorRef.current = null;
      return;
    }

    if (lastShownActionErrorRef.current === taskActionError) {
      return;
    }

    lastShownActionErrorRef.current = taskActionError;
    Alert.alert("Не удалось выполнить действие", taskActionError);
  }, [taskActionError]);

  const { getValidAccessToken } = useAuth();
  const confirmDeleteTask = useTaskDeletion({
    isConnected,
    getValidAccessToken,
    onDeleteTask,
  });

  const resetTasksScroll = useCallback(() => {
    tasksListRef.current?.scrollToOffset({ offset: 0, animated: false });
  }, []);
  const handleTaskListScrollStart = useCallback(() => {
    setIsTaskListScrolling(true);
  }, []);
  const handleTaskListScrollEnd = useCallback(() => {
    setIsTaskListScrolling(false);
  }, []);

  useEffect(() => {
    const animationFrame = requestAnimationFrame(resetTasksScroll);

    return () => {
      cancelAnimationFrame(animationFrame);
    };
  }, [activeTaskChip, resetTasksScroll]);

  const openCreateTaskPicker = useCallback(() => {
    openCreateTaskForm("field");
  }, [openCreateTaskForm]);

  const openZonesModal = useCallback((zones: string[]) => {
    setSelectedZones(zones);
    setZonesModalVisible(true);
  }, []);

  const openCostsModal = useCallback((item: ProductionTask) => {
    setSelectedCosts({
      costs_per_ha: item?.costs_per_ha,
      total_costs: item?.total_costs,
    });

    setCostsModalVisible(true);
  }, []);

  const openTaskPage = useCallback((item: ProductionTask) => {
    router.push({
      pathname: "/production/tasks/[id]",
      params: {
        id: item.id,
        taskTypeId: item.task_type?.id,
        taskSnapshot: JSON.stringify(item),
      },
    });
  }, []);

  return (
    <>
      <View style={styles.tasksContainer}>
        <TaskListControls
          activeTaskFilter={activeTaskChip}
          searchQuery={searchQuery}
          onFilterChange={setActiveTaskChip}
          onSearchQueryChange={setSearchQuery}
        />

        <TaskList
          ref={tasksListRef}
          tasks={filteredTasks}
          isLoading={isLoading}
          isLoadingMore={isLoadingMore}
          hasMore={hasMore}
          refreshing={refreshing}
          searchQuery={searchQuery}
          onRefresh={onRefresh}
          onLoadMore={onLoadMore}
          onEdit={openEditTask}
          onDelete={confirmDeleteTask}
          onOpenZones={openZonesModal}
          onOpenCosts={openCostsModal}
          onOpenTask={openTaskPage}
          onScrollStart={handleTaskListScrollStart}
          onScrollEnd={handleTaskListScrollEnd}
        />
      </View>

      {!isTaskListScrolling && (
        <CreateTaskButton onPress={openCreateTaskPicker} />
      )}

      <ZonesModal
        visible={zonesModalVisible}
        zones={selectedZones}
        onClose={() => setZonesModalVisible(false)}
      />

      <CostsModal
        visible={costsModalVisible}
        costs={selectedCosts}
        onClose={() => setCostsModalVisible(false)}
      />

      <TaskFormModals
        activeType={activeTaskFormType}
        currentTask={taskFormCurrentTask}
        isSubmitting={isCreatingTask || isUpdatingTask}
        isActionLoading={isActionLoading}
        onClose={closeTaskForm}
        onCreateFieldTask={onCreateFieldTask}
        onUpdateAllProductionTask={onUpdateAllProductionTask}
      />
    </>
  );
};
