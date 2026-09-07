import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";

import { FieldProductionTaskResponse } from "../../../../../entities/productionTask/model/fieldProductionTask.interface";
import { useDictionaryActions } from "../../../../../features/dictionarySync";
import { useProductionShiftActions } from "../../../../../entities/productionShift/lib/useProductionShiftActions";
import { useTariffActions } from "../../../../../src/hooks/database/useTariffActions";
import { useNetworkStatus } from "../../../../../shared/lib/useNetworkStatus";
import { useProductionTasks } from "../../../../../entities/productionTask/lib/useProductionTasks";
import Colors from "../../../../../shared/styles/Colors";
import { AppPickerModal } from "../../../../AppSelector/AppPickerModal";
import { AddShiftPartFields } from "./AddShiftPartFields";
import {
  AddShiftMode,
  buildAddShiftPartPayload,
  validateAddShiftPart,
} from "./AddShiftPartModal.helpers";
import { styles } from "./AddShiftPartModal.styles";
import { useAddShiftPartForm } from "./useAddShiftPartForm";

type Props = {
  visible: boolean;
  mode: AddShiftMode;
  currentTask: FieldProductionTaskResponse;
  accessToken: string | null;
  employees: any[];
  onClose: () => void;
  onSaved: () => Promise<void> | void;
};

export const AddShiftPartModal = ({
  visible,
  mode,
  currentTask,
  accessToken,
  employees,
  onClose,
  onSaved,
}: Props) => {
  const insets = useSafeAreaInsets();
  const {
    loadAgriculturalMachinery,
    loadProductionWorkPlaces: loadWorkPlaces,
  } = useDictionaryActions();
  const { loadShiftSettings } = useProductionShiftActions();
  const { searchTariffs } = useTariffActions();
  const { isConnected } = useNetworkStatus();
  const { createShiftPart, getTaskShiftForceLoadPreview } = useProductionTasks({
    status: [],
    autoLoad: false,
  });
  const [isSaving, setIsSaving] = useState(false);
  const {
    isFact,
    picker,
    setPicker,
    employee,
    shiftType,
    technique,
    agriMachine,
    tariff,
    field,
    form,
    setForm,
    agriculturalOptions,
    pickerConfig,
  } = useAddShiftPartForm({
    visible,
    mode,
    currentTask,
    accessToken,
    employees,
    loadWorkPlaces,
    loadAgriculturalMachinery,
    loadShiftSettings,
    searchTariffs,
  });

  const handleSubmit = async () => {
    const error = validateAddShiftPart({
      accessToken,
      form,
      isFact,
      hasEmployee: Boolean(employee),
      hasShiftType: Boolean(shiftType),
      hasTechnique: Boolean(technique),
      hasTariff: Boolean(tariff),
    });
    if (error) {
      Alert.alert("Не хватает данных", error);
      return;
    }

    if (!isConnected) {
      Alert.alert(
        "Нет подключения к интернету",
        "Добавление смены доступно только онлайн.",
      );
      return;
    }

    try {
      setIsSaving(true);
      const payload = buildAddShiftPartPayload({
        currentTaskId: currentTask.id,
        form,
        isFact,
        employeeId: employee?.id,
        shiftTypeId: shiftType?.id,
        techniqueId: technique?.id,
        agriculturalMachineryId: agriMachine?.id,
        tariffId: tariff?.id,
        fieldId: field?.id,
      });

      if (isFact && form.forceLoadTrack) {
        const preview = await getTaskShiftForceLoadPreview({
          accessToken,
          data: {
            start_at: payload.start_at_iso,
            ended_at: payload.ended_at,
            work_place_id: payload.work_place_id,
            employee_id: payload.employee_id,
            shift_type: payload.type,
            date: payload.date,
          },
        });

        Alert.alert(
          "Предпросмотр трека",
          Array.isArray(preview)
            ? `Получено элементов: ${preview.length}`
            : "Данные трека загружены",
        );
      } else {
        const success = await createShiftPart({
          accessToken,
          data: payload,
        });

        if (!success) {
          Alert.alert(
            "Не удалось добавить смену",
            "Проверьте данные и повторите.",
          );
          return;
        }
      }

      await onSaved();
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />

        <View
          style={[
            styles.sheet,
            { paddingBottom: Math.max(16, insets.bottom + 16) },
          ]}
        >
          <View style={styles.header}>
            <View style={styles.headerIcon}>
              <MaterialCommunityIcons
                name={isFact ? "clipboard-check-outline" : "access-point"}
                size={21}
                color={Colors.greenColor}
              />
            </View>
            <View style={styles.headerText}>
              <Text style={styles.title}>
                {isFact ? "Добавить смену по факту" : "Добавить онлайн-смену"}
              </Text>
            </View>
            <Pressable style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close" size={22} color="#667085" />
            </Pressable>
          </View>

          <ScrollView
            style={styles.content}
            contentContainerStyle={styles.contentInner}
            keyboardShouldPersistTaps="handled"
          >
            <AddShiftPartFields
              isFact={isFact}
              form={form}
              setForm={setForm}
              employee={employee}
              shiftType={shiftType}
              technique={technique}
              agriMachine={agriMachine}
              tariff={tariff}
              field={field}
              agriculturalOptionsLength={agriculturalOptions.length}
              onOpenPicker={setPicker}
            />
          </ScrollView>

          <View style={styles.footer}>
            <Pressable
              style={[styles.footerButton, styles.cancelButton]}
              onPress={onClose}
            >
              <Text style={styles.cancelText}>Отмена</Text>
            </Pressable>

            <Pressable
              style={[
                styles.footerButton,
                styles.saveButton,
                isSaving && styles.disabledButton,
              ]}
              onPress={handleSubmit}
              disabled={isSaving}
            >
              {isSaving ? (
                <ActivityIndicator color={Colors.white} size="small" />
              ) : (
                <Text style={styles.saveText}>
                  {form.forceLoadTrack ? "Загрузить трек" : "Добавить"}
                </Text>
              )}
            </Pressable>
          </View>
        </View>

        <AppPickerModal
          visible={Boolean(picker)}
          title={pickerConfig.title}
          data={pickerConfig.data}
          selectedId={pickerConfig.selectedId}
          onClose={() => setPicker(null)}
          onSelect={pickerConfig.onSelect}
        />
      </View>
    </Modal>
  );
};
