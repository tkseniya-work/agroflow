import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Text } from "@ui-kitten/components";
import React, { memo } from "react";
import { ActivityIndicator, Pressable, View } from "react-native";

import Colors from "../../../../shared/styles/Colors";
import {
  getAssignedTechniqueDisplayName,
  getTechniqueTermsText,
} from "./TaskTechniques.logic";
import { styles } from "./TaskTechniques.styles";

type Props = {
  techniques: any[];
  deletingId: string | null;
  isDataLoading: boolean;
  onAdd: () => void;
  onDelete: (id: string) => void;
};

const TaskTechniquesCardComponent = ({
  techniques,
  deletingId,
  isDataLoading,
  onAdd,
  onDelete,
}: Props) => (
  <View style={styles.card}>
    <View style={styles.header}>
      <View style={styles.headerTitleWrap}>
        <Text style={styles.title}>Техника</Text>
      </View>

      <View style={styles.countChip}>
        <Text style={styles.countChipText}>{techniques.length}</Text>
      </View>
    </View>

    <View style={styles.divider} />

    <Pressable
      style={[styles.addButton, isDataLoading && styles.addButtonDisabled]}
      onPress={onAdd}
      disabled={isDataLoading}
      accessibilityRole="button"
      accessibilityLabel="Добавить технику"
    >
      {isDataLoading ? (
        <>
          <ActivityIndicator size="small" color={Colors.greenColor} />
          <Text style={styles.addButtonText}>Загружаем технику...</Text>
        </>
      ) : (
        <>
          <Ionicons name="add" size={20} color={Colors.greenColor} />
          <Text style={styles.addButtonText}>Добавить технику</Text>
        </>
      )}
    </Pressable>

    {techniques.length === 0 ? (
      <View style={styles.emptyBox}>
        <Ionicons name="construct-outline" size={26} color="#98A2B3" />
        <Text style={styles.emptyText}>Не добавлено ни одной техники</Text>
      </View>
    ) : (
      <View style={styles.techniqueList}>
        {techniques.map((item) => {
          const displayName = getAssignedTechniqueDisplayName(item);
          const termsText = getTechniqueTermsText(item);

          return (
            <View key={item.id} style={styles.techniqueRow}>
              <View style={styles.techniqueIcon}>
                <MaterialCommunityIcons
                  name="tractor-variant"
                  size={22}
                  color={Colors.greenColor}
                />
              </View>

              <View style={styles.techniqueTextWrap}>
                <Text style={styles.techniqueName} numberOfLines={1}>
                  {displayName}
                </Text>
                <Text style={styles.techniqueMeta} numberOfLines={1}>
                  {item.agriculture_machine?.name ?? "СХМ не указана"}
                </Text>
                {!!termsText && (
                  <Text style={styles.techniqueMeta}>{termsText}</Text>
                )}
              </View>

              <Pressable
                onPress={() => onDelete(item.id)}
                style={styles.deleteButton}
                disabled={deletingId === item.id}
                accessibilityRole="button"
                accessibilityLabel={`Удалить технику ${displayName}`}
              >
                {deletingId === item.id ? (
                  <ActivityIndicator size="small" color={Colors.error} />
                ) : (
                  <Ionicons name="close" size={18} color="#667085" />
                )}
              </Pressable>
            </View>
          );
        })}
      </View>
    )}
  </View>
);

export const TaskTechniquesCard = memo(TaskTechniquesCardComponent);
