import axios from "axios";

import { productionShiftActionsService } from "../../entities/productionShift";

jest.mock("axios", () => ({
  __esModule: true,
  default: {
    post: jest.fn(),
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
  code: "workplace_qr-key",
  shiftType: 1,
  employeeId: "employee-1",
  scannedAt: "2026-08-19T09:11:06.352Z",
  scannedPlace: {
    type: "Point",
    coordinates: [37.6, 55.7],
  },
};

describe("productionShiftActionsService.openShift", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns the backend validation reason", async () => {
    jest.mocked(axios.post).mockRejectedValue({
      isAxiosError: true,
      response: {
        status: 500,
        data: {
          detail: "Ключ не совпадает.",
          errorCode: "validation",
        },
      },
      config: {
        method: "post",
        url: "/api/production-shifts/open-by-qr/",
      },
    });

    await expect(
      productionShiftActionsService.openShift(request),
    ).rejects.toThrow("Ключ не совпадает.");
  });

  it("uses a safe fallback when the backend returned no reason", async () => {
    jest.mocked(axios.post).mockRejectedValue({
      isAxiosError: true,
      response: {
        status: 500,
        data: {},
      },
      config: {},
    });

    await expect(
      productionShiftActionsService.openShift(request),
    ).rejects.toThrow("Не удалось открыть смену");
  });
});
