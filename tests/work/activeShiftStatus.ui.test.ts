import { hasActiveShift } from "../../src/utils/activeShiftStatus";

const openStoredShift = {
  key: "stored-key",
  productionShiftId: "shift-1",
  closeAt: "",
};

describe("hasActiveShift", () => {
  test("detects an open stored shift", () => {
    expect(
      hasActiveShift({
        storedShifts: [openStoredShift as any],
        pendingOpenShifts: [],
        pendingCloseShifts: [],
      }),
    ).toBe(true);
  });

  test("does not show a stored shift queued for closing", () => {
    expect(
      hasActiveShift({
        storedShifts: [openStoredShift as any],
        pendingOpenShifts: [],
        pendingCloseShifts: [{ shift_id: "shift-1" } as any],
      }),
    ).toBe(false);
  });

  test("detects only unfinished offline shifts for the current employee", () => {
    expect(
      hasActiveShift({
        storedShifts: [],
        pendingOpenShifts: [
          { employee_id: "employee-2", ended_at: null } as any,
          { employee_id: "employee-1", ended_at: "2026-08-04" } as any,
        ],
        pendingCloseShifts: [],
        employeeId: "employee-1",
      }),
    ).toBe(false);

    expect(
      hasActiveShift({
        storedShifts: [],
        pendingOpenShifts: [
          { employee_id: "employee-1", ended_at: null } as any,
        ],
        pendingCloseShifts: [],
        employeeId: "employee-1",
      }),
    ).toBe(true);
  });
});
