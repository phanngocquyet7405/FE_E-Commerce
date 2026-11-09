import axiosClient from "./axiosClient";
import { ApiResponse, Category, CategoryRequest } from "@/types";

export const adminCategoryApi = {
  /**
   * Lấy toàn bộ danh mục sản phẩm
   */
  async getCategories(): Promise<ApiResponse<Category[]>> {
    const response = await axiosClient.get<ApiResponse<Category[]>>(
      "/api/v1/public/categories"
    );
    return response.data;
  },

  /**
   * Tạo danh mục mới
   */
  async createCategory(payload: CategoryRequest): Promise<ApiResponse<Category>> {
    const response = await axiosClient.post<ApiResponse<Category>>(
      "/api/v1/admin/categories",
      payload
    );
    return response.data;
  },

  /**
   * Cập nhật danh mục
   */
  async updateCategory(
    id: string,
    payload: CategoryRequest
  ): Promise<ApiResponse<Category>> {
    const response = await axiosClient.put<ApiResponse<Category>>(
      `/api/v1/admin/categories/${id}`,
      payload
    );
    return response.data;
  },

  /**
   * Xóa danh mục
   */
  async deleteCategory(id: string): Promise<ApiResponse<void>> {
    const response = await axiosClient.delete<ApiResponse<void>>(
      `/api/v1/admin/categories/${id}`
    );
    return response.data;
  },
};

export default adminCategoryApi;
