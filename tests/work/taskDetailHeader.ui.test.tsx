import { fireEvent, render, screen } from "@testing-library/react-native";
import React from "react";

import { TaskDetailHeader } from "../../widgets/Work/Field/Detail/task-detail/TaskDetailHeader";

const createProps = (overrides: Record<string, unknown> = {}) => ({
  isActiveTask: true,
  isArchivedTask: false,
  onBack: jest.fn(),
  onEdit: jest.fn(),
  onComplete: jest.fn(),
  onResume: jest.fn(),
  ...overrides,
});

describe("TaskDetailHeader", () => {
  test("forwards navigation and active task actions", () => {
    const props = createProps();
    render(<TaskDetailHeader {...props} />);

    fireEvent.press(screen.getByLabelText("Назад"));
    fireEvent.press(screen.getByLabelText("Редактировать задание"));
    fireEvent.press(screen.getByLabelText("Завершить задание"));

    expect(props.onBack).toHaveBeenCalledTimes(1);
    expect(props.onEdit).toHaveBeenCalledTimes(1);
    expect(props.onComplete).toHaveBeenCalledTimes(1);
    expect(screen.queryByLabelText("Возобновить задание")).toBeNull();
  });

  test("shows the resume action for an archived task", () => {
    const props = createProps({ isActiveTask: false, isArchivedTask: true });
    render(<TaskDetailHeader {...props} />);

    expect(screen.queryByLabelText("Завершить задание")).toBeNull();
    fireEvent.press(screen.getByLabelText("Возобновить задание"));

    expect(props.onResume).toHaveBeenCalledTimes(1);
  });

  test("shows a custom title and hides status actions while updating", () => {
    const props = createProps({
      title: "Стационарное задание",
      isUpdating: true,
    });
    render(<TaskDetailHeader {...props} />);

    expect(screen.getByText("Стационарное задание")).toBeTruthy();
    expect(screen.queryByLabelText("Завершить задание")).toBeNull();
    expect(screen.queryByLabelText("Возобновить задание")).toBeNull();
  });
});
