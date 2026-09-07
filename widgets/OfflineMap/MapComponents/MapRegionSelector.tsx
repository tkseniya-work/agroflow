import React from "react";
import {
  ActivityIndicator,
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Colors from "../../../shared/styles/Colors";

type MapRegionSelectorProps = {
  mapMode: "selectRegion" | "normal";
  isSaving?: boolean;
  error?: string | null;
  onConfirm: () => void;
  onCancel: () => void;
};

const MapRegionSelector = ({
  mapMode,
  isSaving = false,
  error,
  onConfirm,
  onCancel,
}: MapRegionSelectorProps) => {
  const insets = useSafeAreaInsets();

  if (mapMode !== "selectRegion") return null;

  return (
    <>
      <View
        pointerEvents="none"
        style={[styles.instructions, { top: insets.top + 12 }]}
      >
        <Text style={styles.title}>Область для офлайн-карты</Text>
        <Text style={styles.hint}>
          Перемещайте и масштабируйте карту. Скачается участок внутри рамки.
        </Text>
      </View>

      <View
        accessibilityLabel="Область для сохранения офлайн-карты"
        pointerEvents="none"
        style={[
          styles.box,
          {
            top: insets.top + 100,
            bottom: insets.bottom + 270,
          },
        ]}
      />

      <View style={[styles.container, { bottom: insets.bottom + 204 }]}>
        {!!error && (
          <View
            accessible
            accessibilityLiveRegion="polite"
            accessibilityRole="alert"
            style={styles.errorCard}
          >
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <View style={styles.actions}>
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Отменить выбор офлайн-области"
            disabled={isSaving}
            style={[styles.btn, styles.cancelButton, isSaving && styles.disabled]}
            onPress={onCancel}
          >
            <Text style={styles.cancelText}>Отмена</Text>
          </TouchableOpacity>

          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel={
              isSaving ? "Подготовка офлайн-области" : "Скачать офлайн-область"
            }
            disabled={isSaving}
            style={[styles.btn, styles.saveButton, isSaving && styles.disabled]}
            onPress={onConfirm}
          >
            {isSaving && (
              <ActivityIndicator
                accessibilityLabel="Сохраняем офлайн-область"
                size="small"
                color={Colors.white}
              />
            )}
            <Text style={styles.saveText}>
              {isSaving ? "Начинаем..." : error ? "Повторить" : "Скачать"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
};

export default React.memo(MapRegionSelector);

const styles = StyleSheet.create({
  box: {
    position: "absolute",
    left: 18,
    right: 18,
    borderWidth: 2,
    borderColor: Colors.greenColor,
    borderRadius: 18,
    backgroundColor: "rgba(11,148,68,0.04)",
  },
  instructions: {
    position: "absolute",
    left: 12,
    right: 12,
    zIndex: 20,
    paddingVertical: 10,
    paddingHorizontal: 13,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.97)",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  title: {
    color: Colors.grey900,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "700",
  },
  hint: {
    marginTop: 3,
    color: Colors.grey600,
    fontSize: 12,
    lineHeight: 16,
  },
  container: {
    position: "absolute",
    left: 12,
    right: 12,
    zIndex: 20,
    gap: 8,
  },
  actions: {
    flexDirection: "row",
    gap: 10,
  },
  btn: {
    minHeight: 46,
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    paddingHorizontal: 14,
    borderRadius: 13,
    borderWidth: 1,
  },
  cancelButton: {
    borderColor: "#D7DCE2",
    backgroundColor: "rgba(255,255,255,0.97)",
  },
  saveButton: {
    borderColor: Colors.greenColor,
    backgroundColor: Colors.greenColor,
  },
  cancelText: {
    color: Colors.grey800,
    fontSize: 14,
    fontWeight: "700",
  },
  saveText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: "700",
  },
  errorCard: {
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#F4C7C3",
    borderRadius: 12,
    backgroundColor: "rgba(255,250,250,0.98)",
  },
  errorText: {
    color: "#B3261E",
    fontSize: 12,
    lineHeight: 16,
    textAlign: "center",
  },
  disabled: {
    opacity: 0.72,
  },
});
