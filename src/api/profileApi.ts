import axiosClient from "./axiosClient";
import {
  ApiResponse,
  ChangePasswordRequest,
  UpdateProfileRequest,
  User,
} from "@/types";

export const profileApi = {
  /**
   * Lấy thông tin tài khoản admin hiện tại
   */
  async getProfile(): Promise<ApiResponse<User>> {
    const response = await axiosClient.get<ApiResponse<User>>("/api/v1/profile/me");
    return response.data;
  },

  /**
   * Cập nhật họ tên, số điện thoại, avatar URL
   */
  async updateProfile(payload: UpdateProfileRequest): Promise<ApiResponse<User>> {
    const response = await axiosClient.put<ApiResponse<User>>(
      "/api/v1/profile/me",
      payload
    );
    return response.data;
  },

  /**
   * Đổi mật khẩu tài khoản
   */
  async changePassword(
    payload: ChangePasswordRequest
  ): Promise<ApiResponse<void>> {
    const response = await axiosClient.post<ApiResponse<void>>(
      "/api/v1/profile/change-password",
      payload
    );
    return response.data;
  },
};

export default profileApi;
