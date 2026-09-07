import {
  act,
  fireEvent,
  render,
  screen,
} from "@testing-library/react-native";
import React from "react";
import { Alert } from "react-native";

import { OfflineTab } from "../../widgets/OfflineMap/MapBottomPanel/OfflineTab";
import MapDataStatusBanner from "../../widgets/OfflineMap/MapDataStatusBanner";
import { MapFloatingControls } from "../../widgets/OfflineMap/MapFloatingControls";
import MapRegionSelector from "../../widgets/OfflineMap/MapComponents/MapRegionSelector";

const mockFocus = jest.fn();

jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ bottom: 0, left: 0, right: 0, top: 0 }),
}));

jest.mock("../../widgets/OfflineMap/useMapCamera", () => ({
  useMapCamera: () => ({ focus: mockFocus }),
}));

jest.mock("../../shared/lib/useNetworkStatus", () => ({
  useNetworkStatus: () => ({
    forcedOffline: false,
    isConnected: true,
    isEnvOfflineMode: false,
  }),
}));

describe("Map controls", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("shows a friendly error and retries loading", () => {
    const onRetry = jest.fn();

    render(
      <MapDataStatusBanner
        tone="error"
        title="Не удалось загрузить поля"
        message="Проверьте подключение к интернету."
        onRetry={onRetry}
      />,
    );

    expect(screen.getByRole("alert")).toBeTruthy();
    expect(screen.getByText("Не удалось загрузить поля")).toBeTruthy();

    fireEvent.press(
      screen.getByRole("button", {
        name: "Повторить загрузку данных карты",
      }),
    );

    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  test("supports a contextual action label", () => {
    const onOpen = jest.fn();

    render(
      <MapDataStatusBanner
        tone="info"
        title="Поле выбрано"
        message="Посмотрите информацию о поле."
        onRetry={onOpen}
        actionLabel="Открыть"
        actionAccessibilityLabel="Открыть информацию о выбранном поле"
      />,
    );

    fireEvent.press(
      screen.getByRole("button", {
        name: "Открыть информацию о выбранном поле",
      }),
    );

    expect(screen.getByText("Открыть")).toBeTruthy();
    expect(onOpen).toHaveBeenCalledTimes(1);
  });

  test("announces every floating action and exposes the labels state", () => {
    const onPressCompany = jest.fn();
    const onPressMyLocation = jest.fn();
    const onToggleLabels = jest.fn();
    const onToggleMeasurement = jest.fn();

    render(
      <MapFloatingControls
        showTechniqueLabels
        isMeasurementActive={false}
        onPressCompany={onPressCompany}
        onPressMyLocation={onPressMyLocation}
        onToggleLabels={onToggleLabels}
        onToggleMeasurement={onToggleMeasurement}
      />,
    );

    fireEvent.press(
      screen.getByRole("button", {
        name: "Перейти к расположению организации",
      }),
    );
    fireEvent.press(
      screen.getByRole("button", {
        name: "Показать моё местоположение",
      }),
    );
    fireEvent.press(
      screen.getByRole("button", {
        name: "Измерить площадь или расстояние",
      }),
    );
    fireEvent.press(
      screen.getByRole("button", {
        name: "Скрыть подписи техники",
        selected: true,
      }),
    );

    expect(onPressCompany).toHaveBeenCalledTimes(1);
    expect(onPressMyLocation).toHaveBeenCalledTimes(1);
    expect(onToggleMeasurement).toHaveBeenCalledTimes(1);
    expect(onToggleLabels).toHaveBeenCalledTimes(1);
  });

  test("explains region selection and blocks duplicate saving", () => {
    const onConfirm = jest.fn();

    render(
      <MapRegionSelector
        mapMode="selectRegion"
        isSaving
        onConfirm={onConfirm}
        onCancel={jest.fn()}
      />,
    );

    expect(screen.getByText("Область для офлайн-карты")).toBeTruthy();
    expect(screen.getByText("Начинаем...")).toBeTruthy();

    fireEvent.press(
      screen.getByRole("button", { name: "Подготовка офлайн-области" }),
    );

    expect(onConfirm).not.toHaveBeenCalled();
  });

  test("shows a region save error and lets the user retry", () => {
    const onConfirm = jest.fn();

    render(
      <MapRegionSelector
        mapMode="selectRegion"
        error="Не удалось сохранить область."
        onConfirm={onConfirm}
        onCancel={jest.fn()}
      />,
    );

    expect(screen.getByRole("alert")).toBeTruthy();
    expect(screen.getByText("Повторить")).toBeTruthy();

    fireEvent.press(
      screen.getByRole("button", { name: "Скачать офлайн-область" }),
    );

    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  test("asks for confirmation before deleting an offline region", async () => {
    const deleteRegion = jest.fn().mockResolvedValue(undefined);
    const alertSpy = jest.spyOn(Alert, "alert").mockImplementation(jest.fn());

    render(
      <OfflineTab
        regions={[
          {
            id: "region-1",
            name: "Северное поле",
            bounds: [
              [30, 50],
              [31, 51],
            ],
            minZoom: 10,
            maxZoom: 16,
            styleURL: "satellite",
            isDeletable: true,
          },
        ]}
        cameraRef={{ current: null }}
        setInteractionMode={jest.fn()}
        collapsePanel={jest.fn()}
        loadRegions={jest.fn()}
        saveRegion={jest.fn()}
        deleteRegion={deleteRegion}
      />,
    );

    fireEvent.press(
      screen.getByRole("button", {
        name: "Удалить офлайн-область Северное поле",
      }),
    );

    expect(deleteRegion).not.toHaveBeenCalled();
    expect(alertSpy).toHaveBeenCalledWith(
      "Удалить офлайн-область?",
      expect.stringContaining("Северное поле"),
      expect.any(Array),
    );

    const buttons = alertSpy.mock.calls[0][2];
    const deleteButton = buttons?.find((button) => button.text === "Удалить");

    await act(async () => {
      deleteButton?.onPress?.();
    });

    expect(deleteRegion).toHaveBeenCalledWith("region-1");
  });
});
