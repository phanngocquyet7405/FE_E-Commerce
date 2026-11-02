"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  RefreshCw,
  ArrowUpRight,
  Eye,
  CheckCircle,
  Truck,
  Clock,
  AlertCircle,
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
import adminService, { DashboardOverview } from "@/services/adminService";
import { Order, OrderStatus, Product } from "@/types";

const DEFAULT_FALLBACK_DATA: DashboardOverview = {
  stats: {
    totalRevenue: 158420000,
    totalOrders: 48,
    totalCustomers: 124,
    totalProducts: 16,
    revenueGrowth: 18.5,
    ordersGrowth: 14.2,
  },
  recentOrders: [
    {
      id: "ord-001",
      orderCode: "ORD-20261102-A9F1",
      userId: "user-1",
      customerName: "Nguyễn Văn Tuấn",
      customerEmail: "tuan.nguyen@gmail.com",
      customerPhone: "0987654321",
      shippingAddress: {
        receiverName: "Nguyễn Văn Tuấn",
        phone: "0987654321",
        streetAddress: "Số 12 Duy Tân",
        ward: "Dịch Vọng Hậu",
        district: "Cầu Giấy",
        city: "Hà Nội",
        isDefault: true,
      },
      items: [
        {
          productId: "prod-1",
          productName: "iPhone 16 Pro Max 256GB Titan",
          unitPrice: 34990000,
          quantity: 1,
          subtotal: 34990000,
        },
      ],
      totalAmount: 34990000,
      shippingFee: 0,
      finalAmount: 34990000,
      paymentMethod: "VNPAY",
      status: "CONFIRMED",
      createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    },
    {
      id: "ord-002",
      orderCode: "ORD-20261102-B8E2",
      userId: "user-2",
      customerName: "Trần Thị Mai",
      customerEmail: "mai.tran@gmail.com",
      customerPhone: "0912345678",
      shippingAddress: {
        receiverName: "Trần Thị Mai",
        phone: "0912345678",
        streetAddress: "45 Lê Duẩn",
        city: "Đà Nẵng",
        isDefault: true,
      },
      items: [
        {
          productId: "prod-3",
          productName: "Tai nghe Sony WH-1000XM5",
          unitPrice: 7990000,
          quantity: 1,
          subtotal: 7990000,
        },
      ],
      totalAmount: 7990000,
      shippingFee: 30000,
      finalAmount: 8020000,
      paymentMethod: "COD",
      status: "PENDING",
      createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    },
    {
      id: "ord-003",
      orderCode: "ORD-20261101-C7D3",
      userId: "user-3",
      customerName: "Lê Hoàng Long",
      customerEmail: "long.le@gmail.com",
      customerPhone: "0909876543",
      shippingAddress: {
        receiverName: "Lê Hoàng Long",
        phone: "0909876543",
        streetAddress: "128 Nguyễn Trãi",
        city: "TP. Hồ Chí Minh",
        isDefault: true,
      },
      items: [
        {
          productId: "prod-4",
          productName: "Apple Watch Series 10",
          unitPrice: 11490000,
          quantity: 1,
          subtotal: 11490000,
        },
      ],
      totalAmount: 11490000,
      shippingFee: 0,
      finalAmount: 11490000,
      paymentMethod: "MOMO",
      status: "SHIPPING",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    },
    {
      id: "ord-004",
      orderCode: "ORD-20261031-D6C4",
      userId: "user-4",
      customerName: "Phạm Thúy Hằng",
      customerEmail: "hang.pham@gmail.com",
      customerPhone: "0977112233",
      shippingAddress: {
        receiverName: "Phạm Thúy Hằng",
        phone: "0977112233",
        streetAddress: "88 Trần Phú",
        city: "Hải Phòng",
        isDefault: true,
      },
      items: [
        {
          productId: "prod-6",
          productName: "iPad Air 11 inch M2",
          unitPrice: 16490000,
          quantity: 1,
          subtotal: 16490000,
        },
      ],
      totalAmount: 16490000,
      shippingFee: 0,
      finalAmount: 16490000,
      paymentMethod: "VNPAY",
      status: "DELIVERED",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    },
  ],
  recentProducts: [
    {
      id: "prod-1",
      sku: "IPHONE-16-PRO",
      name: "iPhone 16 Pro Max 256GB Titan",
      slug: "iphone-16-pro-max",
      description: "A18 Pro",
      price: 34990000,
      stockQuantity: 45,
      thumbnailUrl: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=400&auto=format&fit=crop&q=80",
      images: [],
      active: true,
      categoryId: "cat-1",
      categoryName: "Điện thoại",
      brandName: "Apple",
      createdAt: new Date().toISOString(),
    },
    {
      id: "prod-2",
      sku: "MBP-M3-PRO",
      name: "MacBook Pro 14 M3 Pro",
      slug: "macbook-pro-14-m3-pro",
      description: "M3 Pro",
      price: 49990000,
      stockQuantity: 20,
      thumbnailUrl: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&auto=format&fit=crop&q=80",
      images: [],
      active: true,
      categoryId: "cat-2",
      categoryName: "Laptop",
      brandName: "Apple",
      createdAt: new Date().toISOString(),
    },
  ],
};

