"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ShieldAlert,
  Lock,
  Mail,
  AlertCircle,
  ArrowRight,
  Server,
  KeyRound,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import authService from "@/services/authService";
import { useToast } from "@/components/ui/toast";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { success, error } = useToast();

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const redirectUrl = searchParams.get("redirect") || "/dashboard";
  const errorParam = searchParams.get("error");

  // Hiển thị thông báo nếu bị điều hướng từ bảo vệ route
  useEffect(() => {
    // Dọn dẹp token cũ còn lưu trong trình duyệt để tránh gửi token hết hạn
    authService.clearSession();

    if (errorParam === "session_expired") {
      setErrorMessage("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại để tiếp tục.");
    } else if (errorParam === "unauthorized_admin") {
      setErrorMessage(
        "Yêu cầu quyền Quản trị viên (ROLE_ADMIN) để truy cập Cổng Quản Trị."
      );
    }
  }, [errorParam]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!email.trim() || !password.trim()) {
      setErrorMessage("Vui lòng nhập đầy đủ Email và Mật khẩu.");
      return;
    }

    setIsLoading(true);

    try {
      // Đảm bảo không còn token cũ trong LocalStorage trước khi gửi request đăng nhập
      authService.clearSession();

      const result = await authService.login({
        email: email.trim(),
        password: password.trim(),
      });

      // Kiểm tra nghiêm ngặt quyền Quản trị viên
      if (result.role !== "ADMIN") {
        // Dọn dẹp token ở LocalStorage để tránh lưu phiên trái phép
        authService.clearSession();
        const msg = `Tài khoản [${result.email}] xác thực thành công nhưng không có quyền Quản trị viên (ROLE_ADMIN). Vui lòng đăng nhập bằng tài khoản Quản trị hoặc cấp quyền trong cơ sở dữ liệu.`;
        setErrorMessage(msg);
        error("Từ chối truy cập", msg);
        return;
      }

      // Đăng nhập hợp lệ với quyền ROLE_ADMIN
      success("Đăng nhập thành công", "Chào mừng Quản trị viên trở lại hệ thống!");
      router.push(redirectUrl);
    } catch (err: unknown) {
      console.error("Lỗi đăng nhập:", err);
      const errorObj = err as {
        response?: { data?: { message?: string; code?: number } };
      };
      const message =
        errorObj?.response?.data?.message ||
        "Email hoặc mật khẩu không chính xác. Vui lòng kiểm tra lại!";
      setErrorMessage(message);
      error("Đăng nhập thất bại", message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md space-y-6">
      {/* LOGO & HEADING */}
      <div className="text-center space-y-2">
        <div className="inline-flex h-14 w-14 rounded-2xl bg-gradient-to-tr from-indigo-500 to-indigo-600 items-center justify-center text-white shadow-xl shadow-indigo-500/20 mb-2">
          <ShieldAlert className="h-7 w-7" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
          ShopDev Admin Portal
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Cổng quản trị cơ sở dữ liệu & thương mại điện tử
        </p>
      </div>

      {/* LOGIN CARD */}
      <Card className="border-slate-800 bg-slate-900/90 backdrop-blur-xl shadow-2xl text-slate-100">
        <CardHeader className="space-y-1 pb-4 border-b border-slate-800">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
              <KeyRound className="h-4 w-4 text-indigo-400" />
              <span>Xác Thực Quản Trị</span>
            </CardTitle>
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Backend Live
            </span>
          </div>
          <CardDescription className="text-xs text-slate-400">
            Hệ thống yêu cầu tài khoản được cấp quyền <strong className="text-indigo-400 font-semibold">ROLE_ADMIN</strong>
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4 pt-5">
            {errorMessage && (
              <div className="flex items-start space-x-2.5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-300 text-xs animate-in fade-in leading-relaxed">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose-400" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <Label
                htmlFor="email"
                className="text-xs font-semibold text-slate-300 flex items-center justify-between"
              >
                <span>Email Quản Trị Viên</span>
                <span className="text-[10px] text-slate-500">Bắt buộc</span>
              </Label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@ecommerce.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  className="pl-10 h-10 text-sm bg-slate-950/60 border-slate-800 text-white placeholder:text-slate-600 focus:border-indigo-500 focus:ring-indigo-500 rounded-xl"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="password"
                className="text-xs font-semibold text-slate-300 flex items-center justify-between"
              >
                <span>Mật Khẩu</span>
                <span className="text-[10px] text-slate-500">Mã hóa JWT</span>
              </Label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  className="pl-10 h-10 text-sm bg-slate-950/60 border-slate-800 text-white placeholder:text-slate-600 focus:border-indigo-500 focus:ring-indigo-500 rounded-xl"
                />
              </div>
            </div>
          </CardContent>

          <CardFooter className="pt-2 pb-6 flex flex-col space-y-3">
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-10 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <span className="h-4 w-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
                  <span>Đang xác thực bảo mật...</span>
                </>
              ) : (
                <>
                  <span>Đăng Nhập Quản Trị</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>

            <div className="flex items-center justify-center gap-2 text-[11px] text-slate-500 pt-2 border-t border-slate-800/80 w-full">
              <Server className="h-3.5 w-3.5" />
              <span>Spring Boot 3.3.4 + Redis Blacklist + Mongo Atlas</span>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-4 sm:p-6 text-foreground">
      <Suspense
        fallback={
          <div className="flex items-center space-x-2 text-white">
            <span className="h-5 w-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
            <span className="text-sm">Đang tải trang đăng nhập...</span>
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </div>
  );
}
