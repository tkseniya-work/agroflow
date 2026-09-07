import { Ionicons } from "@expo/vector-icons";
import { Text } from "@ui-kitten/components";
import React, { useCallback, useRef, useState } from "react";
import { Modal, Platform, Pressable, StyleSheet, View } from "react-native";

import Colors from "../styles/Colors";

export type ActionSelectionItem = {
  key: string;
  label: string;
  icon: React.ComponentProps<typeof Ionicons>["name"];
  accessibilityLabel?: string;
  tone?: "default" | "danger";
  onPress: () => void;
};

type ActionSelectionModalProps = {
  visible: boolean;
  title: string;
  subtitle?: string;
  actions: ActionSelectionItem[];
  onClose: () => void;
  deferActionsUntilDismissed?: boolean;
};

export const ActionSelectionModal = ({
  visible,
  title,
  subtitle,
  actions,
  onClose,
  deferActionsUntilDismissed = false,
}: ActionSelectionModalProps) => {
  const pendingActionRef = useRef<(() => void) | null>(null);
  const [dismissWithoutAnimation, setDismissWithoutAnimation] = useState(false);

  const close = useCallback(() => {
    pendingActionRef.current = null;
    setDismissWithoutAnimation(false);
    onClose();
  }, [onClose]);

  const handleActionPress = useCallback(
    (action: ActionSelectionItem) => {
      if (deferActionsUntilDismissed && Platform.OS === "ios") {
        pendingActionRef.current = action.onPress;
        setDismissWithoutAnimation(true);
        requestAnimationFrame(onClose);
        return;
      }

      onClose();
      action.onPress();
    },
    [deferActionsUntilDismissed, onClose],
  );

  const handleDismiss = useCallback(() => {
    const pendingAction = pendingActionRef.current;
    pendingActionRef.current = null;
    setDismissWithoutAnimation(false);
    pendingAction?.();
  }, []);

  return (
    <Modal
      visible={visible}
      transparent
      animationType={dismissWithoutAnimation ? "none" : "fade"}
      statusBarTranslucent
      onRequestClose={close}
      onDismiss={handleDismiss}
    >
      <View style={styles.overlay}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Закрыть меню действий"
          style={styles.backdrop}
          onPress={close}
        />

        <View style={styles.dialog}>
          <View style={styles.header}>
            <View style={styles.headerText}>
              <Text style={styles.title}>{title}</Text>
              {subtitle ? (
                <Text style={styles.subtitle} numberOfLines={2}>
                  {subtitle}
                </Text>
              ) : null}
            </View>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Закрыть меню"
              hitSlop={8}
              style={styles.close}
              onPress={close}
            >
              <Ionicons name="close" size={20} color="#475467" />
            </Pressable>
          </View>

          <View style={styles.list}>
            {actions.map((action) => {
              const isDanger = action.tone === "danger";

              return (
                <Pressable
                  key={action.key}
                  accessibilityRole="button"
                  accessibilityLabel={action.accessibilityLabel ?? action.label}
                  style={[styles.row, isDanger && styles.dangerRow]}
                  onPress={() => handleActionPress(action)}
                >
                  <View style={[styles.icon, isDanger && styles.dangerIcon]}>
                    <Ionicons
                      name={action.icon}
                      size={20}
                      color={isDanger ? Colors.error : Colors.greenColor}
                    />
                  </View>

                  <Text style={[styles.rowText, isDanger && styles.dangerText]}>
                    {action.label}
                  </Text>

                  <Ionicons
                    name="chevron-forward"
                    size={18}
                    color={isDanger ? "#F97066" : "#98A2B3"}
                  />
                </Pressable>
              );
            })}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(15, 23, 42, 0.38)",
  },
  dialog: {
    width: "100%",
    maxWidth: 380,
    borderRadius: 22,
    backgroundColor: Colors.white,
    padding: 16,
    shadowColor: "#101828",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 12,
  },
  header: {
    minHeight: 56,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  headerText: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    fontSize: 16,
    fontWeight: "900",
    color: "#101828",
  },
  subtitle: {
    marginTop: 3,
    fontSize: 12,
    color: "#667085",
  },
  close: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#F2F4F7",
    alignItems: "center",
    justifyContent: "center",
  },
  list: {
    gap: 8,
    marginTop: 8,
  },
  row: {
    minHeight: 56,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#EAECF0",
    backgroundColor: "#F9FAFB",
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
  },
  dangerRow: {
    borderColor: "#FECDCA",
    backgroundColor: "#FEF3F2",
  },
  icon: {
    width: 34,
    height: 34,
    borderRadius: 11,
    backgroundColor: "#ECFDF3",
    alignItems: "center",
    justifyContent: "center",
  },
  dangerIcon: {
    backgroundColor: "#FEE4E2",
  },
  rowText: {
    flex: 1,
    fontSize: 14,
    fontWeight: "700",
    color: "#344054",
  },
  dangerText: {
    color: Colors.error,
  },
});
