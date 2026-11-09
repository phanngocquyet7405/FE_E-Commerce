"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, Loader2 } from "lucide-react";
import authService from "@/services/authService";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Tự động kiểm tra phiên làm việc của Quản trị viên
    const isAuthenticated = authService.isAuthenticated();
    const isAdmin = authService.isAdmin();

    if (isAuthenticated && isAdmin) {
      router.replace("/dashboard");
    } else {
      router.replace("/login");
    }
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-50/50 via-background to-slate-100 p-4">
      <div className="flex flex-col items-center space-y-4 max-w-sm text-center">
        <div className="h-14 w-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-xl shadow-indigo-600/25 animate-pulse">
          <ShieldCheck className="h-8 w-8" />
        </div>
        <div className="space-y-1">
          <h2 className="text-xl font-extrabold tracking-tight text-foreground">
            ShopDev Admin Portal
          </h2>
          <p className="text-xs text-muted-foreground flex items-center justify-center gap-1.5">
            <Loader2 className="h-3.5 w-3.5 animate-spin text-indigo-600" />
            <span>Đang xác thực phiên quản trị viên...</span>
          </p>
        </div>
      </div>
    </div>
  );
}
