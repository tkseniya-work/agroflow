import { fireEvent, render, screen } from "@testing-library/react-native";
import React from "react";

import { DateRangeModal } from "../../widgets/Work/work-screen/DateRangeModal";
import { ScanConfirmationModal } from "../../widgets/Work/work-screen/ScanConfirmationModal";

describe("Work page modals", () => {
  test("date range modal validates dates and emits user changes", () => {
    const onStartDateChange = jest.fn();
    const onEndDateChange = jest.fn();
    const onClose = jest.fn();
    const onApply = jest.fn();

    render(
      <DateRangeModal
        visible
        startDate="2026-07-20"
        endDate="2026-07-10"
        parsedStartDate={new Date(2026, 6, 20)}
        parsedEndDate={new Date(2026, 6, 10)}
        isRangeValid={false}
        onStartDateChange={onStartDateChange}
        onEndDateChange={onEndDateChange}
        onClose={onClose}
        onApply={onApply}
      />,
    );

    expect(
      screen.getByText("Дата окончания должна быть не раньше даты начала"),
    ).toBeTruthy();

    const dateInputs = screen.getAllByPlaceholderText("ГГГГ-ММ-ДД");
    fireEvent.changeText(dateInputs[0], "20260701");
    fireEvent.changeText(dateInputs[1], "20260731");
    fireEvent.press(screen.getByText("Применить"));
    fireEvent.press(screen.getByText("Отмена"));

    expect(onStartDateChange).toHaveBeenCalledWith("2026-07-01");
    expect(onEndDateChange).toHaveBeenCalledWith("2026-07-31");
    expect(onApply).not.toHaveBeenCalled();
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test("date range modal applies a valid range", () => {
    const onApply = jest.fn();

    render(
      <DateRangeModal
        visible
        startDate="2026-07-01"
        endDate="2026-07-31"
        parsedStartDate={new Date(2026, 6, 1)}
        parsedEndDate={new Date(2026, 6, 31)}
        isRangeValid
        onStartDateChange={jest.fn()}
        onEndDateChange={jest.fn()}
        onClose={jest.fn()}
        onApply={onApply}
      />,
    );

    fireEvent.press(screen.getByText("Применить"));

    expect(onApply).toHaveBeenCalledTimes(1);
    expect(
      screen.queryByText("Дата окончания должна быть не раньше даты начала"),
    ).toBeNull();
  });

  test("scan confirmation displays data and submits selected shift", () => {
    const onShiftTypeChange = jest.fn();
    const onConfirm = jest.fn();
    const getDisplayShift = jest.fn((shiftType?: number) => ({
      displayName: shiftType === 1 ? "Дневная смена" : "Ночная смена",
    }));

    render(
      <ScanConfirmationModal
        pendingScan={{
          workPlaceName: "Склад №1",
          scannedAt: new Date(2026, 6, 15, 8, 30),
          shiftType: 1,
        }}
        isProcessing={false}
        getDisplayShift={getDisplayShift}
        onShiftTypeChange={onShiftTypeChange}
        onCancel={jest.fn()}
        onConfirm={onConfirm}
      />,
    );

    expect(screen.getByText("Склад №1")).toBeTruthy();
    expect(screen.getByText("Дневная смена")).toBeTruthy();
    expect(screen.getByText("Ночная смена")).toBeTruthy();

    fireEvent.press(screen.getByText("Ночная смена"));
    fireEvent.press(screen.getByText("Создать"));

    expect(onShiftTypeChange).toHaveBeenCalledWith(2);
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  test("scan confirmation blocks actions while processing", () => {
    const onCancel = jest.fn();
    const onConfirm = jest.fn();

    render(
      <ScanConfirmationModal
        pendingScan={{ workPlaceName: "Поле", shiftType: 2 }}
        isProcessing
        getDisplayShift={(shiftType) => ({
          displayName: shiftType === 1 ? "Дневная смена" : "Ночная смена",
        })}
        onShiftTypeChange={jest.fn()}
        onCancel={onCancel}
        onConfirm={onConfirm}
      />,
    );

    fireEvent.press(screen.getByText("Отмена"));
    fireEvent.press(screen.getByText("Создаем..."));

    expect(onCancel).not.toHaveBeenCalled();
    expect(onConfirm).not.toHaveBeenCalled();
  });

  test("scan confirmation is not rendered without pending scan", () => {
    render(
      <ScanConfirmationModal
        pendingScan={null}
        isProcessing={false}
        getDisplayShift={() => ({ displayName: "Смена" })}
        onShiftTypeChange={jest.fn()}
        onCancel={jest.fn()}
        onConfirm={jest.fn()}
      />,
    );

    expect(screen.queryByText("Создать отрезок")).toBeNull();
  });
});
