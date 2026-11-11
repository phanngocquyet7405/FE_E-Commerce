"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  Search,
  Filter,
  RefreshCw,
  Eye,
  CheckCircle,
  Truck,
  XCircle,
  RotateCcw,
  Clock,
  CreditCard,
  User,
  MapPin,
  Calendar,
  AlertTriangle,
  Printer,
  Download,
  CheckSquare,
  Square,
  Layers,
} from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { TableSkeletonRows } from "@/components/ui/skeleton";
import { InvoicePrintModal } from "@/components/admin/InvoicePrintModal";
import { useToast } from "@/components/ui/toast";
import { formatCurrency, formatDate, formatOrderStatus } from "@/utils/format";
import { exportToCsv } from "@/utils/exportCsv";
import adminOrderApi, { AdminOrderCriteria } from "@/api/adminOrderApi";
import {
  AdminOrderDetailResponse,
  Order,
  OrderStatus,
  PageResponse,
  PaymentMethod,
} from "@/types";

export default function AdminOrdersPage() {
  const { success, error: toastError, info } = useToast();

  const [loading, setLoading] = useState<boolean>(true);
  const [ordersData, setOrdersData] = useState<PageResponse<Order>>({
    items: [],
    pageNo: 0,
    pageSize: 10,
    totalElements: 0,
    totalPages: 0,
    last: true,
  });

  // Bộ lọc
  const [keyword, setKeyword] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [paymentFilter, setPaymentFilter] = useState<string>("ALL");
  const [currentPage, setCurrentPage] = useState<number>(0);

  // Checkbox chọn nhiều đơn hàng (Bulk actions)
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
  const [bulkActionLoading, setBulkActionLoading] = useState<boolean>(false);

  // Modal Chi tiết đơn hàng
  const [detailModalOpen, setDetailModalOpen] = useState<boolean>(false);
  const [loadingDetail, setLoadingDetail] = useState<boolean>(false);
  const [orderDetail, setOrderDetail] = useState<AdminOrderDetailResponse | null>(null);
  const [actionLoading, setActionLoading] = useState<boolean>(false);

  // Modal In Phiếu Giao Hàng
  const [printModalOpen, setPrintModalOpen] = useState<boolean>(false);
  const [orderToPrint, setOrderToPrint] = useState<Order | null>(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const criteria: AdminOrderCriteria = {
        keyword: keyword.trim() || undefined,
        status: statusFilter !== "ALL" ? statusFilter : undefined,
        paymentMethod: paymentFilter !== "ALL" ? paymentFilter : undefined,
        page: currentPage,
        size: 10,
        sortBy: "createdAt",
        sortDir: "desc",
      };

      const res = await adminOrderApi.getOrders(criteria);
      if (res.data) {
        setOrdersData(res.data);
      }
    } catch (err) {
      console.error("Lỗi khi tải danh sách đơn hàng:", err);
      toastError("Không thể tải đơn hàng", "Vui lòng kiểm tra lại kết nối server.");
    } finally {
      setLoading(false);
    }
  }, [keyword, statusFilter, paymentFilter, currentPage, toastError]);

  useEffect(() => {
    fetchOrders();
    setSelectedOrderIds([]);
  }, [fetchOrders]);

  const handleOpenDetail = async (orderId: string) => {
    setDetailModalOpen(true);
    setLoadingDetail(true);
    try {
      const res = await adminOrderApi.getOrderById(orderId);
      if (res.data) {
        setOrderDetail(res.data);
      }
    } catch (err) {
      console.error("Lỗi khi tải chi tiết đơn hàng:", err);
      toastError("Lỗi", "Không thể lấy thông tin chi tiết đơn hàng.");
      setDetailModalOpen(false);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleOpenPrint = (order: Order) => {
    setOrderToPrint(order);
    setPrintModalOpen(true);
  };

  const handleUpdateStatus = async (
    orderId: string,
    newStatus: OrderStatus,
    note?: string
  ) => {
    setActionLoading(true);
    try {
      await adminOrderApi.updateOrderStatus(orderId, newStatus, note);
      success("Cập nhật thành công", `Đơn hàng đã chuyển sang trạng thái ${newStatus}`);
      fetchOrders();
      if (orderDetail?.order?.id === orderId) {
        const res = await adminOrderApi.getOrderById(orderId);
        if (res.data) setOrderDetail(res.data);
      }
    } catch (err) {
      console.error("Lỗi cập nhật trạng thái đơn:", err);
      toastError("Thất bại", "Không thể cập nhật trạng thái đơn hàng.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmRefund = async (orderId: string) => {
    if (!confirm("Bạn có chắc chắn xác nhận đã hoàn trả tiền thủ công cho khách hàng?")) {
      return;
    }
    setActionLoading(true);
    try {
      await adminOrderApi.confirmRefund(orderId);
      success("Đã hoàn tiền", "Đơn hàng đã chuyển sang trạng thái REFUNDED.");
      fetchOrders();
      setDetailModalOpen(false);
    } catch (err) {
      console.error("Lỗi xác nhận hoàn tiền:", err);
      toastError("Thất bại", "Không thể xác nhận hoàn tiền cho đơn hàng.");
    } finally {
      setActionLoading(false);
    }
  };

  // Xuất file CSV Đơn hàng
  const handleExportCsv = () => {
    if (ordersData.items.length === 0) {
      toastError("Trống", "Không có đơn hàng nào để xuất.");
      return;
    }

    const exportRows = ordersData.items.map((ord) => ({
      orderCode: ord.orderCode,
      customerName: ord.customerName,
      customerPhone: ord.customerPhone,
      customerEmail: ord.customerEmail,
      totalAmount: ord.finalAmount || ord.totalAmount,
      paymentMethod: ord.paymentMethod,
      status: ord.status,
      address: `${ord.shippingAddress?.streetAddress || ""}, ${ord.shippingAddress?.city || ""}`,
      createdAt: formatDate(ord.createdAt),
    }));

    exportToCsv("Danh_Sach_Don_Hang", exportRows, [
      { key: "orderCode", label: "Mã Đơn Hàng" },
      { key: "customerName", label: "Tên Khách Hàng" },
      { key: "customerPhone", label: "Số Điện Thoại" },
      { key: "customerEmail", label: "Email" },
      { key: "totalAmount", label: "Tổng Thanh Toán (VNĐ)" },
      { key: "paymentMethod", label: "Phương Thức" },
      { key: "status", label: "Trạng Thái" },
      { key: "address", label: "Địa Chỉ Nhận Hàng" },
      { key: "createdAt", label: "Thời Gian Đặt" },
    ]);

    success("Xuất file thành công", "Đã tải xuống danh sách đơn hàng định dạng CSV.");
  };

  // Thao tác Checkbox chọn nhiều
  const toggleSelectAll = () => {
    if (selectedOrderIds.length === ordersData.items.length) {
      setSelectedOrderIds([]);
    } else {
      setSelectedOrderIds(ordersData.items.map((o) => o.id));
    }
  };

  const toggleSelectOrder = (id: string) => {
    setSelectedOrderIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // Duyệt hàng loạt các đơn PENDING đã chọn
  const handleBulkConfirm = async () => {
    const pendingOrders = ordersData.items.filter(
      (o) => selectedOrderIds.includes(o.id) && o.status === "PENDING"
    );

    if (pendingOrders.length === 0) {
      toastError("Không phù hợp", "Chỉ các đơn hàng đang ở trạng thái 'PENDING' mới có thể duyệt hàng loạt.");
      return;
    }

    setBulkActionLoading(true);
    try {
      await Promise.all(
        pendingOrders.map((o) => adminOrderApi.updateOrderStatus(o.id, "CONFIRMED"))
      );
      success("Duyệt hàng loạt thành công", `Đã duyệt ${pendingOrders.length} đơn hàng.`);
      setSelectedOrderIds([]);
      fetchOrders();
    } catch (err) {
      console.error("Lỗi duyệt hàng loạt:", err);
      toastError("Thất bại", "Có lỗi xảy ra khi duyệt hàng loạt.");
    } finally {
      setBulkActionLoading(false);
    }
  };

  // Danh sách các phễu trạng thái
  const FUNNEL_ITEMS = [
    { id: "ALL", label: "Tất cả đơn", color: "bg-muted text-foreground" },
    { id: "PENDING", label: "Chờ duyệt", color: "bg-amber-50 text-amber-700 border-amber-200" },
    { id: "CONFIRMED", label: "Đã duyệt", color: "bg-blue-50 text-blue-700 border-blue-200" },
    { id: "SHIPPING", label: "Đang giao", color: "bg-purple-50 text-purple-700 border-purple-200" },
    { id: "DELIVERED", label: "Đã giao", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    { id: "CANCELLED", label: "Đã hủy", color: "bg-rose-50 text-rose-700 border-rose-200" },
    { id: "AWAITING_REFUND", label: "Chờ hoàn tiền", color: "bg-orange-50 text-orange-700 border-orange-200" },
  ];

  return (
    <div className="space-y-6">
      {/* HEADER & NÚT HÀNH ĐỘNG */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
            <span>Quản Lý Đơn Hàng</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-200">
              {ordersData.totalElements} đơn
            </span>
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Duyệt đơn theo State Machine, in phiếu giao hàng và xuất báo cáo đối soát.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCsv}
            className="flex-1 sm:flex-none border-input hover:bg-muted font-semibold text-xs flex items-center justify-center gap-1.5 h-9 rounded-xl"
            title="Tải danh sách đơn hàng về máy tính"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Xuất Excel/CSV</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={fetchOrders}
            disabled={loading}
            className="flex-1 sm:flex-none border-input hover:bg-muted font-semibold text-xs flex items-center justify-center gap-1.5 h-9 rounded-xl"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Làm mới</span>
          </Button>
        </div>
      </div>

      {/* PHỄU TRẠNG THÁI ĐƠN HÀNG (ORDER STATE FUNNEL) */}
      <div className="flex gap-2 overflow-x-auto pb-2 sm:grid sm:grid-cols-4 lg:grid-cols-7 sm:overflow-visible no-scrollbar">
        {FUNNEL_ITEMS.map((item) => {
          const isSelected = statusFilter === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                setStatusFilter(item.id);
                setCurrentPage(0);
              }}
              className={`p-2.5 rounded-xl border text-left transition-all shrink-0 min-w-[125px] sm:min-w-0 ${
                isSelected
                  ? "border-indigo-600 ring-2 ring-indigo-500/20 bg-card shadow-sm"
                  : "border-border bg-card/60 hover:bg-card hover:border-muted-foreground/30"
              }`}
            >
              <span
                className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold border mb-1 ${item.color}`}
              >
                {item.label}
              </span>
              <p className="text-xs font-bold text-foreground">
                {item.id === "ALL"
                  ? `${ordersData.totalElements} đơn`
                  : item.id === statusFilter
                  ? `${ordersData.totalElements} đơn`
                  : "Lọc ngay"}
              </p>
            </button>
          );
        })}
      </div>

      {/* THANH TÌM KIẾM & BỘ LỌC */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Search Input */}
            <div className="md:col-span-2 relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm nhanh theo mã đơn (ORD-...), tên khách, SĐT..."
                value={keyword}
                onChange={(e) => {
                  setKeyword(e.target.value);
                  setCurrentPage(0);
                }}
                className="pl-9 h-9 text-xs rounded-xl"
              />
            </div>

            {/* Payment Method Filter */}
            <div>
              <select
                value={paymentFilter}
                onChange={(e) => {
                  setPaymentFilter(e.target.value);
                  setCurrentPage(0);
                }}
                className="w-full h-9 px-3 text-xs rounded-xl border border-input bg-background focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
              >
                <option value="ALL">Tất cả phương thức thanh toán</option>
                <option value="SEPAY">VietQR SePay (Chuyển khoản)</option>
                <option value="COD">Tiền mặt khi nhận (COD)</option>
                <option value="VNPAY">VNPAY</option>
                <option value="MOMO">Ví MoMo</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* FLOATING BULK ACTIONS BAR (KHI CÓ CHỌN HÀNG LOẠT) */}
      {selectedOrderIds.length > 0 && (
        <div className="sticky top-20 z-20 flex items-center justify-between p-3 rounded-2xl bg-indigo-900 text-white shadow-xl animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center space-x-2 text-xs font-semibold pl-2">
            <CheckSquare className="h-4 w-4 text-indigo-300" />
            <span>Đã chọn {selectedOrderIds.length} đơn hàng</span>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              size="sm"
              disabled={bulkActionLoading}
              onClick={handleBulkConfirm}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-8 rounded-xl font-semibold"
            >
              <CheckCircle className="h-3.5 w-3.5 mr-1" />
              <span>Duyệt tất cả đơn PENDING</span>
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setSelectedOrderIds([])}
              className="text-xs h-8 rounded-xl bg-transparent border-indigo-400 text-indigo-100 hover:bg-indigo-800"
            >
              Bỏ chọn
            </Button>
          </div>
        </div>
      )}

      {/* BẢNG DỮ LIỆU ĐƠN HÀNG */}
      <Card>
        <CardContent className="p-0">
          {/* 1. DESKTOP VIEW: DATA TABLE (Hidden on mobile < md) */}
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">
                    <button
                      onClick={toggleSelectAll}
                      className="flex items-center justify-center p-1"
                      title="Chọn tất cả"
                    >
                      {selectedOrderIds.length > 0 &&
                      selectedOrderIds.length === ordersData.items.length ? (
                        <CheckSquare className="h-4 w-4 text-indigo-600" />
                      ) : (
                        <Square className="h-4 w-4 text-muted-foreground" />
                      )}
                    </button>
                  </TableHead>
                  <TableHead>Mã Đơn</TableHead>
                  <TableHead>Khách Hàng</TableHead>
                  <TableHead>Thời Gian</TableHead>
                  <TableHead>Tổng Thanh Toán</TableHead>
                  <TableHead>Hình Thức</TableHead>
                  <TableHead>Trạng Thái</TableHead>
                  <TableHead className="text-right">Hành Động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableSkeletonRows rows={5} cols={8} />
                ) : ordersData.items.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-12 text-xs text-muted-foreground">
                      Không tìm thấy đơn hàng nào phù hợp với bộ lọc.
                    </TableCell>
                  </TableRow>
                ) : (
                  ordersData.items.map((order) => {
                    const statusInfo = formatOrderStatus(order.status);
                    const isSelected = selectedOrderIds.includes(order.id);

                    return (
                      <TableRow
                        key={order.id}
                        className={`hover:bg-muted/40 transition-colors ${
                          isSelected ? "bg-indigo-50/50 dark:bg-indigo-950/20" : ""
                        }`}
                      >
                        {/* Checkbox */}
                        <TableCell>
                          <button
                            onClick={() => toggleSelectOrder(order.id)}
                            className="flex items-center justify-center p-1"
                          >
                            {isSelected ? (
                              <CheckSquare className="h-4 w-4 text-indigo-600" />
                            ) : (
                              <Square className="h-4 w-4 text-muted-foreground" />
                            )}
                          </button>
                        </TableCell>

                        <TableCell className="font-mono text-xs font-bold text-foreground">
                          {order.orderCode}
                        </TableCell>

                        <TableCell>
                          <div className="font-semibold text-xs text-foreground">
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
                          <Badge
                            variant="outline"
                            className={`text-[10px] font-mono ${
                              order.paymentMethod === "SEPAY"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/30 dark:text-emerald-300"
                                : ""
                            }`}
                          >
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

                        <TableCell className="text-right whitespace-nowrap space-x-1">
                          {/* Quick Action */}
                          {order.status === "PENDING" && (
                            <Button
                              size="sm"
                              variant="success"
                              className="h-7 text-xs px-2 rounded-lg"
                              onClick={() => handleUpdateStatus(order.id, "CONFIRMED")}
                            >
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Duyệt
                            </Button>
                          )}
                          {order.status === "CONFIRMED" && (
                            <Button
                              size="sm"
                              className="h-7 text-xs px-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white"
                              onClick={() => handleUpdateStatus(order.id, "SHIPPING")}
                            >
                              <Truck className="h-3 w-3 mr-1" />
                              Giao
                            </Button>
                          )}

                          {/* In Phiếu Nhanh */}
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 w-7 p-0 rounded-lg text-slate-500 hover:text-foreground"
                            onClick={() => handleOpenPrint(order)}
                            title="In phiếu giao hàng"
                          >
                            <Printer className="h-3.5 w-3.5" />
                          </Button>

                          {/* Chi Tiết */}
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs px-2.5 rounded-lg text-indigo-600 hover:text-indigo-700"
                            onClick={() => handleOpenDetail(order.id)}
                          >
                            <Eye className="h-3.5 w-3.5 mr-1" />
                            Chi tiết
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {/* 2. MOBILE VIEW: TOUCH-OPTIMIZED ORDER CARDS (Shown on < md) */}
          <div className="md:hidden divide-y divide-border">
            {loading ? (
              <div className="p-6 text-center text-xs text-muted-foreground space-y-2">
                <RefreshCw className="h-5 w-5 animate-spin mx-auto text-indigo-600" />
                <span>Đang tải danh sách đơn hàng...</span>
              </div>
            ) : ordersData.items.length === 0 ? (
              <div className="text-center py-12 text-xs text-muted-foreground">
                Không tìm thấy đơn hàng nào phù hợp với bộ lọc.
              </div>
            ) : (
              ordersData.items.map((order) => {
                const statusInfo = formatOrderStatus(order.status);
                const isSelected = selectedOrderIds.includes(order.id);

                return (
                  <div
                    key={order.id}
                    className={`p-3.5 space-y-2.5 transition-colors ${
                      isSelected ? "bg-indigo-50/50 dark:bg-indigo-950/20" : ""
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => toggleSelectOrder(order.id)}
                          className="flex items-center justify-center p-1 rounded-md text-foreground"
                          aria-label="Chọn đơn hàng"
                        >
                          {isSelected ? (
                            <CheckSquare className="h-4 w-4 text-indigo-600" />
                          ) : (
                            <Square className="h-4 w-4 text-muted-foreground" />
                          )}
                        </button>
                        <span className="font-mono text-xs font-bold text-foreground">
                          #{order.orderCode}
                        </span>
                      </div>
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

                    <div className="flex items-center justify-between pt-1.5 border-t text-[11px] text-muted-foreground gap-2">
                      <span className="truncate">{formatDate(order.createdAt)}</span>
                      <div className="flex items-center space-x-1.5 shrink-0">
                        {order.status === "PENDING" && (
                          <Button
                            size="sm"
                            variant="success"
                            className="h-7 text-xs px-2.5 rounded-lg"
                            onClick={() => handleUpdateStatus(order.id, "CONFIRMED")}
                          >
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Duyệt
                          </Button>
                        )}
                        {order.status === "CONFIRMED" && (
                          <Button
                            size="sm"
                            className="h-7 text-xs px-2.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white"
                            onClick={() => handleUpdateStatus(order.id, "SHIPPING")}
                          >
                            <Truck className="h-3 w-3 mr-1" />
                            Giao
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 w-7 p-0 rounded-lg text-slate-500"
                          onClick={() => handleOpenPrint(order)}
                          title="In phiếu giao hàng"
                        >
                          <Printer className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs px-2 rounded-lg text-indigo-600"
                          onClick={() => handleOpenDetail(order.id)}
                        >
                          <Eye className="h-3.5 w-3.5 mr-1" />
                          Chi tiết
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* PHÂN TRANG */}
          {ordersData.totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t">
              <span className="text-xs text-muted-foreground text-center sm:text-left">
                Trang {ordersData.pageNo + 1} / {ordersData.totalPages} ({ordersData.totalElements} đơn)
              </span>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={ordersData.pageNo === 0}
                  onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                  className="h-8 text-xs rounded-lg"
                >
                  Trước
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={ordersData.last}
                  onClick={() => setCurrentPage((p) => p + 1)}
                  className="h-8 text-xs rounded-lg"
                >
                  Sau
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* MODAL CHI TIẾT ĐƠN HÀNG */}
      <Modal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        title={orderDetail?.order?.orderCode ? `Chi Tiết Đơn Hàng #${orderDetail.order.orderCode}` : "Chi Tiết Đơn Hàng"}
        description="Thông tin các mặt hàng, địa chỉ nhận hàng và đối soát SePay"
        maxWidth="2xl"
        footer={
          orderDetail?.order && (
            <div className="flex flex-wrap items-center justify-between w-full gap-2">
              <div className="flex items-center space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs h-8 rounded-xl gap-1.5"
                  onClick={() => handleOpenPrint(orderDetail.order)}
                >
                  <Printer className="h-3.5 w-3.5" />
                  <span>In Phiếu Giao Hàng</span>
                </Button>

                {orderDetail.order.status === "AWAITING_REFUND" && (
                  <Button
                    size="sm"
                    className="bg-amber-600 hover:bg-amber-700 text-white text-xs h-8 rounded-xl"
                    disabled={actionLoading}
                    onClick={() => handleConfirmRefund(orderDetail.order.id)}
                  >
                    <RotateCcw className="h-3.5 w-3.5 mr-1" />
                    Xác nhận đã hoàn tiền
                  </Button>
                )}
              </div>

              <div className="flex items-center space-x-2">
                {orderDetail.order.status === "PENDING" && (
                  <Button
                    size="sm"
                    variant="success"
                    className="text-xs h-8 rounded-xl"
                    disabled={actionLoading}
                    onClick={() => handleUpdateStatus(orderDetail.order.id, "CONFIRMED")}
                  >
                    Duyệt đơn hàng
                  </Button>
                )}
                {orderDetail.order.status === "CONFIRMED" && (
                  <Button
                    size="sm"
                    className="bg-purple-600 hover:bg-purple-700 text-white text-xs h-8 rounded-xl"
                    disabled={actionLoading}
                    onClick={() => handleUpdateStatus(orderDetail.order.id, "SHIPPING")}
                  >
                    Giao hàng
                  </Button>
                )}
                {orderDetail.order.status === "SHIPPING" && (
                  <Button
                    size="sm"
                    variant="success"
                    className="text-xs h-8 rounded-xl"
                    disabled={actionLoading}
                    onClick={() => handleUpdateStatus(orderDetail.order.id, "DELIVERED")}
                  >
                    Đã giao thành công
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs h-8 rounded-xl"
                  onClick={() => setDetailModalOpen(false)}
                >
                  Đóng
                </Button>
              </div>
            </div>
          )
        }
      >
        {loadingDetail || !orderDetail ? (
          <div className="py-12 flex flex-col items-center justify-center text-xs text-muted-foreground">
            <RefreshCw className="h-6 w-6 animate-spin text-indigo-600 mb-2" />
            <span>Đang tải thông tin chi tiết đơn hàng...</span>
          </div>
        ) : (
          <div className="space-y-5 text-xs">
            {/* THÔNG TIN KHÁCH HÀNG & GIAO HÀNG */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3.5 rounded-xl bg-muted/30 border">
              <div>
                <p className="font-bold text-foreground flex items-center gap-1.5 mb-1.5">
                  <User className="h-4 w-4 text-indigo-600" />
                  <span>Thông Tin Người Nhận</span>
                </p>
                <p className="font-semibold text-foreground">{orderDetail.order.customerName}</p>
                <p className="text-muted-foreground">{orderDetail.order.customerEmail}</p>
                <p className="text-muted-foreground font-mono">{orderDetail.order.customerPhone}</p>
              </div>

              <div>
                <p className="font-bold text-foreground flex items-center gap-1.5 mb-1.5">
                  <MapPin className="h-4 w-4 text-rose-500" />
                  <span>Địa Chỉ Giao Hàng</span>
                </p>
                <p className="text-foreground leading-relaxed">
                  {orderDetail.order.shippingAddress?.streetAddress},{" "}
                  {orderDetail.order.shippingAddress?.ward ? `${orderDetail.order.shippingAddress.ward}, ` : ""}
                  {orderDetail.order.shippingAddress?.district ? `${orderDetail.order.shippingAddress.district}, ` : ""}
                  {orderDetail.order.shippingAddress?.city}
                </p>
                {orderDetail.order.note && (
                  <p className="text-amber-700 bg-amber-50 dark:bg-amber-950/30 dark:text-amber-300 p-1.5 rounded-lg mt-1 border border-amber-200">
                    <strong>Ghi chú:</strong> {orderDetail.order.note}
                  </p>
                )}
              </div>
            </div>

            {/* DANH SÁCH MẶT HÀNG */}
            <div>
              <p className="font-bold text-sm text-foreground mb-2">
                Danh Sách Sản Phẩm ({orderDetail.order.items?.length || 0})
              </p>
              <div className="border rounded-xl overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/40">
                      <TableHead>Sản phẩm</TableHead>
                      <TableHead className="text-center">Số lượng</TableHead>
                      <TableHead className="text-right">Đơn giá</TableHead>
                      <TableHead className="text-right">Thành tiền</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orderDetail.order.items?.map((item, i) => (
                      <TableRow key={i}>
                        <TableCell>
                          <p className="font-semibold text-foreground">{item.productName}</p>
                          <p className="font-mono text-[10px] text-muted-foreground">{item.productSku}</p>
                        </TableCell>
                        <TableCell className="text-center font-bold">{item.quantity}</TableCell>
                        <TableCell className="text-right">{formatCurrency(item.unitPrice)}</TableCell>
                        <TableCell className="text-right font-bold text-rose-600">
                          {formatCurrency(item.subtotal)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* TỔNG TIỀN */}
            <div className="flex justify-end pt-2">
              <div className="w-64 space-y-1 text-right">
                <div className="flex justify-between text-muted-foreground">
                  <span>Tiền hàng:</span>
                  <span>{formatCurrency(orderDetail.order.totalAmount)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Phí giao hàng:</span>
                  <span>{formatCurrency(orderDetail.order.shippingFee || 0)}</span>
                </div>
                <div className="flex justify-between font-bold text-sm text-rose-600 border-t pt-1">
                  <span>Tổng thanh toán:</span>
                  <span>{formatCurrency(orderDetail.order.finalAmount || orderDetail.order.totalAmount)}</span>
                </div>
              </div>
            </div>

            {/* LỊCH SỬ GIAO DỊCH SEPAY LIÊN QUAN */}
            {orderDetail.transactions && orderDetail.transactions.length > 0 && (
              <div className="pt-3 border-t">
                <p className="font-bold text-sm text-foreground flex items-center gap-1.5 mb-2">
                  <CreditCard className="h-4 w-4 text-emerald-600" />
                  <span>Lịch Sử Giao Dịch Chuyển Khoản VietQR SePay</span>
                </p>
                <div className="space-y-2">
                  {orderDetail.transactions.map((tx) => (
                    <div
                      key={tx.id}
                      className="p-3 rounded-xl bg-muted/40 border flex flex-col sm:flex-row justify-between gap-2"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-xs text-foreground">
                            {tx.gateway || "BANK"} - {tx.accountNumber}
                          </span>
                          <Badge variant={tx.status === "MATCHED" ? "success" : "secondary"}>
                            {tx.status}
                          </Badge>
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          Nội dung: <em>&quot;{tx.content}&quot;</em>
                        </p>
                        <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                          Mã GD SePay: #{tx.sepayId} | {tx.transactionDate}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-xs font-bold text-emerald-600">
                          +{formatCurrency(tx.amountIn || 0)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* MODAL IN PHIẾU GIAO HÀNG & HÓA ĐƠN */}
      <InvoicePrintModal
        isOpen={printModalOpen}
        onClose={() => setPrintModalOpen(false)}
        order={orderToPrint}
      />
    </div>
  );
}
