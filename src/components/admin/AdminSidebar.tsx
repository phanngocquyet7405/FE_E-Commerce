"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Layers,
  Users,
  CreditCard,
  Settings,
  LogOut,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  X,
} from "lucide-react";
import authService from "@/services/authService";
import { cn } from "@/utils/format";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

export const NAV_ITEMS = [
  {
    title: "Tổng quan",
    href: "/dashboard",
    icon: LayoutDashboard,
    exact: true,
  },
  {
    title: "Đơn hàng",
    href: "/dashboard/orders",
    icon: ShoppingBag,
    badge: "Live",
  },
  {
    title: "Sản phẩm & Kho",
    href: "/dashboard/products",
    icon: Package,
  },
  {
    title: "Danh mục & Hiệu",
    href: "/dashboard/categories",
    icon: Layers,
  },
  {
    title: "Người dùng",
    href: "/dashboard/customers",
    icon: Users,
  },
  {
    title: "Giao dịch SePay",
    href: "/dashboard/payments",
    icon: CreditCard,
    badge: "Auto",
  },
  {
    title: "Cài đặt hệ thống",
    href: "/dashboard/settings",
    icon: Settings,
  },
];

interface AdminSidebarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function AdminSidebar({ mobileOpen = false, onMobileClose }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { info } = useToast();
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);

  const handleLogout = async () => {
    info("Đang đăng xuất", "Đã thu hồi token an toàn trên Redis.");
    if (onMobileClose) onMobileClose();
    await authService.logout();
    router.push("/login");
  };

  const navContent = (collapsed: boolean, isMobileView: boolean = false) => (
    <div className="flex flex-col justify-between h-full">
      <div>
        {/* LOGO ADMIN */}
        <div className="h-16 border-b flex items-center justify-between px-4">
          <Link
            href="/dashboard"
            onClick={() => isMobileView && onMobileClose?.()}
            className="flex items-center space-x-3 overflow-hidden"
          >
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white font-bold shadow-md shadow-indigo-600/20 shrink-0">
              <ShieldCheck className="h-5 w-5" />
            </div>
            {(!collapsed || isMobileView) && (
              <div className="min-w-0">
                <h2 className="text-sm font-extrabold tracking-tight text-foreground truncate">
                  ShopDev Admin
                </h2>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold mt-0.5">
                  Quản Trị Bán Hàng
                </p>
              </div>
            )}
          </Link>

          {/* Desktop Collapse Toggle */}
          {!isMobileView ? (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="h-8 w-8 text-muted-foreground hover:text-foreground shrink-0 hidden lg:flex"
              title={isCollapsed ? "Mở rộng" : "Thu gọn"}
            >
              {isCollapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              onClick={onMobileClose}
              className="h-8 w-8 text-muted-foreground hover:text-foreground shrink-0 rounded-xl"
              aria-label="Đóng menu"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* MENU ITEMS */}
        <div className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-14rem)]">
          {(!collapsed || isMobileView) && (
            <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70 mb-2">
              Phân hệ quản lý
            </p>
          )}

          {NAV_ITEMS.map((item) => {
            const isActive = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => isMobileView && onMobileClose?.()}
                title={collapsed && !isMobileView ? item.title : undefined}
                className={cn(
                  "flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group",
                  isActive
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                    : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
                )}
              >
                <div className="flex items-center space-x-3 min-w-0">
                  <Icon
                    className={cn(
                      "h-4 w-4 shrink-0 transition-transform group-hover:scale-110",
                      isActive ? "text-white" : "text-muted-foreground"
                    )}
                  />
                  {(!collapsed || isMobileView) && (
                    <span className="truncate">{item.title}</span>
                  )}
                </div>

                {(!collapsed || isMobileView) && item.badge && (
                  <span
                    className={cn(
                      "text-[9px] font-bold px-1.5 py-0.5 rounded-md leading-none",
                      isActive
                        ? "bg-white/20 text-white"
                        : "bg-indigo-50 text-indigo-600 border border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800"
                    )}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </div>

      {/* FOOTER & LOGOUT */}
      <div className="p-3 border-t space-y-2 shrink-0">
        {(!collapsed || isMobileView) && (
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-50/80 to-purple-50/60 dark:from-indigo-950/40 dark:to-purple-950/30 border border-indigo-100 dark:border-indigo-900/40 flex items-center space-x-2.5">
            <div className="h-7 w-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
              <TrendingUp className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-bold text-indigo-950 dark:text-indigo-200 truncate">
                Spring Boot 3.3.4
              </p>
              <p className="text-[10px] text-indigo-600 dark:text-indigo-400 font-medium truncate">
                MongoDB Atlas Active
              </p>
            </div>
          </div>
        )}

        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          className={cn(
            "w-full text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/30 flex items-center rounded-xl",
            collapsed && !isMobileView ? "justify-center px-0 h-10" : "justify-start px-3 h-9"
          )}
          title="Đăng xuất khỏi hệ thống"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {(!collapsed || isMobileView) && <span className="ml-2.5">Đăng xuất quản trị</span>}
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {/* 1. DESKTOP STICKY SIDEBAR (Hidden on mobile & tablet < lg) */}
      <aside
        className={cn(
          "hidden lg:flex border-r bg-card h-screen flex-col justify-between shrink-0 sticky top-0 transition-all duration-300 z-40 shadow-sm",
          isCollapsed ? "w-20" : "w-64"
        )}
      >
        {navContent(isCollapsed, false)}
      </aside>

      {/* 2. MOBILE DRAWER (Only rendered when open on < lg) */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-background/80 backdrop-blur-sm transition-opacity animate-in fade-in"
            onClick={onMobileClose}
          />

          {/* Drawer Content */}
          <div className="relative w-72 max-w-[85vw] h-full bg-card border-r shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-200">
            {navContent(false, true)}
          </div>
        </div>
      )}
    </>
  );
}

export default AdminSidebar;
