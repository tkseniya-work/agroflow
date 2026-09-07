import { Modal, Text } from "@ui-kitten/components";
import React, { memo, useCallback } from "react";
import { Pressable, TouchableOpacity, View } from "react-native";

import { styles } from "../styles";

export type CreateTaskType =
  | "field"
  | "stationary"
  | "transport"
  | "transportation";

type Props = {
  visible: boolean;
  selectedType: CreateTaskType | null;
  onClose: () => void;
  onSelect: (type: CreateTaskType) => void;
};

const OPTIONS: { type: CreateTaskType; label: string }[] = [
  { type: "field", label: "Полевая" },
  { type: "stationary", label: "Стационарная" },
  { type: "transport", label: "Транспортная" },
  { type: "transportation", label: "Транспортировка" },
];

type TaskTypeOptionProps = {
  type: CreateTaskType;
  label: string;
  selected: boolean;
  onSelect: (type: CreateTaskType) => void;
};

const TaskTypeOption = memo(function TaskTypeOption({
  type,
  label,
  selected,
  onSelect,
}: TaskTypeOptionProps) {
  const handlePress = useCallback(() => {
    onSelect(type);
  }, [onSelect, type]);

  return (
    <Pressable
      style={({ pressed }) => [
        styles.taskTypeOption,
        selected && styles.taskTypeOptionSelected,
        pressed && styles.taskTypeOptionPressed,
      ]}
      onPress={handlePress}
    >
      <Text
        style={[
          styles.taskTypeOptionTitle,
          selected && styles.taskTypeOptionTitleSelected,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
});

function CreateTaskTypeModalComponent({
  visible,
  selectedType,
  onClose,
  onSelect,
}: Props) {
  return (
    <Modal
      visible={visible}
      backdropStyle={styles.backdrop}
      onBackdropPress={onClose}
    >
      <View style={styles.taskTypeModal}>
        <View style={styles.taskTypeModalHeader}>
          <Text style={styles.taskTypeModalTitle}>Создать задание</Text>
          <Text style={styles.taskTypeModalSubtitle}>Выберите тип задания</Text>
        </View>

        <View style={styles.taskTypeOptions}>
          {OPTIONS.map((option) => (
            <TaskTypeOption
              key={option.type}
              type={option.type}
              label={option.label}
              selected={selectedType === option.type}
              onSelect={onSelect}
            />
          ))}
        </View>

        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.taskTypeCancelButton}
          onPress={onClose}
        >
          <Text style={styles.taskTypeCancelText}>Отмена</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

export const CreateTaskTypeModal = memo(CreateTaskTypeModalComponent);
