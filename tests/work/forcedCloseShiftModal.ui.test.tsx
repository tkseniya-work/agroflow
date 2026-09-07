/* eslint-disable @typescript-eslint/no-require-imports */
import { fireEvent, render, screen } from "@testing-library/react-native";
import React from "react";

import { ForcedCloseShiftModal } from "../../widgets/Work/ForcedCloseShiftModal";

jest.mock("../../shared/ui/AppDateTimePicker", () => {
  const React = require("react");
  const { Pressable, Text } = require("react-native");

  return {
    AppDateTimePicker: ({
      label,
      onChange,
    }: {
      label: string;
      onChange: (value: { date: string; time: string }) => void;
    }) => (
      <Pressable
        accessibilityLabel="Выбрать тестовое время"
        onPress={() =>
          onChange({ date: "2026-07-20", time: "18:30:00" })
        }
      >
        <Text>{label}</Text>
      </Pressable>
    ),
  };
});

const shift = {
  productionShiftId: "shift-1",
  shiftType: { id: 1 },
  openAt: "2026-07-20T07:00:00",
};

const defaultProps = {
  visible: true,
  shifts: [shift],
  needsTime: true,
  pickerVisible: true,
  queueIndex: 1,
  queueTotal: 2,
  closeDate: "2026-07-20",
  closeTime: "18:00:00",
  selectedCloseDate: new Date(2026, 6, 20, 18),
  isClosing: false,
  onClose: jest.fn(),
  onConfirm: jest.fn(),
  onTogglePicker: jest.fn(),
  onDateTimeChange: jest.fn(),
};

describe("ForcedCloseShiftModal", () => {
  test("shows the online close flow and emits all user actions", () => {
    const onClose = jest.fn();
    const onConfirm = jest.fn();
    const onTogglePicker = jest.fn();
    const onDateTimeChange = jest.fn();

    render(
      <ForcedCloseShiftModal
        {...defaultProps}
        mode="online"
        onClose={onClose}
        onConfirm={onConfirm}
        onTogglePicker={onTogglePicker}
        onDateTimeChange={onDateTimeChange}
      />,
    );

    expect(
      screen.getByText(
        "Перед сканированием нужно закрыть предыдущую онлайн-смену.",
      ),
    ).toBeTruthy();
    expect(screen.getByText("Смена 1 из 2")).toBeTruthy();
    expect(screen.getByText("Первая смена")).toBeTruthy();
    expect(screen.getByText("Дата и время закрытия")).toBeTruthy();

    fireEvent.press(screen.getByLabelText("Скрыть выбор времени"));
    fireEvent.press(screen.getByLabelText("Выбрать тестовое время"));
    fireEvent.press(screen.getByLabelText("Завершить смену"));
    fireEvent.press(
      screen.getByLabelText("Закрыть окно завершения смены"),
    );

    expect(onTogglePicker).toHaveBeenCalledTimes(1);
    expect(onDateTimeChange).toHaveBeenCalledWith({
      date: "2026-07-20",
      time: "18:30:00",
    });
    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test("shows the offline explanation without a hidden picker", () => {
    render(
      <ForcedCloseShiftModal
        {...defaultProps}
        mode="offline"
        pickerVisible={false}
        queueTotal={1}
        selectedCloseDate={null}
      />,
    );

    expect(
      screen.getByText(
        "Есть незавершенные офлайн-отрезки. Перед продолжением их нужно закрыть.",
      ),
    ).toBeTruthy();
    expect(
      screen.getByText(
        "Смена закрывается позже планового времени. Проверьте фактические дату и время закрытия.",
      ),
    ).toBeTruthy();
    expect(screen.getByText("Не указано")).toBeTruthy();
    expect(screen.getByLabelText("Изменить дату и время")).toBeTruthy();
    expect(screen.queryByText("Смена 1 из 1")).toBeNull();
    expect(screen.queryByText("Дата и время закрытия")).toBeNull();
  });

  test("blocks repeated confirmation while the shift is closing", () => {
    const onConfirm = jest.fn();

    render(
      <ForcedCloseShiftModal
        {...defaultProps}
        isClosing
        onConfirm={onConfirm}
      />,
    );

    fireEvent.press(screen.getByLabelText("Закрываем..."));

    expect(onConfirm).not.toHaveBeenCalled();
  });
});
