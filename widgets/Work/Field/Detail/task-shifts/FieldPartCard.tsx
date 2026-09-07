import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import React, { memo, useCallback } from "react";
import { Pressable, View } from "react-native";
import { Text } from "@ui-kitten/components";

import { useShifts } from "../../../shared/useShifts";
import Colors from "../../../../../shared/styles/Colors";
import { FieldPartCardProps } from "../../../../../src/types/task.types";
import { buildFieldPartCardModel } from "./FieldPartCard.helpers";
import { ShiftPartActions } from "./ShiftPartActions";
import { styles } from "./styles";

function FieldPartCardComponent({
  employeeName,
  employeePosition,
  aggregate,
  fieldPart,
  tariffPart,
  productionShiftId,
  shiftType,
  qrCodeScannedAt,
  onOpenDetails,
  onEditPart,
  onDeletePart,
  deletingPartId,
}: FieldPartCardProps) {
  const { getShiftName } = useShifts();
  const model = buildFieldPartCardModel({
    employeeName,
    employeePosition,
    aggregate,
    fieldPart,
    tariffPart,
    productionShiftId,
    shiftType,
    qrCodeScannedAt,
    shiftName: getShiftName(shiftType),
  });
  const isDeleting = Boolean(
    deletingPartId && model.deleteIds.includes(String(deletingPartId)),
  );

  const handleOpenDetails = useCallback(() => {
    onOpenDetails(model.detailPayload);
  }, [model.detailPayload, onOpenDetails]);

  return (
    <ShiftPartActions
      details={model.detailPayload}
      onEdit={onEditPart}
      onDelete={onDeletePart}
      isDeleting={isDeleting}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Открыть подробности: ${model.compact.title}`}
        style={styles.compactPartRow}
        onPress={handleOpenDetails}
      >
        <View
          style={
            model.variant === "transport"
              ? styles.compactInfoStripe
              : styles.compactSuccessStripe
          }
        />

        <View style={styles.compactMainWrap}>
          <View style={styles.compactHeaderRow}>
            <View
              style={[
                styles.compactWorkIcon,
                model.variant === "transport" &&
                  styles.compactTransportIcon,
              ]}
            >
              <MaterialCommunityIcons
                name={
                  model.variant === "transport"
                    ? "truck-fast-outline"
                    : "tractor-variant"
                }
                size={18}
                color={
                  model.variant === "transport"
                    ? Colors.blue
                    : Colors.greenColor
                }
              />
            </View>
            <View style={styles.compactHeadingWrap}>
              <Text style={styles.compactTitle} numberOfLines={1}>
                {model.compact.title}
              </Text>
            </View>
          </View>

          <View style={styles.compactMetaRow}>
            <View style={styles.compactMetaChip}>
              <Ionicons name="time-outline" size={13} color="#475467" />
              <Text style={styles.compactMetaText}>{model.compact.time}</Text>
            </View>
            <View
              style={[
                styles.compactMetaChip,
                Number(shiftType) === 2
                  ? styles.compactNightChip
                  : styles.compactDayChip,
              ]}
              accessible
              accessibilityLabel={`${model.compact.duration}, ${
                Number(shiftType) === 2 ? "ночная" : "дневная"
              } смена`}
            >
              <Text
                style={[
                  styles.compactMetaText,
                  Number(shiftType) === 2
                    ? styles.compactNightText
                    : styles.compactDayText,
                ]}
              >
                {model.compact.duration}
              </Text>
              <Ionicons
                name={Number(shiftType) === 2 ? "moon-outline" : "sunny-outline"}
                size={13}
                color={Number(shiftType) === 2 ? "#3538CD" : "#B54708"}
              />
            </View>
            {model.compact.badges.map((badge, index) => (
              <View
                key={`${badge.label}-${index}`}
                style={[
                  styles.compactMetaChip,
                  badge.tone === "danger" && styles.compactDangerChip,
                  badge.tone === "info" && styles.compactInfoChip,
                  badge.tone === "sourceQr" && styles.compactSourceQrChip,
                  badge.tone === "sourceManual" &&
                    styles.compactSourceManualChip,
                  badge.tone === "sourceAuto" &&
                    styles.compactSourceAutoChip,
                  badge.tone === "correction" &&
                    styles.compactCorrectionChip,
                ]}
              >
                <Ionicons
                  name={badge.icon}
                  size={13}
                  color={
                    badge.tone === "danger"
                      ? "#B42318"
                      : badge.tone === "info"
                        ? "#175CD3"
                        : badge.tone === "sourceQr"
                          ? "#067647"
                          : badge.tone === "sourceManual"
                            ? "#B54708"
                            : badge.tone === "sourceAuto"
                              ? "#5925DC"
                              : badge.tone === "correction"
                                ? "#B54708"
                        : "#475467"
                  }
                />
                <Text
                  style={[
                    styles.compactMetaText,
                    badge.tone === "danger" && styles.compactDangerText,
                    badge.tone === "info" && styles.compactInfoText,
                    badge.tone === "sourceQr" && styles.compactSourceQrText,
                    badge.tone === "sourceManual" &&
                      styles.compactSourceManualText,
                    badge.tone === "sourceAuto" &&
                      styles.compactSourceAutoText,
                    badge.tone === "correction" &&
                      styles.compactCorrectionText,
                  ]}
                >
                  {badge.label}
                </Text>
              </View>
            ))}
          </View>

          <View style={styles.compactMetrics}>
            {model.compact.metrics.map((metric) => (
              <View
                key={metric.label}
                style={[
                  styles.compactMetric,
                  metric.tone === "success" && styles.compactMetricPayment,
                  metric.tone === "warning" && styles.compactMetricWarning,
                ]}
              >
                <Text style={styles.compactMetricLabel}>{metric.label}</Text>
                <Text
                  style={[
                    styles.compactMetricValue,
                    metric.tone === "success" && styles.compactMetricMoney,
                    metric.tone === "warning" && styles.compactMetricWarningText,
                  ]}
                  numberOfLines={1}
                >
                  {metric.value}
                </Text>
              </View>
            ))}
          </View>
        </View>

      </Pressable>
    </ShiftPartActions>
  );
}

export const FieldPartCard = memo(FieldPartCardComponent);
