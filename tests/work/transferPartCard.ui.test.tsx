/* eslint-disable @typescript-eslint/no-require-imports */
import React from "react";
import { fireEvent, render } from "@testing-library/react-native";

import { TransferPartCard } from "../../widgets/Work/Field/Detail/task-shifts/TransferPartCard";

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
          <Pressable testID="edit-transfer" onPress={() => onEdit(details)} />
          <Pressable
            testID="delete-transfer"
            onPress={() => onDelete(details)}
          />
          {children}
        </View>
      ),
    };
  },
);

const createProps = (overrides: Record<string, unknown> = {}) => ({
  employeeName: "Иванов И.И.",
  employeePosition: "Водитель",
  aggregate: {
    technique_standard: {
      name: "КамАЗ",
      state_number: "А123АА",
      machinery_model: { name: "65115" },
    },
  },
  currentPart: {
    shift_parts: [{ id: "part-1", employee_id: "employee-1" }],
    production_kilometers: 80,
    fuel_total: 16,
    payment_total: 900,
    parts_duration: 120,
  },
  productionShiftId: "shift-1",
  shiftType: 1,
  kilometers: 80,
  avgSpeed: 40,
  maxSpeed: 65,
  onEditPart: jest.fn(),
  onDeletePart: jest.fn(),
  ...overrides,
});

describe("TransferPartCard", () => {
  test("renders employee boarding as an initial part", () => {
    const props = createProps({
      currentPart: {
        shift_parts: [
          { id: "part-1", is_initial: true, part_type: { id: 1 } },
        ],
      },
    });
    const screen = render(<TransferPartCard {...(props as any)} />);

    expect(screen.getByText("Посадка сотрудника")).toBeTruthy();
    expect(screen.queryByText("Иванов И.И.")).toBeNull();
    expect(screen.getByText("Сотрудник сел в технику")).toBeTruthy();
    expect(screen.getByText("старт смены")).toBeTruthy();
    expect(screen.getByText("QR")).toBeTruthy();
    expect(screen.queryByText("КамАЗ · 65115 · А123АА")).toBeNull();
  });

  test("forwards transportation actions and deleting state", () => {
    const props = createProps({
      deletingPartId: "part-1",
      currentPart: {
        shift_parts: [
          {
            id: "part-1",
            employee_id: "employee-1",
            part_type: { id: 3 },
          },
        ],
        is_transportation: true,
        production_kilometers: 80,
        fuel_total: 16,
        payment_total: 900,
      },
    });
    const screen = render(<TransferPartCard {...(props as any)} />);

    expect(screen.getByText("deleting")).toBeTruthy();
    expect(screen.getByText("Транспортировка")).toBeTruthy();
    expect(screen.getByText("Авто")).toBeTruthy();
    expect(screen.queryByText("КамАЗ · 65115 · А123АА")).toBeNull();
    expect(screen.getByText("ср. 40 км/ч")).toBeTruthy();
    expect(screen.getByText("макс. 65 км/ч")).toBeTruthy();
    expect(screen.getByText("Расход ГСМ")).toBeTruthy();
    expect(screen.getByText("ГСМ всего")).toBeTruthy();
    expect(screen.getByLabelText("0 мин, дневная смена")).toBeTruthy();
    fireEvent.press(screen.getByTestId("edit-transfer"));
    fireEvent.press(screen.getByTestId("delete-transfer"));

    expect(props.onEditPart).toHaveBeenCalledWith(
      expect.objectContaining({ title: "Транспортировка" }),
    );
    expect(props.onDeletePart).toHaveBeenCalledWith(
      expect.objectContaining({ title: "Транспортировка" }),
    );
  });
});
