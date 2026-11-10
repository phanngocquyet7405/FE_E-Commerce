import axiosClient from "./axiosClient";
import { ApiResponse, PageResponse, Product, ProductRequest } from "@/types";

export interface AdminProductCriteria {
  keyword?: string;
  active?: boolean;
  categoryId?: string;
  brandId?: string;
  lowStock?: boolean;
  lowStockThreshold?: number;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: "asc" | "desc";
}

export const adminProductApi = {
  /**
   * Lấy danh sách sản phẩm dành cho quản trị viên (gồm sản phẩm ẩn và bộ lọc nâng cao)
   */
  async getProducts(
    criteria: AdminProductCriteria = {}
  ): Promise<ApiResponse<PageResponse<Product>>> {
    const params: Record<string, string | number | boolean> = {};

    if (criteria.keyword) params.keyword = criteria.keyword;
    if (criteria.active !== undefined) params.active = criteria.active;
    if (criteria.categoryId) params.categoryId = criteria.categoryId;
    if (criteria.brandId) params.brandId = criteria.brandId;
    if (criteria.lowStock !== undefined) params.lowStock = criteria.lowStock;
    if (criteria.lowStockThreshold) params.lowStockThreshold = criteria.lowStockThreshold;
    if (criteria.page !== undefined) params.page = criteria.page;
    if (criteria.size !== undefined) params.size = criteria.size;
    if (criteria.sortBy) params.sortBy = criteria.sortBy;
    if (criteria.sortDir) params.sortDir = criteria.sortDir;

    const response = await axiosClient.get<ApiResponse<PageResponse<Product>>>(
      "/api/v1/admin/products",
      { params }
    );
    return response.data;
  },

  /**
   * Xem chi tiết sản phẩm kể cả sản phẩm ẩn
   */
  async getProductById(id: string): Promise<ApiResponse<Product>> {
    const response = await axiosClient.get<ApiResponse<Product>>(
      `/api/v1/admin/products/${id}`
    );
    return response.data;
  },

  /**
   * Tạo sản phẩm mới
   */
  async createProduct(payload: ProductRequest): Promise<ApiResponse<Product>> {
    const response = await axiosClient.post<ApiResponse<Product>>(
      "/api/v1/admin/products",
      payload
    );
    return response.data;
  },

  /**
   * Cập nhật thông tin sản phẩm
   */
  async updateProduct(
    id: string,
    payload: ProductRequest
  ): Promise<ApiResponse<Product>> {
    const response = await axiosClient.put<ApiResponse<Product>>(
      `/api/v1/admin/products/${id}`,
      payload
    );
    return response.data;
  },

  /**
   * Bật / tắt trạng thái kinh doanh của sản phẩm
   */
  async updateProductStatus(
    id: string,
    active: boolean
  ): Promise<ApiResponse<Product>> {
    const response = await axiosClient.patch<ApiResponse<Product>>(
      `/api/v1/admin/products/${id}/status`,
      { active }
    );
    return response.data;
  },

  /**
   * Vô hiệu hóa / Xóa mềm sản phẩm
   */
  async deleteProduct(id: string): Promise<ApiResponse<void>> {
    const response = await axiosClient.delete<ApiResponse<void>>(
      `/api/v1/admin/products/${id}`
    );
    return response.data;
  },
};

export default adminProductApi;
