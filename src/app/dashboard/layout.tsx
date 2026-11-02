"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import authService from "@/services/authService";
import { Bell, ShieldCheck, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState<boolean>(false);
  const [adminEmail, setAdminEmail] = useState<string>("");

  useEffect(() => {
    const authenticated = authService.isAuthenticated();
    const isAdmin = authService.isAdmin();

    if (!authenticated || !isAdmin) {
      router.replace("/login?error=unauthorized_admin");
      return;
    }

    const user = authService.getCurrentUser();
    setAdminEmail(user?.email || "admin@ecommerce.com");
    setIsAuthorized(true);
  }, [router]);

  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background space-y-4">
        <div className="h-12 w-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center animate-bounce shadow-lg">
          <ShieldCheck className="h-7 w-7" />
        </div>
        <div className="text-center space-y-1">
          <h3 className="font-bold text-lg text-foreground">
            Đang xác minh quyền Quản trị viên...
          </h3>
          <p className="text-xs text-muted-foreground">
            Hệ thống đang kiểm tra chữ ký số JWT và quyền hạn bảo mật.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-muted/20">
      <AdminSidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <header className="h-16 border-b bg-background flex items-center justify-between px-6 sticky top-0 z-30 shadow-sm">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">
              Admin Mode
            </span>
            <span className="text-sm text-muted-foreground hidden sm:inline">
              | Bảng điều khiển quản lý thời gian thực
            </span>
          </div>

          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              className="relative text-muted-foreground hover:text-foreground"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-rose-500 animate-pulse"></span>
            </Button>

            <div className="flex items-center space-x-3 pl-3 border-l">
              <div className="h-9 w-9 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow">
                {adminEmail ? adminEmail[0].toUpperCase() : "A"}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-xs font-bold text-foreground leading-tight">
                  {adminEmail.split("@")[0]}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  ROLE_ADMIN
                </p>
              </div>
            </div>
          </div>
        </header>

        <main className="p-6 md:p-8 flex-1">{children}</main>
      </div>
    </div>
  );
}
