import React, { memo } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  View,
} from "react-native";

import { ForcedCloseShiftModalActions } from "./ForcedCloseShiftModalActions";
import { ForcedCloseShiftModalContent } from "./ForcedCloseShiftModalContent";
import { ForcedCloseShiftModalHeader } from "./ForcedCloseShiftModalHeader";
import { forcedCloseShiftModalStyles as styles } from "./ForcedCloseShiftModal.styles";
import type { ForcedCloseShiftModalProps } from "./ForcedCloseShiftModal.types";

const ForcedCloseShiftModalComponent = ({
  visible,
  shifts,
  mode = "offline",
  needsTime,
  pickerVisible,
  queueIndex,
  queueTotal,
  closeDate,
  closeTime,
  selectedCloseDate,
  isClosing,
  onClose,
  onConfirm,
  onTogglePicker,
  onDateTimeChange,
}: ForcedCloseShiftModalProps) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.root}>
        <Pressable style={styles.backdrop} onPress={onClose} />

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={24}
          style={styles.overlay}
          pointerEvents="box-none"
        >
          <View style={styles.modal}>
            <ForcedCloseShiftModalHeader mode={mode} onClose={onClose} />
            <ForcedCloseShiftModalContent
              shifts={shifts}
              mode={mode}
              needsTime={needsTime}
              pickerVisible={pickerVisible}
              queueIndex={queueIndex}
              queueTotal={queueTotal}
              closeDate={closeDate}
              closeTime={closeTime}
              selectedCloseDate={selectedCloseDate}
              onTogglePicker={onTogglePicker}
              onDateTimeChange={onDateTimeChange}
            />
            <ForcedCloseShiftModalActions
              isClosing={isClosing}
              onConfirm={onConfirm}
            />
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

export const ForcedCloseShiftModal = memo(ForcedCloseShiftModalComponent);
