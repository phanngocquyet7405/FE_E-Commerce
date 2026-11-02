import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { OrderStatus } from "@/types";

/**
 * Hàm hợp nhất class Tailwind an toàn theo chuẩn Shadcn UI
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Định dạng tiền tệ Việt Nam Đồng (VND)
 * Ví dụ: 250000 -> "250.000 ₫"
 */
export function formatCurrency(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return "0 ₫";
  }
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
}

/**
 * Định dạng ngày tháng giờ theo chuẩn tiếng Việt
 */
export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return "N/A";
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  } catch {
    return dateString;
  }
}

/**
 * Cung cấp thông tin nhãn hiển thị và màu sắc trực quan cho từng trạng thái đơn hàng
 */
export function formatOrderStatus(status: OrderStatus): {
  label: string;
  badgeClass: string;
} {
  switch (status) {
    case "PENDING":
      return {
        label: "Chờ xác nhận",
        badgeClass: "bg-amber-100 text-amber-800 border-amber-300",
      };
    case "CONFIRMED":
      return {
        label: "Đã xác nhận",
        badgeClass: "bg-blue-100 text-blue-800 border-blue-300",
      };
    case "SHIPPING":
      return {
        label: "Đang vận chuyển",
        badgeClass: "bg-purple-100 text-purple-800 border-purple-300",
      };
    case "DELIVERED":
      return {
        label: "Đã giao thành công",
        badgeClass: "bg-emerald-100 text-emerald-800 border-emerald-300",
      };
    case "CANCELLED":
      return {
        label: "Đã hủy",
        badgeClass: "bg-rose-100 text-rose-800 border-rose-300",
      };
    default:
      return {
        label: status,
        badgeClass: "bg-gray-100 text-gray-800 border-gray-300",
      };
  }
}
