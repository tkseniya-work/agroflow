import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  ActivityIndicator,
  Pressable,
  TextInput,
  View,
} from "react-native";
import { Text } from "@ui-kitten/components";

import Colors from "../../../../shared/styles/Colors";
import { AppSelector } from "../../../AppSelector/AppSelector";
import { styles } from "./TaskTechniqueModal.styles";
import type { TaskTechniquePicker } from "./TaskTechniqueModalPickers";
import {
  GenerateTariffTarget,
  getBusyTechniqueContext,
  MachineryOption,
  TechniqueOption,
} from "./TaskTechniques.logic";

type Props = {
  isTransportLikeTask: boolean;
  requiresTransferTariff: boolean;
  selectedTechnique: TechniqueOption | null;
  selectedMachinery: MachineryOption | null;
  selectedTariff: any | null;
  selectedTransferTariff: any | null;
  workSpeed: string;
  processingDepth: string;
  soluteFlowRate: string;
  isSubmitting: boolean;
  onOpenPicker: (picker: TaskTechniquePicker) => void;
  onChangeWorkSpeed: (value: string) => void;
  onChangeProcessingDepth: (value: string) => void;
  onChangeSoluteFlowRate: (value: string) => void;
  onOpenGenerateTariff: (target: GenerateTariffTarget) => void;
  onClose: () => void;
  onSubmit: () => void;
};

export function TaskTechniqueModalFields({
  isTransportLikeTask,
  requiresTransferTariff,
  selectedTechnique,
  selectedMachinery,
  selectedTariff,
  selectedTransferTariff,
  workSpeed,
  processingDepth,
  soluteFlowRate,
  isSubmitting,
  onOpenPicker,
  onChangeWorkSpeed,
  onChangeProcessingDepth,
  onChangeSoluteFlowRate,
  onOpenGenerateTariff,
  onClose,
  onSubmit,
}: Props) {
  const busyContext = selectedTechnique?.additionalInfo
    ? getBusyTechniqueContext(selectedTechnique.additionalInfo)
    : null;

  return (
    <>
      <AppSelector
        label="Техника"
        value={selectedTechnique?.displayName ?? null}
        placeholder="Выбрать технику"
        onPress={() => onOpenPicker("technique")}
        variant={selectedTechnique?.additionalInfo ? "danger" : "default"}
        badgeText={selectedTechnique?.additionalInfo ? "Занята" : null}
      />

      {selectedTechnique?.additionalInfo && (
        <View style={styles.warningBox}>
          <Ionicons name="warning-outline" size={18} color="#B54708" />
          <View style={styles.warningTextWrap}>
            <Text style={styles.warningText}>
              Техника на данный момент выполняет другое задание. После назначения
              агрегата она будет перемещена на текущее задание.
            </Text>
            {!!busyContext && (
              <Text style={styles.warningMeta}>{busyContext}</Text>
            )}
          </View>
        </View>
      )}

      <AppSelector
        label="Сельхозмашина"
        value={selectedMachinery?.name}
        placeholder="Выбрать сельхозмашину"
        onPress={() => onOpenPicker("machinery")}
      />

      <AppSelector
        label="Основной тариф"
        value={
          selectedTariff ? `Норма: ${selectedTariff.norm_value ?? "-"}` : null
        }
        placeholder={
          selectedTechnique ? "Выбрать тариф" : "Сначала выберите технику"
        }
        disabled={!selectedTechnique}
        onPress={() => onOpenPicker("tariff")}
      />

      <GenerateTariffButton
        label="Сгенерировать основной тариф"
        disabled={!selectedTechnique}
        onPress={() => onOpenGenerateTariff("main")}
      />

      {requiresTransferTariff && (
        <>
          <AppSelector
            label="Тариф на перегон"
            value={
              selectedTransferTariff
                ? `Норма: ${selectedTransferTariff.norm_value ?? "-"}`
                : null
            }
            placeholder={
              selectedTechnique
                ? "Выбрать тариф на перегон"
                : "Сначала выберите технику"
            }
            disabled={!selectedTechnique}
            onPress={() => onOpenPicker("transferTariff")}
          />

          <GenerateTariffButton
            label="Сгенерировать тариф на перегон"
            disabled={!selectedTechnique}
            onPress={() => onOpenGenerateTariff("transfer")}
          />
        </>
      )}

      <View style={styles.paramsCard}>
        <Text style={styles.paramsTitle}>
          {isTransportLikeTask
            ? "Параметры транспортировки"
            : "Агротехнические параметры"}
        </Text>

        <TechniqueParameterInput
          label="Скорость работы, км/ч"
          placeholder="Введите скорость"
          value={workSpeed}
          onChangeText={onChangeWorkSpeed}
        />

        {!isTransportLikeTask && (
          <>
            <TechniqueParameterInput
              label="Глубина обработки, см"
              placeholder="Введите глубину"
              value={processingDepth}
              onChangeText={onChangeProcessingDepth}
            />
            <TechniqueParameterInput
              label="Норма вылива, л/га"
              placeholder="Введите норму"
              value={soluteFlowRate}
              onChangeText={onChangeSoluteFlowRate}
            />
          </>
        )}
      </View>

      <View style={styles.footer}>
        <Pressable style={styles.cancelButton} onPress={onClose}>
          <Text style={styles.cancelButtonText}>Отменить</Text>
        </Pressable>

        <Pressable
          style={[
            styles.submitButton,
            isSubmitting && styles.submitButtonDisabled,
          ]}
          disabled={isSubmitting}
          onPress={onSubmit}
        >
          {isSubmitting ? (
            <ActivityIndicator color={Colors.white} />
          ) : (
            <Text style={styles.submitButtonText}>
              {selectedTechnique?.additionalInfo ? "Перенести" : "Сохранить"}
            </Text>
          )}
        </Pressable>
      </View>
    </>
  );
}

function GenerateTariffButton({
  label,
  disabled,
  onPress,
}: {
  label: string;
  disabled: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={[
        styles.generateTariffButton,
        disabled && styles.generateTariffButtonDisabled,
      ]}
      disabled={disabled}
      onPress={onPress}
    >
      <Ionicons
        name="sparkles-outline"
        size={18}
        color={disabled ? "#98A2B3" : Colors.greenColor}
      />
      <Text
        style={[
          styles.generateTariffButtonText,
          disabled && styles.generateTariffButtonTextDisabled,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function TechniqueParameterInput({
  label,
  placeholder,
  value,
  onChangeText,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (value: string) => void;
}) {
  return (
    <View style={styles.inputBox}>
      <Text style={styles.inputLabel}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        keyboardType="decimal-pad"
        placeholder={placeholder}
        placeholderTextColor="#98A2B3"
        style={styles.textInput}
      />
    </View>
  );
}
