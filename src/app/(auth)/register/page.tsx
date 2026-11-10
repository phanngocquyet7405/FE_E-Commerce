"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShoppingBag,
  Lock,
  Mail,
  User as UserIcon,
  Phone,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
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

export default function RegisterPage() {
  const router = useRouter();

  const [fullName, setFullName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!fullName.trim() || !email.trim() || !password.trim()) {
      setErrorMessage("Vui lòng điền các trường bắt buộc có dấu (*).");
      return;
    }

    if (password.length < 6) {
      setErrorMessage("Mật khẩu phải có độ dài tối thiểu 6 ký tự.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Mật khẩu xác nhận không khớp. Vui lòng kiểm tra lại.");
      return;
    }

    setIsLoading(true);

    try {
      await authService.register({
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
        password: password.trim(),
      });

      setSuccessMessage("Đăng ký tài khoản thành công! Đang chuyển hướng sang Đăng nhập...");

      setTimeout(() => {
        router.push("/login");
      }, 1500);
    } catch (err: unknown) {
      console.error("Lỗi đăng ký:", err);
      const errorObj = err as {
        response?: { data?: { message?: string; code?: number } };
      };
      const message =
        errorObj?.response?.data?.message ||
        "Đăng ký thất bại. Email có thể đã được sử dụng!";
      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50/60 via-background to-purple-50/50 p-4 sm:p-6">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center space-x-2 group">
            <div className="h-11 w-11 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
              <ShoppingBag className="h-6 w-6" />
            </div>
            <span className="font-extrabold text-2xl tracking-tight bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              ShopDev
            </span>
          </Link>
          <p className="text-sm text-muted-foreground">
            Tạo tài khoản mới để nhận ngập tràn ưu đãi thành viên
          </p>
        </div>

        <Card className="border shadow-xl backdrop-blur bg-card/95">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-xl font-bold text-center">
              Đăng Ký Tài Khoản
            </CardTitle>
            <CardDescription className="text-center text-xs">
              Điền thông tin bên dưới để bắt đầu trải nghiệm mua sắm
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-3.5">
              {errorMessage && (
                <div className="flex items-start space-x-2.5 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {successMessage && (
                <div className="flex items-start space-x-2.5 p-3 rounded-lg bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs">
                  <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{successMessage}</span>
                </div>
              )}

              <div className="space-y-1">
                <Label htmlFor="fullName" required>
                  Họ và tên
                </Label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Nguyễn Văn A"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="pl-9"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="email" required>
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="example@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-9"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="phone">Số điện thoại</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="0912 345 678"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="pl-9"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="password" required>
                  Mật khẩu
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Tối thiểu 6 ký tự"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-9"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="confirmPassword" required>
                  Xác nhận mật khẩu
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Nhập lại mật khẩu"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-9"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col space-y-3 pt-2">
              <Button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-md shadow-indigo-600/20"
                isLoading={isLoading}
              >
                <span>Tạo Tài Khoản Mới</span>
                {!isLoading && <ArrowRight className="ml-2 h-4 w-4" />}
              </Button>

              <div className="text-center text-xs text-muted-foreground">
                Đã có tài khoản?{" "}
                <Link
                  href="/login"
                  className="font-semibold text-indigo-600 hover:underline"
                >
                  Đăng nhập
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>

        <div className="text-center">
          <Link
            href="/"
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Quay lại trang chủ mua sắm
          </Link>
        </div>
      </div>
    </div>
  );
}
