const assert = require("node:assert/strict");
const test = require("node:test");

const {
  buildShiftTimelineModel,
  collectShiftTimelineEntries,
} = require("../../.test-build/widgets/Work/Field/Detail/task-shifts/ShiftTimeline.helpers");

test("builds a chronological scale with work, gaps, movement and extension", () => {
  const entries = collectShiftTimelineEntries(
    {
      fields_task_parts: [
        {
          task_field_name: "Поле 7",
          grouped_by_tariff_parts: [
            {
              shift_parts: [
                {
                  id: "boarding",
                  is_initial: true,
                  start_at: "2026-07-20T07:59:00",
                  end_at: "2026-07-20T08:00:00",
                },
                {
                  id: "work",
                  start_at: "2026-07-20T08:00:00",
                  end_at: "2026-07-20T10:00:00",
                  extend_due: "2026-07-20T10:30:00",
                  break_duration: "00:30:00",
                },
              ],
            },
          ],
        },
      ],
    },
    {
      grouped_by_tariff_parts: [
        {
          shift_parts: [
            {
              id: "move",
              start_at: "2026-07-20T11:00:00",
              end_at: "2026-07-20T12:00:00",
            },
          ],
        },
      ],
    },
  );
  const model = buildShiftTimelineModel(entries, { id: 1 }, {
    data: {
      first_shift_break_start: "09:00:00",
      first_shift_break_end: "09:30:00",
    },
  });

  assert.ok(model);
  assert.equal(model.startLabel, "08:00");
  assert.equal(model.endLabel, "12:00");
  assert.equal(model.totalDurationLabel, "4 ч");
  assert.equal(model.totalBreakLabel, "30 мин");
  assert.equal(model.totalExtendLabel, "30 мин");
  assert.deepEqual(model.breakInterval, {
    leftPct: 25,
    widthPct: 12.5,
    timeRange: "09:00 – 09:30",
    durationLabel: "30 мин",
  });
  assert.ok(model.ticks.some((tick) => tick.label === "09:00"));
  assert.deepEqual(
    model.segments.map((segment) => segment.kind),
    ["work", "extend", "gap", "move"],
  );
  assert.equal(model.segments[0].entryLabel, "Поле 7");
  assert.equal(model.segments[2].timeRange, "10:30 – 11:00");
});

test("keeps night-shift parts after midnight in the right order", () => {
  const model = buildShiftTimelineModel([
    {
      kind: "work",
      part: {
        id: "before-midnight",
        start_at: "2026-07-20T23:00:00",
        end_at: "2026-07-20T23:30:00",
      },
    },
    {
      kind: "move",
      part: {
        id: "after-midnight",
        start_at: "2026-07-21T00:15:00",
        end_at: "2026-07-21T01:00:00",
      },
    },
  ]);

  assert.ok(model);
  assert.equal(model.startLabel, "23:00");
  assert.equal(model.endLabel, "01:00");
  assert.equal(model.totalDurationLabel, "2 ч");
  assert.deepEqual(
    model.segments.map((segment) => segment.kind),
    ["work", "gap", "move"],
  );
});

test("uses transfer flags inside a transport work block", () => {
  const entries = collectShiftTimelineEntries(
    {
      fields_task_parts: [
        {
          task_field_name: "Поле 4",
          grouped_by_tariff_parts: [
            {
              break_duration: "00:20:00",
              shift_parts: [
                {
                  id: "loading",
                  start_at: "2026-07-20T08:00:00",
                  end_at: "2026-07-20T09:00:00",
                },
                {
                  id: "road",
                  is_transfer: true,
                  start_at: "2026-07-20T09:00:00",
                  end_at: "2026-07-20T10:00:00",
                },
              ],
            },
          ],
        },
      ],
    },
    null,
  );
  const model = buildShiftTimelineModel(entries);

  assert.ok(model);
  assert.deepEqual(
    model.segments.map((segment) => segment.kind),
    ["work", "move"],
  );
  assert.equal(model.segments[0].entryLabel, "Поле 4");
  assert.equal(model.segments[0].breakLabel, "20 мин");
});
