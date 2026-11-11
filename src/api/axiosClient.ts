import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from "axios";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://ecommerce-backend-q1wt.onrender.com/";

export const axiosClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000, // 30s timeout để dự phòng cold start trên Render
});

/**
 * 1. Danh sách các API Auth công khai không được đính kèm Authorization header:
 * - POST /api/v1/auth/login
 * - POST /api/v1/auth/register
 * - POST /api/v1/auth/refresh-token
 * - POST /api/v1/auth/verify-otp
 * - POST /api/v1/auth/forgot-password
 * - POST /api/v1/auth/reset-password
 */
export const isPublicAuthEndpoint = (url: string = ""): boolean => {
  return (
    url.includes("/api/v1/auth/login") ||
    url.includes("/api/v1/auth/register") ||
    url.includes("/api/v1/auth/refresh-token") ||
    url.includes("/api/v1/auth/verify-otp") ||
    url.includes("/api/v1/auth/verify-reset-otp") ||
    url.includes("/api/v1/auth/forgot-password") ||
    url.includes("/api/v1/auth/reset-password") ||
    url.includes("/api/v1/auth/send-verification-otp") ||
    url.includes("/api/v1/auth/resend-verification-otp") ||
    url.includes("/health")
  );
};

// =========================================================================
// 1. REQUEST INTERCEPTOR: Tuyệt đối KHÔNG đính kèm Token vào API Auth công khai
// =========================================================================
axiosClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const url = config.url || "";
    const isAuthPublicRoute = isPublicAuthEndpoint(url);

    if (isAuthPublicRoute) {
      // Đảm bảo không tồn tại header Authorization đối với các route công khai
      if (config.headers) {
        if (typeof config.headers.delete === "function") {
          config.headers.delete("Authorization");
          config.headers.delete("authorization");
        }
        delete config.headers.Authorization;
        delete (config.headers as Record<string, unknown>)["Authorization"];
        delete (config.headers as Record<string, unknown>)["authorization"];
      }
    } else if (typeof window !== "undefined") {
      const token =
        localStorage.getItem("accessToken") ||
        localStorage.getItem("access_token");

      if (token && config.headers) {
        if (typeof config.headers.set === "function") {
          config.headers.set("Authorization", `Bearer ${token}`);
        } else {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
    }

    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// =========================================================================
// 2. RESPONSE INTERCEPTOR: Tự động cấp lại Token (Silent Refresh) khi 401
// =========================================================================
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else if (token) {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

axiosClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as
      | (InternalAxiosRequestConfig & { _retry?: boolean })
      | undefined;

    if (typeof window === "undefined" || !error.response) {
      return Promise.reject(error);
    }

    const status = error.response.status;
    const requestUrl = originalRequest?.url || "";

    // Không kích hoạt refresh nếu lỗi 401 xảy ra tại các route Auth công khai (login, register, refresh-token, ...)
    const isAuthRoute =
      isPublicAuthEndpoint(requestUrl) ||
      requestUrl.includes("/auth/login") ||
      requestUrl.includes("/auth/refresh-token");

    if (isAuthRoute) {
      return Promise.reject(error);
    }

    // Xử lý lỗi 401 do Access Token hết hạn trên các route cần xác thực
    if (status === 401 && originalRequest && !originalRequest._retry) {
      // Nếu đang có tiến trình refresh token chạy ngầm, xếp request này vào hàng đợi chờ
      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              if (typeof originalRequest.headers.set === "function") {
                originalRequest.headers.set("Authorization", `Bearer ${token}`);
              } else {
                originalRequest.headers.Authorization = `Bearer ${token}`;
              }
            }
            return axiosClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken =
        localStorage.getItem("refreshToken") ||
        localStorage.getItem("refresh_token");

      // Nếu không có Refresh Token (chưa đăng nhập hoặc bị xóa) -> Buộc đăng nhập
      if (!refreshToken) {
        isRefreshing = false;
        clearAuthAndRedirect();
        return Promise.reject(error);
      }

      try {
        const baseURL =
          axiosClient.defaults.baseURL ||
          BASE_URL ||
          process.env.NEXT_PUBLIC_API_URL ||
          "http://localhost:8080";

        const refreshEndpoint = `${baseURL.replace(/\/$/, "")}/api/v1/auth/refresh-token`;

        // Dùng axios thuần để gọi refresh-token tránh lặp vô tận Interceptor
        const refreshResponse = await axios.post(
          refreshEndpoint,
          { refreshToken },
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        // Hỗ trợ cả 2 định dạng phản hồi { data: { accessToken, ... } } hoặc { accessToken, ... }
        const responseData =
          refreshResponse.data?.data || refreshResponse.data;
        const newAccessToken =
          responseData?.accessToken || responseData?.access_token;
        const newRefreshToken =
          responseData?.refreshToken || responseData?.refresh_token;

        if (!newAccessToken) {
          throw new Error("Không nhận được access token mới từ hệ thống");
        }

        // Lưu trữ cả 2 chuẩn đặt tên (camelCase & snake_case) để tương thích tuyệt đối
        localStorage.setItem("accessToken", newAccessToken);
        localStorage.setItem("access_token", newAccessToken);
        if (newRefreshToken) {
          localStorage.setItem("refreshToken", newRefreshToken);
          localStorage.setItem("refresh_token", newRefreshToken);
        }

        // Cập nhật default Authorization header và Authorization header cho request hiện tại
        axiosClient.defaults.headers.common["Authorization"] = `Bearer ${newAccessToken}`;
        if (originalRequest.headers) {
          if (typeof originalRequest.headers.set === "function") {
            originalRequest.headers.set("Authorization", `Bearer ${newAccessToken}`);
          } else {
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          }
        }

        // Thông báo đồng bộ trạng thái đăng nhập cho toàn bộ ứng dụng
        window.dispatchEvent(new Event("auth-changed"));

        // Giải phóng hàng đợi các request đang chờ
        processQueue(null, newAccessToken);

        // Retry lại request ban đầu với Access Token mới
        return axiosClient(originalRequest);
      } catch (refreshErr) {
        // Cả refreshToken cũng hết hạn hoặc không hợp lệ -> Xóa Storage và chuyển về /login
        processQueue(refreshErr, null);
        clearAuthAndRedirect();
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

/**
 * Xóa sạch Storage khi Refresh Token hết hạn và điều hướng an toàn về /login
 */
export function clearAuthAndRedirect() {
  if (typeof window !== "undefined") {
    const theme = localStorage.getItem("shopdev_admin_theme");
    localStorage.clear();
    if (theme) {
      localStorage.setItem("shopdev_admin_theme", theme);
    }

    window.dispatchEvent(new Event("auth-changed"));

    const currentPath = window.location.pathname;
    if (!currentPath.includes("/login") && !currentPath.includes("/register")) {
      window.location.href = `/login?error=session_expired&redirect=${encodeURIComponent(currentPath)}`;
    }
  }
}

export const api = axiosClient;
export const apiClient = axiosClient;
export default axiosClient;
