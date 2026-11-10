import { jwtDecode } from "jwt-decode";
import { JwtPayload } from "@/types";

/**
 * Giải mã token JWT và trả về payload có kiểu dữ liệu chuẩn xác
 */
export function decodeToken(token: string | null | undefined): JwtPayload | null {
  if (!token || typeof token !== "string") {
    return null;
  }
  try {
    return jwtDecode<JwtPayload>(token);
  } catch (error) {
    console.error("Lỗi khi giải mã token JWT:", error);
    return null;
  }
}

/**
 * Kiểm tra xem token JWT đã hết hạn hay chưa
 */
export function isTokenExpired(token: string | null | undefined): boolean {
  if (!token) return true;
  const payload = decodeToken(token);
  if (!payload || !payload.exp) return true;

  // exp trong JWT là epoch seconds, Date.now() là milliseconds
  const currentTime = Math.floor(Date.now() / 1000);
  return payload.exp < currentTime;
}

/**
 * Lấy quyền hạn chuẩn hóa ('ADMIN' hoặc 'CUSTOMER') từ token JWT
 * Backend Spring Security hỗ trợ mảng roles: ["ROLE_ADMIN"] hoặc trường role: "ADMIN"
 */
export function getUserRole(token: string | null | undefined): "ADMIN" | "CUSTOMER" | null {
  const payload = decodeToken(token);
  if (!payload) return null;

  // 1. Kiểm tra mảng roles
  const roles = Array.isArray(payload.roles) ? payload.roles : [];
  const hasAdminInRoles = roles.some((r) => {
    if (typeof r !== "string") return false;
    const upper = r.toUpperCase();
    return upper === "ROLE_ADMIN" || upper === "ADMIN" || upper.includes("ADMIN");
  });

  if (hasAdminInRoles) {
    return "ADMIN";
  }

  // 2. Kiểm tra trường role đơn lẻ
  if (payload.role) {
    const roleUpper = String(payload.role).toUpperCase();
    if (roleUpper === "ROLE_ADMIN" || roleUpper === "ADMIN" || roleUpper.includes("ADMIN")) {
      return "ADMIN";
    }
  }

  // 3. Dự phòng nếu email bắt đầu bằng admin@
  if (payload.sub && payload.sub.toLowerCase().startsWith("admin@")) {
    return "ADMIN";
  }

  return "CUSTOMER";
}

/**
 * Kiểm tra nhanh xem người dùng có phải là Quản trị viên (ADMIN) không
 */
export function isAdminUser(token: string | null | undefined): boolean {
  return getUserRole(token) === "ADMIN";
}

/**
 * Trích xuất thông tin người dùng cơ bản từ Token
 */
export function getAuthUserFromToken(token: string | null | undefined): {
  id?: string;
  email: string;
  role: "ADMIN" | "CUSTOMER";
} | null {
  if (!token || isTokenExpired(token)) return null;

  const payload = decodeToken(token);
  if (!payload) return null;

  const role = getUserRole(token) || "CUSTOMER";

  return {
    id: payload.uid,
    email: payload.sub,
    role,
  };
}
