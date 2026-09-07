const test = require("node:test");
const assert = require("node:assert/strict");

const {
  getTaskFieldId,
  getTaskFieldWorkDateLabel,
  getTaskFieldWorkState,
  isTaskFieldWorkUsed,
  normalizeTaskFieldWorks,
} = require("../../.test-build/widgets/Work/Field/Edit/taskFieldWorks.logic.js");

test("task field works flatten grouped API data and inherit used state", () => {
  const works = normalizeTaskFieldWorks([
    {
      is_used: true,
      works: [
        { id: "work-1", work_standard: { name: "Посев" } },
        { id: "work-2", is_used: false },
      ],
    },
  ]);

  assert.equal(works.length, 2);
  assert.equal(works[0].is_used, true);
  assert.equal(works[1].is_used, false);
  assert.equal(isTaskFieldWorkUsed({ isUsed: "1" }), true);
  assert.equal(getTaskFieldId({ season_field: { id: 15 } }), "15");
});

test("task field work state allows selected and locally released works", () => {
  const usedWork = { id: "work-1", is_used: true };

  assert.deepEqual(
    getTaskFieldWorkState({
      work: usedWork,
      selectedWorkId: "work-1",
      locallyReleasedWorkIds: [],
      serverSelectedWorkId: "work-1",
    }),
    {
      workId: "work-1",
      isSelected: true,
      isUsedByAnotherTask: false,
      isDisabled: false,
    },
  );

  assert.equal(
    getTaskFieldWorkState({
      work: usedWork,
      selectedWorkId: null,
      locallyReleasedWorkIds: ["work-1"],
      serverSelectedWorkId: null,
    }).isDisabled,
    false,
  );
  assert.equal(
    getTaskFieldWorkState({
      work: usedWork,
      selectedWorkId: null,
      locallyReleasedWorkIds: [],
      serverSelectedWorkId: null,
    }).isDisabled,
    true,
  );
  assert.equal(getTaskFieldWorkDateLabel({ month: 3, year: 2026 }), "Март 2026");
});
