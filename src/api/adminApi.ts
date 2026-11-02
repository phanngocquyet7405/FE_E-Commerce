import axiosClient from "./axiosClient";
import {
  ApiResponse,
  Order,
  OrderStatus,
  PageResponse,
  Product,
  User,
} from "@/types";

export const adminApi = {
  /**
   * Lấy danh sách toàn bộ đơn hàng trong hệ thống (Hỗ trợ lọc theo trạng thái và phân trang)
   */
  async getOrders(
    page: number = 0,
    size: number = 10,
    status?: OrderStatus | string
  ): Promise<ApiResponse<PageResponse<Order>>> {
    const params: Record<string, string | number> = { page, size };
    if (status && status !== "ALL") {
      params.status = status;
    }
    const response = await axiosClient.get<ApiResponse<PageResponse<Order>>>(
      "/api/v1/admin/orders",
      { params }
    );
    return response.data;
  },

  /**
   * Cập nhật trạng thái đơn hàng (Dành cho Admin: CONFIRMED, SHIPPING, DELIVERED, CANCELLED)
   */
  async updateOrderStatus(
    orderId: string,
    status: OrderStatus
  ): Promise<ApiResponse<Order>> {
    const response = await axiosClient.put<ApiResponse<Order>>(
      `/api/v1/admin/orders/${orderId}/status`,
      { status }
    );
    return response.data;
  },

  /**
   * Lấy danh sách sản phẩm phục vụ thống kê và quản lý
   */
  async getProducts(
    page: number = 0,
    size: number = 10
  ): Promise<ApiResponse<PageResponse<Product>>> {
    const response = await axiosClient.get<ApiResponse<PageResponse<Product>>>(
      "/api/v1/public/products",
      {
        params: { page, size },
      }
    );
    return response.data;
  },

  /**
   * Lấy danh sách người dùng khách hàng
   */
  async getUsers(
    page: number = 0,
    size: number = 10
  ): Promise<ApiResponse<PageResponse<User>>> {
    const response = await axiosClient.get<ApiResponse<PageResponse<User>>>(
      "/api/v1/admin/users",
      {
        params: { page, size },
      }
    );
    return response.data;
  },
};

export default adminApi;
