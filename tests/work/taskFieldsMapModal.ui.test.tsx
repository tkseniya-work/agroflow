import { fireEvent, render, screen } from "@testing-library/react-native";
import React from "react";
import { Text } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { TaskFieldsMapModal } from "../../widgets/Work/Field/Edit/TaskFieldsMapModal";

const renderModal = (
  props: Partial<React.ComponentProps<typeof TaskFieldsMapModal>> = {},
) => {
  const defaultProps: React.ComponentProps<typeof TaskFieldsMapModal> = {
    visible: true,
    selectedCount: 2,
    isSaving: false,
    onClose: jest.fn(),
    onSave: jest.fn(),
    renderMap: () => <Text>Карта полей</Text>,
  };
  const mergedProps = { ...defaultProps, ...props };

  return {
    props: mergedProps,
    ...render(
      <SafeAreaProvider
        initialMetrics={{
          frame: { x: 0, y: 0, width: 390, height: 844 },
          insets: { top: 44, left: 0, right: 0, bottom: 34 },
        }}
      >
        <TaskFieldsMapModal {...mergedProps} />
      </SafeAreaProvider>,
    ),
  };
};

describe("TaskFieldsMapModal", () => {
  test("shows selection count, closes and saves", () => {
    const { props } = renderModal();

    expect(screen.getByText("Выбор полей")).toBeTruthy();
    expect(screen.getByText("Выбрано: 2")).toBeTruthy();
    expect(screen.getByText("Карта полей")).toBeTruthy();

    fireEvent.press(screen.getByText("Готово"));
    fireEvent.press(screen.getByLabelText("Закрыть выбор полей"));

    expect(props.onSave).toHaveBeenCalledTimes(1);
    expect(props.onClose).toHaveBeenCalledTimes(1);
  });

  test("blocks closing and saving while fields are being saved", () => {
    const onClose = jest.fn();
    const onSave = jest.fn();

    renderModal({ isSaving: true, onClose, onSave });

    expect(screen.queryByText("Готово")).toBeNull();
    fireEvent.press(screen.getByLabelText("Закрыть выбор полей"));

    expect(onClose).not.toHaveBeenCalled();
    expect(onSave).not.toHaveBeenCalled();
  });
});
