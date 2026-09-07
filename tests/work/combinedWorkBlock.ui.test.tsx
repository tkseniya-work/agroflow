/* eslint-disable @typescript-eslint/no-require-imports */

import { fireEvent, render, screen } from "@testing-library/react-native";
import React from "react";

import { CombinedWorkBlock } from "../../widgets/Work/Field/Detail/task-shifts/CombinedWorkBlock";

jest.mock(
  "../../widgets/Work/Field/Detail/task-shifts/FieldPartCard",
  () => {
    const React = require("react");
    const { Text } = require("react-native");

    return {
      FieldPartCard: ({ fieldPart }: any) =>
        React.createElement(Text, null, `field:${fieldPart.id}`),
    };
  },
);

jest.mock(
  "../../widgets/Work/Field/Detail/task-shifts/TransferPartCard",
  () => {
    const React = require("react");
    const { Text } = require("react-native");

    return {
      TransferPartCard: ({ currentPart }: any) =>
        React.createElement(
          Text,
          null,
          `transfer:${currentPart.shift_parts.map((part: any) => part.id).join(",")}`,
        ),
    };
  },
);

describe("CombinedWorkBlock", () => {
  test("sorts all work by time and keeps boarding separate from transfers", () => {
    const onDeletePart = jest.fn();

    render(
      <CombinedWorkBlock
        employee={{ id: "employee-1" }}
        employeeName="Иванов И.И."
        employeePosition="Механизатор"
        groupedAggregate={{
          aggregate: {
            technique_standard: {
              machinery_model: { name: "МТЗ-82" },
              state_number: "А123АА",
            },
            agricultural_machine: { name: "Сеялка" },
          },
          output_value_aggregate_parts: {
            fields_task_parts: [
              {
                id: "field-1",
                open_at_parts_time: "2026-07-20T10:00:00Z",
                grouped_by_tariff_parts: [
                  {
                    shift_parts: [
                      {
                        id: "field",
                        start_at: "2026-07-20T10:00:00Z",
                        end_at: "2026-07-20T11:00:00Z",
                      },
                    ],
                  },
                ],
              },
            ],
          },
          transfer_aggregate_parts: {
            grouped_by_tariff_parts: [
              {
                tariff_id: "transfer",
                shift_parts: [
                  {
                    id: "boarding",
                    is_initial: true,
                    start_at: "2026-07-20T08:00:00Z",
                    end_at: "2026-07-20T08:00:01Z",
                  },
                  {
                    id: "regular",
                    start_at: "2026-07-20T12:00:00Z",
                    end_at: "2026-07-20T13:00:00Z",
                  },
                ],
              },
            ],
          },
        }}
        onOpenDetails={jest.fn()}
        onEditPart={jest.fn()}
        onDeletePart={onDeletePart}
      />,
    );

    expect(screen.getAllByText(/^(field|transfer):/).map((item) => item.props.children)).toEqual([
      "transfer:regular",
      "field:field-1",
      "transfer:boarding",
    ]);
    expect(screen.getByText("Иванов И.И.")).toBeTruthy();
    expect(screen.getByText("Выработка + Перегон")).toBeTruthy();
    expect(screen.getByText("МТЗ-82 · А123АА")).toBeTruthy();
    expect(screen.getByText("СХМ: Сеялка")).toBeTruthy();

    fireEvent.press(
      screen.getByLabelText("Удалить всю смену сотрудника Иванов И.И."),
    );

    expect(onDeletePart).toHaveBeenCalledWith(
      expect.objectContaining({
        deleteTitle: "Удаление блока",
        deleteMessage:
          "Удалить выбранный рабочий блок?\n\nБудут удалены: работа на поле и перегон техники",
        deleteIds: ["field", "boarding", "regular"],
      }),
    );
  });

  test("uses the transport group deletion wording and tariff chronology", () => {
    const onDeletePart = jest.fn();

    render(
      <CombinedWorkBlock
        employee={{ id: "employee-2" }}
        employeeName="Петров П.П."
        employeePosition="Водитель"
        groupedAggregate={{
          task_kind: "transport",
          is_transport_task: true,
          aggregate: {
            technique_standard: {
              machinery_model: { name: "КамАЗ" },
              state_number: "А456АА",
            },
          },
          output_value_aggregate_parts: {
            fields_task_parts: [
              {
                id: "transport-field",
                is_transport_task: true,
                task_field_name: "Поле 12",
                grouped_by_tariff_parts: [
                  {
                    is_transport_task: true,
                    open_at_parts_time: "2026-07-20T09:00:00Z",
                    shift_parts: [
                      {
                        id: "transport-1",
                        start_at: "2026-07-20T09:00:00Z",
                        end_at: "2026-07-20T10:00:00Z",
                      },
                    ],
                  },
                ],
              },
            ],
          },
        }}
        onOpenDetails={jest.fn()}
        onEditPart={jest.fn()}
        onDeletePart={onDeletePart}
      />,
    );

    expect(screen.getByText("Петров П.П.")).toBeTruthy();
    expect(screen.getByText("Выработка")).toBeTruthy();
    expect(screen.getByText("КамАЗ · А456АА")).toBeTruthy();
    expect(screen.getByText("field:transport-field")).toBeTruthy();

    fireEvent.press(
      screen.getByLabelText("Удалить всю смену сотрудника Петров П.П."),
    );

    expect(onDeletePart).toHaveBeenCalledWith(
      expect.objectContaining({
        icon: "truck-fast-outline",
        deleteMessage:
          "Удалить выбранный рабочий блок?\n\nБудут удалены: работа техники по транспортировке продукции с поля",
        deleteIds: ["transport-1"],
      }),
    );
  });

  test("uses the transportation block wording without duplicating technique in the header", () => {
    const onDeletePart = jest.fn();

    render(
      <CombinedWorkBlock
        employee={{ id: "employee-3" }}
        employeeName="Сидоров С.С."
        employeePosition="Водитель"
        groupedAggregate={{
          task_kind: "transportation",
          is_product_transportation_task: true,
          aggregate: {
            technique_standard: {
              machinery_model: { name: "КамАЗ" },
              state_number: "А789АА",
            },
          },
          output_value_aggregate_parts: {
            fields_task_parts: [
              {
                id: "transportation-field",
                task_field_name: "Выработка",
                grouped_by_tariff_parts: [
                  {
                    task_field_name: "Поле 5",
                    shift_parts: [
                      {
                        id: "transportation-1",
                        start_at: "2026-07-20T09:00:00Z",
                        end_at: "2026-07-20T10:00:00Z",
                      },
                    ],
                  },
                ],
              },
            ],
          },
        }}
        onOpenDetails={jest.fn()}
        onEditPart={jest.fn()}
        onDeletePart={onDeletePart}
      />,
    );

    expect(screen.getByText("Сидоров С.С.")).toBeTruthy();
    expect(screen.getByText("Выработка")).toBeTruthy();
    expect(screen.queryByText("КамАЗ · А789АА")).toBeNull();
    expect(
      screen.getByLabelText("Открыть хронологию смены"),
    ).toBeTruthy();

    fireEvent.press(
      screen.getByLabelText("Удалить всю смену сотрудника Сидоров С.С."),
    );

    expect(onDeletePart).toHaveBeenCalledWith(
      expect.objectContaining({
        icon: "tractor-variant",
        deleteMessage:
          "Удалить выбранный рабочий блок?\n\nБудут удалены: работа техники по транспортировке продукции с поля",
        deleteIds: ["transportation-1"],
      }),
    );
  });
});
