import axios from "axios";

import { employeeWageFundApi } from "../../entities/employee";

jest.mock("axios", () => ({
  __esModule: true,
  default: {
    post: jest.fn(),
  },
}));

const mockPost = axios.post as jest.Mock;

describe("employeeWageFundApi", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("posts employee ids and season to the monthly analytics endpoint", async () => {
    mockPost.mockResolvedValue({ data: [] });

    await employeeWageFundApi.loadMonthly({
      accessToken: "token",
      employeeIds: ["employee-1"],
      season: 2026,
    });

    expect(mockPost).toHaveBeenCalledWith(
      expect.stringMatching(
        /\/api\/analytic\/employees-wage-fund\/monthly$/,
      ),
      {
        employee_ids: ["employee-1"],
        season: 2026,
      },
      {
        headers: {
          Authorization: "Bearer token",
          "Content-Type": "application/json",
        },
      },
    );
  });
});