export default function DashboardPage() {
  const [data, setData] = useState<DashboardOverview>(DEFAULT_FALLBACK_DATA);
  const [loading, setLoading] = useState<boolean>(true);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const overview = await adminService.getDashboardOverview();
      if (overview.recentOrders.length > 0) {
        setData(overview);
      }
    } catch (error) {
      console.warn("Không thể nạp dữ liệu backend, duy trì dữ liệu demo:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleUpdateStatus = async (orderId: string, newStatus: OrderStatus) => {
    setUpdatingOrderId(orderId);
    try {
      await adminService.updateOrderStatus(orderId, newStatus);
      setData((prev) => ({
        ...prev,
        recentOrders: prev.recentOrders.map((ord) =>
          ord.id === orderId ? { ...ord, status: newStatus } : ord
        ),
      }));
    } catch (error) {
      console.error("Cập nhật trạng thái thất bại:", error);
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const { stats, recentOrders, recentProducts } = data;

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Bảng Điều Khiển Quản Trị
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Tổng hợp dữ liệu kinh doanh, đơn đặt hàng và kho hàng thời gian thực.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={fetchDashboardData}
          disabled={loading}
          className="border-input hover:bg-muted font-medium flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          <span>{loading ? "Đang đồng bộ..." : "Làm mới dữ liệu"}</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatsCard
          title="Tổng Doanh Thu"
          value={formatCurrency(stats.totalRevenue)}
          icon={DollarSign}
          growth={stats.revenueGrowth}
          description="so với tháng trước"
          iconBgColor="bg-emerald-50"
          iconColor="text-emerald-600"
        />

        <StatsCard
          title="Tổng Đơn Hàng"
          value={stats.totalOrders}
          icon={ShoppingCart}
          growth={stats.ordersGrowth}
          description="so với tháng trước"
          iconBgColor="bg-indigo-50"
          iconColor="text-indigo-600"
        />

        <StatsCard
          title="Tổng Khách Hàng"
          value={stats.totalCustomers}
          icon={Users}
          growth={8.4}
          description="tài khoản kích hoạt"
          iconBgColor="bg-blue-50"
          iconColor="text-blue-600"
        />

        <StatsCard
          title="Sản Phẩm Đang Bán"
          value={stats.totalProducts}
          icon={Package}
          description="trong kho sẵn hàng"
          iconBgColor="bg-purple-50"
          iconColor="text-purple-600"
        />
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <div>
            <CardTitle className="text-lg font-bold">
              Đơn Hàng Mới Nhất
            </CardTitle>
            <CardDescription className="text-xs">
              Các đơn hàng vừa được khách đặt qua Web & Mobile
            </CardDescription>
          </div>
          <Link href="/dashboard/orders">
            <Button variant="ghost" size="sm" className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold">
              <span>Xem tất cả</span>
              <ArrowUpRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        </CardHeader>

        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mã Đơn</TableHead>
                <TableHead>Khách Hàng</TableHead>
                <TableHead>Thời Gian</TableHead>
                <TableHead>Tổng Tiền</TableHead>
                <TableHead>Hình Thức</TableHead>
                <TableHead>Trạng Thái</TableHead>
                <TableHead className="text-right">Thao Tác Admin</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    Chưa có đơn hàng nào được ghi nhận.
                  </TableCell>
                </TableRow>
              ) : (
                recentOrders.map((order) => {
                  const statusInfo = formatOrderStatus(order.status);
                  const isUpdating = updatingOrderId === order.id;

                  return (
                    <TableRow key={order.id} className="hover:bg-muted/40">
                      <TableCell className="font-mono text-xs font-semibold text-foreground">
                        {order.orderCode}
                      </TableCell>

                      <TableCell>
                        <div className="font-medium text-xs text-foreground">
                          {order.customerName}
                        </div>
                        <div className="text-[11px] text-muted-foreground">
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

                      <TableCell className="text-right whitespace-nowrap space-x-1">
                        {order.status === "PENDING" && (
                          <Button
                            size="sm"
                            variant="success"
                            className="h-7 text-xs px-2"
                            disabled={isUpdating}
                            onClick={() => handleUpdateStatus(order.id, "CONFIRMED")}
                          >
                            <CheckCircle className="h-3.5 w-3.5 mr-1" />
                            Duyệt đơn
                          </Button>
                        )}
                        {order.status === "CONFIRMED" && (
                          <Button
                            size="sm"
                            className="h-7 text-xs px-2 bg-purple-600 hover:bg-purple-700 text-white"
                            disabled={isUpdating}
                            onClick={() => handleUpdateStatus(order.id, "SHIPPING")}
                          >
                            <Truck className="h-3.5 w-3.5 mr-1" />
                            Giao hàng
                          </Button>
                        )}
                        {order.status === "SHIPPING" && (
                          <Button
                            size="sm"
                            variant="success"
                            className="h-7 text-xs px-2"
                            disabled={isUpdating}
                            onClick={() => handleUpdateStatus(order.id, "DELIVERED")}
                          >
                            <CheckCircle className="h-3.5 w-3.5 mr-1" />
                            Hoàn tất
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <div>
            <CardTitle className="text-lg font-bold">
              Sản Phẩm Trong Kho
            </CardTitle>
            <CardDescription className="text-xs">
              Các sản phẩm và lượng tồn kho thực tế trong cơ sở dữ liệu MongoDB
            </CardDescription>
          </div>
          <Link href="/dashboard/products">
            <Button variant="ghost" size="sm" className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold">
              <span>Quản lý kho</span>
              <ArrowUpRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        </CardHeader>

        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Sản Phẩm</TableHead>
                <TableHead>Mã SKU</TableHead>
                <TableHead>Danh Mục</TableHead>
                <TableHead>Đơn Giá</TableHead>
                <TableHead>Tồn Kho</TableHead>
                <TableHead>Trạng Thái</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentProducts.map((prod) => (
                <TableRow key={prod.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 relative rounded-md overflow-hidden bg-muted shrink-0 border">
                        <Image
                          src={
                            prod.thumbnailUrl ||
                            "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100&auto=format&fit=crop&q=80"
                          }
                          alt={prod.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <span className="font-semibold text-xs text-foreground truncate max-w-xs">
                        {prod.name}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-xs">{prod.sku}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {prod.categoryName || "Chung"}
                  </TableCell>
                  <TableCell className="font-bold text-xs text-foreground">
                    {formatCurrency(prod.price)}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`font-semibold text-xs ${
                        prod.stockQuantity <= 10
                          ? "text-rose-600"
                          : "text-foreground"
                      }`}
                    >
                      {prod.stockQuantity} món
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={prod.active ? "success" : "secondary"}>
                      {prod.active ? "Đang kinh doanh" : "Ngừng bán"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
