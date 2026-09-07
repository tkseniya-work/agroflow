import { StyleService } from "@ui-kitten/components";
import { AppIcon, LayoutCustom, Text } from "shared/ui";
import React from "react";
import { Modal, TouchableOpacity, View } from "react-native";
import Colors from "styles/Colors";
import EvaIcons from "types/eva-icon-enum";

export interface ChartData {
  label: string;
  value: number;
  valueString: string;
  color: string;
}

interface TimeDetailsModalProps {
  visible: boolean;
  onClose: () => void;
  chartData: ChartData[];
  title?: string;
}

const TimeDetailsModal: React.FC<TimeDetailsModalProps> = ({
  visible,
  onClose,
  chartData,
  title = "Детализация времени",
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.tooltipOverlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={styles.tooltipContent}>
          <LayoutCustom horizontal itemsCenter justify="space-between" mb={12}>
            <Text category="body">{title}</Text>
            <TouchableOpacity onPress={onClose} hitSlop={10}>
              <AppIcon name={EvaIcons.Close} size={20} fill={Colors.grey600} />
            </TouchableOpacity>
          </LayoutCustom>

          <LayoutCustom gap={8}>
            {chartData.map((data, index) => (
              <LayoutCustom
                key={index}
                horizontal
                itemsCenter
                justify="space-between"
              >
                <LayoutCustom horizontal itemsCenter gap={8}>
                  <View
                    style={[
                      styles.colorIndicator,
                      { backgroundColor: data.color },
                    ]}
                  />
                  <Text category="c1">{data.label}</Text>
                </LayoutCustom>
                <Text category="c1" fontWeight="600">
                  {data.valueString}
                </Text>
              </LayoutCustom>
            ))}
          </LayoutCustom>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

export default TimeDetailsModal;

const styles = StyleService.create({
  tooltipOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  tooltipContent: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    width: "80%",
    maxWidth: 300,
  },
  colorIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
});
