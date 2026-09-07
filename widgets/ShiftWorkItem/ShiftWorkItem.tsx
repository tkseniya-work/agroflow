import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Icon } from "@ui-kitten/components";
import React, { memo, useCallback, useMemo, useState } from "react";
import { Image, StyleSheet, TouchableOpacity, View } from "react-native";
import { AppIcon, LayoutCustom, Text } from "../../shared/ui";
import TimeDetailsModal, {
  ChartData,
} from "../TimeDetailsModal";
import Colors from "../../shared/styles/Colors";
import EvaIcons from "../../src/types/eva-icon-enum";
import { ShiftData, WorkType } from "../../entities/productionShift";
import { formatCurrency } from "../../src/utils/shiftDataUtils";
import DonutChart from "../DonutChart/DonutChart";
import { formatTimeRange } from "../../shared/lib/formatUtils";

const SHIFT_TYPE_COLORS = {
  day: Colors.shift.day,
  night: Colors.shift.night,
};

const CHART_COLORS = {
  totalTime: Colors.chart.totalTime,
  smallStops: Colors.chart.smallStops,
  longStops: Colors.chart.longStops,
};

const DEFAULT_WORK_ICON_SIZE = 22;
const FIELD_WORK_ICON_WIDTH = 32;
const UNKNOWN_WORK_PLACE_NAME = "Без названия";

// ExpandBlock
const ExpandBlock = memo(
  ({
    title,
    children,
    defaultExpanded = false,
  }: {
    title: string;
    children: React.ReactNode;
    defaultExpanded?: boolean;
  }) => {
    const [expanded, setExpanded] = useState(defaultExpanded);
    const toggleExpanded = useCallback(
      () => setExpanded((current) => !current),
      [],
    );

    return (
      <LayoutCustom gap={4}>
        <TouchableOpacity onPress={toggleExpanded}>
          <LayoutCustom horizontal justify="space-between" itemsCenter>
            <Text category="c1" fontWeight="600">
              {title}
            </Text>
            <AppIcon
              name={expanded ? EvaIcons.ChevronUp : EvaIcons.ChevronDown}
              size={16}
              fill={Colors.grey500}
            />
          </LayoutCustom>
        </TouchableOpacity>

        {expanded && <LayoutCustom gap={8}>{children}</LayoutCustom>}
      </LayoutCustom>
    );
  },
);
ExpandBlock.displayName = "ExpandBlock";

// Компонент иконки работы
const WorkIcon = memo(
  ({
    size = DEFAULT_WORK_ICON_SIZE,
    item,
  }: {
    size?: number;
    item: ShiftData;
  }) => {
    const iconSource = useMemo(
      () =>
        item.iconLink?.toString().trim()
          ? { uri: item.iconLink.toString() }
          : null,
      [item.iconLink],
    );
    const imageStyle = useMemo(() => ({ width: size, height: size }), [size]);

    if (item.workType === WorkType.Field) {
      if (iconSource) {
        return (
          <Image
            source={iconSource}
            style={imageStyle}
            resizeMode="contain"
          />
        );
      }
      return (
        <Icon
          pack="assets"
          width={FIELD_WORK_ICON_WIDTH}
          height={DEFAULT_WORK_ICON_SIZE}
          name="ic_technique"
          fill={Colors.success}
        />
      );
    }

    switch (item.workType) {
      case WorkType.Stationary:
        return (
          <AppIcon size={22} name={EvaIcons.Pin} fill={Colors.icon.error} />
        );
      case WorkType.Transport:
        return (
          <MaterialCommunityIcons
            name="map-marker-distance"
            size={22}
            color={Colors.icon.award}
          />
        );
      case WorkType.ProductsTransportation:
        return (
          <MaterialCommunityIcons
            name="dump-truck"
            size={24}
            color={Colors.secondary}
          />
        );
      case WorkType.Transfers:
        return (
          <MaterialCommunityIcons
            name="truck-fast"
            size={22}
            color={Colors.blue}
          />
        );
      default:
        return (
          <AppIcon
            size={22}
            name={EvaIcons.QuestionMarkCircle}
            fill={Colors.icon.default}
          />
        );
    }
  },
);
WorkIcon.displayName = "WorkIcon";

// PlanFactItem
const PlanFactItem = memo(
  ({
    icon,
    color,
    label,
    value,
    isFact = false,
  }: {
    icon: EvaIcons;
    color: string;
    label: string;
    value: string;
    isFact?: boolean;
  }) => (
    <LayoutCustom horizontal gap={4} itemsCenter>
      <AppIcon name={icon} size={11} fill={color} />
      <Text category="note" status={isFact ? undefined : "grey"}>
        {label} {value}
      </Text>
    </LayoutCustom>
  ),
);
PlanFactItem.displayName = "PlanFactItem";

// SpeedItem
const SpeedItem = memo(({ value }: { value: string }) => (
  <LayoutCustom horizontal gap={4} itemsCenter>
    <Text category="note" status="grey">
      {value}
    </Text>
  </LayoutCustom>
));
SpeedItem.displayName = "SpeedItem";

