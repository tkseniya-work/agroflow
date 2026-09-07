import { Ionicons } from "@expo/vector-icons";
import { Modal, Text } from "@ui-kitten/components";
import React, { memo, useMemo } from "react";
import { TouchableOpacity, View } from "react-native";

import Colors from "../../../shared/styles/Colors";
import { styles } from "../styles";

type CostsData = {
  costs_per_ha?: number | null;
  total_costs?: number | null;
} | null;

type Props = {
  visible: boolean;
  costs: CostsData;
  onClose: () => void;
};

const numberFormatter = new Intl.NumberFormat("ru-RU");

const CostsModalComponent = ({ visible, costs, onClose }: Props) => {
  const formattedCostsPerHa = useMemo(
    () => numberFormatter.format(Number(costs?.costs_per_ha || 0)),
    [costs?.costs_per_ha],
  );
  const formattedTotalCosts = useMemo(
    () => numberFormatter.format(Number(costs?.total_costs || 0)),
    [costs?.total_costs],
  );

  return (
    <Modal
      visible={visible}
      backdropStyle={styles.backdrop}
      onBackdropPress={onClose}
    >
      <View style={styles.costsModal}>
        <View style={styles.costsModalHeader}>
          <Text style={styles.costsModalTitle}>Затраты</Text>

          <TouchableOpacity activeOpacity={0.75} onPress={onClose}>
            <Ionicons name="close" size={22} color={Colors.grey700} />
          </TouchableOpacity>
        </View>

        <View style={styles.costsModalContent}>
          <View style={styles.costsModalRow}>
            <Text style={styles.costsModalLabel}>На гектар:</Text>

            <Text style={styles.costsModalValue}>
              {formattedCostsPerHa} р/га
            </Text>
          </View>

          <View style={styles.costsModalRow}>
            <Text style={styles.costsModalLabel}>Всего:</Text>

            <Text style={styles.costsModalValue}>
              {formattedTotalCosts} р
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export const CostsModal = memo(CostsModalComponent);
