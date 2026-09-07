import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  ActivityIndicator,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  StatusBar,
  View,
} from "react-native";
import { Text } from "@ui-kitten/components";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Colors from "../../../../shared/styles/Colors";

type Props = {
  visible: boolean;
  selectedCount: number;
  isSaving: boolean;
  onClose: () => void;
  onSave: () => void;
  renderMap: () => React.ReactNode;
};

export function TaskFieldsMapModal({
  visible,
  selectedCount,
  isSaving,
  onClose,
  onSave,
  renderMap,
}: Props) {
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={visible}
      animationType="fade"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View
          style={[
            styles.header,
            Platform.OS === "android" && {
              paddingTop:
                Math.max(insets.top, StatusBar.currentHeight ?? 0) + 12,
            },
          ]}
        >
          <Pressable
            accessibilityLabel="Закрыть выбор полей"
            onPress={onClose}
            style={styles.closeButton}
            disabled={isSaving}
          >
            {isSaving ? (
              <ActivityIndicator size="small" color={Colors.black} />
            ) : (
              <Ionicons name="close" size={24} color={Colors.black} />
            )}
          </Pressable>

          <View style={styles.titleWrap}>
            <Text style={styles.title}>Выбор полей</Text>
            <Text style={styles.subtitle}>Выбрано: {selectedCount}</Text>
          </View>

          <Pressable
            onPress={onSave}
            style={[
              styles.doneButton,
              isSaving && styles.doneButtonDisabled,
            ]}
            disabled={isSaving}
          >
            {isSaving ? (
              <ActivityIndicator size="small" color={Colors.white} />
            ) : (
              <Text style={styles.doneText}>Готово</Text>
            )}
          </Pressable>
        </View>

        <View style={styles.map}>{renderMap()}</View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F6F8FA",
  },
  header: {
    paddingTop: 56,
    paddingHorizontal: 16,
    paddingBottom: 14,
    backgroundColor: Colors.white,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  closeButton: {
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
  },
  titleWrap: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: "800",
    color: Colors.black,
  },
  subtitle: {
    marginTop: 2,
    fontSize: 13,
    color: "#667085",
  },
  doneButton: {
    height: 38,
    minWidth: 76,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: Colors.greenColor,
    alignItems: "center",
    justifyContent: "center",
  },
  doneButtonDisabled: {
    opacity: 0.7,
  },
  doneText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: "800",
  },
  map: {
    flex: 1,
  },
});
