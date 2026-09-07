import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
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

import { AppPickerModal } from "../../../../AppSelector/AppPickerModal";
import { FieldProductionTaskResponse } from "../../../../../entities/productionTask/model/fieldProductionTask.interface";
import Colors from "../../../../../shared/styles/Colors";
import { useProductionTasks } from "../../../../../entities/productionTask/lib/useProductionTasks";
import { useProductionShiftActions } from "../../../../../entities/productionShift/lib/useProductionShiftActions";
import { useDictionaryActions } from "../../../../../features/dictionarySync";
import { useTariffActions } from "../../../../../src/hooks/database/useTariffActions";
import { useNetworkStatus } from "../../../../../shared/lib/useNetworkStatus";
import { ShiftPartDetails } from "../../../../../src/types/task.types";
import { ShiftPartEditMaterialsForm } from "./ShiftPartEditMaterialsForm";
import {
  buildMaterialQuantityRequest,
  buildShiftPartSavePlan,
  getMaterialQuantityError,
} from "./ShiftPartEditModal.helpers";
import { modalStyles } from "./ShiftPartEditModal.styles";
import { ShiftPartEditPartForm } from "./ShiftPartEditPartForm";
import { useShiftPartEditForm } from "./useShiftPartEditForm";

type Props = {
  visible: boolean;
  currentTask: FieldProductionTaskResponse;
  details: ShiftPartDetails | null;
  accessToken: string | null;
  onClose: () => void;
  onSaved: () => Promise<void> | void;
};

