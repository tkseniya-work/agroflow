import axios from "axios";

import { productionShiftApi } from "../../entities/productionShift";

jest.mock("axios", () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
  },
  isAxiosError: (error: unknown) =>
    Boolean(
      error &&
        typeof error === "object" &&
        "isAxiosError" in error &&
        error.isAxiosError,
    ),
}));

const request = {
  accessToken: "token",
  userId: "employee-1",
  startDate: "2026-08-24T00:00:00.000Z",
  endDate: "2026-08-24T23:59:59.999Z",
};

describe("productionShiftApi.loadByEmployee", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("limits the request duration and returns loaded shifts", async () => {
    const responseData = { shifts: [{ id: "shift-1" }] };
    jest.mocked(axios.get).mockResolvedValue({ data: responseData });

    await expect(productionShiftApi.loadByEmployee(request)).resolves.toEqual(
      responseData,
    );
    expect(axios.get).toHaveBeenCalledWith(
      expect.stringContaining("employee-1"),
      expect.objectContaining({
        timeout: 10000,
        headers: expect.objectContaining({
          Authorization: "Bearer token",
        }),
      }),
    );
  });

  it("passes a connection error to the local fallback handler", async () => {
    const error = {
      isAxiosError: true,
      code: "ERR_NETWORK",
      config: {},
    };
    const warningSpy = jest.spyOn(console, "warn").mockImplementation();
    jest.mocked(axios.get).mockRejectedValue(error);

    await expect(productionShiftApi.loadByEmployee(request)).rejects.toBe(error);

    warningSpy.mockRestore();
  });
});
