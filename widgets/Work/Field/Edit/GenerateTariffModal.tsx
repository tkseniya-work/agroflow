import { Ionicons } from "@expo/vector-icons";
import { Text } from "@ui-kitten/components";
import React from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import Colors from "../../../../shared/styles/Colors";
import type {
  GenerateTariffTarget,
  MachineryOption,
  TechniqueOption,
} from "./TaskTechniques.logic";

type Props = {
  target: GenerateTariffTarget | null;
  workName?: string | null;
  transferWorkName?: string | null;
  technique: TechniqueOption | null;
  machinery: MachineryOption | null;
  isGenerating: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export function GenerateTariffModal({
  target,
  workName,
  transferWorkName,
  technique,
  machinery,
  isGenerating,
  onClose,
  onConfirm,
}: Props) {
  return (
    <Modal
      visible={target !== null}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable
          style={styles.backdrop}
          onPress={() => {
            if (!isGenerating) onClose();
          }}
        />

        <View style={styles.card}>
          <View style={styles.header}>
            <View style={styles.icon}>
              <Ionicons
                name="sparkles"
                size={21}
                color={Colors.greenColor}
              />
            </View>

            <View style={styles.titleWrap}>
              <Text style={styles.title}>
                {target === "transfer" ? "Тариф на перегон" : "Основной тариф"}
              </Text>
              <Text style={styles.subtitle}>Проверьте данные для генерации</Text>
            </View>

            <Pressable
              style={styles.closeButton}
              disabled={isGenerating}
              onPress={onClose}
            >
              <Ionicons name="close" size={20} color="#667085" />
            </Pressable>
          </View>

          <View style={styles.info}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Работа</Text>
              <Text style={styles.infoValue}>
                {target === "transfer"
                  ? (transferWorkName ?? "Перегон")
                  : (workName ?? "—")}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Модель техники</Text>
              <View style={styles.infoValueWrap}>
                <Text style={styles.infoValue}>
                  {technique?.machineryModelName ?? "—"}
                </Text>
                {!!technique?.machineryModelPower && (
                  <Text style={styles.infoHint}>
                    Мощность: {technique.machineryModelPower} л.с.
                  </Text>
                )}
              </View>
            </View>

            <View style={[styles.infoRow, styles.infoLast]}>
              <Text style={styles.infoLabel}>СХМ</Text>
              <Text style={styles.infoValue}>
                {machinery?.machineryModelName ?? "—"}
              </Text>
            </View>
          </View>

          <Text style={styles.note}>
            Тариф будет добавлен в справочник и сразу выбран в форме.
          </Text>

          <View style={styles.actions}>
            <Pressable
              style={styles.cancelButton}
              disabled={isGenerating}
              onPress={onClose}
            >
              <Text style={styles.cancelButtonText}>Отмена</Text>
            </Pressable>

            <Pressable
              style={[
                styles.submitButton,
                isGenerating && styles.submitButtonDisabled,
              ]}
              disabled={isGenerating}
              onPress={onConfirm}
            >
              {isGenerating ? (
                <ActivityIndicator size="small" color={Colors.white} />
              ) : (
                <>
                  <Ionicons name="sparkles" size={17} color={Colors.white} />
                  <Text style={styles.submitButtonText}>Создать и выбрать</Text>
                </>
              )}
            </Pressable>
          </View>
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
    padding: 20,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(16, 24, 40, 0.48)",
  },
  card: {
    width: "100%",
    maxWidth: 520,
    borderRadius: 18,
    backgroundColor: Colors.white,
    padding: 16,
  },
  header: {
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#ECFDF3",
    alignItems: "center",
    justifyContent: "center",
  },
  titleWrap: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    fontSize: 17,
    fontWeight: "800",
    color: "#101828",
  },
  subtitle: {
    marginTop: 2,
    fontSize: 12,
    color: "#667085",
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F2F4F7",
    alignItems: "center",
    justifyContent: "center",
  },
  info: {
    marginTop: 16,
    borderWidth: 1,
    borderColor: "#EAECF0",
    borderRadius: 14,
    paddingHorizontal: 12,
  },
  infoRow: {
    minHeight: 54,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#EAECF0",
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  infoLast: {
    borderBottomWidth: 0,
  },
  infoLabel: {
    width: 112,
    fontSize: 12,
    color: "#667085",
  },
  infoValueWrap: {
    flex: 1,
    minWidth: 0,
  },
  infoValue: {
    flex: 1,
    fontSize: 13,
    fontWeight: "700",
    color: "#344054",
  },
  infoHint: {
    marginTop: 2,
    fontSize: 11,
    color: "#667085",
  },
  note: {
    marginTop: 12,
    fontSize: 12,
    lineHeight: 17,
    color: "#667085",
  },
  actions: {
    marginTop: 16,
    flexDirection: "row",
    gap: 10,
  },
  cancelButton: {
    flex: 1,
    height: 46,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#D0D5DD",
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#344054",
  },
  submitButton: {
    flex: 1.4,
    height: 46,
    borderRadius: 12,
    backgroundColor: Colors.greenColor,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },
  submitButtonDisabled: {
    opacity: 0.65,
  },
  submitButtonText: {
    fontSize: 13,
    fontWeight: "800",
    color: Colors.white,
  },
});
