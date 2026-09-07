/* eslint-disable @typescript-eslint/no-require-imports */

import { act, fireEvent, render, screen } from "@testing-library/react-native";
import React from "react";

import { TaskFormModals } from "../../widgets/Work/TaskFormModals";

jest.mock(
  "../../widgets/Work/Field/AddEditTask/AddEditFieldTask",
  () => {
    const React = require("react");
    const { Pressable, Text, View } = require("react-native");

    return {
      FieldTaskFormModal: ({ visible, currentTask, onClose, onSubmit }) =>
        visible
          ? React.createElement(
              View,
              null,
              React.createElement(
                Text,
                null,
                `field:${currentTask?.id ?? "new"}`,
              ),
              React.createElement(
                Pressable,
                { accessibilityLabel: "close-field", onPress: onClose },
                React.createElement(Text, null, "close"),
              ),
              React.createElement(
                Pressable,
                {
                  accessibilityLabel: "submit-field",
                  onPress: () => onSubmit({ source: "field" }),
                },
                React.createElement(Text, null, "submit"),
              ),
            )
          : null,
    };
  },
);

const createProps = (overrides: Record<string, unknown> = {}) => ({
  activeType: "field" as const,
  currentTask: null,
  isSubmitting: false,
  isActionLoading: false,
  onClose: jest.fn(),
  onCreateFieldTask: jest.fn().mockResolvedValue(true),
  onUpdateAllProductionTask: jest.fn().mockResolvedValue(true),
  ...overrides,
});

describe("TaskFormModals", () => {
  test("creates a field task and closes after success", async () => {
    const props = createProps();
    render(<TaskFormModals {...props} />);

    expect(screen.getByText("field:new")).toBeTruthy();
    await act(async () => {
      fireEvent.press(screen.getByLabelText("submit-field"));
    });

    expect(props.onCreateFieldTask).toHaveBeenCalledWith({ source: "field" });
    expect(props.onUpdateAllProductionTask).not.toHaveBeenCalled();
    expect(props.onClose).toHaveBeenCalledTimes(1);
  });

  test("updates an existing field task through the shared update action", async () => {
    const currentTask = { id: "task-2", task_type: { id: 1 } } as any;
    const props = createProps({ currentTask });
    render(<TaskFormModals {...props} />);

    expect(screen.getByText("field:task-2")).toBeTruthy();
    await act(async () => {
      fireEvent.press(screen.getByLabelText("submit-field"));
    });

    expect(props.onCreateFieldTask).not.toHaveBeenCalled();
    expect(props.onUpdateAllProductionTask).toHaveBeenCalledWith({
      source: "field",
    });
    expect(props.onClose).toHaveBeenCalledTimes(1);
  });

  test("keeps the form open after a failed request", async () => {
    const onClose = jest.fn();
    const props = createProps({
      onClose,
      onCreateFieldTask: jest.fn().mockResolvedValue(false),
    });
    render(<TaskFormModals {...props} />);

    await act(async () => {
      fireEvent.press(screen.getByLabelText("submit-field"));
    });

    expect(onClose).not.toHaveBeenCalled();
  });

  test("does not render the field form when it isn't the active type", () => {
    const props = createProps({ activeType: null });
    render(<TaskFormModals {...props} />);

    expect(screen.queryByText("field:new")).toBeNull();
  });
});
