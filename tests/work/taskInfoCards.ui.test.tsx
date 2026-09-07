import { render, screen } from "@testing-library/react-native";
import React from "react";

import { TaskInfoCard } from "../../widgets/Work/Field/Edit/TaskInfoCard";

const baseTask = {
  work_standard: { name: "Посев пшеницы" },
  task_type: { description: "Производственное задание" },
  status: { id: 1, description: "В работе" },
  date_start: "2026-07-20",
  season_year: 2026,
  created_by: { fullname: "Иван Иванов" },
  last_modified_by: { fullname: "Пётр Петров" },
};

describe("task information cards", () => {
  test("shows shared loading and error states", () => {
    const view = render(
      <TaskInfoCard currentTask={null} isLoading />,
    );

    expect(
      screen.getByText("Загружаем информацию о задании"),
    ).toBeTruthy();

    view.rerender(
      <TaskInfoCard currentTask={null} error={new Error("network")} />,
    );

    expect(screen.getByText("Не удалось загрузить задание")).toBeTruthy();
  });

  test("renders field metrics, progress and people", () => {
    render(
      <TaskInfoCard
        currentTask={
          {
            ...baseTask,
            progress: 45,
            comment: "Проверить норму высева",
            field_task: {
              task_fields: [{ area: 10.5 }, { area: 5 }],
              techniques: [{ id: 1 }, { id: 2 }],
            },
          } as any
        }
      />,
    );

    expect(screen.getByText("Посев пшеницы")).toBeTruthy();
    expect(screen.getByText("2 / 15,5 га")).toBeTruthy();
    expect(screen.getByText("45%")).toBeTruthy();
    expect(screen.getByText("Иван Иванов")).toBeTruthy();
    expect(screen.getByText("Проверить норму высева")).toBeTruthy();
  });
});
