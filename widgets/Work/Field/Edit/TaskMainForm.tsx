import React, { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import Colors from "../../../../shared/styles/Colors";

type Props = {
  currentTask: any;
  seasons: any[];
  tariffsList: any[];
  onNext: () => void;
};

export const TaskMainForm: React.FC<Props> = ({
  currentTask,
  seasons,
  tariffsList,
  onNext,
}) => {
  const [seasonYear, setSeasonYear] = useState(
    String(currentTask?.season_year ?? "")
  );
  const [comment, setComment] = useState(currentTask?.comment ?? "");
  const [dateStart, setDateStart] = useState(currentTask?.date_start ?? "");

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Основные данные</Text>

      <Text style={styles.label}>Сезон</Text>
      <TextInput
        value={seasonYear}
        onChangeText={setSeasonYear}
        placeholder="Например: 2026"
        style={styles.input}
        keyboardType="number-pad"
      />

      <Text style={styles.label}>Дата начала</Text>
      <TextInput
        value={dateStart}
        onChangeText={setDateStart}
        placeholder="2026-05-22"
        style={styles.input}
      />

      <Text style={styles.label}>Комментарий</Text>
      <TextInput
        value={comment}
        onChangeText={setComment}
        placeholder="Комментарий"
        style={[styles.input, styles.textArea]}
        multiline
      />

      <Pressable style={styles.button} onPress={onNext}>
        <Text style={styles.buttonText}>Далее</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.black,
    marginBottom: 4,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#344054",
  },
  input: {
    minHeight: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#D0D5DD",
    paddingHorizontal: 12,
    backgroundColor: Colors.white,
    fontSize: 14,
  },
  textArea: {
    minHeight: 90,
    paddingTop: 12,
    textAlignVertical: "top",
  },
  button: {
    marginTop: 10,
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
