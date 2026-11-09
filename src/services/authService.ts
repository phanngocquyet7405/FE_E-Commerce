import authApi from "@/api/authApi";
import {
  AuthTokens,
  LoginRequest,
  RegisterRequest,
  User,
} from "@/types";
import {
  decodeToken,
  getAuthUserFromToken,
  getUserRole,
  isAdminUser,
  isTokenExpired,
} from "@/utils/jwt";

const ACCESS_TOKEN_KEY = "access_token";
const REFRESH_TOKEN_KEY = "refresh_token";
const USER_INFO_KEY = "user_info";

export interface LoginResult {
  tokens: AuthTokens;
  role: "ADMIN" | "CUSTOMER";
  email: string;
}

export const authService = {
  /**
   * Đăng nhập tài khoản, lưu trữ Tokens & giải mã Quyền hạn
   */
  async login(payload: LoginRequest): Promise<LoginResult> {
    const res = await authApi.login(payload);
    const tokens = res.data;

    if (typeof window !== "undefined") {
      localStorage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken);
      localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);

      const authInfo = getAuthUserFromToken(tokens.accessToken);
      if (authInfo) {
        localStorage.setItem(USER_INFO_KEY, JSON.stringify(authInfo));
      }

      window.dispatchEvent(new Event("auth-changed"));
    }

    const role = getUserRole(tokens.accessToken) || "CUSTOMER";
    const payloadData = decodeToken(tokens.accessToken);

    return {
      tokens,
      role,
      email: payloadData?.sub || payload.email,
    };
  },

  /**
   * Đăng ký tài khoản mới
   */
  async register(payload: RegisterRequest): Promise<User> {
    const res = await authApi.register(payload);
    return res.data;
  },

  /**
   * Xóa sạch Session và Tokens ở LocalStorage mà KHÔNG gọi API backend và KHÔNG reload trang
   * Dùng khi xác thực quyền hạn thất bại để bảo vệ thông tin mà không gây hard reload
   */
  clearSession(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      localStorage.removeItem(USER_INFO_KEY);

      window.dispatchEvent(new Event("auth-changed"));
    }
  },

  /**
   * Đăng xuất an toàn: Thu hồi token trên Redis & Dọn sạch LocalStorage
   * @param redirect Có điều hướng về /login hay không (chỉ điều hướng nếu chưa ở /login)
   */
  async logout(redirect: boolean = true): Promise<void> {
    if (typeof window !== "undefined") {
      const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
      if (refreshToken) {
        try {
          await authApi.logout(refreshToken);
        } catch (error) {
          console.warn("Lỗi khi gọi API logout:", error);
        }
      }

      this.clearSession();

      if (redirect && window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
  },

  /**
   * Lấy Access Token hiện tại
   */
  getAccessToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  },

  /**
   * Lấy Refresh Token hiện tại
   */
  getRefreshToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  },

  /**
   * Kiểm tra người dùng đã xác thực và token còn hạn hay không
   */
  isAuthenticated(): boolean {
    const token = this.getAccessToken();
    if (!token) return false;
    return !isTokenExpired(token);
  },

  /**
   * Lấy quyền hạn của người dùng hiện tại từ token JWT
   */
  getCurrentRole(): "ADMIN" | "CUSTOMER" | null {
    const token = this.getAccessToken();
    if (!token || isTokenExpired(token)) return null;
    return getUserRole(token);
  },

  /**
   * Kiểm tra nghiêm ngặt xem người dùng hiện tại có quyền Quản trị viên (ROLE_ADMIN) hay không
   */
  isAdmin(): boolean {
    const token = this.getAccessToken();
    if (!token || isTokenExpired(token)) return false;
    return isAdminUser(token);
  },

  /**
   * Lấy thông tin cơ bản của người dùng đang đăng nhập
   */
  getCurrentUser(): { id?: string; email: string; role: "ADMIN" | "CUSTOMER" } | null {
    const token = this.getAccessToken();
    return getAuthUserFromToken(token);
  },
};

export default authService;
