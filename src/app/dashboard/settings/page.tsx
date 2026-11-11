"use client";

import React, { useEffect, useState } from "react";
import {
  Settings,
  User,
  Lock,
  Server,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  Mail,
  Phone,
  Database,
  Cloud,
  Save,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import profileApi from "@/api/profileApi";
import { ChangePasswordRequest, UpdateProfileRequest, User as UserType } from "@/types";

export default function AdminSettingsPage() {
  const { success, error: toastError } = useToast();

  const [loading, setLoading] = useState<boolean>(true);
  const [userProfile, setUserProfile] = useState<UserType | null>(null);

  // Form Profile
  const [profileForm, setProfileForm] = useState<UpdateProfileRequest>({
    fullName: "",
    phone: "",
    avatarUrl: "",
  });
  const [savingProfile, setSavingProfile] = useState<boolean>(false);

  // Form Đổi mật khẩu
  const [passwordForm, setPasswordForm] = useState<ChangePasswordRequest>({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [changingPassword, setChangingPassword] = useState<boolean>(false);

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await profileApi.getProfile();
        if (res.data) {
          setUserProfile(res.data);
          setProfileForm({
            fullName: res.data.fullName || "",
            phone: res.data.phone || "",
            avatarUrl: res.data.avatarUrl || "",
          });
        }
      } catch (err) {
        console.error("Lỗi nạp profile:", err);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const res = await profileApi.updateProfile(profileForm);
      if (res.data) {
        setUserProfile(res.data);
        success("Cập nhật thành công", "Thông tin hồ sơ quản trị viên đã được lưu.");
      }
    } catch (err) {
      console.error("Lỗi cập nhật hồ sơ:", err);
      toastError("Lỗi", "Không thể cập nhật thông tin hồ sơ.");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toastError("Không khớp", "Mật khẩu xác nhận không trùng khớp.");
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      toastError("Mật khẩu yếu", "Mật khẩu mới phải có tối thiểu 6 ký tự.");
      return;
    }

    setChangingPassword(true);
    try {
      await profileApi.changePassword(passwordForm);
      success("Đổi mật khẩu thành công", "Mật khẩu mới đã được cập nhật an toàn.");
      setPasswordForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err: unknown) {
      console.error("Lỗi đổi mật khẩu:", err);
      const errorObj = err as { response?: { data?: { message?: string } } };
      const msg = errorObj?.response?.data?.message || "Mật khẩu cũ không chính xác.";
      toastError("Đổi mật khẩu thất bại", msg);
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* HEADER */}
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
          <span>Cấu Hình Hệ Thống & Tài Khoản Quản Trị</span>
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Quản lý tài khoản Admin, bảo mật chữ ký số JWT và thông số kết nối cơ sở hạ tầng.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* CỘT 1 & 2: HỒ SƠ & BẢO MẬT (2 COLS) */}
        <div className="lg:col-span-2 space-y-6">
          {/* CARD HỒ SƠ ADMIN */}
          <Card>
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <User className="h-4 w-4 text-indigo-600" />
                <span>Hồ Sơ Quản Trị Viên</span>
              </CardTitle>
              <CardDescription className="text-xs">
                Thông tin hiển thị trên Header và nhật ký kiểm toán hệ thống (Audit Logs)
              </CardDescription>
            </CardHeader>

            <CardContent className="pt-4">
              <form onSubmit={handleUpdateProfile} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold">Email Đăng Nhập</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                      <Input
                        disabled
                        value={userProfile?.email || "admin@ecommerce.com"}
                        className="pl-9 h-9 text-xs rounded-xl bg-muted font-mono"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs font-semibold">Vai Trò Hệ Thống</Label>
                    <div className="h-9 px-3 flex items-center bg-muted rounded-xl text-xs font-bold font-mono text-indigo-600 border">
                      ROLE_ADMIN
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold">Họ Và Tên (*)</Label>
                    <Input
                      placeholder="Nguyễn Văn Quản Trị"
                      value={profileForm.fullName}
                      onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
                      required
                      className="h-9 text-xs rounded-xl"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs font-semibold">Số Điện Thoại</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                      <Input
                        placeholder="0987654321"
                        value={profileForm.phone}
                        onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                        className="pl-9 h-9 text-xs rounded-xl font-mono"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <Button
                    type="submit"
                    size="sm"
                    disabled={savingProfile}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white h-8 text-xs rounded-xl px-4 font-semibold gap-1.5 shadow-sm"
                  >
                    <Save className="h-3.5 w-3.5" />
                    <span>{savingProfile ? "Đang lưu..." : "Lưu Thay Đổi"}</span>
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* CARD ĐỔI MẬT KHẨU */}
          <Card>
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Lock className="h-4 w-4 text-rose-500" />
                <span>Đổi Mật Khẩu Quản Trị</span>
              </CardTitle>
              <CardDescription className="text-xs">
                Cập nhật mật khẩu định kỳ để bảo vệ toàn vẹn dữ liệu hệ thống
              </CardDescription>
            </CardHeader>

            <CardContent className="pt-4">
              <form onSubmit={handleChangePassword} className="space-y-4 text-xs">
                <div className="space-y-1">
                  <Label className="text-xs font-semibold">Mật Khẩu Hiện Tại (*)</Label>
                  <Input
                    type="password"
                    placeholder="••••••••••••"
                    value={passwordForm.oldPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, oldPassword: e.target.value })}
                    required
                    className="h-9 text-xs rounded-xl"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold">Mật Khẩu Mới (*)</Label>
                    <Input
                      type="password"
                      placeholder="Tối thiểu 6 ký tự"
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                      required
                      className="h-9 text-xs rounded-xl"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs font-semibold">Xác Nhận Mật Khẩu Mới (*)</Label>
                    <Input
                      type="password"
                      placeholder="Nhập lại mật khẩu mới"
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                      required
                      className="h-9 text-xs rounded-xl"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <Button
                    type="submit"
                    size="sm"
                    disabled={changingPassword}
                    className="bg-rose-600 hover:bg-rose-700 text-white h-8 text-xs rounded-xl px-4 font-semibold gap-1.5 shadow-sm"
                  >
                    <ShieldCheck className="h-3.5 w-3.5" />
                    <span>{changingPassword ? "Đang xử lý..." : "Cập Nhật Mật Khẩu"}</span>
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* CỘT 3: THÔNG SỐ SERVER & BẢO MẬT (1 COL) */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Server className="h-4 w-4 text-indigo-600" />
                <span>Hạ Tầng Backend</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-3 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-50 border space-y-1">
                <span className="text-muted-foreground text-[10px] uppercase font-bold tracking-wider">
                  Framework & Ngôn ngữ
                </span>
                <p className="font-bold text-foreground">Java 21 + Spring Boot 3.3.4</p>
                <p className="text-[11px] text-muted-foreground">3-Tier MVC Architecture</p>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 border space-y-1">
                <span className="text-muted-foreground text-[10px] uppercase font-bold tracking-wider">
                  Cơ sở dữ liệu
                </span>
                <p className="font-bold text-emerald-600 flex items-center gap-1">
                  <Database className="h-3.5 w-3.5" />
                  <span>MongoDB Atlas (ReplicaSet)</span>
                </p>
                <p className="text-[11px] text-muted-foreground">
                  Atomic findAndModify trừ kho
                </p>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 border space-y-1">
                <span className="text-muted-foreground text-[10px] uppercase font-bold tracking-wider">
                  Cache & Quản lý Token
                </span>
                <p className="font-bold text-rose-600 flex items-center gap-1">
                  <span>Redis Cloud In-Memory</span>
                </p>
                <p className="text-[11px] text-muted-foreground">
                  Whitelist Refresh + Blacklist Logout
                </p>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 border space-y-1">
                <span className="text-muted-foreground text-[10px] uppercase font-bold tracking-wider">
                  Cổng Thanh Toán Tự Động
                </span>
                <p className="font-bold text-indigo-600">SePay VietQR</p>
                <p className="text-[11px] text-muted-foreground">
                  Webhook đối soát số dư thời gian thực
                </p>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 border space-y-1">
                <span className="text-muted-foreground text-[10px] uppercase font-bold tracking-wider">
                  Lưu Trữ Ảnh
                </span>
                <p className="font-bold text-blue-600 flex items-center gap-1">
                  <Cloud className="h-3.5 w-3.5" />
                  <span>Cloudinary CDN</span>
                </p>
                <p className="text-[11px] text-muted-foreground">
                  Magic Bytes Binary Validation
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
