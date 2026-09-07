import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Text } from "@ui-kitten/components";
import React, { memo, useCallback, useMemo } from "react";
import { Pressable, View } from "react-native";

import { styles } from "./styles";
import {
  CombinedWorkBlockProps,
  ShiftPartDetails,
} from "../../../../../src/types/task.types";
import { getWorkTypeLabel } from "../../../../../src/utils/taskUtils";
import { EmployeeAvatar } from "../../../components/EmployeeAvatar";
import { FieldPartCard } from "./FieldPartCard";
import { collectShiftTimelineEntries } from "./ShiftTimeline.helpers";
import { ShiftTimeline } from "./ShiftTimeline";
import { TransferPartCard } from "./TransferPartCard";

function CombinedWorkBlockComponent({
  employee,
  employeeName,
  employeePosition,
  groupedAggregate,
  productionShiftId,
  shiftType,
  shiftSettings,
  qrCodeScannedAt,
  onOpenDetails,
  onEditPart,
  onDeletePart,
  deletingPartId,
}: CombinedWorkBlockProps) {
  const aggregate = groupedAggregate?.aggregate || {};
  const outputValueAggregateParts =
    groupedAggregate?.output_value_aggregate_parts ??
    groupedAggregate?.outputValueAggregateParts;
  const transferAggregateParts =
    groupedAggregate?.transfer_aggregate_parts ??
    groupedAggregate?.transferAggregateParts;
  const isTransportTask = Boolean(
    groupedAggregate?.is_transport_task ||
      groupedAggregate?.isTransportTask ||
      groupedAggregate?.task_kind === "transport",
  );
  const isProductTransportationTask = Boolean(
    groupedAggregate?.is_product_transportation_task ||
      groupedAggregate?.isProductTransportationTask ||
      groupedAggregate?.task_kind === "transportation",
  );
  const isTransportationWork =
    isTransportTask || isProductTransportationTask;
  const timelineEntries = useMemo(
    () =>
      collectShiftTimelineEntries(
        outputValueAggregateParts,
        transferAggregateParts,
      ),
    [outputValueAggregateParts, transferAggregateParts],
  );
  const technique =
    aggregate?.technique_standard ??
    aggregate?.techniqueStandard ??
    aggregate?.technique;
  const agriculturalMachine =
    aggregate?.agricultural_machine ??
    aggregate?.agriculturalMachine ??
    aggregate?.agriculture_machine;
  const techniqueName =
    technique?.machinery_model?.name ??
    technique?.machineryModel?.name ??
    technique?.name ??
    "Техника не указана";
  const techniqueLabel = [techniqueName, technique?.state_number]
    .filter(Boolean)
    .join(" · ");
  const workTypeLabel = getWorkTypeLabel(groupedAggregate);
  const groupPartIds = useMemo(
    () =>
      Array.from(
        new Set(
          timelineEntries
            .map((entry) => entry?.part?.id)
            .filter(Boolean)
            .map(String),
        ),
      ),
    [timelineEntries],
  );
  const deleteDetails = useMemo<ShiftPartDetails | null>(() => {
    if (!groupPartIds.length) return null;

    const hasFieldWork = Boolean(outputValueAggregateParts);
    const hasTransfer = Boolean(transferAggregateParts);

    return {
      type: hasFieldWork ? "field" : "transfer",
      title: employeeName,
      subtitle: workTypeLabel,
      color: isTransportTask
        ? "#2E90FA"
        : hasFieldWork
          ? "#12B76A"
          : "#2E90FA",
      icon:
        isTransportTask || !hasFieldWork
          ? "truck-fast-outline"
          : "tractor-variant",
      deleteTitle: "Удаление блока",
      deleteMessage:
        isTransportationWork
          ? "Удалить выбранный рабочий блок?\n\nБудут удалены: работа техники по транспортировке продукции с поля"
          : hasFieldWork && hasTransfer
            ? "Удалить выбранный рабочий блок?\n\nБудут удалены: работа на поле и перегон техники"
            : "Удалить выбранный рабочий блок?",
      deleteIds: groupPartIds,
      rows: [],
    };
  }, [
    employeeName,
    groupPartIds,
    isTransportationWork,
    outputValueAggregateParts,
    transferAggregateParts,
    workTypeLabel,
  ]);
  const handleDeleteGroup = useCallback(() => {
    if (deleteDetails) onDeletePart(deleteDetails);
  }, [deleteDetails, onDeletePart]);
  const isDeletingGroup = Boolean(
    deletingPartId && groupPartIds.includes(String(deletingPartId)),
  );
  const combinedCards = useMemo(() => {
    const parseTime = (value?: string | null) => {
      if (!value) return Number.NEGATIVE_INFINITY;

      const time = new Date(value).getTime();
      return Number.isNaN(time) ? Number.NEGATIVE_INFINITY : time;
    };
    const fieldCards = (
      outputValueAggregateParts?.fields_task_parts ||
      outputValueAggregateParts?.fieldsTaskParts ||
      outputValueAggregateParts?.fields ||
      []
    ).flatMap((fieldPart: any, fieldIndex: number) =>
      (
        fieldPart?.grouped_by_tariff_parts ||
        fieldPart?.groupedByTariffParts ||
        fieldPart?.tariff_parts ||
        []
      ).map((tariffPart: any, tariffIndex: number) => ({
        type: "field" as const,
        fieldPart,
        key: `field-part-${fieldPart?.task_field_id ?? fieldIndex}-${tariffPart?.tariff?.id ?? tariffIndex}`,
        sortKey: parseTime(
          (isTransportTask
            ? tariffPart?.open_at_parts_time ??
              tariffPart?.openAtPartsTime
            : fieldPart?.open_at_parts_time) ??
            fieldPart?.open_at_parts_time ??
            tariffPart?.open_at_parts_time ??
            tariffPart?.shift_parts?.[0]?.start_at,
        ),
        tariffPart,
      })),
    );
    const transferCards = (
      transferAggregateParts?.grouped_by_tariff_parts ||
      transferAggregateParts?.groupedByTariffParts ||
      transferAggregateParts?.tariff_parts ||
      []
    ).flatMap((transferPart: any, index: number) => {
      const parts =
        transferPart?.shift_parts || transferPart?.shiftParts || [];
      const initialParts = parts.filter(
        (part: any) => part?.is_initial ?? part?.isInitial,
      );
      const regularParts = parts.filter(
        (part: any) => !(part?.is_initial ?? part?.isInitial),
      );
      const cards: any[] = [];

      if (regularParts.length > 0) {
        cards.push({
          type: "transfer" as const,
          key: `transfer-part-${transferPart?.tariff_id ?? index}-regular`,
          sortKey: parseTime(
            transferPart?.open_at_parts_time ?? regularParts[0]?.start_at,
          ),
          transferPart: {
            ...transferPart,
            shift_parts: regularParts,
            shiftParts: regularParts,
          },
        });
      }

      initialParts.forEach((initialPart: any, initialIndex: number) => {
        cards.push({
          type: "transfer" as const,
          key: `transfer-part-${transferPart?.tariff_id ?? index}-initial-${initialPart?.id ?? initialIndex}`,
          sortKey: parseTime(initialPart?.start_at),
          transferPart: {
            ...transferPart,
            open_at_parts_time: initialPart?.start_at,
            closed_at_parts_time: initialPart?.end_at,
            shift_parts: [initialPart],
            shiftParts: [initialPart],
          },
        });
      });

      return cards;
    });

    return [...fieldCards, ...transferCards].sort(
      (a, b) => b.sortKey - a.sortKey,
    );
  }, [isTransportTask, outputValueAggregateParts, transferAggregateParts]);

  return (
    <View style={styles.workBlock}>
      <View style={styles.workBlockHeader}>
        <EmployeeAvatar employee={employee} style={styles.workBlockAvatar} />

        <View style={styles.workBlockHeaderContent}>
          <View style={styles.workBlockEmployeeLine}>
            <Text style={styles.workBlockEmployeeName} numberOfLines={1}>
              {employeeName}
            </Text>
            {!!workTypeLabel && (
              <>
                <Text style={styles.workBlockDivider}>•</Text>
                <Text style={styles.workBlockType} numberOfLines={1}>
                  {workTypeLabel}
                </Text>
              </>
            )}
          </View>

          {!isProductTransportationTask && (
            <View style={styles.workBlockEquipmentRow}>
              <View style={styles.workBlockEquipmentChip}>
                <MaterialCommunityIcons
                  name={
                    isTransportTask
                      ? "truck-fast-outline"
                      : "tractor-variant"
                  }
                  size={13}
                  color="#475467"
                />
                <Text style={styles.workBlockEquipmentText} numberOfLines={1}>
                  {techniqueLabel}
                </Text>
              </View>

              {!!agriculturalMachine?.name && (
                <View style={styles.workBlockEquipmentChip}>
                  <Ionicons name="construct-outline" size={13} color="#475467" />
                  <Text style={styles.workBlockEquipmentText} numberOfLines={1}>
                    СХМ: {agriculturalMachine.name}
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>

        {!!deleteDetails && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Удалить всю смену сотрудника ${employeeName}`}
            disabled={isDeletingGroup}
            style={[
              styles.workBlockDeleteButton,
              isDeletingGroup && styles.workBlockDeleteButtonDisabled,
            ]}
            onPress={handleDeleteGroup}
          >
            <Ionicons name="trash-outline" size={17} color="#D92D20" />
          </Pressable>
        )}
      </View>

      <ShiftTimeline
        entries={timelineEntries}
        shiftType={shiftType}
        shiftSettings={
          groupedAggregate?.shift_settings ??
          groupedAggregate?.shiftSettings ??
          shiftSettings
        }
      />

      <View style={styles.workBlockBody}>
        {combinedCards.map((card: any) =>
          card.type === "field" ? (
            <FieldPartCard
              key={card.key}
              employeeName={employeeName}
              employeePosition={employeePosition}
              aggregate={aggregate}
              fieldPart={card.fieldPart}
              tariffPart={card.tariffPart}
              productionShiftId={productionShiftId}
              shiftType={shiftType}
              qrCodeScannedAt={qrCodeScannedAt}
              onOpenDetails={onOpenDetails}
              onEditPart={onEditPart}
              onDeletePart={onDeletePart}
              deletingPartId={deletingPartId}
            />
          ) : (
            <TransferPartCard
              key={card.key}
              employeeName={employeeName}
              employeePosition={employeePosition}
              aggregate={aggregate}
              currentPart={card.transferPart}
              productionShiftId={productionShiftId}
              shiftType={shiftType}
              kilometers={transferAggregateParts?.transfer_kilometers}
              avgSpeed={transferAggregateParts?.avg_speed}
              maxSpeed={transferAggregateParts?.max_speed}
              qrCodeScannedAt={qrCodeScannedAt}
              onEditPart={onEditPart}
              onDeletePart={onDeletePart}
              deletingPartId={deletingPartId}
            />
          ),
        )}
      </View>
    </View>
  );
}

export const CombinedWorkBlock = memo(CombinedWorkBlockComponent);
