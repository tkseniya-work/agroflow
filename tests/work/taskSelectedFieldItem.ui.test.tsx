import { fireEvent, render, screen } from "@testing-library/react-native";
import React from "react";

import { TaskSelectedFieldItem } from "../../widgets/Work/Field/Edit/TaskSelectedFieldItem";

const selectedWork = {
  id: "work-1",
  month: 3,
  year: 2026,
  work_standard: { name: "Посев" },
};
const usedWork = {
  id: "work-2",
  is_used: true,
  month: 4,
  year: 2026,
  work_standard: { name: "Опрыскивание" },
};
const freeWork = {
  id: "work-3",
  month: 5,
  year: 2026,
  work_standard: { name: "Культивация" },
};
const field = {
  id: "field-1",
  name: "Поле 1",
  area: 125.5,
  works: [selectedWork, usedWork],
};
const currentTask = {
  field_task: {
    task_fields: [
      {
        id: "task-field-1",
        season_field: { id: "field-1" },
        plan_work: selectedWork,
      },
    ],
  },
};

describe("TaskSelectedFieldItem", () => {
  test("allows selected work changes and blocks work used by another task", () => {
    const onToggle = jest.fn();
    const onDelete = jest.fn();
    const onToggleWork = jest.fn();

    render(
      <TaskSelectedFieldItem
        currentTask={currentTask}
        field={field}
        expanded
        selectedWorkId="work-1"
        isUpdating={false}
        onToggle={onToggle}
        onDelete={onDelete}
        onToggleWork={onToggleWork}
      />,
    );

    expect(screen.getByText("Выбрано")).toBeTruthy();
    expect(screen.getByText("Использовано")).toBeTruthy();
    expect(screen.getByText("Март 2026")).toBeTruthy();

    fireEvent.press(screen.getByText("Опрыскивание"));
    expect(onToggleWork).not.toHaveBeenCalled();

    fireEvent.press(screen.getByText("Посев"));
    expect(onToggleWork).toHaveBeenCalledWith(field, selectedWork);

    fireEvent.press(screen.getByText("Поле 1"));
    fireEvent.press(screen.getByLabelText("Удалить поле Поле 1"));
    expect(onToggle).toHaveBeenCalledTimes(1);
    expect(onDelete).toHaveBeenCalledTimes(1);
  });

  test("hides collapsed works and shows an empty expanded state", () => {
    const emptyField = { ...field, works: [] };
    const view = render(
      <TaskSelectedFieldItem
        currentTask={currentTask}
        field={emptyField}
        expanded={false}
        selectedWorkId={null}
        isUpdating={false}
        onToggle={jest.fn()}
        onDelete={jest.fn()}
        onToggleWork={jest.fn()}
      />,
    );

    expect(screen.queryByText("Нет плановых работ")).toBeNull();
    expect(
      screen.getByLabelText("Развернуть поле Поле 1").props
        .accessibilityState,
    ).toEqual({ expanded: false });

    view.rerender(
      <TaskSelectedFieldItem
        currentTask={currentTask}
        field={emptyField}
        expanded
        selectedWorkId={null}
        isUpdating={false}
        onToggle={jest.fn()}
        onDelete={jest.fn()}
        onToggleWork={jest.fn()}
      />,
    );

    expect(screen.getByText("Нет плановых работ")).toBeTruthy();
    expect(
      screen.getByLabelText("Свернуть поле Поле 1").props
        .accessibilityState,
    ).toEqual({ expanded: true });
  });

  test("blocks deletion and work changes while the field is updating", () => {
    const onDelete = jest.fn();
    const onToggleWork = jest.fn();

    render(
      <TaskSelectedFieldItem
        currentTask={currentTask}
        field={field}
        expanded
        selectedWorkId="work-1"
        isUpdating
        onToggle={jest.fn()}
        onDelete={onDelete}
        onToggleWork={onToggleWork}
      />,
    );

    const selectedWorkControl = screen.getByLabelText(
      "Плановая работа Посев",
    );
    expect(selectedWorkControl.props.accessibilityState).toEqual({
      checked: true,
      disabled: true,
    });

    fireEvent.press(selectedWorkControl);
    fireEvent.press(screen.getByLabelText("Удалить поле Поле 1"));

    expect(onToggleWork).not.toHaveBeenCalled();
    expect(onDelete).not.toHaveBeenCalled();
  });

  test("optimistically switches work and releases the server selection", () => {
    const serverWork = { ...selectedWork, is_used: true };
    const optimisticField = {
      ...field,
      works: [serverWork, freeWork],
    };
    const optimisticTask = {
      field_task: {
        task_fields: [
          {
            id: "task-field-1",
            season_field: { id: "field-1" },
            plan_work: serverWork,
          },
        ],
      },
    };
    const onToggleWork = jest.fn();

    render(
      <TaskSelectedFieldItem
        currentTask={optimisticTask}
        field={optimisticField}
        expanded
        selectedWorkId="work-1"
        isUpdating={false}
        onToggle={jest.fn()}
        onDelete={jest.fn()}
        onToggleWork={onToggleWork}
      />,
    );

    fireEvent.press(
      screen.getByLabelText("Плановая работа Культивация"),
    );

    expect(
      screen.getByLabelText("Плановая работа Культивация").props
        .accessibilityState,
    ).toEqual({ checked: true, disabled: false });
    expect(
      screen.getByLabelText("Плановая работа Посев").props
        .accessibilityState,
    ).toEqual({ checked: false, disabled: false });

    fireEvent.press(screen.getByLabelText("Плановая работа Посев"));

    expect(onToggleWork).toHaveBeenNthCalledWith(
      1,
      optimisticField,
      freeWork,
    );
    expect(onToggleWork).toHaveBeenNthCalledWith(
      2,
      optimisticField,
      serverWork,
    );
  });
});
