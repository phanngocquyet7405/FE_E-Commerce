"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  CreditCard,
  Menu,
} from "lucide-react";
import { cn } from "@/utils/format";

interface AdminMobileBottomNavProps {
  onOpenMenu: () => void;
}

export function AdminMobileBottomNav({ onOpenMenu }: AdminMobileBottomNavProps) {
  const pathname = usePathname();

  const NAV_ITEMS = [
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
    },
    {
      title: "Sản phẩm",
      href: "/dashboard/products",
      icon: Package,
    },
    {
      title: "Giao dịch",
      href: "/dashboard/payments",
      icon: CreditCard,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 h-16 border-t bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80 flex items-center justify-around px-2 lg:hidden shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
      {NAV_ITEMS.map((item) => {
        const isActive = item.exact
          ? pathname === item.href
          : pathname.startsWith(item.href);
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center flex-1 h-full py-1 text-[11px] font-semibold transition-colors relative",
              isActive
                ? "text-indigo-600 dark:text-indigo-400 font-bold"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <div
              className={cn(
                "p-1 rounded-xl transition-all",
                isActive && "bg-indigo-50 dark:bg-indigo-950/40"
              )}
            >
              <Icon className="h-5 w-5" />
            </div>
            <span className="truncate mt-0.5">{item.title}</span>
            {isActive && (
              <span className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400" />
            )}
          </Link>
        );
      })}

      {/* Button Open Drawer */}
      <button
        onClick={onOpenMenu}
        className="flex flex-col items-center justify-center flex-1 h-full py-1 text-[11px] font-semibold text-muted-foreground hover:text-foreground transition-colors"
        aria-label="Mở menu quản trị bổ sung"
      >
        <div className="p-1 rounded-xl">
          <Menu className="h-5 w-5" />
        </div>
        <span className="truncate mt-0.5">Thêm</span>
      </button>
    </nav>
  );
}

export default AdminMobileBottomNav;
