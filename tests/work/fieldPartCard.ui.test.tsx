/* eslint-disable @typescript-eslint/no-require-imports */
import React from "react";
import { fireEvent, render } from "@testing-library/react-native";

import { FieldPartCard } from "../../widgets/Work/Field/Detail/task-shifts/FieldPartCard";

jest.mock("../../widgets/Work/shared/useShifts", () => ({
  useShifts: () => ({ getShiftName: () => "Первая смена" }),
}));

jest.mock(
  "../../widgets/Work/Field/Detail/task-shifts/ShiftPartActions",
  () => {
    const React = require("react");
    const { Pressable, Text, View } = require("react-native");

    return {
      ShiftPartActions: ({
        children,
        details,
        isDeleting,
        onEdit,
        onDelete,
      }: any) => (
        <View>
          <Text>{isDeleting ? "deleting" : "ready"}</Text>
          <Pressable testID="edit-part" onPress={() => onEdit(details)} />
          <Pressable testID="delete-part" onPress={() => onDelete(details)} />
          {children}
        </View>
      ),
    };
  },
);

const createProps = (overrides: Record<string, unknown> = {}) => ({
  employeeName: "Иванов И.И.",
  employeePosition: "Механизатор",
  aggregate: {
    technique_standard: {
      name: "Трактор",
      state_number: "А123АА",
      machinery_model: { name: "МТЗ-82" },
    },
  },
  fieldPart: {
    task_field_name: "Поле 1",
    area_fact: 5,
    open_at_parts_time: "2026-07-20T08:00:00Z",
    closed_at_parts_time: "2026-07-20T18:00:00Z",
  },
  tariffPart: {
    shift_parts: [{ id: "part-1", employee_id: "employee-1" }],
    output_value_total: 10,
    tariff: { unit_code: { description: "га" } },
  },
  productionShiftId: "shift-1",
  shiftType: 1,
  onOpenDetails: jest.fn(),
  onEditPart: jest.fn(),
  onDeletePart: jest.fn(),
  ...overrides,
});

