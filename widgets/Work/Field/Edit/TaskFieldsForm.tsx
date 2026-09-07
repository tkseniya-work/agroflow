import React from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";

import Colors from "../../../../shared/styles/Colors";

type Props = {
  currentTask: any;
  fields: any[];
  selectedField: any;
  onSelectField: (field: any) => void;
  onPrev: () => void;
  onNext: () => void;
};

export const TaskFieldsForm: React.FC<Props> = ({
  fields,
  selectedField,
  onSelectField,
  onPrev,
  onNext,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Выбор поля</Text>

      <FlatList
        data={fields}
        keyExtractor={(item, index) => String(item?.id ?? index)}
        scrollEnabled={false}
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
        renderItem={({ item }) => {
          const active = selectedField?.id === item?.id;

          return (
            <Pressable
              onPress={() => onSelectField(item)}
              style={[styles.fieldCard, active && styles.fieldCardActive]}
            >
              <Text style={[styles.fieldName, active && styles.fieldNameActive]}>
                {item?.name ?? item?.field_name ?? "Поле без названия"}
              </Text>

              {!!item?.area && (
                <Text style={styles.fieldMeta}>{item.area} га</Text>
              )}
            </Pressable>
          );
        }}
      />

      <View style={styles.footer}>
        <Pressable style={styles.secondaryButton} onPress={onPrev}>
          <Text style={styles.secondaryButtonText}>Назад</Text>
        </Pressable>

        <Pressable style={styles.button} onPress={onNext}>
          <Text style={styles.buttonText}>Далее</Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.black,
  },
  fieldCard: {
    padding: 14,
    borderRadius: 16,
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#EAECF0",
  },
  fieldCardActive: {
    borderColor: Colors.greenColor,
    backgroundColor: "#ECFDF3",
  },
  fieldName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#101828",
  },
  fieldNameActive: {
    color: Colors.greenColor,
  },
  fieldMeta: {
    marginTop: 4,
    fontSize: 13,
    color: "#667085",
  },
  footer: {
    flexDirection: "row",
    gap: 10,
    marginTop: 8,
  },
  secondaryButton: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    backgroundColor: "#F2F4F7",
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryButtonText: {
    color: "#344054",
    fontSize: 15,
    fontWeight: "700",
  },
  button: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    backgroundColor: Colors.greenColor,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: "700",
  },
});