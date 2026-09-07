import { Ionicons } from "@expo/vector-icons";
import { Text } from "@ui-kitten/components";
import React from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from "react-native";

import type { ProductionTaskConsumableType } from "../../../../entities/productionTask";
import Colors from "../../../../shared/styles/Colors";
import { AppSelector } from "../../../AppSelector/AppSelector";
import {
  getConsumableName,
  normTypeLabels,
} from "./TaskConsumables.logic";

type Props = {
  visible: boolean;
  type: ProductionTaskConsumableType;
  editingItem: any | null;
  selectedSource: any | null;
  selectedUnit: any | null;
  sourceOptionsCount: number;
  quantity: string;
  isSubmitting: boolean;
  onQuantityChange: (value: string) => void;
  onOpenSource: () => void;
  onOpenUnit: () => void;
  onClose: () => void;
  onSubmit: () => void;
};

export function ConsumableEditModal({
  visible,
  type,
  editingItem,
  selectedSource,
  selectedUnit,
  sourceOptionsCount,
  quantity,
  isSubmitting,
  onQuantityChange,
  onOpenSource,
  onOpenUnit,
  onClose,
  onSubmit,
}: Props) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />

        <View style={styles.card}>
          <View style={styles.header}>
            <Text style={styles.title}>
              {editingItem ? "Редактировать" : "Добавить"}{" "}
              {normTypeLabels[type].toLowerCase()}
            </Text>
            <Pressable
              accessibilityLabel="Закрыть"
              onPress={onClose}
              style={styles.iconButton}
            >
              <Ionicons name="close" size={18} color="#667085" />
            </Pressable>
          </View>

          {!editingItem && sourceOptionsCount > 0 && (
            <AppSelector
              label="Расходник"
              value={
                selectedSource ? getConsumableName(selectedSource, type) : null
              }
              placeholder="Выбрать из справочника"
              onPress={onOpenSource}
            />
          )}

          {!editingItem && sourceOptionsCount === 0 && (
            <View style={styles.hintBox}>
              <Text style={styles.hintText}>
                В справочнике нет расходников этого типа.
              </Text>
            </View>
          )}

          <View style={styles.inputBox}>
            <Text style={styles.inputLabel}>Норма</Text>
            <TextInput
              value={quantity}
              onChangeText={onQuantityChange}
              keyboardType="decimal-pad"
              placeholder="Введите норму"
              placeholderTextColor="#98A2B3"
              style={styles.textInput}
            />
          </View>

          {type === "seed" && (
            <AppSelector
              label="Ед."
              value={
                selectedUnit
                  ? (selectedUnit.name ??
                    selectedUnit.description ??
                    String(selectedUnit.type ?? selectedUnit.id ?? ""))
                  : null
              }
              placeholder="Выбрать единицу измерения"
              onPress={onOpenUnit}
            />
          )}

          <Pressable
            style={[
              styles.submitButton,
              isSubmitting && styles.submitButtonDisabled,
            ]}
            onPress={onSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <Text style={styles.submitButtonText}>
                {editingItem ? "Изменить" : "Добавить"}
              </Text>
            )}
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  card: {
    width: "90%",
    borderRadius: 22,
    backgroundColor: Colors.white,
    padding: 16,
    gap: 12,
  },
  header: {
    minHeight: 36,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  title: {
    flex: 1,
    fontSize: 17,
    fontWeight: "800",
    color: "#101828",
  },
  iconButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: Colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
  hintBox: {
    borderRadius: 14,
    backgroundColor: "#F9FAFB",
    padding: 12,
  },
  hintText: {
    fontSize: 12,
    color: "#667085",
    lineHeight: 17,
  },
  inputBox: {
    borderRadius: 12,
    backgroundColor: "#F7F8FA",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#ECECEC",
  },
  inputLabel: {
    fontSize: 11,
    color: "#667085",
    marginBottom: 2,
  },
  textInput: {
    minHeight: 34,
    paddingVertical: 0,
    fontSize: 15,
    fontWeight: "700",
    color: "#101828",
  },
  submitButton: {
    height: 46,
    borderRadius: 14,
    backgroundColor: Colors.greenColor,
    alignItems: "center",
    justifyContent: "center",
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    fontSize: 15,
    fontWeight: "800",
    color: Colors.white,
  },
});
