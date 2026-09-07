import { Ionicons } from "@expo/vector-icons";
import { Text } from "@ui-kitten/components";
import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Pressable, View } from "react-native";

import Colors from "../../../../../shared/styles/Colors";
import type { ShiftPartDetails } from "../../../../../src/types/task.types";
import {
  formatRussianDate,
  getEmployeeId,
  getEmployeeName,
  getEmployeePosition,
  getEmployeeShiftGroups,
  getEmployeeShortName,
  getLatestOpenAt,
  getShiftAggregates,
  isToday,
} from "../../../../../src/utils/taskUtils";
import { CombinedWorkBlock } from "./CombinedWorkBlock";
import { styles } from "./styles";

type Props = {
  taskId: string;
  groups: any[];
  employees: any[];
  shiftSettings?: any;
  isLoading: boolean;
  deletingPartId: string | null;
  showDateRangeSwitch?: boolean;
  onOpenDetails: (details: ShiftPartDetails) => void;
  onEditPart: (details: ShiftPartDetails) => void;
  onDeletePart: (details: ShiftPartDetails) => void;
};

const TaskShiftGroupsComponent = ({
  taskId,
  groups,
  employees,
  shiftSettings,
  isLoading,
  deletingPartId,
  showDateRangeSwitch = true,
  onOpenDetails,
  onEditPart,
  onDeletePart,
}: Props) => {
  const [openDates, setOpenDates] = useState<Set<string>>(new Set());
  const [showAllDates, setShowAllDates] = useState(false);
  const initializedTaskIdRef = useRef<string | null>(null);

  const employeesById = useMemo(
    () =>
      new Map(
        employees
          .map((employee: any) => {
            const employeeId =
              employee?.employees?.id ?? employee?.employee?.id ?? employee?.id;

            return employeeId != null
              ? ([String(employeeId), employee] as const)
              : null;
          })
          .filter(
            (item): item is readonly [string, any] => item !== null,
          ),
      ),
    [employees],
  );

  const sortedGroups = useMemo(
    () =>
      [...groups]
        .map((group) => ({
          ...group,
          employees_task_parts: [
            ...(group.employees_task_parts ||
              group.employeesTaskParts ||
              group.employee_shifts_parts ||
              group.employeeShiftsParts ||
              group.employees ||
              group.employee_parts ||
              []),
          ].sort((a, b) => getLatestOpenAt(b) - getLatestOpenAt(a)),
        }))
        .sort(
          (a, b) =>
            new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime(),
        ),
    [groups],
  );

  useEffect(() => {
    if (!sortedGroups.length) return;
    if (initializedTaskIdRef.current === taskId) return;

    const latestDate = sortedGroups[0].date;

    if (latestDate) {
      setOpenDates(new Set([latestDate]));
      initializedTaskIdRef.current = taskId;
    }
  }, [sortedGroups, taskId]);

  const toggleDate = useCallback((date: string) => {
    setOpenDates((previous) => {
      const next = new Set(previous);

      if (next.has(date)) {
        next.delete(date);
      } else {
        next.add(date);
      }

      return next;
    });
  }, []);

  const visibleGroups =
    !showDateRangeSwitch || showAllDates
      ? sortedGroups
      : sortedGroups.slice(0, 7);
  const hasHiddenDates =
    showDateRangeSwitch && sortedGroups.length > 7;

  if (isLoading && !groups.length) {
    return (
      <View style={styles.loadingBox}>
        <ActivityIndicator size="small" color={Colors.greenColor} />
        <Text style={styles.emptyText}>Загружаем смены</Text>
      </View>
    );
  }

  if (!sortedGroups.length) {
    return (
      <View style={styles.emptyBox}>
        <Ionicons name="calendar-outline" size={26} color="#98A2B3" />
        <Text style={styles.emptyText}>Нет данных о сменах</Text>
      </View>
    );
  }

  return (
    <View style={styles.groupList}>
      {hasHiddenDates && (
        <View style={styles.dateRangeSwitch}>
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ selected: !showAllDates }}
            style={[
              styles.dateRangeButton,
              !showAllDates && styles.dateRangeButtonActive,
            ]}
            onPress={() => setShowAllDates(false)}
          >
            <Text
              style={[
                styles.dateRangeButtonText,
                !showAllDates && styles.dateRangeButtonTextActive,
              ]}
            >
              Последние 7
            </Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ selected: showAllDates }}
            style={[
              styles.dateRangeButton,
              showAllDates && styles.dateRangeButtonActive,
            ]}
            onPress={() => setShowAllDates(true)}
          >
            <Text
              style={[
                styles.dateRangeButtonText,
                showAllDates && styles.dateRangeButtonTextActive,
              ]}
            >
              Все даты
            </Text>
          </Pressable>
        </View>
      )}

      {!!deletingPartId && (
        <View style={styles.deletingStatus}>
          <ActivityIndicator size="small" color={Colors.error} />
          <Text style={styles.deletingStatusText}>Удаляем отрезок...</Text>
        </View>
      )}

      {visibleGroups.map((group: any) => {
        const date = String(group.date ?? "");
        const open = openDates.has(date);
        const today = isToday(date);
        const count = group.employees_task_parts?.length ?? 0;
        const formattedDate = formatRussianDate(date);

        return (
          <View key={`task-shift-date-${date}`} style={styles.dateGroup}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Смены за ${formattedDate}`}
              accessibilityState={{ expanded: open }}
              style={[styles.dateHeader, today && styles.dateHeaderToday]}
              onPress={() => toggleDate(date)}
            >
              <View style={styles.dateTextWrap}>
                <Text
                  style={[
                    styles.dateTitle,
                    today && styles.dateTitleToday,
                  ]}
                  numberOfLines={1}
                >
                  {formattedDate}
                </Text>

                {today && <Text style={styles.todayText}>сегодня</Text>}
              </View>

              <View style={styles.dateMetaWrap}>
                <View style={styles.employeeChip}>
                  <Text style={styles.employeeChipText}>{count} чел.</Text>
                </View>

                <Ionicons
                  name={open ? "chevron-up" : "chevron-down"}
                  size={18}
                  color="#667085"
                />
              </View>
            </Pressable>

            {open && (
              <View style={styles.employeeList}>
                {count === 0 ? (
                  <Text style={styles.noPartsText}>
                    Нет данных о сменах выработки
                  </Text>
                ) : (
                  group.employees_task_parts.map(
                    (employee: any, index: number) => {
                      const shiftGroups = getEmployeeShiftGroups(employee);
                      const workBlocks = shiftGroups.flatMap(
                        (shift: any, shiftIndex: number) =>
                          getShiftAggregates(shift).map(
                            (groupedAggregate: any, aggregateIndex: number) => ({
                              key: `combined-work-${date}-${index}-${shiftIndex}-${aggregateIndex}`,
                              shift,
                              groupedAggregate,
                            }),
                          ),
                      );
                      const employeeId = getEmployeeId(employee);
                      const employeeFromList =
                        employeeId != null
                          ? employeesById.get(String(employeeId))
                          : null;
                      const displayEmployee = employeeFromList || employee;
                      const employeeName = employeeFromList
                        ? getEmployeeShortName(employeeFromList)
                        : getEmployeeName(employee);
                      const employeePosition =
                        getEmployeePosition(displayEmployee);
                      return (
                        <View
                          key={
                            employee.id ??
                            employee.employee_id ??
                            `task-shift-employee-${date}-${index}`
                          }
                          style={styles.employeeSection}
                        >
                          <View style={styles.employeeWorkList}>
                            {workBlocks.length === 0 ? (
                              <View style={styles.employeeEmptyCard}>
                                <Text style={styles.employeeEmptyName}>
                                  {employeeName}
                                </Text>
                                <Text style={styles.noPartsText}>
                                  Рабочие блоки не найдены
                                </Text>
                              </View>
                            ) : (
                              workBlocks.map(
                                ({ key, shift, groupedAggregate }: any) => (
                                  <CombinedWorkBlock
                                    key={key}
                                    employee={displayEmployee}
                                    employeeName={employeeName}
                                    employeePosition={employeePosition}
                                    groupedAggregate={groupedAggregate}
                                    productionShiftId={
                                      shift.production_shift_id
                                    }
                                    shiftType={shift.shift_type}
                                    shiftSettings={
                                      shift.shift_settings ??
                                      shift.shiftSettings ??
                                      shiftSettings
                                    }
                                    qrCodeScannedAt={shift.qr_code_scanned_at}
                                    onOpenDetails={onOpenDetails}
                                    onEditPart={onEditPart}
                                    onDeletePart={onDeletePart}
                                    deletingPartId={deletingPartId}
                                  />
                                ),
                              )
                            )}
                          </View>
                        </View>
                      );
                    },
                  )
                )}
              </View>
            )}
          </View>
        );
      })}
    </View>
  );
};

export const TaskShiftGroups = memo(TaskShiftGroupsComponent);
