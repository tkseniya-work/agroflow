import React, { useState, useMemo, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Modal,
  Animated,
  Pressable,
} from "react-native";
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import Colors from "../../../../shared/styles/Colors";

export interface DropdownItem {
  id: string;
  name: string;
  stateNumber?: string | null;
  isTruck?: boolean;
}

interface TechniquePickerModalProps {
  visible: boolean;
  items: DropdownItem[];
  selectedItems: DropdownItem[];
  onClose: (selected: DropdownItem[]) => void;
  onResetAll?: () => void;
}

export const TechniquePickerModal: React.FC<TechniquePickerModalProps> = ({
  visible,
  items,
  selectedItems,
  onClose,
  onResetAll,
}) => {
  const [pickerSelection, setPickerSelection] =
    useState<DropdownItem[]>(selectedItems);
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    if (visible) {
      setPickerSelection(selectedItems);
    }
  }, [selectedItems, visible]);

  const filteredItems = useMemo(() => {
    const query = searchText.trim().toLowerCase();

    return items.filter(
      (item) =>
        item.name.toLowerCase().includes(query) ||
        String(item.stateNumber ?? "")
          .toLowerCase()
          .includes(query),
    );
  }, [items, searchText]);

  const toggleItem = (item: DropdownItem) => {
    const exists = pickerSelection.some((i) => i.id === item.id);
    setPickerSelection(
      exists
        ? pickerSelection.filter((i) => i.id !== item.id)
        : [...pickerSelection, item],
    );
  };

  const confirmSelection = () => {
    onClose(pickerSelection);
    setSearchText("");
  };

  const resetAll = () => {
    setPickerSelection([]);
    if (onResetAll) {
      onResetAll();
    }
    setSearchText("");
  };

  const RenderItem = ({ item }: { item: DropdownItem }) => {
    const isSelected = pickerSelection.some((i) => i.id === item.id);
    const scale = new Animated.Value(1);

    const onPressIn = () => {
      Animated.spring(scale, {
        toValue: 0.96,
        useNativeDriver: true,
      }).start();
    };

    const onPressOut = () => {
      Animated.spring(scale, {
        toValue: 1,
        friction: 3,
        useNativeDriver: true,
      }).start();
    };

    return (
      <Pressable
        onPress={() => toggleItem(item)}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
      >
        <Animated.View
          style={[
            styles.itemContainer,
            isSelected && styles.itemSelected,
            { transform: [{ scale }] },
          ]}
        >
          <View
            style={[styles.itemIcon, isSelected && styles.itemIconSelected]}
          >
            <MaterialCommunityIcons
              name={item.isTruck ? "dump-truck" : "tractor-variant"}
              size={25}
              color={isSelected ? Colors.greenColor : "#667085"}
            />
          </View>

          <View style={styles.itemContent}>
            <Text
              style={[styles.itemText, isSelected && styles.selectedText]}
              numberOfLines={1}
            >
              {item.name}
            </Text>

            {!!item.stateNumber && (
              <View style={styles.stateNumberBadge}>
                <Text style={styles.stateNumberText}>{item.stateNumber}</Text>
              </View>
            )}
          </View>

          <MaterialIcons
            name={isSelected ? "check-circle" : "radio-button-unchecked"}
            size={21}
            color={isSelected ? Colors.greenColor : "#B4BBC5"}
          />
        </Animated.View>
      </Pressable>
    );
  };

  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Поиск техники..."
            placeholderTextColor="#999"
            value={searchText}
            onChangeText={setSearchText}
          />

          <FlatList
            data={filteredItems}
            keyExtractor={(item) => item.id}
            renderItem={RenderItem}
            contentContainerStyle={{ paddingBottom: 20 }}
          />

          <View style={styles.buttonsRow}>
            <TouchableOpacity style={styles.resetButton} onPress={resetAll}>
              <Text style={styles.resetText}>Сбросить все</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.closeButton}
              onPress={confirmSelection}
            >
              <Text style={styles.closeText}>Готово</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "90%",
    maxHeight: "70%",
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 10,
  },
  searchInput: {
    padding: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: "#f5f5f5",
    fontSize: 16,
  },
  itemContainer: {
    minHeight: 62,
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#EAECF0",
    borderRadius: 10,
    marginVertical: 4,
    position: "relative",
    backgroundColor: "#fff",
  },
  itemSelected: {
    backgroundColor: "#ECFDF3",
    borderColor: "#B7E8C8",
  },
  itemIcon: {
    width: 38,
    height: 38,
    borderRadius: 8,
    backgroundColor: "#F2F4F7",
    alignItems: "center",
    justifyContent: "center",
  },
  itemIconSelected: {
    backgroundColor: "#DDF8E7",
  },
  itemContent: {
    flex: 1,
    minWidth: 0,
  },
  itemText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1D2939",
  },
  selectedText: {
    color: Colors.greenColor,
  },
  stateNumberBadge: {
    alignSelf: "flex-start",
    marginTop: 5,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#D0D5DD",
    backgroundColor: "#F9FAFB",
  },
  stateNumberText: {
    fontSize: 11,
    lineHeight: 13,
    fontWeight: "700",
    color: "#475467",
  },
  buttonsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
  },
  resetButton: {
    padding: 14,
    backgroundColor: "#f0f0f0",
    borderRadius: 12,
    flex: 1,
    marginRight: 8,
    alignItems: "center",
  },
  resetText: {
    color: "#555",
    fontWeight: "bold",
  },
  closeButton: {
    padding: 14,
    backgroundColor: Colors.greenColor,
    borderRadius: 12,
    flex: 1,
    marginLeft: 8,
    alignItems: "center",
  },
  closeText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
