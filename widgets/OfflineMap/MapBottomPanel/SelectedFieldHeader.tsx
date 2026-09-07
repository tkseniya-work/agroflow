import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { SeasonFieldRequest } from "../../../entities/season";
import Colors from "../../../shared/styles/Colors";

type Props = {
  field: SeasonFieldRequest;
  onChange: () => void;
};

export const SelectedFieldHeader: React.FC<Props> = ({ field, onChange }) => (
  <View style={styles.container}>
    <View style={styles.icon}>
      <MaterialCommunityIcons
        name="map-marker-radius-outline"
        size={21}
        color={Colors.greenColor}
      />
    </View>

    <View style={styles.textBlock}>
      <Text style={styles.label}>Выбранное поле</Text>
      <Text style={styles.name} numberOfLines={1}>
        {field.name || "Без названия"}
        {field.area != null ? ` · ${field.area} га` : ""}
      </Text>
    </View>

    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Выбрать другое поле на карте"
      onPress={onChange}
      style={({ pressed }) => [
        styles.changeButton,
        pressed && styles.changeButtonPressed,
      ]}
    >
      <Text style={styles.changeButtonText}>Сменить</Text>
    </Pressable>
  </View>
);

const styles = StyleSheet.create({
  container: {
    minHeight: 64,
    padding: 10,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#DDE5DF",
    borderRadius: 16,
    backgroundColor: "#F7FAF8",
  },
  icon: {
    width: 38,
    height: 38,
    marginRight: 10,
    borderRadius: 12,
    backgroundColor: Colors.greenColorLight,
    alignItems: "center",
    justifyContent: "center",
  },
  textBlock: {
    flex: 1,
    minWidth: 0,
  },
  label: {
    color: Colors.grey500,
    fontSize: 11,
  },
  name: {
    marginTop: 2,
    color: Colors.grey900,
    fontSize: 14,
    fontWeight: "700",
  },
  changeButton: {
    minHeight: 40,
    marginLeft: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#CDD5CF",
    borderRadius: 11,
    backgroundColor: Colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
  changeButtonPressed: {
    opacity: 0.65,
  },
  changeButtonText: {
    color: Colors.grey800,
    fontSize: 12,
    fontWeight: "700",
  },
});