// TechnicalParams
const TechnicalParams = memo(({ item }: { item: ShiftData }) => (
  <LayoutCustom gap={8}>
    <LayoutCustom horizontal gap={12}>
      {item.maxSpeed && <SpeedItem value={`${item.maxSpeed} км/ч`} />}
      {item.avgSpeed && <SpeedItem value={`${item.avgSpeed} км/ч`} />}
    </LayoutCustom>

    <LayoutCustom horizontal gap={12}>
      {item.processingDepth && (
        <SpeedItem value={`${item.processingDepth} см`} />
      )}
      {item.soluteFlowRate && (
        <SpeedItem value={`${item.soluteFlowRate} л/га`} />
      )}
    </LayoutCustom>

    {(item.fuelNormValue || item.fuelFactValue) && (
      <LayoutCustom gap={4}>
        <Text category="note" status="grey">
          Расход топлива
        </Text>
        <LayoutCustom horizontal gap={12}>
          {item.fuelNormValue && (
            <PlanFactItem
              icon={EvaIcons.FileText}
              color={Colors.chart.planned}
              label="Норма:"
              value={`${item.fuelNormValue} л/100км`}
            />
          )}
          {item.fuelFactValue && (
            <PlanFactItem
              icon={EvaIcons.CheckmarkCircle2}
              color={Colors.chart.actual}
              label="Факт:"
              value={`${item.fuelFactValue} л/100км`}
              isFact
            />
          )}
        </LayoutCustom>
      </LayoutCustom>
    )}
  </LayoutCustom>
));
TechnicalParams.displayName = "TechnicalParams";

// BonusItem
const BonusItem = memo(({ label, value }: { label: string; value: string }) => {
  const v = Number(value.replace(/[^\d.-]/g, ""));
  return (
    <LayoutCustom horizontal justify="space-between">
      <Text category="note" status="grey">
        {label}
      </Text>
      <Text category="note" style={v > 0 ? styles.bonusPositive : undefined}>
        {value}
      </Text>
    </LayoutCustom>
  );
});
BonusItem.displayName = "BonusItem";

// BonusItems
const BonusItems = memo(({ item }: { item: ShiftData }) => {
  const formattedOvertimeBonus = useMemo(
    () => `${formatCurrency(item.overtimeBonus)} р`,
    [item.overtimeBonus],
  );
  const formattedExperienceBonus = useMemo(
    () => `${formatCurrency(item.experienceBonus)} р`,
    [item.experienceBonus],
  );

  return (
    <LayoutCustom gap={2}>
      <BonusItem label="Переработки:" value={formattedOvertimeBonus} />
      <BonusItem label="Стаж:" value={formattedExperienceBonus} />
    </LayoutCustom>
  );
});
BonusItems.displayName = "BonusItems";

