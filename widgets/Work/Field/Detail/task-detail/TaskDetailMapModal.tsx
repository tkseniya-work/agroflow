import { Ionicons } from "@expo/vector-icons";
import { Text } from "@ui-kitten/components";
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
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Colors from "../../../../../shared/styles/Colors";

type Props = {
  visible: boolean;
  trackLinesCount: number;
  isSaving: boolean;
  onClose: () => void;
  onSave: () => void;
  renderMap: () => React.ReactNode;
};

export function TaskDetailMapModal({
  visible,
  trackLinesCount,
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
            accessibilityLabel="Закрыть карту задания"
            onPress={onClose}
            style={styles.closeButton}
            disabled={isSaving}
          >
            <Ionicons name="close" size={24} color={Colors.black} />
          </Pressable>

          <View style={styles.titleWrap}>
            <Text style={styles.title}>Карта задания</Text>
            <Text style={styles.subtitle}>
              {trackLinesCount > 0
                ? "Поля и трек выбранной техники"
                : "Поля задания"}
            </Text>
          </View>

          <Pressable
            accessibilityRole="button"
            onPress={onSave}
            style={[styles.doneButton, isSaving && styles.doneButtonDisabled]}
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
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#F2F4F7",
    alignItems: "center",
    justifyContent: "center",
  },
  titleWrap: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    fontSize: 18,
    fontWeight: "800",
    color: "#101828",
  },
  subtitle: {
    marginTop: 2,
    fontSize: 12,
    color: "#667085",
  },
  doneButton: {
    height: 38,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: Colors.greenColor,
    alignItems: "center",
    justifyContent: "center",
  },
  doneText: {
    fontSize: 14,
    fontWeight: "800",
    color: Colors.white,
  },
  doneButtonDisabled: {
    opacity: 0.7,
  },
  map: {
    flex: 1,
  },
});
