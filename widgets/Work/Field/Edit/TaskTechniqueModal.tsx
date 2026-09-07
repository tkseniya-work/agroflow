import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  View,
} from "react-native";
import { Text } from "@ui-kitten/components";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Colors from "../../../../shared/styles/Colors";
import { PickerOption } from "../../../AppSelector/AppPickerModal";
import { GenerateTariffModal } from "./GenerateTariffModal";
import { styles } from "./TaskTechniqueModal.styles";
import { TaskTechniqueModalFields } from "./TaskTechniqueModalFields";
import {
  TaskTechniqueModalPickers,
  TaskTechniquePicker,
} from "./TaskTechniqueModalPickers";
import {
  GenerateTariffTarget,
  MachineryOption,
  TechniqueOption,
} from "./TaskTechniques.logic";

type Props = {
  visible: boolean;
  workName?: string | null;
  transferWorkName?: string | null;
  isTransportationTask: boolean;
  isTransportLikeTask: boolean;
  requiresTransferTariff: boolean;
  selectedTechnique: TechniqueOption | null;
  selectedMachinery: MachineryOption | null;
  selectedTariff: any | null;
  selectedTransferTariff: any | null;
  workSpeed: string;
  processingDepth: string;
  soluteFlowRate: string;
  techniqueOptions: PickerOption<TechniqueOption>[];
  machineryOptions: PickerOption<MachineryOption>[];
  tariffOptions: PickerOption[];
  transferTariffOptions: PickerOption[];
  generateTariffTarget: GenerateTariffTarget | null;
  isSubmitting: boolean;
  isGeneratingTariff: boolean;
  onClose: () => void;
  onSelectTechnique: (technique: TechniqueOption) => void;
  onSelectMachinery: (machinery: MachineryOption) => void;
  onSelectTariff: (tariff: any) => void;
  onSelectTransferTariff: (tariff: any) => void;
  onChangeWorkSpeed: (value: string) => void;
  onChangeProcessingDepth: (value: string) => void;
  onChangeSoluteFlowRate: (value: string) => void;
  onOpenGenerateTariff: (target: GenerateTariffTarget) => void;
  onCloseGenerateTariff: () => void;
  onGenerateTariff: () => void;
  onSubmit: () => void;
};

export function TaskTechniqueModal({
  visible,
  workName,
  transferWorkName,
  isTransportationTask,
  isTransportLikeTask,
  requiresTransferTariff,
  selectedTechnique,
  selectedMachinery,
  selectedTariff,
  selectedTransferTariff,
  workSpeed,
  processingDepth,
  soluteFlowRate,
  techniqueOptions,
  machineryOptions,
  tariffOptions,
  transferTariffOptions,
  generateTariffTarget,
  isSubmitting,
  isGeneratingTariff,
  onClose,
  onSelectTechnique,
  onSelectMachinery,
  onSelectTariff,
  onSelectTransferTariff,
  onChangeWorkSpeed,
  onChangeProcessingDepth,
  onChangeSoluteFlowRate,
  onOpenGenerateTariff,
  onCloseGenerateTariff,
  onGenerateTariff,
  onSubmit,
}: Props) {
  const insets = useSafeAreaInsets();
  const [activePicker, setActivePicker] =
    useState<TaskTechniquePicker | null>(null);

  useEffect(() => {
    if (!visible) setActivePicker(null);
  }, [visible]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
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
            accessibilityLabel="Закрыть добавление техники"
            onPress={onClose}
            style={styles.iconButton}
          >
            <Ionicons name="close" size={24} color={Colors.black} />
          </Pressable>

          <View style={styles.titleWrap}>
            <Text style={styles.title}>Добавить технику</Text>
            <Text style={styles.subtitle}>
              {selectedTechnique?.additionalInfo
                ? isTransportationTask
                  ? "Техника будет добавлена в текущее задание"
                  : "Техника будет перенесена на текущее задание"
                : (workName ?? "Полевое задание")}
            </Text>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={[
            styles.content,
            {
              paddingBottom:
                Platform.OS === "android"
                  ? 60 + Math.max(insets.bottom, 16) + 16
                  : Math.max(24, insets.bottom + 16),
            },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <TaskTechniqueModalFields
            isTransportLikeTask={isTransportLikeTask}
            requiresTransferTariff={requiresTransferTariff}
            selectedTechnique={selectedTechnique}
            selectedMachinery={selectedMachinery}
            selectedTariff={selectedTariff}
            selectedTransferTariff={selectedTransferTariff}
            workSpeed={workSpeed}
            processingDepth={processingDepth}
            soluteFlowRate={soluteFlowRate}
            isSubmitting={isSubmitting}
            onOpenPicker={setActivePicker}
            onChangeWorkSpeed={onChangeWorkSpeed}
            onChangeProcessingDepth={onChangeProcessingDepth}
            onChangeSoluteFlowRate={onChangeSoluteFlowRate}
            onOpenGenerateTariff={onOpenGenerateTariff}
            onClose={onClose}
            onSubmit={onSubmit}
          />
        </ScrollView>

        <TaskTechniqueModalPickers
          activePicker={activePicker}
          techniqueOptions={techniqueOptions}
          machineryOptions={machineryOptions}
          tariffOptions={tariffOptions}
          transferTariffOptions={transferTariffOptions}
          selectedTechnique={selectedTechnique}
          selectedMachinery={selectedMachinery}
          selectedTariff={selectedTariff}
          selectedTransferTariff={selectedTransferTariff}
          onClose={() => setActivePicker(null)}
          onSelectTechnique={onSelectTechnique}
          onSelectMachinery={onSelectMachinery}
          onSelectTariff={onSelectTariff}
          onSelectTransferTariff={onSelectTransferTariff}
        />

        <GenerateTariffModal
          target={generateTariffTarget}
          workName={workName ?? undefined}
          transferWorkName={transferWorkName ?? undefined}
          technique={selectedTechnique}
          machinery={selectedMachinery}
          isGenerating={isGeneratingTariff}
          onClose={onCloseGenerateTariff}
          onConfirm={onGenerateTariff}
        />
      </View>
    </Modal>
  );
}
