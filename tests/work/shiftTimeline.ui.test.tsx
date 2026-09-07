import { fireEvent, render, screen } from "@testing-library/react-native";
import React from "react";

import { ShiftTimeline } from "../../widgets/Work/Field/Detail/task-shifts/ShiftTimeline";

const entries = [
  {
    kind: "work" as const,
    label: "Поле 1",
    part: {
      id: "work",
      start_at: "2026-07-20T08:00:00",
      end_at: "2026-07-20T10:00:00",
      break_duration: "00:15:00",
    },
  },
  {
    kind: "move" as const,
    part: {
      id: "move",
      start_at: "2026-07-20T10:30:00",
      end_at: "2026-07-20T11:00:00",
    },
  },
];

describe("ShiftTimeline", () => {
  test("opens the timeline in a modal and shows segment details on press", () => {
    render(
      <ShiftTimeline
        entries={entries}
        shiftType={1}
        shiftSettings={{
          first_shift_break_start: "09:00:00",
          first_shift_break_end: "09:15:00",
        }}
      />,
    );

    const toggle = screen.getByLabelText("Открыть хронологию смены");
    expect(screen.queryByText("2 ч 30 мин")).toBeNull();

    fireEvent.press(toggle);

    expect(screen.getByText("Хронология смены")).toBeTruthy();
    expect(screen.getByText("3 ч")).toBeTruthy();
    expect(screen.getAllByText("Перерыв · 15 мин")).toHaveLength(2);
    expect(screen.getByText("Простой")).toBeTruthy();
    expect(screen.getByText("09:00")).toBeTruthy();
    expect(
      screen.getByLabelText("Перерыв: 09:00 – 09:15, 15 мин"),
    ).toBeTruthy();
    expect(screen.getByText("Отрезок 1 из 3")).toBeTruthy();
    expect(screen.getByTestId("timeline-segment-bar-move-move")).toHaveStyle({
      width: "100%",
      backgroundColor: "#00B8D9",
      borderColor: "#0891B2",
    });

    fireEvent.press(screen.getByLabelText("Следующий отрезок"));
    expect(screen.getByText("Отрезок 2 из 3")).toBeTruthy();
    expect(screen.getByText("10:00 – 10:30")).toBeTruthy();
    expect(screen.getByText("30 мин")).toBeTruthy();

    fireEvent.press(screen.getByLabelText("Предыдущий отрезок"));
    expect(screen.getByText("Отрезок 1 из 3")).toBeTruthy();

    fireEvent.press(
      screen.getByLabelText("Выработка: 08:00 – 10:00, 2 ч"),
    );

    expect(screen.getByText("Поле 1")).toBeTruthy();
    expect(screen.getByText("08:00 – 10:00")).toBeTruthy();
    expect(screen.getByText("2 ч")).toBeTruthy();

    fireEvent.press(screen.getByLabelText("Закрыть хронологию смены"));
    expect(screen.queryByText("Хронология смены")).toBeNull();
  });

  test("keeps an overlapping move above the initially selected work", () => {
    render(
      <ShiftTimeline
        entries={[
          {
            kind: "work",
            part: {
              id: "manual-work",
              start_at: "2026-07-18T19:00:00+03:00",
              end_at: "2026-07-20T07:00:00+03:00",
            },
          },
          {
            kind: "move",
            part: {
              id: "automatic-move",
              start_at: "2026-07-18T19:00:04+03:00",
              end_at: "2026-07-18T21:32:10+03:00",
            },
          },
        ]}
      />,
    );

    fireEvent.press(
      screen.getByLabelText("Открыть хронологию смены"),
    );

    expect(
      screen.getByTestId("timeline-segment-touch-work-manual-work"),
    ).toHaveStyle({
      transform: [{ scaleY: 1.3 }],
    });
    expect(
      screen.getByTestId("timeline-segment-touch-move-automatic-move"),
    ).toHaveStyle({
      zIndex: 4,
    });
    expect(
      screen.getByTestId("timeline-segment-bar-move-automatic-move"),
    ).toHaveStyle({
      backgroundColor: "#00B8D9",
    });
  });
});
