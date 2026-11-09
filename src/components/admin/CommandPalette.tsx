"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  LayoutDashboard,
  ShoppingBag,
  Package,
  Layers,
  Users,
  CreditCard,
  Settings,
  Plus,
  LogOut,
  X,
  ArrowRight,
  Command,
} from "lucide-react";
import authService from "@/services/authService";

interface CommandItem {
  id: string;
  title: string;
  description: string;
  category: "Điều hướng" | "Thao tác nhanh";
  icon: React.ElementType;
  action: () => void;
}

export function CommandPalette() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [query, setQuery] = useState<string>("");
  const [selectedIndex, setSelectedIndex] = useState<number>(0);

  // Bắt phím tắt Ctrl + K hoặc Cmd + K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const items: CommandItem[] = [
    {
      id: "nav-dash",
      title: "Bảng Điều Khiển Tổng Quan",
      description: "Xem doanh thu, đơn hàng và biểu đồ tăng trưởng",
      category: "Điều hướng",
      icon: LayoutDashboard,
      action: () => router.push("/dashboard"),
    },
    {
      id: "nav-orders",
      title: "Quản Lý Đơn Hàng",
      description: "Duyệt đơn, giao hàng và theo dõi vận chuyển",
      category: "Điều hướng",
      icon: ShoppingBag,
      action: () => router.push("/dashboard/orders"),
    },
    {
      id: "nav-products",
      title: "Quản Lý Kho & Sản Phẩm",
      description: "Danh sách tồn kho, điều chỉnh giá và sửa sản phẩm",
      category: "Điều hướng",
      icon: Package,
      action: () => router.push("/dashboard/products"),
    },
    {
      id: "nav-cat",
      title: "Danh Mục & Thương Hiệu",
      description: "Phân loại hàng hóa và đối tác nhãn hàng",
      category: "Điều hướng",
      icon: Layers,
      action: () => router.push("/dashboard/categories"),
    },
    {
      id: "nav-users",
      title: "Quản Lý Người Dùng & Khách",
      description: "Khóa/mở tài khoản, phân quyền Quản trị viên",
      category: "Điều hướng",
      icon: Users,
      action: () => router.push("/dashboard/customers"),
    },
    {
      id: "nav-payments",
      title: "Đối Soát Giao Dịch SePay",
      description: "Log biến động số dư ngân hàng và đối soát VietQR",
      category: "Điều hướng",
      icon: CreditCard,
      action: () => router.push("/dashboard/payments"),
    },
    {
      id: "nav-settings",
      title: "Cài Đặt Hệ Thống & Hồ Sơ",
      description: "Đổi mật khẩu tài khoản và thông số hạ tầng",
      category: "Điều hướng",
      icon: Settings,
      action: () => router.push("/dashboard/settings"),
    },
    {
      id: "act-new-prod",
      title: "Thêm Sản Phẩm Mới",
      description: "Tạo sản phẩm và tải ảnh lên Cloudinary",
      category: "Thao tác nhanh",
      icon: Plus,
      action: () => router.push("/dashboard/products"),
    },
    {
      id: "act-logout",
      title: "Đăng Xuất Khỏi Hệ Thống",
      description: "Thu hồi token trên Redis Blacklist",
      category: "Thao tác nhanh",
      icon: LogOut,
      action: async () => {
        await authService.logout();
        router.push("/login");
      },
    },
  ];

  const filteredItems = items.filter(
    (item) =>
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.description.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (item: CommandItem) => {
    setIsOpen(false);
    setQuery("");
    item.action();
  };

  const handleKeyDownList = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % filteredItems.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % filteredItems.length);
    } else if (e.key === "Enter" && filteredItems[selectedIndex]) {
      e.preventDefault();
      handleSelect(filteredItems[selectedIndex]);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-20 p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-background/80 backdrop-blur-md transition-opacity animate-in fade-in"
        onClick={() => setIsOpen(false)}
      />

      {/* Palette Box */}
      <div className="relative w-full max-w-xl bg-card rounded-2xl border shadow-2xl overflow-hidden z-10 animate-in zoom-in-95 duration-150">
        {/* Search Header */}
        <div className="flex items-center px-4 border-b">
          <Search className="h-4 w-4 text-muted-foreground shrink-0" />
          <input
            type="text"
            placeholder="Gõ lệnh tìm kiếm hoặc trang cần đến (ví dụ: 'đơn', 'kho', 'sepay')..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDownList}
            autoFocus
            className="w-full h-12 px-3 text-sm bg-transparent border-none focus:outline-none placeholder:text-muted-foreground text-foreground"
          />
          <div className="flex items-center space-x-1 shrink-0">
            <kbd className="hidden sm:inline-flex h-5 items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] text-muted-foreground">
              ESC
            </kbd>
          </div>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {filteredItems.length === 0 ? (
            <div className="py-8 text-center text-xs text-muted-foreground">
              Không tìm thấy lệnh hoặc trang nào phù hợp với &quot;{query}&quot;.
            </div>
          ) : (
            filteredItems.map((item, index) => {
              const Icon = item.icon;
              const isSelected = index === selectedIndex;

              return (
                <div
                  key={item.id}
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer text-xs transition-colors ${
                    isSelected
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "text-foreground hover:bg-muted"
                  }`}
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <div
                      className={`h-7 w-7 rounded-lg flex items-center justify-center shrink-0 ${
                        isSelected
                          ? "bg-white/20 text-white"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold truncate">{item.title}</p>
                      <p
                        className={`text-[10px] truncate ${
                          isSelected ? "text-indigo-100" : "text-muted-foreground"
                        }`}
                      >
                        {item.description}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`text-[9px] px-1.5 py-0.5 rounded font-mono shrink-0 ml-2 ${
                      isSelected
                        ? "bg-white/20 text-white"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {item.category}
                  </span>
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts helper */}
        <div className="px-4 py-2 border-t bg-muted/30 flex items-center justify-between text-[10px] text-muted-foreground">
          <div className="flex items-center space-x-2">
            <span>↑↓ để di chuyển</span>
            <span>•</span>
            <span>Enter để chọn</span>
          </div>
          <span className="font-mono">ShopDev Admin Palette</span>
        </div>
      </div>
    </div>
  );
}

export default CommandPalette;
