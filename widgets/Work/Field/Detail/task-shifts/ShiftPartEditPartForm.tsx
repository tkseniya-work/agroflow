import React from "react";
import { View } from "react-native";

import { AppDateTimePicker } from "../../../../../shared/ui/AppDateTimePicker";
import { InputField, SelectorRow } from "./ShiftPartEditControls";
import { FormState } from "./ShiftPartEditModal.helpers";
import { modalStyles } from "./ShiftPartEditModal.styles";
import type { ShiftPartEditPicker } from "./useShiftPartEditForm";

type Props = {
  form: FormState;
  detailsType: "field" | "transfer";
  selectedShiftType: any;
  selectedField: any;
  selectedTechnique: any;
  selectedAgriMachine: any;
  selectedTariff: any;
  agriOptionsLength: number;
  isHarvesting: boolean;
  isTransportation: boolean;
  isTransportOutput?: boolean;
  setField: (key: keyof FormState, value: string | boolean) => void;
  setPicker: (picker: ShiftPartEditPicker) => void;
};

export function ShiftPartEditPartForm({
  form,
  detailsType,
  selectedShiftType,
  selectedField,
  selectedTechnique,
  selectedAgriMachine,
  selectedTariff,
  agriOptionsLength,
  isHarvesting,
  isTransportation,
  isTransportOutput = false,
  setField,
  setPicker,
}: Props) {
  const getDateTimeValue = (value: string) => {
    const [date = "", timeWithZone = ""] = value.split("T");
    const time = timeWithZone.replace(/Z$/, "").split(/[+-]/)[0].slice(0, 5);

    return { date, time };
  };

  const buildDateTimeValue = (date: string, time: string) => {
    if (!date || !time) return "";

    const normalizedTime = /^\d{2}:\d{2}$/.test(time) ? `${time}:00` : time;

    return `${date}T${normalizedTime}`;
  };

  const startValue = getDateTimeValue(form.startAt);
  const endValue = getDateTimeValue(form.endedAt);

  return (
    <View style={modalStyles.formGrid}>
      <AppDateTimePicker
        label="Начало"
        date={startValue.date}
        time={startValue.time}
        includeSeconds={false}
        placeholder="Дата начала"
        onChange={(value) =>
          setField("startAt", buildDateTimeValue(value.date, value.time))
        }
      />

      <AppDateTimePicker
        label="Окончание"
        date={endValue.date}
        time={endValue.time}
        includeSeconds={false}
        placeholder="Дата окончания"
        onChange={(value) =>
          setField("endedAt", buildDateTimeValue(value.date, value.time))
        }
      />

      <SelectorRow
        label="Тип смены"
        value={selectedShiftType?.label}
        placeholder="Выберите смену"
        onPress={() => setPicker("shift")}
      />

      {detailsType === "field" && !isTransportOutput && (
        <SelectorRow
          label="Поле"
          value={selectedField?.label}
          placeholder="Выберите поле"
          onPress={() => setPicker("field")}
        />
      )}

      <SelectorRow
        label="Техника"
        value={selectedTechnique?.label}
        placeholder="Выберите технику"
        onPress={() => setPicker("technique")}
      />

      {!!agriOptionsLength && (
        <SelectorRow
          label="СХМ"
          value={selectedAgriMachine?.label}
          placeholder="Выберите СХМ"
          onPress={() => setPicker("agri")}
        />
      )}

      <SelectorRow
        label="Тариф"
        value={selectedTariff?.label}
        placeholder="Выберите тариф"
        onPress={() => setPicker("tariff")}
      />

      {detailsType === "field" && (
        <>
          {isHarvesting && (
            <>
              <InputField
                label="Намолот"
                value={form.threshed}
                onChangeText={(value) => setField("threshed", value)}
                keyboardType="decimal-pad"
                suffix="кг"
              />
              <InputField
                label="Бункеры"
                value={form.numberOfBins}
                onChangeText={(value) => setField("numberOfBins", value)}
                keyboardType="decimal-pad"
                suffix="шт"
              />
            </>
          )}

          {isTransportation && (
            <>
              <InputField
                label="Перевезенный вес"
                value={form.transportedWeight}
                onChangeText={(value) => setField("transportedWeight", value)}
                keyboardType="decimal-pad"
                suffix="кг"
              />
              <InputField
                label="Количество рейсов"
                value={form.numberOfTrips}
                onChangeText={(value) => setField("numberOfTrips", value)}
                keyboardType="decimal-pad"
                suffix="шт"
              />
            </>
          )}

          <InputField
            label="Выработка"
            value={form.outputValue}
            onChangeText={(value) => setField("outputValue", value)}
            keyboardType="decimal-pad"
          />

          {!isTransportOutput && (
            <InputField
              label="Обработанная площадь"
              value={form.factArea}
              onChangeText={(value) => setField("factArea", value)}
              keyboardType="decimal-pad"
              suffix="га"
            />
          )}

        </>
      )}

      {detailsType === "transfer" && isTransportation && (
        <>
          <InputField
            label="Перевезенный вес"
            value={form.transportedWeight}
            onChangeText={(value) => setField("transportedWeight", value)}
            keyboardType="decimal-pad"
            suffix="кг"
          />
          <InputField
            label="Количество рейсов"
            value={form.numberOfTrips}
            onChangeText={(value) => setField("numberOfTrips", value)}
            keyboardType="decimal-pad"
            suffix="шт"
          />
          <InputField
            label="Выработка"
            value={form.outputValue}
            onChangeText={(value) => setField("outputValue", value)}
            keyboardType="decimal-pad"
          />
        </>
      )}
    </View>
  );
}
