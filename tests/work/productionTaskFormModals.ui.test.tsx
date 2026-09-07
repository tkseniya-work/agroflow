/* eslint-disable @typescript-eslint/no-require-imports */
import {
  act,
  fireEvent,
  render,
  screen,
} from "@testing-library/react-native";
import React from "react";

import { FieldTaskFormModal } from "../../widgets/Work/Field/AddEditTask/AddEditFieldTask";

const mockGetValidAccessToken = jest.fn();
const mockChangeSeason = jest.fn();
const mockSeasons = [
  { id: "season-2025", year: 2025, is_current: false },
  { id: "season-2026", year: 2026, is_current: true },
];
const mockWorkStandards = [
  { id: "work-1", name: "Перевозка урожая" },
];

jest.mock("../../entities/auth/lib/useAuth", () => ({
  useAuth: () => ({
    getValidAccessToken: mockGetValidAccessToken,
  }),
}));

jest.mock("../../features/localData/useLocalData", () => ({
  useWorkStandards: () => mockWorkStandards,
}));

jest.mock("../../entities/season", () => ({
  useSeasonFields: () => ({
    seasons: mockSeasons,
    currentSeason: mockSeasons[1],
    changeSeason: mockChangeSeason,
  }),
}));

jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ bottom: 0, left: 0, right: 0, top: 0 }),
}));

jest.mock("../../widgets/AppSelector/AppSelector", () => {
  const React = require("react");
  const { Pressable, Text } = require("react-native");

  return {
    AppSelector: ({
      label,
      value,
      placeholder,
      onPress,
      disabled,
    }: {
      label: string;
      value?: string | number | null;
      placeholder: string;
      onPress: () => void;
      disabled?: boolean;
    }) => (
      <Pressable
        accessibilityLabel={`Открыть ${label}`}
        accessibilityState={{ disabled: Boolean(disabled) }}
        disabled={disabled}
        onPress={onPress}
      >
        <Text>{value || placeholder}</Text>
      </Pressable>
    ),
  };
});

jest.mock("../../widgets/AppSelector/AppPickerModal", () => {
  const React = require("react");
  const { Pressable, Text, View } = require("react-native");

  return {
    AppPickerModal: ({
      visible,
      title,
      data,
      onSelect,
    }: {
      visible: boolean;
      title: string;
      data: {
        id: string | number;
        title: string | number;
        raw: any;
      }[];
      onSelect: (item: any) => void | Promise<void>;
    }) =>
      visible ? (
        <View>
          <Text>{title}</Text>
          {data.map((item) => (
            <Pressable
              key={String(item.id)}
              accessibilityLabel={`${title}: ${item.title}`}
              onPress={() => onSelect(item.raw)}
            >
              <Text>{item.title}</Text>
            </Pressable>
          ))}
        </View>
      ) : null,
  };
});

const submitForm = async (label: string) => {
  await act(async () => {
    fireEvent.press(screen.getByLabelText(label));
    await Promise.resolve();
    await Promise.resolve();
  });
};

describe("production task form modals", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetValidAccessToken.mockResolvedValue("access-token");
  });

  test("requires a work standard before creating a field task", async () => {
    const onClose = jest.fn();
    const onSubmit = jest.fn().mockResolvedValue(undefined);

    render(
      <FieldTaskFormModal
        visible
        currentTask={null}
        onClose={onClose}
        onSubmit={onSubmit}
      />,
    );

    await submitForm("Создать задание");

    expect(screen.getByText("Выберите вид работы")).toBeTruthy();
    expect(onSubmit).not.toHaveBeenCalled();

    fireEvent.press(screen.getByLabelText("Открыть Вид работы"));
    fireEvent.press(
      screen.getByLabelText("Выбор вида работы: Перевозка урожая"),
    );
    await submitForm("Создать задание");

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        accessToken: "access-token",
        seasonYear: 2026,
        workStandardId: "work-1",
      }),
    );
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test("creates a field task through the shared production form", async () => {
    const onClose = jest.fn();
    const onSubmit = jest.fn().mockResolvedValue(undefined);

    render(
      <FieldTaskFormModal
        visible
        currentTask={null}
        onClose={onClose}
        onSubmit={onSubmit}
      />,
    );

    expect(screen.getByText("Полевое задание")).toBeTruthy();

    fireEvent.press(screen.getByLabelText("Открыть Вид работы"));
    fireEvent.press(
      screen.getByLabelText("Выбор вида работы: Перевозка урожая"),
    );
    fireEvent.changeText(screen.getByLabelText("Дата начала"), "2026-09-01");
    fireEvent.changeText(
      screen.getByLabelText("Комментарий"),
      "Подготовить поле",
    );
    await submitForm("Создать задание");

    expect(onSubmit).toHaveBeenCalledWith({
      accessToken: "access-token",
      seasonYear: 2026,
      dateStart: "2026-09-01",
      workStandardId: "work-1",
      comment: "Подготовить поле",
    });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test("hydrates edit values and submits only mutable task fields", async () => {
    const onClose = jest.fn();
    const onSubmit = jest.fn().mockResolvedValue(true);
    const currentTask = {
      id: "task-1",
      season_year: 2025,
      date_start: "2025-03-15T00:00:00",
      comment: "Старый комментарий",
      work_standard: mockWorkStandards[0],
    };

    render(
      <FieldTaskFormModal
        visible
        currentTask={currentTask as any}
        onClose={onClose}
        onSubmit={onSubmit}
      />,
    );

    expect(screen.getByLabelText("Дата начала").props.value).toBe(
      "2025-03-15",
    );
    expect(screen.getByLabelText("Комментарий").props.value).toBe(
      "Старый комментарий",
    );
    expect(
      screen.getByLabelText("Открыть Вид работы").props.accessibilityState,
    ).toEqual({ disabled: true });

    fireEvent.changeText(
      screen.getByLabelText("Комментарий"),
      "Новый комментарий",
    );
    await submitForm("Сохранить задание");

    expect(onSubmit).toHaveBeenCalledWith({
      accessToken: "access-token",
      taskId: "task-1",
      seasonYear: 2025,
      dateStart: "2025-03-15",
      comment: "Новый комментарий",
    });
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
