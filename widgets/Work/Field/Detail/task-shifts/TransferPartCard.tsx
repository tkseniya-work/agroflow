import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import React, { memo } from "react";
import { View } from "react-native";
import { Text } from "@ui-kitten/components";

import { useShifts } from "../../../shared/useShifts";
import Colors from "../../../../../shared/styles/Colors";
import { TransferPartCardProps } from "../../../../../src/types/task.types";
import { ShiftPartActions } from "./ShiftPartActions";
import { styles } from "./styles";
import { buildTransferPartCardModel } from "./TransferPartCard.helpers";

function TransferPartCardComponent({
  employeeName,
  employeePosition,
  aggregate,
  currentPart,
  productionShiftId,
  shiftType,
  kilometers,
  avgSpeed,
  maxSpeed,
  qrCodeScannedAt,
  onEditPart,
  onDeletePart,
  deletingPartId,
}: TransferPartCardProps) {
  const { getShiftName } = useShifts();
  const model = buildTransferPartCardModel({
    employeeName,
    employeePosition,
    aggregate,
    currentPart,
    productionShiftId,
    shiftType,
    kilometers,
    avgSpeed,
    maxSpeed,
    qrCodeScannedAt,
    shiftName: getShiftName(shiftType),
  });
  const isDeleting = Boolean(
    deletingPartId && model.deleteIds.includes(String(deletingPartId)),
  );

  if (model.isInitial) {
    return (
      <ShiftPartActions
        details={model.detailPayload}
        onEdit={onEditPart}
        onDelete={onDeletePart}
        isDeleting={isDeleting}
      >
        <View
          style={[styles.compactPartRow, styles.compactInitialPartRow]}
        >
          <View style={styles.compactSuccessStripe} />

          <View style={styles.compactMainWrap}>
            <View style={styles.compactHeaderRow}>
              <View style={styles.compactWorkIcon}>
                <MaterialCommunityIcons
                  name="account-check-outline"
                  size={18}
                  color={Colors.greenColor}
                />
              </View>
              <View style={styles.compactHeadingWrap}>
                <Text style={styles.compactTitle} numberOfLines={1}>
                  Посадка сотрудника
                </Text>
              </View>
            </View>

            <Text style={styles.compactSubtitle}>
              Сотрудник сел в технику
            </Text>

            <View style={styles.compactMetaRow}>
              <View style={styles.compactMetaChip}>
                <Ionicons name="time-outline" size={13} color="#475467" />
                <Text style={styles.compactMetaText}>
                  {model.compact.initialTime}
                </Text>
              </View>
              <Text style={styles.compactStartBadge}>старт смены</Text>
              {model.compact.initialBadges.map((badge, index) => (
                <View
                  key={`${badge.label}-${index}`}
                  style={[
                    styles.compactMetaChip,
                    badge.tone === "sourceQr" && styles.compactSourceQrChip,
                    badge.tone === "sourceManual" &&
                      styles.compactSourceManualChip,
                    badge.tone === "sourceAuto" &&
                      styles.compactSourceAutoChip,
                  ]}
                >
                  <Ionicons
                    name={badge.icon}
                    size={13}
                    color={
                      badge.tone === "sourceQr"
                        ? "#067647"
                        : badge.tone === "sourceManual"
                          ? "#B54708"
                          : badge.tone === "sourceAuto"
                            ? "#5925DC"
                            : "#475467"
                    }
                  />
                  <Text
                    style={[
                      styles.compactMetaText,
                      badge.tone === "sourceQr" && styles.compactSourceQrText,
                      badge.tone === "sourceManual" &&
                        styles.compactSourceManualText,
                      badge.tone === "sourceAuto" &&
                        styles.compactSourceAutoText,
                    ]}
                  >
                    {badge.label}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      </ShiftPartActions>
    );
  }

  return (
    <ShiftPartActions
      details={model.detailPayload}
      onEdit={onEditPart}
      onDelete={onDeletePart}
      isDeleting={isDeleting}
    >
      <View style={styles.compactPartRow}>
        <View style={styles.compactInfoStripe} />

        <View style={styles.compactMainWrap}>
          <View style={styles.compactHeaderRow}>
            <View style={[styles.compactWorkIcon, styles.compactTransportIcon]}>
              <MaterialCommunityIcons
                name={model.transferIcon}
                size={18}
                color={Colors.blue}
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
                  badge.tone === "sourceQr" && styles.compactSourceQrChip,
                  badge.tone === "sourceManual" &&
                    styles.compactSourceManualChip,
                  badge.tone === "sourceAuto" &&
                    styles.compactSourceAutoChip,
                ]}
              >
                <Ionicons
                  name={badge.icon}
                  size={13}
                  color={
                    badge.tone === "sourceQr"
                      ? "#067647"
                      : badge.tone === "sourceManual"
                        ? "#B54708"
                        : badge.tone === "sourceAuto"
                          ? "#5925DC"
                          : "#475467"
                  }
                />
                <Text
                  style={[
                    styles.compactMetaText,
                    badge.tone === "sourceQr" && styles.compactSourceQrText,
                    badge.tone === "sourceManual" &&
                      styles.compactSourceManualText,
                    badge.tone === "sourceAuto" &&
                      styles.compactSourceAutoText,
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
                ]}
              >
                <Text style={styles.compactMetricLabel}>{metric.label}</Text>
                <Text
                  style={[
                    styles.compactMetricValue,
                    metric.tone === "success" && styles.compactMetricMoney,
                  ]}
                  numberOfLines={1}
                >
                  {metric.value}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    </ShiftPartActions>
  );
}

export const TransferPartCard = memo(TransferPartCardComponent);
