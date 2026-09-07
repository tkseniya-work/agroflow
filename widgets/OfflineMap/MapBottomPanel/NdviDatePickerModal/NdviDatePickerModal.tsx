import Colors from "../../../../shared/styles/Colors";
import React from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Pressable,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

interface NdviDatePickerModalProps {
  visible: boolean;
  dates: string[];
  selectedDate: string | null | undefined;
  onClose: () => void;
  onSelect: (date: string) => void | Promise<void>;
}

const formatDisplayDate = (dateString?: string) => {
  if (!dateString) return "—";

  try {
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return dateString;

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    return `${day}.${month}.${year}`;
  } catch {
    return dateString;
  }
};

export const NdviDatePickerModal: React.FC<NdviDatePickerModalProps> = ({
  visible,
  dates,
  selectedDate,
  onClose,
  onSelect,
}) => {
  const handleSelect = async (date: string) => {
    await onSelect(date);
    onClose();
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

        <View style={styles.modalCard}>
          <View style={styles.header}>
            <Text style={styles.title}>Выбор даты снимка</Text>

            <TouchableOpacity
              onPress={onClose}
              style={styles.iconButton}
              activeOpacity={0.8}
            >
              <MaterialIcons name="close" size={22} color={Colors.grey700} />
            </TouchableOpacity>
          </View>

          <FlatList
            data={dates}
            keyExtractor={(item) => item}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            renderItem={({ item, index }) => {
              const active = selectedDate === item;
              const isLatest = index === 0;

              return (
                <TouchableOpacity
                  style={[styles.item, active && styles.itemActive]}
                  activeOpacity={0.85}
                  onPress={() => handleSelect(item)}
                >
                  <View style={styles.itemTextWrap}>
                    <Text
                      style={[
                        styles.itemTitle,
                        active && styles.itemTitleActive,
                      ]}
                    >
                      {formatDisplayDate(item)}
                    </Text>

                    {isLatest && (
                      <Text style={styles.itemSubtitle}>Последний снимок</Text>
                    )}
                  </View>

                  {active && (
                    <MaterialIcons
                      name="check-circle"
                      size={20}
                      color={Colors.greenColor}
                    />
                  )}
                </TouchableOpacity>
              );
            }}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>Нет доступных снимков</Text>
              </View>
            }
          />
        </View>
      </View>
    </Modal>
  );
};

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
  modalCard: {
    width: "90%",
    maxHeight: "65%",
    backgroundColor: Colors.white,
    borderRadius: 20,
    paddingTop: 14,
    paddingHorizontal: 16,
    paddingBottom: 16,
    elevation: 8,
  },
  header: {
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  title: {
    fontSize: 17,
    fontWeight: "700",
    color: Colors.grey800,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  listContent: {
    paddingBottom: 8,
  },
  item: {
    minHeight: 52,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: "#F7F8FA",
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  itemActive: {
    backgroundColor: Colors.greenColorLight,
    borderWidth: 1,
    borderColor: Colors.greenColor,
  },
  itemTextWrap: {
    flex: 1,
    paddingRight: 10,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.grey800,
  },
  itemTitleActive: {
    color: Colors.greenColor,
  },
  itemSubtitle: {
    fontSize: 12,
    color: Colors.grey500,
    marginTop: 2,
  },
  emptyState: {
    paddingVertical: 24,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 14,
    color: Colors.grey500,
  },
});