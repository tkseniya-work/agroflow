const test = require("node:test");
const assert = require("node:assert/strict");

const {
  filterTaskList,
  getServerTaskTypeIds,
  normalizeAndSortTasks,
  normalizeTaskSearchText,
} = require("../../.test-build/widgets/Work/tasksSection.logic.js");

const tasks = [
  {
    id: 1,
    date_start: "2026-06-01T00:00:00Z",
    task_type: { id: 1 },
    work_standard: { name: "Посев пшеницы" },
    comment: "Северное поле",
  },
  {
    id: 2,
    date_start: "2026-07-01T00:00:00Z",
    task_type: { id: 2 },
    work_standard: { name: "Перевозка" },
    comment: "На склад",
  },
];

test("tasks are normalized and sorted from newest to oldest", () => {
  const result = normalizeAndSortTasks(tasks);

  assert.deepEqual(
    result.map((task) => task.id),
    [2, 1],
  );
  assert.equal(result[0].transport, true);
  assert.equal(result[1].transport, false);
  assert.equal(tasks[0].transport, undefined);
});

test("local task filters combine type and normalized Russian search", () => {
  const normalizedTasks = normalizeAndSortTasks(tasks);

  assert.equal(normalizeTaskSearchText("  ПОСЕВ   ПШЕНИЦЫ "), "посев пшеницы");
  assert.deepEqual(
    filterTaskList({
      tasks: normalizedTasks,
      activeTaskFilter: "field",
      searchQuery: "  северное   ПОЛЕ ",
      serverFiltering: false,
    }).map((task) => task.id),
    [1],
  );
  assert.deepEqual(getServerTaskTypeIds("transportation"), [4]);
  assert.deepEqual(getServerTaskTypeIds("all"), [1, 2, 3, 4]);
});

test("a task without a known type remains in the field filter", () => {
  const taskWithoutType = normalizeAndSortTasks([{ id: 3 }]);

  assert.deepEqual(
    filterTaskList({
      tasks: taskWithoutType,
      activeTaskFilter: "field",
      searchQuery: "",
      serverFiltering: false,
    }).map((task) => task.id),
    [3],
  );
});

test("server filtering keeps the received task page unchanged", () => {
  const normalizedTasks = normalizeAndSortTasks(tasks);
  const result = filterTaskList({
    tasks: normalizedTasks,
    activeTaskFilter: "field",
    searchQuery: "нет совпадений",
    serverFiltering: true,
  });

  assert.equal(result, normalizedTasks);
});
