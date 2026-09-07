import { Ionicons } from "@expo/vector-icons";
import React, { memo, useCallback, useState } from "react";
import { ActivityIndicator, Pressable, View } from "react-native";

import { ActionSelectionModal } from "../../../../../shared/ui/ActionSelectionModal";
import Colors from "../../../../../shared/styles/Colors";
import { ShiftPartDetails } from "../../../../../src/types/task.types";
import { styles } from "./styles";

function ShiftPartActionsComponent({
  details,
  children,
  onEdit,
  onDelete,
  isDeleting,
}: {
  details: ShiftPartDetails;
  children: React.ReactNode;
  onEdit: (details: ShiftPartDetails) => void;
  onDelete: (details: ShiftPartDetails) => void;
  isDeleting?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);
  const handleEdit = useCallback(() => {
    close();
    onEdit(details);
  }, [close, details, onEdit]);
  const handleDelete = useCallback(() => {
    close();
    onDelete(details);
  }, [close, details, onDelete]);

  return (
    <View style={styles.partActionsContainer}>
      {children}

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Открыть действия: ${details.title}`}
        disabled={isDeleting}
        hitSlop={8}
        style={[
          styles.partActionsTrigger,
          isDeleting && styles.partActionsTriggerDisabled,
        ]}
        onPress={() => setOpen(true)}
      >
        {isDeleting ? (
          <ActivityIndicator size="small" color={Colors.error} />
        ) : (
          <Ionicons name="ellipsis-vertical" size={18} color="#475467" />
        )}
      </Pressable>

      <ActionSelectionModal
        visible={open}
        title="Действия со сменой"
        subtitle={details.title}
        onClose={close}
        actions={[
          {
            key: "edit",
            label: "Редактировать",
            icon: "create-outline",
            accessibilityLabel: `Редактировать: ${details.title}`,
            onPress: handleEdit,
          },
          {
            key: "delete",
            label: "Удалить",
            icon: "trash-outline",
            tone: "danger",
            accessibilityLabel: `Удалить: ${details.title}`,
            onPress: handleDelete,
          },
        ]}
      />
    </View>
  );
}

export const ShiftPartActions = memo(ShiftPartActionsComponent);
