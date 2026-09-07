import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, Text, View } from "react-native";

import Colors from "../../../../../shared/styles/Colors";
import { formatNumber } from "../../../../../src/utils/taskUtils";
import { InputField } from "./ShiftPartEditControls";
import { MaterialItem } from "./ShiftPartEditModal.helpers";
import { modalStyles } from "./ShiftPartEditModal.styles";

type Props = {
  materialItems: MaterialItem[];
  selectedMaterialIndex: number;
  selectedMaterial?: MaterialItem;
  materialQuantity: string;
  quantityError?: string | null;
  shiftPartsCount: number;
  onSelectMaterial: (index: number) => void;
  onChangeMaterialQuantity: (value: string) => void;
};

export function ShiftPartEditMaterialsForm({
  materialItems,
  selectedMaterialIndex,
  selectedMaterial,
  materialQuantity,
  quantityError,
  shiftPartsCount,
  onSelectMaterial,
  onChangeMaterialQuantity,
}: Props) {
  return (
    <View>
      <View style={modalStyles.infoBox}>
        <Text style={modalStyles.infoText}>
          Отрезков в группе: {shiftPartsCount}. Расход применится ко всей группе.
        </Text>
      </View>

      {materialItems.length ? (
        <>
          <View style={modalStyles.materialList}>
            {materialItems.map((item, index) => {
              const active = index === selectedMaterialIndex;

              return (
                <Pressable
                  key={`${item.type}-${item.id}`}
                  style={[
                    modalStyles.materialItem,
                    active && modalStyles.materialItemActive,
                  ]}
                  onPress={() => onSelectMaterial(index)}
                >
                  <View style={modalStyles.materialTextWrap}>
                    <Text style={modalStyles.materialTitle}>{item.label}</Text>
                    <Text style={modalStyles.materialSubtitle}>
                      Сейчас: {formatNumber(item.value, 2)} {item.unit}
                    </Text>
                  </View>
                  {active && (
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color={Colors.greenColor}
                    />
                  )}
                </Pressable>
              );
            })}
          </View>

          <InputField
            label="Количество"
            value={materialQuantity}
            onChangeText={onChangeMaterialQuantity}
            keyboardType="decimal-pad"
            suffix={selectedMaterial?.unit}
            error={quantityError}
          />
        </>
      ) : (
        <View style={modalStyles.emptyBox}>
          <Ionicons name="cube-outline" size={24} color="#98A2B3" />
          <Text style={modalStyles.emptyText}>
            Для этой группы нет расходников для редактирования.
          </Text>
        </View>
      )}
    </View>
  );
}
