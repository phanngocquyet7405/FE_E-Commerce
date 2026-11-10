import axiosClient from "./axiosClient";
import { AdminUserResponse, ApiResponse, PageResponse, RoleType } from "@/types";

export interface AdminUserCriteria {
  keyword?: string;
  role?: RoleType | string;
  active?: boolean;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: "asc" | "desc";
}

export const adminUserApi = {
  /**
   * Lấy danh sách người dùng khách hàng và quản trị viên
   */
  async getUsers(
    criteria: AdminUserCriteria = {}
  ): Promise<ApiResponse<PageResponse<AdminUserResponse>>> {
    const params: Record<string, string | number | boolean> = {};

    if (criteria.keyword) params.keyword = criteria.keyword;
    if (criteria.role && criteria.role !== "ALL") params.role = criteria.role;
    if (criteria.active !== undefined) params.active = criteria.active;
    if (criteria.page !== undefined) params.page = criteria.page;
    if (criteria.size !== undefined) params.size = criteria.size;
    if (criteria.sortBy) params.sortBy = criteria.sortBy;
    if (criteria.sortDir) params.sortDir = criteria.sortDir;

    const response = await axiosClient.get<ApiResponse<PageResponse<AdminUserResponse>>>(
      "/api/v1/admin/users",
      { params }
    );
    return response.data;
  },

  /**
   * Khóa hoặc Mở khóa tài khoản người dùng
   */
  async updateUserStatus(
    id: string,
    active: boolean
  ): Promise<ApiResponse<AdminUserResponse>> {
    const response = await axiosClient.patch<ApiResponse<AdminUserResponse>>(
      `/api/v1/admin/users/${id}/status`,
      { active }
    );
    return response.data;
  },

  /**
   * Cập nhật danh sách quyền hạn cho người dùng (ROLE_ADMIN, ROLE_CUSTOMER)
   */
  async updateUserRoles(
    id: string,
    roles: RoleType[]
  ): Promise<ApiResponse<AdminUserResponse>> {
    const response = await axiosClient.patch<ApiResponse<AdminUserResponse>>(
      `/api/v1/admin/users/${id}/roles`,
      roles
    );
    return response.data;
  },
};

export default adminUserApi;
