import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://ecommerce-backend-q1wt.onrender.com/";

export const axiosClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000, // 30s timeout để dự phòng cold start trên Render
});

// ==========================================
// REQUEST INTERCEPTOR: Tự động đính kèm JWT
// ==========================================
axiosClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("access_token");
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// ==========================================
// RESPONSE INTERCEPTOR: Tự động xử lý lỗi 401
// ==========================================
axiosClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError) => {
    if (typeof window !== "undefined" && error.response) {
      const status = error.response.status;

      // Khi bị 401 Unauthorized (Token hết hạn hoặc không hợp lệ)
      // CHỈ kích hoạt nếu không phải đang ở trang /login hoặc /register
      if (status === 401) {
        const currentPath = window.location.pathname;
        if (!currentPath.includes("/login") && !currentPath.includes("/register")) {
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          localStorage.removeItem("user_info");
          localStorage.removeItem("dev_admin_override");

          window.location.href = `/login?error=session_expired&redirect=${encodeURIComponent(currentPath)}`;
        }
      }
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
