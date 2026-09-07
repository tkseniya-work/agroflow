import { Ionicons } from "@expo/vector-icons";
import { Modal, Text } from "@ui-kitten/components";
import React, { memo } from "react";
import { ScrollView, TouchableOpacity, View } from "react-native";

import Colors from "../../../shared/styles/Colors";
import { styles } from "../styles";

type Props = {
  visible: boolean;
  zones: string[];
  onClose: () => void;
};

const ZonesModalComponent = ({ visible, zones, onClose }: Props) => {
  return (
    <Modal
      visible={visible}
      backdropStyle={styles.backdrop}
      onBackdropPress={onClose}
    >
      <View style={styles.zonesModal}>
        <View style={styles.zonesModalHeader}>
          <Text style={styles.zonesModalTitle}>Зоны задания</Text>

          <TouchableOpacity activeOpacity={0.75} onPress={onClose}>
            <Ionicons name="close" size={22} color={Colors.grey700} />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.zonesModalList}
          showsVerticalScrollIndicator={false}
        >
          {zones.map((zone, index) => (
            <View key={`${zone}-${index}`} style={styles.zoneItem}>
              <Text style={styles.zoneIndex}>{index + 1}</Text>
              <Text style={styles.zoneName}>{zone}</Text>
            </View>
          ))}
        </ScrollView>
      </View>
    </Modal>
  );
};

export const ZonesModal = memo(ZonesModalComponent);
