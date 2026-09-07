import { fireEvent, render, screen } from "@testing-library/react-native";
import React from "react";
import { Text, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { TaskDetailMapModal } from "../../widgets/Work/Field/Detail/task-detail/TaskDetailMapModal";

const renderModal = (
  props: Partial<React.ComponentProps<typeof TaskDetailMapModal>> = {},
) => {
  const defaultProps: React.ComponentProps<typeof TaskDetailMapModal> = {
    visible: true,
    trackLinesCount: 0,
    isSaving: false,
    onClose: jest.fn(),
    onSave: jest.fn(),
    renderMap: () => (
      <View>
        <Text>Содержимое карты</Text>
      </View>
    ),
  };

  return {
    props: { ...defaultProps, ...props },
    ...render(
      <SafeAreaProvider
        initialMetrics={{
          frame: { x: 0, y: 0, width: 390, height: 844 },
          insets: { top: 44, left: 0, right: 0, bottom: 34 },
        }}
      >
        <TaskDetailMapModal {...defaultProps} {...props} />
      </SafeAreaProvider>,
    ),
  };
};

describe("TaskDetailMapModal", () => {
  test("shows fields, closes and saves selection", () => {
    const onClose = jest.fn();
    const onSave = jest.fn();

    renderModal({ onClose, onSave });

    expect(screen.getByText("Карта задания")).toBeTruthy();
    expect(screen.getByText("Поля задания")).toBeTruthy();
    expect(screen.getByText("Содержимое карты")).toBeTruthy();

    fireEvent.press(screen.getByText("Готово"));
    fireEvent.press(screen.getByLabelText("Закрыть карту задания"));

    expect(onSave).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test("describes technique track and blocks closing while saving", () => {
    const onClose = jest.fn();

    renderModal({ trackLinesCount: 4, isSaving: true, onClose });

    expect(screen.getByText("Поля и трек выбранной техники")).toBeTruthy();
    expect(screen.queryByText("Готово")).toBeNull();

    fireEvent.press(screen.getByLabelText("Закрыть карту задания"));
    expect(onClose).not.toHaveBeenCalled();
  });
});
