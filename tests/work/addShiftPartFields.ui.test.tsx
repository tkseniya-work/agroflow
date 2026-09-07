/* eslint-disable @typescript-eslint/no-require-imports */
import React, { useState } from "react";
import { fireEvent, render } from "@testing-library/react-native";

import { AddShiftPartFields } from "../../widgets/Work/Field/Detail/task-shifts/AddShiftPartFields";
import type { AddShiftPartFormState } from "../../widgets/Work/Field/Detail/task-shifts/AddShiftPartModal.helpers";

jest.mock("../../shared/ui/AppDateTimePicker", () => {
  const React = require("react");
  const { Text } = require("react-native");

  return {
    AppDateTimePicker: ({ label }: { label: string }) => <Text>{label}</Text>,
  };
});

const initialForm: AddShiftPartFormState = {
  date: "2026-07-20",
  startAt: "07:00:00",
  endedDate: "2026-07-20",
  endedAt: "19:00:00",
  outputValue: "",
  factArea: "",
  forceLoadTrack: false,
};

const Harness = ({ isFact }: { isFact: boolean }) => {
  const [form, setForm] = useState(initialForm);

  return (
    <AddShiftPartFields
      isFact={isFact}
      form={form}
      setForm={setForm}
      employee={null}
      shiftType={{ label: "Дневная смена", icon: "sunny-outline" }}
      technique={{ id: "technique-1", label: "Трактор" }}
      agriMachine={null}
      tariff={null}
      field={null}
      agriculturalOptionsLength={1}
      onOpenPicker={jest.fn()}
    />
  );
};

describe("AddShiftPartFields", () => {
  test("shows fact-only fields only in fact mode", () => {
    const online = render(<Harness isFact={false} />);

    expect(online.queryByText("Окончание")).toBeNull();
    expect(online.queryByText("Загрузить по GPS-треку")).toBeNull();
    expect(online.queryByText("Обработанная площадь")).toBeNull();

    const fact = render(<Harness isFact />);

    expect(fact.getByText("Окончание")).toBeTruthy();
    expect(fact.getByText("Загрузить по GPS-треку")).toBeTruthy();
    expect(fact.getByText("Обработанная площадь")).toBeTruthy();
  });

  test("GPS mode hides tariff and production fields", () => {
    const screen = render(<Harness isFact />);

    expect(screen.getByText("Выбрать тариф")).toBeTruthy();
    expect(screen.getByText("Обработанная площадь")).toBeTruthy();

    fireEvent.press(screen.getByText("Загрузить по GPS-треку"));

    expect(screen.queryByText("Выбрать тариф")).toBeNull();
    expect(screen.queryByText("Обработанная площадь")).toBeNull();
  });
});