export const ShiftPartEditModal = ({
  visible,
  currentTask,
  details,
  accessToken,
  onClose,
  onSaved,
}: Props) => {
  const insets = useSafeAreaInsets();
  const { updateShiftPart, updatePartsMaterialQuantity } = useProductionTasks({
    status: [],
    autoLoad: false,
  });
  const { isConnected } = useNetworkStatus();
  const { loadShiftSettings, updateShiftTotalsV2 } =
    useProductionShiftActions();
  const { searchTariffs } = useTariffActions();
  const {
    loadAgriculturalMachinery,
    loadProductionWorkPlaces: loadWorkPlaces,
  } = useDictionaryActions();

  const [isSaving, setIsSaving] = useState(false);
  const [hasAttemptedMaterialSave, setHasAttemptedMaterialSave] =
    useState(false);
  const {
    activeTab,
    setActiveTab,
    picker,
    setPicker,
    selectedShiftType,
    selectedField,
    selectedTechnique,
    selectedAgriMachine,
    selectedTariff,
    selectedMaterialIndex,
    setSelectedMaterialIndex,
    materialQuantity,
    setMaterialQuantity,
    form,
    setField,
    context,
    fieldGrouped,
    tariffGrouped,
    transferGrouped,
    materialPartIds,
    editablePartIds,
    originalStartAt,
    originalEndedAt,
    materialItems,
    selectedMaterial,
    isHarvesting,
    isTransportTask,
    isTransportation,
    isTransportOutput,
    workPlaces,
    agriOptions,
    pickerConfig,
    hasUnsavedChanges,
  } = useShiftPartEditForm({
    visible,
    currentTask,
    details,
    accessToken,
    loadWorkPlaces,
    loadAgriculturalMachinery,
    loadShiftSettings,
    searchTariffs,
  });
  const materialQuantityError = hasAttemptedMaterialSave
    ? getMaterialQuantityError(materialQuantity)
    : null;

  useEffect(() => {
    if (visible) {
      setHasAttemptedMaterialSave(false);
    }
  }, [details, visible]);

  const requestClose = () => {
    if (isSaving) return;

    if (!hasUnsavedChanges) {
      onClose();
      return;
    }

    Alert.alert(
      "Закрыть без сохранения?",
      "Внесённые изменения будут потеряны.",
      [
        {
          text: "Продолжить редактирование",
          style: "cancel",
        },
        {
          text: "Закрыть",
          style: "destructive",
          onPress: onClose,
        },
      ],
    );
  };

  const handleSavePart = async () => {
    if (!details || !accessToken || !context?.productionShiftId) return;

    if (!isConnected) {
      Alert.alert(
        "Нет подключения к интернету",
        "Сохранение изменений доступно только онлайн.",
      );
      return;
    }

    const source = details.type === "field" ? fieldGrouped : transferGrouped;
    const savePlan = buildShiftPartSavePlan({
      accessToken,
      currentTaskId: currentTask.id,
      productionShiftId: context.productionShiftId,
      detailsType: details.type,
      form,
      originalStartAt,
      originalEndedAt,
      originalFieldId: fieldGrouped?.task_field_id,
      editablePartIds,
      fallbackPartId: source?.id,
      isTransportOutput,
      selectedFieldId: selectedField?.id,
      selectedTechnique,
      selectedAgriMachineId: selectedAgriMachine?.id,
      selectedTariffId: selectedTariff?.id,
      oldTariffId:
        tariffGrouped?.tariff?.id ??
        tariffGrouped?.tariff_id ??
        tariffGrouped?.tariffId ??
        null,
      isTransportation,
      isTransportTask,
      workPlaces,
    });

    if (!savePlan.partIds.length) {
      Alert.alert(
        "Не удалось сохранить",
        "Не найдены идентификаторы отрезков.",
      );
      return;
    }

    try {
      setIsSaving(true);

      if (savePlan.hasInvalidTimes) {
        Alert.alert(
          "Не удалось сохранить",
          "Укажите корректное время начала и окончания.",
        );
        return;
      }

      const partResults = savePlan.partRequests.length
        ? await Promise.all(
            savePlan.partRequests.map((request) => updateShiftPart(request)),
          )
        : [true];

      const tariffSuccess = await updateShiftTotalsV2(savePlan.totalsRequest);

      const success = partResults.every(Boolean) && tariffSuccess;

      if (!success) {
        Alert.alert("Не удалось сохранить", "Проверьте данные и повторите.");
        return;
      }

      await onSaved();
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveMaterial = async () => {
    if (!accessToken || !selectedMaterial || !materialPartIds.length) return;

    setHasAttemptedMaterialSave(true);

    if (getMaterialQuantityError(materialQuantity)) return;

    if (!isConnected) {
      Alert.alert(
        "Нет подключения к интернету",
        "Сохранение расхода доступно только онлайн.",
      );
      return;
    }

    try {
      setIsSaving(true);

      const success = await updatePartsMaterialQuantity(
        buildMaterialQuantityRequest({
          accessToken,
          materialPartIds,
          selectedMaterial,
          materialQuantity,
        }),
      );

      if (!success) {
        Alert.alert("Не удалось сохранить расход", "Проверьте значение.");
        return;
      }

      await onSaved();
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  if (!details) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={requestClose}
    >
      <View style={modalStyles.overlay}>
        <Pressable style={modalStyles.backdrop} onPress={requestClose} />

        <View
          style={[
            modalStyles.sheet,
            { paddingBottom: Math.max(16, insets.bottom + 16) },
          ]}
        >
          <View style={modalStyles.header}>
            <View style={modalStyles.titleRow}>
              <View
                style={[
                  modalStyles.iconWrap,
                  { backgroundColor: `${details.color}18` },
                ]}
              >
                <MaterialCommunityIcons
                  name={details.icon}
                  size={20}
                  color={details.color}
                />
              </View>
              <View style={modalStyles.titleTextWrap}>
                <Text style={modalStyles.title} numberOfLines={1}>
                  Редактировать{" "}
                  {details.type === "field" ? "выработку" : details.title}
                </Text>
                <Text style={modalStyles.subtitle} numberOfLines={1}>
                  {details.title} · {details.subtitle}
                </Text>
              </View>
            </View>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Закрыть редактирование"
              style={modalStyles.closeButton}
              onPress={requestClose}
            >
              <Ionicons name="close" size={22} color="#667085" />
            </Pressable>
          </View>

          <View style={modalStyles.tabs}>
            <Pressable
              style={[
                modalStyles.tab,
                activeTab === "part" && modalStyles.tabActive,
              ]}
              onPress={() => setActiveTab("part")}
            >
              <Text
                style={[
                  modalStyles.tabText,
                  activeTab === "part" && modalStyles.tabTextActive,
                ]}
              >
                Отрезок
              </Text>
            </Pressable>

            <Pressable
              style={[
                modalStyles.tab,
                activeTab === "materials" && modalStyles.tabActive,
              ]}
              onPress={() => setActiveTab("materials")}
            >
              <Text
                style={[
                  modalStyles.tabText,
                  activeTab === "materials" && modalStyles.tabTextActive,
                ]}
              >
                Расходники
              </Text>
            </Pressable>
          </View>

          <ScrollView
            style={modalStyles.content}
            contentContainerStyle={modalStyles.contentInner}
            keyboardShouldPersistTaps="handled"
          >
            {activeTab === "part" ? (
              <ShiftPartEditPartForm
                form={form}
                detailsType={details.type}
                selectedShiftType={selectedShiftType}
                selectedField={selectedField}
                selectedTechnique={selectedTechnique}
                selectedAgriMachine={selectedAgriMachine}
                selectedTariff={selectedTariff}
                agriOptionsLength={agriOptions.length}
                isHarvesting={isHarvesting}
                isTransportation={isTransportation}
                isTransportOutput={isTransportOutput}
                setField={setField}
                setPicker={setPicker}
              />
            ) : (
              <ShiftPartEditMaterialsForm
                materialItems={materialItems}
                selectedMaterialIndex={selectedMaterialIndex}
                selectedMaterial={selectedMaterial}
                materialQuantity={materialQuantity}
                quantityError={materialQuantityError}
                shiftPartsCount={materialPartIds.length}
                onSelectMaterial={setSelectedMaterialIndex}
                onChangeMaterialQuantity={setMaterialQuantity}
              />
            )}
          </ScrollView>

          <View style={modalStyles.footer}>
            <Pressable
              style={[modalStyles.footerButton, modalStyles.cancelButton]}
              onPress={requestClose}
              disabled={isSaving}
              accessibilityRole="button"
              accessibilityLabel="Отменить редактирование"
            >
              <Text style={modalStyles.cancelButtonText}>Отмена</Text>
            </Pressable>

            <Pressable
              style={[
                modalStyles.footerButton,
                modalStyles.saveButton,
                isSaving && modalStyles.footerButtonDisabled,
              ]}
              onPress={
                activeTab === "part" ? handleSavePart : handleSaveMaterial
              }
              disabled={
                isSaving || (activeTab === "materials" && !materialItems.length)
              }
            >
              {isSaving ? (
                <ActivityIndicator size="small" color={Colors.white} />
              ) : (
                <Text style={modalStyles.saveButtonText}>Сохранить</Text>
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