describe("FieldPartCard", () => {
  test("opens the details built for the compact card", () => {
    const props = createProps();
    const screen = render(<FieldPartCard {...(props as any)} />);

    expect(screen.queryByText("Иванов И.И.")).toBeNull();
    expect(screen.getByText("Выработка")).toBeTruthy();
    expect(screen.getByText("Начислено")).toBeTruthy();
    fireEvent.press(screen.getByText("Поле 1"));

    expect(props.onOpenDetails).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Поле 1",
        shiftName: "Первая смена",
        deleteIds: ["part-1"],
      }),
    );
  });

  test("forwards edit and delete actions with deleting state", () => {
    const props = createProps({ deletingPartId: "part-1" });
    const screen = render(<FieldPartCard {...(props as any)} />);

    expect(screen.getByText("deleting")).toBeTruthy();
    fireEvent.press(screen.getByTestId("edit-part"));
    fireEvent.press(screen.getByTestId("delete-part"));

    expect(props.onEditPart).toHaveBeenCalledWith(
      expect.objectContaining({ title: "Поле 1" }),
    );
    expect(props.onDeletePart).toHaveBeenCalledWith(
      expect.objectContaining({ title: "Поле 1" }),
    );
  });

  test("renders the values available in the web field card", () => {
    const base = createProps();
    const props = createProps({
      fieldPart: {
        ...base.fieldPart,
        parts_duration: 125,
        fuel_per_ha: 4,
        threshed: 3000,
        number_of_bins: 2,
      },
      tariffPart: {
        ...base.tariffPart,
        area_fact: 6,
        manual_fact_area: 7,
        manual_output_value: 15,
        break_duration: "01:30:00",
        extend_duration: "00:15:00",
        shift_parts: [
          {
            id: "part-1",
            employee_id: "employee-1",
            part_type: { id: 1 },
          },
          { id: "part-2", part_type: { id: 2 } },
          { id: "part-3", part_type: { id: 3 } },
        ],
        tariff: {
          ...base.tariffPart.tariff,
          norm_fuel_per_ha: 3.5,
        },
      },
    });
    const screen = render(<FieldPartCard {...(props as any)} />);

    expect(screen.getByText("Площадь · вручную")).toBeTruthy();
    expect(screen.getByText("7,0 га")).toBeTruthy();
    expect(screen.getByText("Выработка · вручную")).toBeTruthy();
    expect(screen.getByText("15,0 га")).toBeTruthy();
    expect(screen.getByText("QR")).toBeTruthy();
    expect(screen.getByText("Руч.")).toBeTruthy();
    expect(screen.getByText("Авто")).toBeTruthy();
    expect(screen.getByText("перерыв 1 ч 30 мин")).toBeTruthy();
    expect(screen.getByText("продление 15 мин")).toBeTruthy();
    expect(screen.getByText("3,00 т намолот")).toBeTruthy();
    expect(screen.getByText("2 бунк.")).toBeTruthy();
    expect(screen.getByText("норма 3,50 л/га")).toBeTruthy();
    expect(screen.getByText("МТЗ-82 · А123АА")).toBeTruthy();
    expect(screen.getByLabelText("2 ч 5 мин, дневная смена")).toBeTruthy();
  });

  test("renders transport values in the shared compact card", () => {
    const base = createProps();
    const props = createProps({
      aggregate: {
        technique_standard: {
          name: "Грузовик",
          state_number: "А456АА",
          machinery_model: {
            name: "КамАЗ",
            fuel_consumption_per_distance: 28,
          },
        },
      },
      fieldPart: {
        ...base.fieldPart,
        is_transport_task: true,
        task_field_name: "Поле 12",
      },
      tariffPart: {
        ...base.tariffPart,
        is_transport_task: true,
        task_field_name: "Поле 12",
        parts_duration: 125,
        manual_output_value_total: 15,
        production_kilometers: 42.5,
        fuel_per_100km: 24.4,
        payment_total: 2300,
        extend_duration: "00:15:00",
        shift_parts: [
          {
            id: "part-1",
            employee_id: "employee-1",
            part_type: { id: 3 },
          },
        ],
        tariff: {
          unit_code: { short_name: "т" },
        },
      },
    });
    const screen = render(<FieldPartCard {...(props as any)} />);

    expect(screen.getByText("Поле 12")).toBeTruthy();
    expect(screen.getByText("Выработка")).toBeTruthy();
    expect(screen.getByText("15,0 т")).toBeTruthy();
    expect(screen.getByText("Ручн. кор.")).toBeTruthy();
    expect(screen.getByText("Пробег")).toBeTruthy();
    expect(screen.getByText("42,5 км")).toBeTruthy();
    expect(screen.getByText("24,4 л/100км")).toBeTruthy();
    expect(screen.getByText("Авто")).toBeTruthy();
    expect(screen.getByText("продление 15 мин")).toBeTruthy();
    expect(screen.getByText("норма 28,0 л/100км")).toBeTruthy();

    fireEvent.press(screen.getByText("Поле 12"));
    expect(props.onOpenDetails).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Поле 12",
        icon: "truck-fast-outline",
      }),
    );
  });

  test("renders product transportation as a compact transport card", () => {
    const base = createProps();
    const props = createProps({
      fieldPart: {
        ...base.fieldPart,
        task_field_name: "Выработка",
        is_product_transportation_task: true,
        is_transportation_output: true,
      },
      tariffPart: {
        ...base.tariffPart,
        task_field_name: "Поле 5",
        is_product_transportation_task: true,
        is_transportation_output: true,
        output_value_total: 18,
        manual_output_value_total: 20,
        production_kilometers: 36.5,
        transported_weight: 2500,
        number_of_trips: 4,
        fuel_per_100km: 27.3,
        payment_total: 1900,
        shift_parts: [
          {
            id: "part-1",
            employee_id: "employee-1",
            part_type: { id: 1 },
          },
        ],
        tariff: {
          unit_code: { short_name: "т" },
        },
      },
    });
    const screen = render(<FieldPartCard {...(props as any)} />);

    expect(screen.getAllByText("Выработка").length).toBeGreaterThan(0);
    expect(screen.getByText("Поле 5")).toBeTruthy();
    expect(screen.getByText("20,0 т")).toBeTruthy();
    expect(screen.getByText("36,5 км")).toBeTruthy();
    expect(screen.getByText("2,50 т")).toBeTruthy();
    expect(screen.getByText("4 шт.")).toBeTruthy();
    expect(screen.getByText("Ручн. кор.")).toBeTruthy();
    expect(screen.getByText("QR")).toBeTruthy();
    expect(screen.getByText("МТЗ-82 · А123АА")).toBeTruthy();
    expect(screen.queryByText("СХМ: Сеялка")).toBeNull();
  });
});
