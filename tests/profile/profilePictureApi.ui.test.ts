import axios from "axios";

import { employeeApi } from "../../entities/employee";

jest.mock("axios", () => ({
  __esModule: true,
  default: {
    post: jest.fn(),
  },
}));

const mockPost = axios.post as jest.Mock;
const mockAppend = jest.fn();
const NativeFormData = global.FormData;

describe("employeeApi.uploadProfilePicture", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.FormData = jest.fn(() => ({
      append: mockAppend,
    })) as unknown as typeof FormData;
  });

  afterAll(() => {
    global.FormData = NativeFormData;
  });

  test("uploads the avatar using the profile API multipart contract", async () => {
    mockPost.mockResolvedValue({ data: { picture: "avatar-url" } });

    await employeeApi.uploadProfilePicture({
      accessToken: "access-token",
      userId: "oidc-user-id",
      fileUri: "file:///avatar.jpg",
      fileName: "avatar.jpg",
      mimeType: "image/jpeg",
    });

    expect(mockPost).toHaveBeenCalledTimes(1);

    const [url, , config] = mockPost.mock.calls[0];

    expect(url).toMatch(
      /\/api\/account\/upload-profile-picture\/oidc-user-id$/,
    );
    expect(mockAppend).toHaveBeenCalledWith("profilePicture", {
      uri: "file:///avatar.jpg",
      name: "avatar.jpg",
      type: "image/jpeg",
    });
    expect(config).toEqual(
      expect.objectContaining({
        headers: {
          Authorization: "Bearer access-token",
          Accept: "application/json",
          "Content-Type": "multipart/form-data",
        },
        timeout: 30_000,
        transformRequest: expect.any(Function),
      }),
    );
  });
});
