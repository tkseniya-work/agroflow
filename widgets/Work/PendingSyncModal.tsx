import { Ionicons } from "@expo/vector-icons";
import React, { memo, useMemo } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import Colors from "../../shared/styles/Colors";

type Props = {
  visible: boolean;
  isSyncing: boolean;
  count: number;
  onClose: () => void;
  onSync: () => void;
};

const PendingSyncModalComponent = ({
  visible,
  isSyncing,
  count,
  onClose,
  onSync,
}: Props) => {
  const subtitle = useMemo(
    () =>
      `${
        count > 1
          ? `Есть ${count} закрытых офлайн-отрезков.`
          : "Есть закрытый офлайн-отрезок."
      } Лучше отправить данные перед новым сканированием.`,
    [count]
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.root}>
        <Pressable style={styles.backdrop} onPress={onClose} />

        <View style={styles.modal}>
          <View style={styles.header}>
            <View style={styles.iconWrap}>
              <Ionicons
                name="cloud-upload-outline"
                size={24}
                color={Colors.icon.warning}
              />
            </View>

            <View style={styles.titleWrap}>
              <Text style={styles.title}>Ожидает синхронизации</Text>
              <Text style={styles.subtitle}>{subtitle}</Text>
            </View>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity
              activeOpacity={0.8}
              disabled={isSyncing}
              onPress={onSync}
              style={[styles.button, isSyncing && styles.buttonDisabled]}
            >
              <Text style={styles.buttonText}>
                {isSyncing ? "Синхронизируем..." : "Синхронизировать"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              disabled={isSyncing}
              onPress={onClose}
              style={[styles.button, styles.cancelButton]}
            >
              <Text style={styles.cancelText}>Отмена</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export const PendingSyncModal = memo(PendingSyncModalComponent);

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 18,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.black + "80",
  },
  modal: {
    width: "100%",
    maxWidth: 350,
    borderRadius: 22,
    backgroundColor: Colors.white,
    padding: 16,
    gap: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.icon.warning + "18",
  },
  titleWrap: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    fontSize: 18,
    lineHeight: 22,
    fontWeight: "800",
    color: Colors.black,
  },
  subtitle: {
    marginTop: 4,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "600",
    color: Colors.grey600,
  },
  actions: {
    gap: 8,
  },
  button: {
    minHeight: 46,
    width: "100%",
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    backgroundColor: Colors.greenColor,
  },
  cancelButton: {
    backgroundColor: Colors.grey100,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "800",
    color: Colors.white,
    textAlign: "center",
  },
  cancelText: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "800",
    color: Colors.grey700,
    textAlign: "center",
  },
});
