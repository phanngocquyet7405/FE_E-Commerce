import axiosClient from "./axiosClient";
import {
  AdminOrderDetailResponse,
  ApiResponse,
  Order,
  OrderStatus,
  PageResponse,
  PaymentMethod,
  PaymentStatus,
} from "@/types";

export interface AdminOrderCriteria {
  keyword?: string;
  status?: OrderStatus | string;
  paymentStatus?: PaymentStatus | string;
  paymentMethod?: PaymentMethod | string;
  from?: string;
  to?: string;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: "asc" | "desc";
}

export const adminOrderApi = {
  /**
   * Lấy danh sách toàn bộ đơn hàng có bộ lọc nâng cao
   */
  async getOrders(
    criteria: AdminOrderCriteria = {}
  ): Promise<ApiResponse<PageResponse<Order>>> {
    const params: Record<string, string | number> = {};

    if (criteria.keyword) params.keyword = criteria.keyword;
    if (criteria.status && criteria.status !== "ALL") params.status = criteria.status;
    if (criteria.paymentStatus && criteria.paymentStatus !== "ALL")
      params.paymentStatus = criteria.paymentStatus;
    if (criteria.paymentMethod && criteria.paymentMethod !== "ALL")
      params.paymentMethod = criteria.paymentMethod;
    if (criteria.from) params.from = criteria.from;
    if (criteria.to) params.to = criteria.to;
    if (criteria.page !== undefined) params.page = criteria.page;
    if (criteria.size !== undefined) params.size = criteria.size;
    if (criteria.sortBy) params.sortBy = criteria.sortBy;
    if (criteria.sortDir) params.sortDir = criteria.sortDir;

    const response = await axiosClient.get<ApiResponse<PageResponse<Order>>>(
      "/api/v1/admin/orders",
      { params }
    );
    return response.data;
  },

  /**
   * Lấy chi tiết đơn hàng kèm lịch sử giao dịch SePay liên quan
   */
  async getOrderById(id: string): Promise<ApiResponse<AdminOrderDetailResponse>> {
    const response = await axiosClient.get<ApiResponse<AdminOrderDetailResponse>>(
      `/api/v1/admin/orders/${id}`
    );
    return response.data;
  },

  /**
   * Cập nhật trạng thái đơn hàng (CONFIRMED, SHIPPING, DELIVERED, CANCELLED)
   */
  async updateOrderStatus(
    orderId: string,
    status: OrderStatus,
    note?: string
  ): Promise<ApiResponse<Order>> {
    const response = await axiosClient.patch<ApiResponse<Order>>(
      `/api/v1/admin/orders/${orderId}/status`,
      { status, note }
    );
    return response.data;
  },

  /**
   * Xác nhận hoàn tiền cho đơn hàng online đã hủy (AWAITING_REFUND -> REFUNDED)
   */
  async confirmRefund(orderId: string): Promise<ApiResponse<Order>> {
    const response = await axiosClient.patch<ApiResponse<Order>>(
      `/api/v1/admin/orders/${orderId}/confirm-refund`
    );
    return response.data;
  },
};

export default adminOrderApi;
