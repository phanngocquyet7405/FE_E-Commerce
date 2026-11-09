import adminOrderApi from "@/api/adminOrderApi";
import adminProductApi from "@/api/adminProductApi";
import adminUserApi from "@/api/adminUserApi";
import adminStatsApi from "@/api/adminStatsApi";
import {
  AdminDashboardStats,
  Order,
  OrderStatus,
  PageResponse,
  Product,
} from "@/types";

export interface DashboardOverview {
  stats: AdminDashboardStats;
  recentOrders: Order[];
  recentProducts: Product[];
}

export const adminService = {
  /**
   * Lấy tổng hợp dữ liệu thống kê tổng quan cho trang Dashboard Admin
   */
  async getDashboardOverview(): Promise<DashboardOverview> {
    try {
      const [ovRes, ordersRes, productsRes] = await Promise.all([
        adminStatsApi.getOverview().catch(() => null),
        adminOrderApi.getOrders({ page: 0, size: 5, sortBy: "createdAt", sortDir: "desc" }),
        adminProductApi.getProducts({ page: 0, size: 5, sortBy: "createdAt", sortDir: "desc" }),
      ]);

      const ov = ovRes?.data;
      const ordersData = ordersRes.data || { totalElements: 0, items: [] };
      const productsData = productsRes.data || { totalElements: 0, items: [] };

      const stats: AdminDashboardStats = {
        totalRevenue: ov?.totalRevenue || 0,
        totalOrders: ov?.totalOrders || ordersData.totalElements,
        totalCustomers: ov?.newUsersCount || 0,
        totalProducts: productsData.totalElements || 0,
        revenueGrowth: 18.2,
        ordersGrowth: 12.5,
      };

      return {
        stats,
        recentOrders: ordersData.items || [],
        recentProducts: productsData.items || [],
      };
    } catch (error) {
      console.error("Lỗi khi nạp dữ liệu thống kê Dashboard:", error);
      throw error;
    }
  },

  /**
   * Lấy danh sách đơn hàng có phân trang và lọc
   */
  async getOrders(
    page: number = 0,
    size: number = 10,
    status?: OrderStatus | string
  ): Promise<PageResponse<Order>> {
    const res = await adminOrderApi.getOrders({ page, size, status });
    return res.data;
  },

  /**
   * Cập nhật trạng thái đơn hàng
   */
  async updateOrderStatus(orderId: string, status: OrderStatus): Promise<Order> {
    const res = await adminOrderApi.updateOrderStatus(orderId, status);
    return res.data;
  },
};

export default adminService;
