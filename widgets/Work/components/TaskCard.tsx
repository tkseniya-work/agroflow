import { Ionicons } from "@expo/vector-icons";
import { Text } from "@ui-kitten/components";
import React, { memo, useCallback, useMemo } from "react";
import { TouchableOpacity, View } from "react-native";

import Colors from "../../../shared/styles/Colors";
import { ProductionTask } from "../../../entities/productionTask";
import {
  getTaskIcon,
  getTaskStatusText,
  getTaskTypeText,
  getTaskZones,
  isFieldTask,
} from "../../../src/utils/taskUtils";

import { SwipeTaskActions } from "./SwipeTaskActions";
import { TaskCostValue } from "./TaskCostValue";
import { TaskProgress } from "./TaskProgress";
import { styles } from "../styles";

type Props = {
  item: ProductionTask;
  onOpenZones: (zones: string[]) => void;
  onOpenCosts: (item: ProductionTask) => void;
  onEdit: (item: ProductionTask) => void;
  onDelete: (item: ProductionTask) => void;
  onOpenTask: (item: ProductionTask) => void;
};

const TaskCardComponent = ({
  item,
  onOpenZones,
  onOpenCosts,
  onEdit,
  onDelete,
  onOpenTask,
}: Props) => {
  const taskIcon = useMemo(() => getTaskIcon(item), [item]);
  const taskTypeText = useMemo(() => getTaskTypeText(item), [item]);
  const statusText = useMemo(() => getTaskStatusText(item?.status), [item?.status]);
  const zones = useMemo(() => getTaskZones(item), [item]);
  const zonesCount = item?.zones?.length || 0;

  const isField = isFieldTask(item);
  const isStationary = item?.task_type?.id === 3;
  const costsValue = isField ? item?.costs_per_ha : item?.total_costs;
  const costsUnit = isField ? "р/га" : "р";
  const dateText = useMemo(
    () =>
      item?.date_start
        ? new Date(item.date_start).toLocaleDateString("ru-RU")
        : "Дата не указана",
    [item?.date_start],
  );

  const handleOpenTask = useCallback(() => {
    onOpenTask(item);
  }, [item, onOpenTask]);

  const handleOpenZones = useCallback(
    (event: any) => {
      event.stopPropagation();
      onOpenZones(zones);
    },
    [onOpenZones, zones],
  );

  const handleOpenCosts = useCallback(
    (event: any) => {
      event.stopPropagation();
      onOpenCosts(item);
    },
    [item, onOpenCosts],
  );

  return (
    <SwipeTaskActions item={item} onEdit={onEdit} onDelete={onDelete}>
      <TouchableOpacity
        activeOpacity={isStationary ? 0.88 : 1}
        style={styles.taskCard}
        onPress={handleOpenTask}
      >
        <View style={styles.taskCardHeader}>
          <View
            style={[
              styles.taskIcon,
              {
                backgroundColor: taskIcon.backgroundColor,
              },
            ]}
          >
            <Ionicons
              name={taskIcon.name as any}
              size={20}
              color={taskIcon.color}
            />
          </View>

          <View style={styles.taskInfo}>
            <Text style={styles.taskTitle}>
              {item?.work_standard?.name || "Задание"}
            </Text>

            <Text style={styles.taskSubtitle}>
              {dateText}
            </Text>

            <Text style={styles.taskTypeText}>{taskTypeText}</Text>
          </View>

          <View
            style={[
              styles.statusBadge,
              item?.status?.id === 2 && styles.statusBadgeCompleted,
            ]}
          >
            <Text
              style={[
                styles.statusBadgeText,
                item?.status?.id === 2 && styles.statusBadgeCompletedText,
              ]}
            >
              {statusText}
            </Text>
          </View>
        </View>

        {isField && <TaskProgress item={item} />}

        <View style={styles.taskDetails}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Зоны</Text>

            <TouchableOpacity
              activeOpacity={zonesCount > 0 ? 0.75 : 1}
              disabled={zonesCount === 0}
              style={styles.zonesInlineButton}
              onPress={handleOpenZones}
            >
              <Text style={styles.zonesInlineText}>
                {zonesCount > 0 ? `${zonesCount} зон` : "Зоны не указаны"}
              </Text>

              {zonesCount > 0 && (
                <Ionicons
                  name="information-circle-outline"
                  size={18}
                  color={Colors.greenColor}
                />
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Затраты</Text>

            <TouchableOpacity
              activeOpacity={0.75}
              style={styles.costPressable}
              onPress={handleOpenCosts}
            >
              <TaskCostValue value={costsValue} unit={costsUnit} />

              <Ionicons
                name="information-circle-outline"
                size={18}
                color={Colors.greenColor}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Комментарий</Text>

            <Text style={styles.detailValue} numberOfLines={3}>
              {item?.comment || "Комментарий не указан"}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    </SwipeTaskActions>
  );
};

export const TaskCard = memo(TaskCardComponent);
