"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Users,
  Settings,
  ArrowLeft,
  LogOut,
  ShieldAlert,
} from "lucide-react";
import authService from "@/services/authService";
import { cn } from "@/utils/format";
import { Button } from "@/components/ui/button";

const NAV_ITEMS = [
  {
    title: "Tổng quan",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Đơn hàng",
    href: "/dashboard/orders",
    icon: ShoppingBag,
    badge: "Mới",
  },
  {
    title: "Sản phẩm",
    href: "/dashboard/products",
    icon: Package,
  },
  {
    title: "Khách hàng",
    href: "/dashboard/customers",
    icon: Users,
  },
  {
    title: "Cấu hình hệ thống",
    href: "/dashboard/settings",
    icon: Settings,
  },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await authService.logout();
    router.push("/login");
  };

  return (
    <aside className="w-64 border-r bg-card h-screen flex flex-col justify-between shrink-0 sticky top-0">
      <div>
        {/* LOGO ADMIN */}
        <div className="h-16 border-b flex items-center px-6 space-x-3">
          <div className="h-9 w-9 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold shadow-md">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-bold tracking-tight text-foreground leading-none">
              Admin Portal
            </h2>
            <p className="text-[11px] text-muted-foreground mt-1">
              ShopDev Management
            </p>
          </div>
        </div>

        {/* MENU ITEMS */}
        <div className="p-4 space-y-1">
          <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
            Điều hướng quản trị
          </p>
          {NAV_ITEMS.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <div className="flex items-center space-x-3">
                  <Icon className="h-4 w-4 shrink-0" />
                  <span>{item.title}</span>
                </div>
                {item.badge && (
                  <span
                    className={cn(
                      "text-[10px] font-bold px-1.5 py-0.5 rounded-full",
                      isActive
                        ? "bg-white/20 text-white"
                        : "bg-indigo-100 text-indigo-700"
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

      {/* FOOTER ACTIONS */}
      <div className="p-4 border-t space-y-2">
        <Link href="/">
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start text-xs font-medium"
          >
            <ArrowLeft className="h-3.5 w-3.5 mr-2" />
            Về trang mua sắm
          </Button>
        </Link>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          className="w-full justify-start text-xs text-destructive hover:bg-destructive/10 hover:text-destructive font-medium"
        >
          <LogOut className="h-3.5 w-3.5 mr-2" />
          Đăng xuất quyền Admin
        </Button>
      </div>
    </aside>
  );
}

export default AdminSidebar;
