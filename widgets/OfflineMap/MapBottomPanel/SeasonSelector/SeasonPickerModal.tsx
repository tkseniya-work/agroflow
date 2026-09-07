import Colors from "../../../../shared/styles/Colors";
import React from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Platform,
  Pressable,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { SeasonRequest } from "../../../../entities/season";

interface SeasonPickerContentProps {
  seasons: SeasonRequest[];
  selectedSeason: SeasonRequest | null;
  onClose: () => void;
  onSelect: (season: SeasonRequest) => void | Promise<void>;
}

interface SeasonPickerModalProps extends SeasonPickerContentProps {
  visible: boolean;
}

export const SeasonPickerContent: React.FC<SeasonPickerContentProps> = ({
  seasons,
  selectedSeason,
  onClose,
  onSelect,
}) => {
  const handleSelect = (season: SeasonRequest) => {
    onClose();
    void onSelect(season);
  };

  return (
    <View style={styles.overlay}>
      <Pressable style={styles.backdrop} onPress={onClose} />

      <View style={styles.modalCard}>
        <View style={styles.header}>
          <Text style={styles.title}>Выбор сезона</Text>

          <TouchableOpacity
            onPress={onClose}
            style={styles.iconButton}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Закрыть выбор сезона"
          >
            <MaterialIcons name="close" size={22} color={Colors.grey700} />
          </TouchableOpacity>
        </View>

        <FlatList
          data={seasons}
          keyExtractor={(item: SeasonRequest) => String(item.id)}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }: any) => {
            const active = selectedSeason?.id === item.id;

            return (
              <TouchableOpacity
                style={[styles.item, active && styles.itemActive]}
                activeOpacity={0.85}
                onPress={() => handleSelect(item)}
                accessibilityRole="button"
                accessibilityLabel={`Сезон ${item.year}${
                  item.is_current ? ", текущий" : ""
                }`}
                accessibilityState={{ selected: active }}
              >
                <View style={styles.itemTextWrap}>
                  <Text
                    style={[
                      styles.itemTitle,
                      active && styles.itemTitleActive,
                    ]}
                  >
                    {item.year}
                  </Text>

                  {!!item?.is_current && (
                    <Text style={styles.itemSubtitle}>Текущий сезон</Text>
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
              <Text style={styles.emptyText}>Нет доступных сезонов</Text>
            </View>
          }
        />
      </View>
    </View>
  );
};

export const SeasonPickerModal: React.FC<SeasonPickerModalProps> = ({
  visible,
  seasons,
  selectedSeason,
  onClose,
  onSelect,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <SeasonPickerContent
        seasons={seasons}
        selectedSeason={selectedSeason}
        onClose={onClose}
        onSelect={onSelect}
      />
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
    elevation: Platform.OS === "android" ? 3 : 8,
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
