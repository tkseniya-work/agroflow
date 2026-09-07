/* eslint-disable @typescript-eslint/no-require-imports */

import { fireEvent, render, screen } from "@testing-library/react-native";
import React from "react";

import { TaskShiftGroups } from "../../widgets/Work/Field/Detail/task-shifts/TaskShiftGroups";

jest.mock(
  "../../widgets/Work/Field/Detail/task-shifts/CombinedWorkBlock",
  () => {
    const React = require("react");
    const { Pressable, Text, View } = require("react-native");

    return {
      CombinedWorkBlock: ({
        employeeName,
        onOpenDetails,
        onEditPart,
        onDeletePart,
      }) => {
        const details = { type: "field", title: "Отрезок" };

        return React.createElement(
          View,
          null,
          React.createElement(Text, null, `work:${employeeName}`),
          React.createElement(
            Pressable,
            {
              accessibilityLabel: "open-shift-details",
              onPress: () => onOpenDetails(details),
            },
            React.createElement(Text, null, "details"),
          ),
          React.createElement(
            Pressable,
            {
              accessibilityLabel: "edit-shift-part",
              onPress: () => onEditPart(details),
            },
            React.createElement(Text, null, "edit"),
          ),
          React.createElement(
            Pressable,
            {
              accessibilityLabel: "delete-shift-part",
              onPress: () => onDeletePart(details),
            },
            React.createElement(Text, null, "delete"),
          ),
        );
      },
    };
  },
);

jest.mock("../../widgets/Work/components/EmployeeAvatar", () => ({
  EmployeeAvatar: () => null,
}));

const employeeWithoutWork = (id: string, name: string) => ({
  id,
  employee_name: name,
  shifts: [],
});

const createProps = (overrides: Record<string, unknown> = {}) => ({
  taskId: "task-1",
  groups: [] as any[],
  employees: [] as any[],
  isLoading: false,
  deletingPartId: null,
  onOpenDetails: jest.fn(),
  onEditPart: jest.fn(),
  onDeletePart: jest.fn(),
  ...overrides,
});

describe("TaskShiftGroups", () => {
  test("shows loading and empty states", () => {
    const props = createProps({ isLoading: true });
    const { rerender } = render(<TaskShiftGroups {...props} />);

    expect(screen.getByText("Загружаем смены")).toBeTruthy();

    rerender(<TaskShiftGroups {...props} isLoading={false} />);
    expect(screen.getByText("Нет данных о сменах")).toBeTruthy();
  });

  test("sorts dates and opens the latest group by default", () => {
    const props = createProps({
      groups: [
        {
          date: "2026-07-19",
          employees_task_parts: [
            employeeWithoutWork("old", "Старый сотрудник"),
          ],
        },
        {
          date: "2026-07-20",
          employees_task_parts: [
            employeeWithoutWork("new", "Новый сотрудник"),
          ],
        },
      ],
    });
    render(<TaskShiftGroups {...props} />);

    const dateButtons = screen.getAllByLabelText(/Смены за/);
    expect(dateButtons[0].props.accessibilityState.expanded).toBe(true);
    expect(dateButtons[1].props.accessibilityState.expanded).toBe(false);
    expect(screen.getByText("Новый сотрудник")).toBeTruthy();
    expect(screen.queryByText("Старый сотрудник")).toBeNull();

    fireEvent.press(dateButtons[1]);
    expect(screen.getByText("Старый сотрудник")).toBeTruthy();
  });

  test("shows an empty message inside an opened date", () => {
    const props = createProps({
      groups: [{ date: "2026-07-20", employees_task_parts: [] }],
    });
    render(<TaskShiftGroups {...props} />);

    expect(screen.getByText("Нет данных о сменах выработки")).toBeTruthy();
  });

  test("shows the latest seven days and can reveal the full history", () => {
    const groups = Array.from({ length: 8 }, (_, index) => {
      const day = String(index + 1).padStart(2, "0");

      return {
        date: `2026-07-${day}`,
        employees_task_parts: [
          employeeWithoutWork(`employee-${day}`, `Сотрудник ${day}`),
        ],
      };
    });
    const props = createProps({ groups });

    render(<TaskShiftGroups {...props} />);

    expect(screen.queryByLabelText("Смены за 1 июля 2026 г.")).toBeNull();

    fireEvent.press(screen.getByText("Все даты"));

    expect(screen.getByLabelText("Смены за 1 июля 2026 г.")).toBeTruthy();
  });

  test("shows all dates without a range switch when it is disabled", () => {
    const groups = Array.from({ length: 8 }, (_, index) => {
      const day = String(index + 1).padStart(2, "0");

      return {
        date: `2026-07-${day}`,
        employees_task_parts: [
          employeeWithoutWork(`employee-${day}`, `Сотрудник ${day}`),
        ],
      };
    });

    render(
      <TaskShiftGroups
        {...createProps({ groups })}
        showDateRangeSwitch={false}
      />,
    );

    expect(screen.queryByText("Последние 7")).toBeNull();
    expect(screen.queryByText("Все даты")).toBeNull();
    expect(screen.getByLabelText("Смены за 1 июля 2026 г.")).toBeTruthy();
  });

  test("resolves employee data and forwards work block actions", () => {
    const aggregate = { output_value_aggregate_parts: {} };
    const props = createProps({
      deletingPartId: "part-1",
      employees: [
        {
          id: "employee-1",
          surname: "Иванов",
          firstname: "Иван",
          position: { name: "Агроном" },
        },
      ],
      groups: [
        {
          date: "2026-07-20",
          employees_task_parts: [
            {
              employee_id: "employee-1",
              shifts: [
                {
                  production_shift_id: "shift-1",
                  shift_type: 1,
                  shift_aggregate_task_parts: [aggregate],
                },
              ],
            },
          ],
        },
      ],
    });
    render(<TaskShiftGroups {...props} />);

    expect(screen.getByText("work:Иванов И.")).toBeTruthy();
    expect(screen.getByText("Удаляем отрезок...")).toBeTruthy();

    fireEvent.press(screen.getByLabelText("open-shift-details"));
    fireEvent.press(screen.getByLabelText("edit-shift-part"));
    fireEvent.press(screen.getByLabelText("delete-shift-part"));

    expect(props.onOpenDetails).toHaveBeenCalledWith(
      expect.objectContaining({ title: "Отрезок" }),
    );
    expect(props.onEditPart).toHaveBeenCalledTimes(1);
    expect(props.onDeletePart).toHaveBeenCalledTimes(1);
  });
});
