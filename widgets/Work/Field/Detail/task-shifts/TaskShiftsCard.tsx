import { Ionicons } from "@expo/vector-icons";
import { Text } from "@ui-kitten/components";
import React from "react";
import { Pressable, View } from "react-native";

import Colors from "../../../../../shared/styles/Colors";
import type { ShiftPartDetails } from "../../../../../src/types/task.types";
import { TaskShiftGroups } from "./TaskShiftGroups";
import { styles } from "./styles";

type Props = {
  taskId: string;
  groups: any[];
  employees: any[];
  shiftSettings?: any;
  isLoading: boolean;
  deletingPartId: string | null;
  showDateRangeSwitch?: boolean;
  addMenuOpen: boolean;
  onToggleAddMenu: () => void;
  onOpenOnlineAdd: () => void;
  onOpenFactAdd: () => void;
  onOpenDetails: (details: ShiftPartDetails) => void;
  onEditPart: (details: ShiftPartDetails) => void;
  onDeletePart: (details: ShiftPartDetails) => void;
};

export const TaskShiftsCard = ({
  taskId,
  groups,
  employees,
  shiftSettings,
  isLoading,
  deletingPartId,
  showDateRangeSwitch = true,
  addMenuOpen,
  onToggleAddMenu,
  onOpenOnlineAdd,
  onOpenFactAdd,
  onOpenDetails,
  onEditPart,
  onDeletePart,
}: Props) => (
  <View style={styles.card}>
    <View style={styles.header}>
      <View style={styles.titleWrap}>
        <View style={styles.titleRow}>
          <Ionicons
            name="time-outline"
            size={18}
            color={Colors.greenColor}
          />
          <Text style={styles.title}>Смены</Text>
          {groups.length > 0 && (
            <View style={styles.countChip}>
              <Text style={styles.countChipText}>{groups.length} дн.</Text>
            </View>
          )}
        </View>

      </View>

      <View style={styles.addMenuWrap}>
        <Pressable
          accessibilityLabel="Добавить смену"
          accessibilityRole="button"
          accessibilityState={{ expanded: addMenuOpen }}
          style={[styles.iconButton, styles.addButton]}
          onPress={onToggleAddMenu}
        >
          <Ionicons name="add" size={22} color={Colors.white} />
        </Pressable>

        {addMenuOpen && (
          <View style={styles.addMenu}>
            <Pressable
              accessibilityLabel="Добавить онлайн-смену"
              accessibilityRole="button"
              style={styles.addMenuItem}
              onPress={onOpenOnlineAdd}
            >
              <Ionicons
                name="radio-outline"
                size={17}
                color={Colors.greenColor}
              />
              <Text style={styles.addMenuText}>Онлайн</Text>
            </Pressable>

            <Pressable
              accessibilityLabel="Добавить смену по факту"
              accessibilityRole="button"
              style={styles.addMenuItem}
              onPress={onOpenFactAdd}
            >
              <Ionicons
                name="clipboard-outline"
                size={17}
                color={Colors.greenColor}
              />
              <Text style={styles.addMenuText}>Факт</Text>
            </Pressable>
          </View>
        )}
      </View>
    </View>

    <TaskShiftGroups
      taskId={taskId}
      groups={groups}
      employees={employees}
      shiftSettings={shiftSettings}
      isLoading={isLoading}
      deletingPartId={deletingPartId}
      showDateRangeSwitch={showDateRangeSwitch}
      onOpenDetails={onOpenDetails}
      onEditPart={onEditPart}
      onDeletePart={onDeletePart}
    />
  </View>
);
