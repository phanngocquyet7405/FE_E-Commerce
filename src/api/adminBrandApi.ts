import axiosClient from "./axiosClient";
import { ApiResponse, Brand, BrandRequest } from "@/types";

export const adminBrandApi = {
  /**
   * Lấy toàn bộ thương hiệu
   */
  async getBrands(): Promise<ApiResponse<Brand[]>> {
    const response = await axiosClient.get<ApiResponse<Brand[]>>(
      "/api/v1/public/brands"
    );
    return response.data;
  },

  /**
   * Tạo thương hiệu mới
   */
  async createBrand(payload: BrandRequest): Promise<ApiResponse<Brand>> {
    const response = await axiosClient.post<ApiResponse<Brand>>(
      "/api/v1/admin/brands",
      payload
    );
    return response.data;
  },

  /**
   * Cập nhật thương hiệu
   */
  async updateBrand(
    id: string,
    payload: BrandRequest
  ): Promise<ApiResponse<Brand>> {
    const response = await axiosClient.put<ApiResponse<Brand>>(
      `/api/v1/admin/brands/${id}`,
      payload
    );
    return response.data;
  },

  /**
   * Xóa thương hiệu
   */
  async deleteBrand(id: string): Promise<ApiResponse<void>> {
    const response = await axiosClient.delete<ApiResponse<void>>(
      `/api/v1/admin/brands/${id}`
    );
    return response.data;
  },
};

export default adminBrandApi;
