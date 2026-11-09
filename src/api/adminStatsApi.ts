import axiosClient from "./axiosClient";
import {
  ApiResponse,
  LowStockProductResponse,
  PageResponse,
  RevenueStatisticsResponse,
  StatisticsOverviewResponse,
  TopSellingProductResponse,
} from "@/types";

export const adminStatsApi = {
  /**
   * Lấy tổng quan thống kê kinh doanh (Doanh thu thực, số đơn theo trạng thái, khách mới, cảnh báo tồn kho)
   */
  async getOverview(
    from?: string,
    to?: string
  ): Promise<ApiResponse<StatisticsOverviewResponse>> {
    const params: Record<string, string> = {};
    if (from) params.from = from;
    if (to) params.to = to;

    const response = await axiosClient.get<ApiResponse<StatisticsOverviewResponse>>(
      "/api/v1/admin/statistics/overview",
      { params }
    );
    return response.data;
  },

  /**
   * Lấy dữ liệu biểu đồ doanh thu theo ngày hoặc tháng
   */
  async getRevenue(
    groupBy: "day" | "month" = "day",
    from?: string,
    to?: string
  ): Promise<ApiResponse<RevenueStatisticsResponse[]>> {
    const params: Record<string, string> = { groupBy };
    if (from) params.from = from;
    if (to) params.to = to;

    const response = await axiosClient.get<ApiResponse<RevenueStatisticsResponse[]>>(
      "/api/v1/admin/statistics/revenue",
      { params }
    );
    return response.data;
  },

  /**
   * Lấy danh sách top sản phẩm bán chạy nhất
   */
  async getTopProducts(
    limit: number = 10,
    from?: string,
    to?: string
  ): Promise<ApiResponse<TopSellingProductResponse[]>> {
    const params: Record<string, string | number> = { limit };
    if (from) params.from = from;
    if (to) params.to = to;

    const response = await axiosClient.get<ApiResponse<TopSellingProductResponse[]>>(
      "/api/v1/admin/statistics/top-products",
      { params }
    );
    return response.data;
  },

  /**
   * Cảnh báo danh sách sản phẩm tồn kho thấp
   */
  async getLowStock(
    threshold: number = 10,
    page: number = 0,
    size: number = 15
  ): Promise<ApiResponse<PageResponse<LowStockProductResponse>>> {
    const response = await axiosClient.get<ApiResponse<PageResponse<LowStockProductResponse>>>(
      "/api/v1/admin/statistics/low-stock",
      { params: { threshold, page, size } }
    );
    return response.data;
  },
};

export default adminStatsApi;