// Основной компонент
const ShiftWorkItem = memo(
  ({ item }: { item: ShiftData }) => {
    const [modal, setModal] = useState(false);

    const shiftType = useMemo(
      () => (item.shiftType?.id === 1 ? "day" : "night"),
      [item.shiftType?.id],
    );

    const shiftColors = useMemo(
      () => SHIFT_TYPE_COLORS[shiftType],
      [shiftType],
    );

    const hasBonuses = useMemo(
      () => Number(item.overtimeBonus) > 0 || Number(item.experienceBonus) > 0,
      [item.overtimeBonus, item.experienceBonus],
    );

    const chartData: ChartData[] = useMemo(
      () => [
        {
          label: "Общее время",
          value: item.time,
          valueString: item.timeString,
          color: CHART_COLORS.totalTime,
        },
        {
          label: "Остановки",
          value: item.smallStops,
          valueString: item.smallStopsString,
          color: CHART_COLORS.smallStops,
        },
        {
          label: "Стоянки",
          value: item.longStops,
          valueString: item.longStopsString,
          color: CHART_COLORS.longStops,
        },
      ],
      [
        item.time,
        item.smallStops,
        item.longStops,
        item.timeString,
        item.smallStopsString,
        item.longStopsString,
      ],
    );

    const formattedTimeRange = useMemo(
      () => formatTimeRange(item.startAt, item.endAt),
      [item.startAt, item.endAt],
    );
    const formattedTariffValue = useMemo(
      () => formatCurrency(item.tariffValue),
      [item.tariffValue],
    );
    const formattedBaseTariffPrice = useMemo(
      () => formatCurrency(item.baseTariffPrice),
      [item.baseTariffPrice],
    );
    const formattedTariffPrice = useMemo(
      () => formatCurrency(item.tariffPrice),
      [item.tariffPrice],
    );
    const workPlaceName = item.workPlaceName ?? UNKNOWN_WORK_PLACE_NAME;
    const tariffPriceUnit = item.tariffPriceUnit ?? "";

    const handleOpenModal = useCallback(() => setModal(true), []);
    const handleCloseModal = useCallback(() => setModal(false), []);

    return (
      <LayoutCustom style={styles.container}>
        {/* Заголовок */}
        <LayoutCustom horizontal justify="space-between" itemsCenter>
          <LayoutCustom horizontal gap={8} flex>
            <WorkIcon item={item} />
            <LayoutCustom flex>
              <Text category="c1" fontWeight="700" numberOfLines={2}>
                {workPlaceName}
              </Text>
              {!!item.agriculturalMachineryName && (
                <Text category="note" status="grey">
                  {item.agriculturalMachineryName}
                </Text>
              )}
            </LayoutCustom>
          </LayoutCustom>

          <LayoutCustom
            horizontal
            gap={4}
            itemsCenter
            style={[
              styles.shiftTime,
              { backgroundColor: shiftColors.background },
            ]}
          >
            <AppIcon
              name={shiftType === "day" ? EvaIcons.Sun : EvaIcons.Moon}
              size={12}
              fill={shiftColors.icon}
            />
            <Text category="note">{formattedTimeRange}</Text>
          </LayoutCustom>
        </LayoutCustom>

        {!!item.workName && (
          <LayoutCustom horizontal gap={6} itemsCenter>
            <View style={styles.dot} />
            <Text category="note" style={styles.blue}>
              {item.workName}
            </Text>
          </LayoutCustom>
        )}

        {!!item.taskFieldName && item.workType === WorkType.Field && (
          <LayoutCustom horizontal gap={6} itemsCenter>
            <Text category="note" style={{ color: Colors.grey700 }}>
              {item.taskFieldName}
            </Text>
          </LayoutCustom>
        )}

        {/* TECH */}
        {item.workType !== WorkType.Stationary && (
          <ExpandBlock title="Технические параметры">
            <TechnicalParams item={item} />
          </ExpandBlock>
        )}

        {/* Производственные показатели */}
        <ExpandBlock title="Производственные показатели">
          {item.workType === WorkType.Field && (
            <>
              <Text category="note" status="grey">
                Площадь
              </Text>
              <LayoutCustom horizontal gap={12}>
                <PlanFactItem
                  icon={EvaIcons.FileText}
                  color={Colors.chart.planned}
                  label="Норма:"
                  value={`${item.normValueHa} ${item.unit}`}
                />
                <PlanFactItem
                  icon={EvaIcons.CheckmarkCircle2}
                  color={Colors.chart.actual}
                  label="Факт:"
                  value={`${item.factArea} ${item.unit}`}
                  isFact
                />
              </LayoutCustom>
            </>
          )}

          <Text category="note" status="grey">
            Выработка
          </Text>
          <LayoutCustom horizontal gap={12}>
            <PlanFactItem
              icon={EvaIcons.FileText}
              color={Colors.chart.planned}
              label="Норма:"
              value={`${item.productionNormValue} ${item.tariffUnit}`}
            />
            <PlanFactItem
              icon={EvaIcons.CheckmarkCircle2}
              color={Colors.chart.actual}
              label="Факт:"
              value={`${item.productionFactValue} ${item.tariffUnit}`}
              isFact
            />
          </LayoutCustom>
        </ExpandBlock>

        {/* ЗП */}
        <LayoutCustom horizontal gap={12}>
          <LayoutCustom flex gap={6}>
            <Text category="c1" fontWeight="600">
              Заработная плата
            </Text>
            <Text category="t3" status="success-dark">
              {formattedTariffValue} р
            </Text>

            {(item.baseTariffPrice || item.tariffPrice) && (
              <LayoutCustom gap={2}>
                <Text category="note" status="grey">
                  База: {formattedBaseTariffPrice} {tariffPriceUnit}
                </Text>
                <Text category="subhead" status="success-dark">
                  Расчет: {formattedTariffPrice} {tariffPriceUnit}
                </Text>
              </LayoutCustom>
            )}

            <ExpandBlock title="Доплаты" defaultExpanded={hasBonuses}>
              <BonusItems item={item} />
            </ExpandBlock>
          </LayoutCustom>

          <TouchableOpacity onPress={handleOpenModal}>
            <DonutChart data={chartData} size={110} />
          </TouchableOpacity>
        </LayoutCustom>

        <TimeDetailsModal
          visible={modal}
          onClose={handleCloseModal}
          chartData={chartData}
          title="Детализация времени"
        />
      </LayoutCustom>
    );
  },
);
ShiftWorkItem.displayName = "ShiftWorkItem";

export default ShiftWorkItem;

const styles = StyleSheet.create({
  container: {
    padding: 12,
    borderRadius: 14,
    gap: 8,
    backgroundColor: Colors.white,
    marginBottom: 15,
    borderColor: Colors.grey300,
    borderWidth: 1,
    elevation: 2,
    shadowColor: Colors.grey400,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  shiftTime: {
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.blue,
  },
  blue: {
    color: Colors.blue,
  },
  bonusPositive: {
    color: "#0b9444",
  },
});
