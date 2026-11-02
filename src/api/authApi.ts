import axiosClient from "./axiosClient";
import {
  ApiResponse,
  AuthTokens,
  LoginRequest,
  RegisterRequest,
  RefreshTokenRequest,
  User,
} from "@/types";

export const authApi = {
  /**
   * Đăng nhập tài khoản
   */
  async login(payload: LoginRequest): Promise<ApiResponse<AuthTokens>> {
    const response = await axiosClient.post<ApiResponse<AuthTokens>>(
      "/api/v1/auth/login",
      payload
    );
    return response.data;
  },

  /**
   * Đăng ký tài khoản khách hàng mới
   */
  async register(payload: RegisterRequest): Promise<ApiResponse<User>> {
    const response = await axiosClient.post<ApiResponse<User>>(
      "/api/v1/auth/register",
      payload
    );
    return response.data;
  },

  /**
   * Cấp mới Access Token bằng Refresh Token
   */
  async refreshToken(payload: RefreshTokenRequest): Promise<ApiResponse<AuthTokens>> {
    const response = await axiosClient.post<ApiResponse<AuthTokens>>(
      "/api/v1/auth/refresh-token",
      payload
    );
    return response.data;
  },

  /**
   * Đăng xuất và thu hồi Refresh Token trong Redis
   */
  async logout(refreshToken: string): Promise<ApiResponse<void>> {
    const response = await axiosClient.post<ApiResponse<void>>(
      "/api/v1/auth/logout",
      { refreshToken }
    );
    return response.data;
  },

  /**
   * Lấy thông tin tài khoản hiện tại từ MongoDB
   */
  async getProfile(): Promise<ApiResponse<User>> {
    const response = await axiosClient.get<ApiResponse<User>>("/api/v1/profile/me");
    return response.data;
  },
};

export default authApi;
