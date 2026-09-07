import React, { useEffect, useMemo, useState } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  Pressable,
  TextInput,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import Colors from "../../shared/styles/Colors";

export interface PickerOption<T = any> {
  id: string | number;
  title: string | number;
  subtitle?: string | null;
  sectionTitle?: string | null;
  badgeText?: string | null;
  imageUrl?: string | null;
  showAvatar?: boolean;
  variant?: "default" | "danger";
  raw: T;
}

const PickerAvatar = ({ imageUrl }: { imageUrl?: string | null }) => {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [imageUrl]);

  return (
    <View style={styles.avatar}>
      {imageUrl && !hasError ? (
        <Image
          source={{ uri: imageUrl }}
          style={styles.avatarImage}
          resizeMode="cover"
          onError={() => setHasError(true)}
        />
      ) : (
        <MaterialIcons
          name="person-outline"
          size={20}
          color={Colors.greenColor}
        />
      )}
    </View>
  );
};

interface AppPickerModalProps<T = any> {
  visible: boolean;
  title: string;
  data: PickerOption<T>[];
  selectedId?: string | number | null;
  emptyText?: string;
  searchable?: boolean;
  searchPlaceholder?: string;
  onClose: () => void;
  onSelect: (item: T) => void | Promise<void>;
}

export const AppPickerModal = <T,>({
  visible,
  title,
  data,
  selectedId,
  emptyText = "Нет данных",
  searchable = true,
  searchPlaceholder = "Поиск...",
  onClose,
  onSelect,
}: AppPickerModalProps<T>) => {
  const [searchQuery, setSearchQuery] = useState("");
  
  useEffect(() => {
    if (!visible) {
      setSearchQuery("");
    }
  }, [visible]);

  const filteredData = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) return data;

    return data.filter((item) => {
      const title = String(item.title ?? "").toLowerCase();
      const subtitle = String(item.subtitle ?? "").toLowerCase();

      return title.includes(query) || subtitle.includes(query);
    });
  }, [data, searchQuery]);

  const handleSelect = async (option: PickerOption<T>) => {
    await onSelect(option.raw);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />

        <View style={styles.modalCard}>
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>

            <TouchableOpacity onPress={onClose} style={styles.iconButton} activeOpacity={0.8}>
              <MaterialIcons name="close" size={22} color={Colors.grey700} />
            </TouchableOpacity>
          </View>

          {searchable && (
            <View style={styles.searchBox}>
              <MaterialIcons name="search" size={20} color={Colors.grey500} />

              <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder={searchPlaceholder}
                placeholderTextColor={Colors.grey500}
                style={styles.searchInput}
                autoCorrect={false}
                clearButtonMode="while-editing"
              />

              {!!searchQuery && (
                <TouchableOpacity
                  onPress={() => setSearchQuery("")}
                  style={styles.searchClearButton}
                  activeOpacity={0.8}
                >
                  <MaterialIcons
                    name="close"
                    size={18}
                    color={Colors.grey500}
                  />
                </TouchableOpacity>
              )}
            </View>
          )}

          <FlatList
            data={filteredData}
            keyExtractor={(item) => String(item.id)}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.listContent}
            renderItem={({ item, index }) => {
              const active = String(selectedId) === String(item.id);
              const danger = item.variant === "danger";
              const showSectionTitle =
                !!item.sectionTitle &&
                filteredData[index - 1]?.sectionTitle !== item.sectionTitle;

              return (
                <>
                  {showSectionTitle && (
                    <Text style={styles.sectionTitle}>{item.sectionTitle}</Text>
                  )}

                  <TouchableOpacity
                    style={[
                      styles.item,
                      danger && styles.itemDanger,
                      active && styles.itemActive,
                      active && danger && styles.itemActiveDanger,
                    ]}
                    activeOpacity={0.85}
                    onPress={() => handleSelect(item)}
                  >
                    {item.showAvatar && (
                      <PickerAvatar imageUrl={item.imageUrl} />
                    )}

                    <View style={styles.itemTextWrap}>
                      <Text
                        style={[
                          styles.itemTitle,
                          danger && styles.itemTitleDanger,
                          active && styles.itemTitleActive,
                          active && danger && styles.itemTitleActiveDanger,
                        ]}
                      >
                        {item.title}
                      </Text>

                      {!!item.subtitle && (
                        <Text
                          style={[
                            styles.itemSubtitle,
                            danger && styles.itemSubtitleDanger,
                          ]}
                        >
                          {item.subtitle}
                        </Text>
                      )}
                    </View>

                    {!!item.badgeText && (
                      <View
                        style={[
                          styles.badge,
                          danger ? styles.badgeDanger : styles.badgeDefault,
                        ]}
                      >
                        <Text
                          style={[
                            styles.badgeText,
                            danger
                              ? styles.badgeTextDanger
                              : styles.badgeTextDefault,
                          ]}
                        >
                          {item.badgeText}
                        </Text>
                      </View>
                    )}

                    {active && (
                      <MaterialIcons
                        name="check-circle"
                        size={20}
                        color={danger ? Colors.error : Colors.greenColor}
                      />
                    )}
                  </TouchableOpacity>
                </>
              );
            }}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>
                  {searchQuery ? "Ничего не найдено" : emptyText}
                </Text>
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
  searchBox: {
    minHeight: 44,
    borderRadius: 12,
    backgroundColor: "#F7F8FA",
    borderWidth: 1,
    borderColor: "#ECECEC",
    paddingHorizontal: 12,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  searchInput: {
    flex: 1,
    minHeight: 40,
    paddingVertical: 0,
    fontSize: 14,
    color: Colors.grey800,
  },
  searchClearButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
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
  sectionTitle: {
    marginTop: 8,
    marginBottom: 8,
    fontSize: 13,
    fontWeight: "800",
    color: Colors.grey700,
  },
  itemActive: {
    backgroundColor: Colors.greenColorLight,
    borderWidth: 1,
    borderColor: Colors.greenColor,
  },
  itemDanger: {
    backgroundColor: "#FEF3F2",
    borderWidth: 1,
    borderColor: "#FECDCA",
  },
  itemActiveDanger: {
    backgroundColor: "#FEE4E2",
    borderColor: Colors.error,
  },
  itemTextWrap: {
    flex: 1,
    paddingRight: 10,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    marginRight: 10,
    backgroundColor: "#ECFDF3",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.grey800,
  },
  itemTitleActive: {
    color: Colors.greenColor,
  },
  itemTitleDanger: {
    color: "#B42318",
  },
  itemTitleActiveDanger: {
    color: Colors.error,
  },
  itemSubtitle: {
    fontSize: 12,
    color: Colors.grey500,
    marginTop: 2,
  },
  itemSubtitleDanger: {
    color: "#D92D20",
  },
  badge: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 8,
  },
  badgeDefault: {
    backgroundColor: "#F2F4F7",
  },
  badgeDanger: {
    backgroundColor: "#FEE4E2",
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "700",
  },
  badgeTextDefault: {
    color: Colors.grey700,
  },
  badgeTextDanger: {
    color: "#B42318",
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
