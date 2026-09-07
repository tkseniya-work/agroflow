import { MaterialIcons } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Keyboard,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Colors from "../../../shared/styles/Colors";
import { AppPickerModal } from "../../AppSelector/AppPickerModal";
import { AppSelector } from "../../AppSelector/AppSelector";
import { addEditStyles } from "../styles";
import { productionTaskFormModalStyles as styles } from "./ProductionTaskFormModal.styles";
import type { ProductionTaskFormModalBaseProps } from "./ProductionTaskFormModal.types";
import { useProductionTaskFormModal } from "./useProductionTaskFormModal";

export const ProductionTaskFormModalBase = ({
  visible,
  currentTask,
  subtitle,
  requireWorkStandardOnCreate,
  keepOpenOnFalse,
  onClose,
  onSubmit,
  isSubmitting = false,
}: ProductionTaskFormModalBaseProps) => {
  const insets = useSafeAreaInsets();
  const formScrollRef = useRef<ScrollView | null>(null);
  const commentOffsetRef = useRef(0);
  const [seasonModalVisible, setSeasonModalVisible] = useState(false);
  const [workModalVisible, setWorkModalVisible] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const form = useProductionTaskFormModal({
    visible,
    currentTask,
    requireWorkStandardOnCreate,
    keepOpenOnFalse,
    onClose,
    onSubmit,
  });
  const isBusy = isSubmitting || form.saving;

  useEffect(() => {
    const showSubscription = Keyboard.addListener("keyboardDidShow", (event) =>
      setKeyboardHeight(event.endCoordinates.height),
    );
    const hideSubscription = Keyboard.addListener("keyboardDidHide", () =>
      setKeyboardHeight(0),
    );

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  useEffect(() => {
    if (visible) return;

    setSeasonModalVisible(false);
    setWorkModalVisible(false);
  }, [visible]);

  const scrollToComment = () => {
    setTimeout(() => {
      formScrollRef.current?.scrollTo({
        y: Math.max(0, commentOffsetRef.current - 12),
        animated: true,
      });
    }, 120);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={addEditStyles.overlay}>
        <Pressable style={addEditStyles.backdrop} onPress={onClose} />

        <View
          style={[
            addEditStyles.modalCard,
            { paddingBottom: Math.max(24, insets.bottom + 16) },
          ]}
        >
          <View style={addEditStyles.header}>
            <View>
              <Text style={addEditStyles.title}>
                {currentTask ? "Редактировать" : "Создать"}
              </Text>
              <Text style={addEditStyles.subtitle}>{subtitle}</Text>
            </View>

            <TouchableOpacity
              accessibilityLabel="Закрыть форму задания"
              accessibilityRole="button"
              onPress={onClose}
              style={addEditStyles.iconButton}
            >
              <MaterialIcons name="close" size={22} color={Colors.grey700} />
            </TouchableOpacity>
          </View>

          <ScrollView
            ref={formScrollRef}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[
              addEditStyles.content,
              {
                paddingBottom:
                  Math.max(24, insets.bottom + 16) + keyboardHeight,
              },
            ]}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="interactive"
          >
            <View style={addEditStyles.inputBox}>
              <Text style={addEditStyles.inputLabel}>Дата начала</Text>
              <TextInput
                accessibilityLabel="Дата начала"
                value={form.dateStart}
                onChangeText={form.setDateStart}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={Colors.grey500}
                style={addEditStyles.textInput}
              />
            </View>

            <AppSelector
              label="Сезон"
              value={form.selectedSeason?.year}
              placeholder="Выбрать сезон"
              onPress={() => setSeasonModalVisible(true)}
            />

            <AppSelector
              label="Вид работы"
              value={form.selectedWorkStandard?.name}
              placeholder="Выбрать вид работы"
              onPress={() => setWorkModalVisible(true)}
              disabled={Boolean(currentTask)}
            />

            {!!form.validationError && (
              <View style={styles.validationBox}>
                <Text style={styles.validationText}>
                  {form.validationError}
                </Text>
              </View>
            )}

            <View
              style={addEditStyles.inputBox}
              onLayout={(event) => {
                commentOffsetRef.current = event.nativeEvent.layout.y;
              }}
            >
              <Text style={addEditStyles.inputLabel}>Комментарий</Text>
              <TextInput
                accessibilityLabel="Комментарий"
                value={form.comment}
                onChangeText={form.setComment}
                placeholder="Введите комментарий"
                placeholderTextColor={Colors.grey500}
                style={[addEditStyles.textInput, addEditStyles.commentInput]}
                multiline
                textAlignVertical="top"
                onFocus={scrollToComment}
              />
            </View>
          </ScrollView>

          <View style={addEditStyles.footer}>
            <TouchableOpacity
              accessibilityRole="button"
              style={addEditStyles.cancelButton}
              onPress={onClose}
            >
              <Text style={addEditStyles.cancelText}>Выход</Text>
            </TouchableOpacity>

            <TouchableOpacity
              accessibilityLabel={
                currentTask ? "Сохранить задание" : "Создать задание"
              }
              accessibilityRole="button"
              disabled={isBusy}
              style={[
                addEditStyles.submitButton,
                isBusy && addEditStyles.submitButtonDisabled,
              ]}
              onPress={form.handleSubmit}
            >
              {isBusy ? (
                <ActivityIndicator color={Colors.white} />
              ) : (
                <Text style={addEditStyles.submitButtonText}>
                  {currentTask ? "Сохранить" : "Создать"}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

        <AppPickerModal
          visible={seasonModalVisible}
          title="Выбор сезона"
          data={form.seasonOptions}
          selectedId={
            form.selectedSeason?.id || form.selectedSeason?.year
          }
          onClose={() => setSeasonModalVisible(false)}
          onSelect={form.selectSeason}
        />

        <AppPickerModal
          visible={workModalVisible}
          title="Выбор вида работы"
          data={form.workOptions}
          selectedId={form.selectedWorkStandard?.id}
          onClose={() => setWorkModalVisible(false)}
          onSelect={form.selectWorkStandard}
        />
      </View>
    </Modal>
  );
};
