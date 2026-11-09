"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { CommandPalette } from "@/components/admin/CommandPalette";
import { ThemeToggle } from "@/components/admin/ThemeToggle";
import authService from "@/services/authService";
import { Bell, ShieldCheck, Search, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState<boolean>(false);
  const [adminEmail, setAdminEmail] = useState<string>("");
  const [showFallbackAction, setShowFallbackAction] = useState<boolean>(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowFallbackAction(true);
    }, 2000);

    const authenticated = authService.isAuthenticated();
    const isAdmin = authService.isAdmin();

    // Bắt buộc phải đăng nhập VÀ có quyền ROLE_ADMIN
    if (!authenticated || !isAdmin) {
      router.replace("/login?error=unauthorized_admin");
      return () => clearTimeout(timer);
    }

    const user = authService.getCurrentUser();
    setAdminEmail(user?.email || "admin@ecommerce.com");
    setIsAuthorized(true);

    return () => clearTimeout(timer);
  }, [router]);

  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background space-y-5 p-4">
        <div className="h-14 w-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center animate-bounce shadow-xl shadow-indigo-600/25">
          <ShieldCheck className="h-8 w-8" />
        </div>
        <div className="text-center space-y-1.5 max-w-sm">
          <h3 className="font-bold text-lg text-foreground">
            Đang xác minh quyền Quản trị viên...
          </h3>
          <p className="text-xs text-muted-foreground">
            Hệ thống đang kiểm tra chữ ký số JWT và quyền hạn bảo mật ROLE_ADMIN.
          </p>
        </div>

        {showFallbackAction && (
          <div className="animate-in fade-in duration-300 pt-2 flex flex-col items-center space-y-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.replace("/login")}
              className="text-xs gap-1.5 rounded-xl border-border bg-card hover:bg-accent"
            >
              <span>Chuyển đến trang Đăng nhập</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-muted/20">
      <AdminSidebar />
      <CommandPalette />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <header className="h-16 border-b bg-background flex items-center justify-between px-6 sticky top-0 z-30 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-background/80">
          {/* SEARCH COMMAND PALETTE TRIGGER BUTTON */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => {
                const event = new KeyboardEvent("keydown", {
                  key: "k",
                  ctrlKey: true,
                });
                window.dispatchEvent(event);
              }}
              className="flex items-center space-x-2.5 px-3 py-1.5 rounded-xl border border-input bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground text-xs transition-colors"
            >
              <Search className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Tìm kiếm nhanh lệnh & dữ liệu...</span>
              <kbd className="hidden sm:inline-flex h-4 items-center gap-0.5 rounded border bg-background px-1.5 font-mono text-[9px] text-muted-foreground">
                Ctrl K
              </kbd>
            </button>
          </div>

          {/* HEADER RIGHT ACTIONS */}
          <div className="flex items-center space-x-2">
            <ThemeToggle />

            <Link href="/dashboard/orders">
              <Button
                variant="ghost"
                size="icon"
                className="relative text-muted-foreground hover:text-foreground h-9 w-9 rounded-xl"
                title="Thông báo đơn hàng"
              >
                <Bell className="h-4 w-4" />
                <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-rose-500 animate-pulse"></span>
              </Button>
            </Link>

            <Link
              href="/dashboard/settings"
              className="flex items-center space-x-2.5 pl-3 border-l hover:opacity-80 transition-opacity"
            >
              <div className="h-8 w-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                {adminEmail ? adminEmail[0].toUpperCase() : "A"}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-xs font-bold text-foreground leading-tight truncate max-w-[140px]">
                  {adminEmail.split("@")[0]}
                </p>
                <p className="text-[10px] text-indigo-600 dark:text-indigo-400 font-mono font-semibold">
                  ROLE_ADMIN
                </p>
              </div>
            </Link>
          </div>
        </header>

        <main className="p-4 sm:p-6 md:p-8 flex-1">{children}</main>
      </div>
    </div>
  );
}
