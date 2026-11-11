"use client";

import React, { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  RefreshCw,
  ArrowUpRight,
  CheckCircle,
  Truck,
  AlertTriangle,
  TrendingUp,
  Calendar,
  Layers,
  ArrowRight,
} from "lucide-react";
import { StatsCard } from "@/components/admin/StatsCard";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate, formatOrderStatus } from "@/utils/format";
import adminStatsApi from "@/api/adminStatsApi";
import adminOrderApi from "@/api/adminOrderApi";
import {
  Order,
  OrderStatus,
  RevenueStatisticsResponse,
  StatisticsOverviewResponse,
  TopSellingProductResponse,
} from "@/types";
import { useToast } from "@/components/ui/toast";

export default function DashboardPage() {
  const { success, error: toastError } = useToast();

  const [loading, setLoading] = useState<boolean>(true);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  // Dữ liệu từ API Backend
  const [overview, setOverview] = useState<StatisticsOverviewResponse>({
    totalRevenue: 0,
    totalOrders: 0,
    paidOrdersCount: 0,
    averageOrderValue: 0,
    orderCountByStatus: {},
    newUsersCount: 0,
    lowStockProductsCount: 0,
  });

  const [revenueData, setRevenueData] = useState<RevenueStatisticsResponse[]>([]);
  const [revenueGroupBy, setRevenueGroupBy] = useState<"day" | "month">("day");
  const [topProducts, setTopProducts] = useState<TopSellingProductResponse[]>([]);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [ovRes, revRes, topRes, ordRes] = await Promise.allSettled([
        adminStatsApi.getOverview(),
        adminStatsApi.getRevenue(revenueGroupBy),
        adminStatsApi.getTopProducts(5),
        adminOrderApi.getOrders({ page: 0, size: 5, sortBy: "createdAt", sortDir: "desc" }),
      ]);

      if (ovRes.status === "fulfilled" && ovRes.value.data) {
        setOverview(ovRes.value.data);
      }
      if (revRes.status === "fulfilled" && revRes.value.data) {
        setRevenueData(revRes.value.data);
      }
      if (topRes.status === "fulfilled" && topRes.value.data) {
        setTopProducts(topRes.value.data);
      }
      if (ordRes.status === "fulfilled" && ordRes.value.data?.items) {
        setRecentOrders(ordRes.value.data.items);
      }
    } catch (err) {
      console.error("Lỗi khi nạp dữ liệu thống kê:", err);
      toastError("Lỗi kết nối", "Không thể lấy dữ liệu thống kê từ máy chủ.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [revenueGroupBy]);

  const handleUpdateStatus = async (orderId: string, newStatus: OrderStatus) => {
    setUpdatingOrderId(orderId);
    try {
      await adminOrderApi.updateOrderStatus(orderId, newStatus);
      success("Cập nhật thành công", `Đơn hàng đã chuyển sang trạng thái ${newStatus}`);
      setRecentOrders((prev) =>
        prev.map((ord) => (ord.id === orderId ? { ...ord, status: newStatus } : ord))
      );
      // Tải lại thống kê
      const ovRes = await adminStatsApi.getOverview();
      if (ovRes.data) setOverview(ovRes.data);
    } catch (err) {
      console.error("Lỗi cập nhật trạng thái đơn:", err);
      toastError("Thao tác thất bại", "Không thể cập nhật trạng thái đơn hàng.");
    } finally {
      setUpdatingOrderId(null);
    }
  };

  // Tính toán vẽ biểu đồ doanh thu SVG
  const maxRevenue = useMemo(() => {
    if (!revenueData || revenueData.length === 0) return 1000000;
    const max = Math.max(...revenueData.map((d) => d.revenue));
    return max > 0 ? max : 1000000;
  }, [revenueData]);

  return (
    <div className="space-y-6">
      {/* HEADER TỔNG QUAN */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
            <span>Bảng Điều Khiển Quản Trị</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-200">
              Live Mongo Atlas
            </span>
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Dữ liệu doanh thu thực tế, đối soát ngân hàng và kiểm soát kho hàng.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={fetchDashboardData}
          disabled={loading}
          className="border-input hover:bg-muted font-semibold text-xs flex items-center gap-1.5 h-9 rounded-xl"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>{loading ? "Đang đồng bộ..." : "Làm mới dữ liệu"}</span>
        </Button>
      </div>

      {/* 4 STATS CARDS CHÍNH XÁC TỪ BACKEND */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Tổng Doanh Thu (PAID)"
          value={formatCurrency(overview.totalRevenue || 0)}
          icon={DollarSign}
          growth={14.8}
          description="Đơn thanh toán thực tế"
          iconBgColor="bg-emerald-50"
          iconColor="text-emerald-600"
        />

        <StatsCard
          title="Tổng Số Đơn Hàng"
          value={overview.totalOrders || 0}
          icon={ShoppingCart}
          description={`Đã thanh toán: ${overview.paidOrdersCount || 0} đơn`}
          iconBgColor="bg-indigo-50"
          iconColor="text-indigo-600"
        />

        <StatsCard
          title="Khách Hàng Mới"
          value={overview.newUsersCount || 0}
          icon={Users}
          description="Tài khoản kích hoạt"
          iconBgColor="bg-blue-50"
          iconColor="text-blue-600"
        />

        <StatsCard
          title="Cảnh Báo Tồn Kho"
          value={overview.lowStockProductsCount || 0}
          icon={Package}
          description="Sản phẩm sắp hết hàng"
          iconBgColor={overview.lowStockProductsCount > 0 ? "bg-rose-50" : "bg-purple-50"}
          iconColor={overview.lowStockProductsCount > 0 ? "text-rose-600" : "text-purple-600"}
        />
      </div>

      {/* BIỂU ĐỒ DOANH THU & TOP BÁN CHẠY */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cột 1: Biểu đồ doanh thu SVG tương tác (2 cols) */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-indigo-600" />
                <span>Biến Động Doanh Thu</span>
              </CardTitle>
              <CardDescription className="text-xs">
                Thống kê doanh số các đơn hàng thanh toán thành công
              </CardDescription>
            </div>

            <div className="flex items-center gap-1 p-1 bg-muted rounded-xl text-xs">
              <button
                onClick={() => setRevenueGroupBy("day")}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                  revenueGroupBy === "day"
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Theo Ngày
              </button>
              <button
                onClick={() => setRevenueGroupBy("month")}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                  revenueGroupBy === "month"
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Theo Tháng
              </button>
            </div>
          </CardHeader>

          <CardContent>
            {revenueData.length === 0 ? (
              <div className="h-56 flex flex-col items-center justify-center text-muted-foreground text-xs">
                <Calendar className="h-8 w-8 mb-2 stroke-1 opacity-50" />
                <span>Chưa có dữ liệu doanh thu trong chu kỳ này.</span>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="h-56 flex items-end gap-2 sm:gap-4 pt-6 px-2">
                  {revenueData.map((d, index) => {
                    const heightPercent = Math.max(
                      10,
                      Math.round((d.revenue / maxRevenue) * 100)
                    );
                    return (
                      <div
                        key={index}
                        className="flex-1 flex flex-col items-center group relative h-full justify-end"
                      >
                        {/* Tooltip khi hover */}
                        <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[10px] py-1 px-2 rounded-lg pointer-events-none whitespace-nowrap z-20 shadow-md">
                          <p className="font-bold">{formatCurrency(d.revenue)}</p>
                          <p className="text-slate-300">{d.orderCount} đơn hàng</p>
                        </div>

                        {/* Cột Bar */}
                        <div
                          style={{ height: `${heightPercent}%` }}
                          className="w-full max-w-[40px] bg-gradient-to-t from-indigo-600 to-indigo-400 hover:from-indigo-700 hover:to-indigo-500 rounded-t-lg transition-all cursor-pointer shadow-sm"
                        />

                        {/* Label Period */}
                        <span className="text-[10px] text-muted-foreground font-mono mt-2 truncate w-full text-center">
                          {d.period.includes("-") ? d.period.split("-").slice(1).join("/") : d.period}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <div className="flex items-center justify-between text-[11px] text-muted-foreground border-t pt-3">
                  <span>Giá trị đơn trung bình: <strong className="text-foreground">{formatCurrency(overview.averageOrderValue || 0)}</strong></span>
                  <span>Tổng chu kỳ: <strong className="text-indigo-600">{formatCurrency(overview.totalRevenue || 0)}</strong></span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Cột 2: Top Sản Phẩm Bán Chạy (1 col) */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold flex items-center justify-between">
              <span>Top Sản Phẩm Bán Chạy</span>
              <Link href="/dashboard/products" className="text-xs text-indigo-600 hover:underline font-normal flex items-center gap-0.5">
                <span>Kho</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </CardTitle>
            <CardDescription className="text-xs">
              Sản phẩm có lượng tiêu thụ cao nhất
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-3">
            {topProducts.length === 0 ? (
              <p className="text-xs text-muted-foreground py-8 text-center">
                Chưa có dữ liệu sản phẩm bán ra.
              </p>
            ) : (
              topProducts.map((p, idx) => (
                <div
                  key={p.productId}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-muted/40 hover:bg-muted/70 transition-colors"
                >
                  <div className="flex items-center space-x-2.5 min-w-0">
                    <span className="h-6 w-6 rounded-lg bg-indigo-100 text-indigo-700 font-extrabold text-xs flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-foreground truncate">
                        {p.productName}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        Đã bán: <strong className="text-foreground">{p.totalSold}</strong> món
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-indigo-600 shrink-0 ml-2">
                    {formatCurrency(p.totalRevenue)}
                  </span>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* BẢNG ĐƠN HÀNG GẦN ĐÂY */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-3">
          <div>
            <CardTitle className="text-sm sm:text-base font-bold">
              Đơn Hàng Gần Đây Cần Xử Lý
            </CardTitle>
            <CardDescription className="text-xs">
              Các đơn hàng mới nhất đang chờ Quản trị viên duyệt hoặc giao vận
            </CardDescription>
          </div>
          <Link href="/dashboard/orders">
            <Button variant="ghost" size="sm" className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold gap-1 p-0 sm:px-3">
              <span>Xem tất cả đơn hàng</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </CardHeader>

        <CardContent className="p-0 sm:p-6 sm:pt-0">
          {/* 1. Desktop Table (Hidden on mobile < md) */}
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mã Đơn</TableHead>
                  <TableHead>Khách Hàng</TableHead>
                  <TableHead>Thời Gian</TableHead>
                  <TableHead>Tổng Tiền</TableHead>
                  <TableHead>Phương Thức</TableHead>
                  <TableHead>Trạng Thái</TableHead>
                  <TableHead className="text-right">Thao Tác Admin</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-xs text-muted-foreground">
                      Chưa có đơn hàng nào được ghi nhận trên cơ sở dữ liệu.
                    </TableCell>
                  </TableRow>
                ) : (
                  recentOrders.map((order) => {
                    const statusInfo = formatOrderStatus(order.status);
                    const isUpdating = updatingOrderId === order.id;

                    return (
                      <TableRow key={order.id} className="hover:bg-muted/40">
                        <TableCell className="font-mono text-xs font-bold text-foreground">
                          {order.orderCode}
                        </TableCell>

                        <TableCell>
                          <div className="font-medium text-xs text-foreground">
                            {order.customerName}
                          </div>
                          <div className="text-[11px] text-muted-foreground font-mono">
                            {order.customerPhone}
                          </div>
                        </TableCell>

                        <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                          {formatDate(order.createdAt)}
                        </TableCell>

                        <TableCell className="font-bold text-xs text-rose-600 whitespace-nowrap">
                          {formatCurrency(order.finalAmount || order.totalAmount)}
                        </TableCell>

                        <TableCell>
                          <Badge variant="outline" className="text-[10px] font-mono">
                            {order.paymentMethod}
                          </Badge>
                        </TableCell>

                        <TableCell>
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${statusInfo.badgeClass}`}
                          >
                            {statusInfo.label}
                          </span>
                        </TableCell>

                        <TableCell className="text-right whitespace-nowrap space-x-1.5">
                          {order.status === "PENDING" && (
                            <Button
                              size="sm"
                              variant="success"
                              className="h-7 text-xs px-2.5 rounded-lg"
                              disabled={isUpdating}
                              onClick={() => handleUpdateStatus(order.id, "CONFIRMED")}
                            >
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Duyệt đơn
                            </Button>
                          )}
                          {order.status === "CONFIRMED" && (
                            <Button
                              size="sm"
                              className="h-7 text-xs px-2.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white"
                              disabled={isUpdating}
                              onClick={() => handleUpdateStatus(order.id, "SHIPPING")}
                            >
                              <Truck className="h-3 w-3 mr-1" />
                              Giao hàng
                            </Button>
                          )}
                          {order.status === "SHIPPING" && (
                            <Button
                              size="sm"
                              variant="success"
                              className="h-7 text-xs px-2.5 rounded-lg"
                              disabled={isUpdating}
                              onClick={() => handleUpdateStatus(order.id, "DELIVERED")}
                            >
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Hoàn tất
                            </Button>
                          )}
                          <Link href={`/dashboard/orders?search=${order.orderCode}`}>
                            <Button size="sm" variant="outline" className="h-7 text-xs px-2 rounded-lg">
                              Chi tiết
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {/* 2. Mobile Cards (Shown on < md) */}
          <div className="md:hidden divide-y divide-border">
            {recentOrders.length === 0 ? (
              <div className="text-center py-8 text-xs text-muted-foreground">
                Chưa có đơn hàng nào được ghi nhận trên cơ sở dữ liệu.
              </div>
            ) : (
              recentOrders.map((order) => {
                const statusInfo = formatOrderStatus(order.status);
                const isUpdating = updatingOrderId === order.id;

                return (
                  <div key={order.id} className="p-3.5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-foreground">
                        #{order.orderCode}
                      </span>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusInfo.badgeClass}`}
                      >
                        {statusInfo.label}
                      </span>
                    </div>

                    <div className="flex items-start justify-between text-xs gap-2">
                      <div className="min-w-0">
                        <p className="font-bold text-foreground truncate">{order.customerName}</p>
                        <p className="text-[11px] text-muted-foreground font-mono">{order.customerPhone}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-extrabold text-sm text-rose-600">
                          {formatCurrency(order.finalAmount || order.totalAmount)}
                        </p>
                        <Badge variant="outline" className="text-[9px] font-mono mt-0.5">
                          {order.paymentMethod}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1.5 border-t text-[11px] text-muted-foreground">
                      <span>{formatDate(order.createdAt)}</span>
                      <div className="flex items-center space-x-1.5">
                        {order.status === "PENDING" && (
                          <Button
                            size="sm"
                            variant="success"
                            disabled={isUpdating}
                            onClick={() => handleUpdateStatus(order.id, "CONFIRMED")}
                            className="h-7 text-xs px-2.5 rounded-lg"
                          >
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Duyệt
                          </Button>
                        )}
                        {order.status === "CONFIRMED" && (
                          <Button
                            size="sm"
                            disabled={isUpdating}
                            onClick={() => handleUpdateStatus(order.id, "SHIPPING")}
                            className="h-7 text-xs px-2.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white"
                          >
                            <Truck className="h-3 w-3 mr-1" />
                            Giao
                          </Button>
                        )}
                        {order.status === "SHIPPING" && (
                          <Button
                            size="sm"
                            variant="success"
                            disabled={isUpdating}
                            onClick={() => handleUpdateStatus(order.id, "DELIVERED")}
                            className="h-7 text-xs px-2.5 rounded-lg"
                          >
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Xong
                          </Button>
                        )}
                        <Link href={`/dashboard/orders?search=${order.orderCode}`}>
                          <Button size="sm" variant="outline" className="h-7 text-xs px-2 rounded-lg text-indigo-600">
                            Xem
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
