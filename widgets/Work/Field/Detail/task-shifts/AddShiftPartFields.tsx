import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, Text, View } from "react-native";

import { AppDateTimePicker } from "../../../../../shared/ui/AppDateTimePicker";
import Colors from "../../../../../shared/styles/Colors";
import {
  getDefaultShiftEndDate,
  getShiftEmployeeShortName,
} from "../../../shared/shiftPartFormUtils";
import { InputField, SelectorRow } from "./AddShiftPartControls";
import type { AddShiftPartFormState } from "./AddShiftPartModal.helpers";
import { styles } from "./AddShiftPartModal.styles";
import type { AddShiftPicker } from "./useAddShiftPartForm";

type Props = {
  isFact: boolean;
  form: AddShiftPartFormState;
  setForm: React.Dispatch<React.SetStateAction<AddShiftPartFormState>>;
  employee: any;
  shiftType: any;
  technique: any;
  agriMachine: any;
  tariff: any;
  field: any;
  agriculturalOptionsLength: number;
  onOpenPicker: (picker: AddShiftPicker) => void;
};

export const AddShiftPartFields = ({
  isFact,
  form,
  setForm,
  employee,
  shiftType,
  technique,
  agriMachine,
  tariff,
  field,
  agriculturalOptionsLength,
  onOpenPicker,
}: Props) => (
  <View style={styles.grid}>
    <AppDateTimePicker
      label="Начало"
      date={form.date}
      time={form.startAt}
      includeSeconds={false}
      placeholder="Дата начала"
      onChange={(value) =>
        setForm((previous) => ({
          ...previous,
          date: value.date,
          startAt: value.time,
          endedDate:
            previous.endedDate === previous.date
              ? getDefaultShiftEndDate(
                  value.date,
                  value.time,
                  previous.endedAt,
                )
              : previous.endedDate,
        }))
      }
    />

    <SelectorRow
      label="Сотрудник"
      value={employee ? getShiftEmployeeShortName(employee) : ""}
      placeholder="Выбрать сотрудника"
      onPress={() => onOpenPicker("employee")}
    />

    <SelectorRow
      label="Смена"
      value={shiftType?.label}
      placeholder="Выбрать смену"
      icon={shiftType?.icon}
      onPress={() => onOpenPicker("shift")}
    />

    {isFact && (
      <AppDateTimePicker
        label="Окончание"
        date={form.endedDate}
        time={form.endedAt}
        includeSeconds={false}
        placeholder="Дата окончания"
        onChange={(value) =>
          setForm((previous) => ({
            ...previous,
            endedDate: value.date,
            endedAt: value.time,
          }))
        }
        onClear={() =>
          setForm((previous) => ({
            ...previous,
            endedDate: previous.date,
            endedAt: "",
          }))
        }
      />
    )}

    <SelectorRow
      label="Техника"
      value={technique?.label}
      placeholder="Выбрать технику"
      onPress={() => onOpenPicker("technique")}
    />

    {agriculturalOptionsLength > 0 && (
      <SelectorRow
        label="СХМ"
        value={agriMachine?.label}
        placeholder="Выбрать СХМ"
        onPress={() => onOpenPicker("agri")}
      />
    )}

    {isFact && (
      <Pressable
        style={[styles.forceRow, form.forceLoadTrack && styles.forceRowActive]}
        onPress={() =>
          setForm((previous) => ({
            ...previous,
            forceLoadTrack: !previous.forceLoadTrack,
          }))
        }
      >
        <View style={styles.forceText}>
          <Text style={styles.forceTitle}>Загрузить по GPS-треку</Text>
          <Text style={styles.forceSubtitle}>
            Получить предпросмотр перед созданием отрезка
          </Text>
        </View>
        <Ionicons
          name={form.forceLoadTrack ? "checkbox" : "square-outline"}
          size={23}
          color={form.forceLoadTrack ? Colors.greenColor : "#98A2B3"}
        />
      </Pressable>
    )}

    {!form.forceLoadTrack && (
      <>
        <SelectorRow
          label="Тариф"
          value={tariff?.label}
          placeholder={technique ? "Выбрать тариф" : "Сначала техника"}
          disabled={!technique}
          onPress={() => onOpenPicker("tariff")}
        />

        {isFact && (
          <>
            <SelectorRow
              label="Поле"
              value={field?.label}
              placeholder="Выбрать поле"
              onPress={() => onOpenPicker("field")}
            />

            <InputField
              label="Выработка"
              value={form.outputValue}
              keyboardType="decimal-pad"
              onChangeText={(value) =>
                setForm((previous) => ({
                  ...previous,
                  outputValue: value,
                }))
              }
            />

            <InputField
              label="Обработанная площадь"
              value={form.factArea}
              keyboardType="decimal-pad"
              suffix="га"
              onChangeText={(value) =>
                setForm((previous) => ({
                  ...previous,
                  factArea: value,
                }))
              }
            />
          </>
        )}
      </>
    )}
  </View>
);
