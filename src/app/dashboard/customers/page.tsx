"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  Users,
  Search,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  Lock,
  Unlock,
  Mail,
  Phone,
  Calendar,
  CheckCircle2,
  XCircle,
  Eye,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { TableSkeletonRows } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import { formatCurrency, formatDate } from "@/utils/format";
import adminUserApi, { AdminUserCriteria } from "@/api/adminUserApi";
import { AdminUserResponse, PageResponse, RoleType } from "@/types";

export default function AdminUsersPage() {
  const { success, error: toastError, warning } = useToast();

  const [loading, setLoading] = useState<boolean>(true);
  const [usersData, setUsersData] = useState<PageResponse<AdminUserResponse>>({
    items: [],
    pageNo: 0,
    pageSize: 15,
    totalElements: 0,
    totalPages: 0,
    last: true,
  });

  // Bộ lọc
  const [keyword, setKeyword] = useState<string>("");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");
  const [activeFilter, setActiveFilter] = useState<string>("ALL");
  const [currentPage, setCurrentPage] = useState<number>(0);

  // Modal Phân quyền
  const [roleModalOpen, setRoleModalOpen] = useState<boolean>(false);
  const [selectedUser, setSelectedUser] = useState<AdminUserResponse | null>(null);
  const [targetRoles, setTargetRoles] = useState<RoleType[]>([]);
  const [updating, setUpdating] = useState<boolean>(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const criteria: AdminUserCriteria = {
        keyword: keyword.trim() || undefined,
        role: roleFilter !== "ALL" ? roleFilter : undefined,
        active:
          activeFilter === "ACTIVE"
            ? true
            : activeFilter === "BLOCKED"
            ? false
            : undefined,
        page: currentPage,
        size: 15,
        sortBy: "createdAt",
        sortDir: "desc",
      };

      const res = await adminUserApi.getUsers(criteria);
      if (res.data) {
        setUsersData(res.data);
      }
    } catch (err) {
      console.error("Lỗi khi tải danh sách người dùng:", err);
      toastError("Lỗi", "Không thể lấy danh sách người dùng từ database.");
    } finally {
      setLoading(false);
    }
  }, [keyword, roleFilter, activeFilter, currentPage, toastError]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Khóa / Mở khóa tài khoản
  const handleToggleStatus = async (user: AdminUserResponse) => {
    const newActive = !user.active;
    const actionText = newActive ? "Mở khóa" : "Khóa";

    if (!confirm(`Bạn có chắc chắn muốn ${actionText} tài khoản của "${user.fullName}" (${user.email})?`)) {
      return;
    }

    try {
      await adminUserApi.updateUserStatus(user.id, newActive);
      if (newActive) {
        success("Đã mở khóa", `Tài khoản ${user.email} đã được kích hoạt lại.`);
      } else {
        warning("Đã khóa tài khoản", `Tài khoản ${user.email} đã bị vô hiệu hóa đăng nhập.`);
      }
      setUsersData((prev) => ({
        ...prev,
        items: prev.items.map((u) =>
          u.id === user.id ? { ...u, active: newActive } : u
        ),
      }));
    } catch (err) {
      console.error("Lỗi cập nhật trạng thái user:", err);
      toastError("Lỗi", "Không thể cập nhật trạng thái người dùng.");
    }
  };

  // Mở modal phân quyền
  const handleOpenRoleModal = (user: AdminUserResponse) => {
    setSelectedUser(user);
    setTargetRoles([...user.roles]);
    setRoleModalOpen(true);
  };

  const handleSaveRoles = async () => {
    if (!selectedUser) return;
    setUpdating(true);
    try {
      await adminUserApi.updateUserRoles(selectedUser.id, targetRoles);
      success("Phân quyền thành công", `Đã cập nhật quyền hạn cho tài khoản ${selectedUser.email}.`);
      setRoleModalOpen(false);
      fetchUsers();
    } catch (err) {
      console.error("Lỗi phân quyền:", err);
      toastError("Thất bại", "Không thể cập nhật quyền hạn người dùng.");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
            <span>Quản Trị Người Dùng & Khách Hàng</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-200">
              {usersData.totalElements} tài khoản
            </span>
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Quản lý tài khoản khách hàng, kiểm soát quyền truy cập và phân quyền Quản trị viên.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={fetchUsers}
          disabled={loading}
          className="border-input hover:bg-muted font-semibold text-xs flex items-center gap-1.5 h-9 rounded-xl"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Làm mới</span>
        </Button>
      </div>

      {/* BỘ LỌC */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Search Input */}
            <div className="lg:col-span-2 relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm theo họ tên, email, số điện thoại..."
                value={keyword}
                onChange={(e) => {
                  setKeyword(e.target.value);
                  setCurrentPage(0);
                }}
                className="pl-9 h-9 text-xs rounded-xl"
              />
            </div>

            {/* Role Filter */}
            <div>
              <select
                value={roleFilter}
                onChange={(e) => {
                  setRoleFilter(e.target.value);
                  setCurrentPage(0);
                }}
                className="w-full h-9 px-3 text-xs rounded-xl border border-input bg-background focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
              >
                <option value="ALL">Tất cả vai trò</option>
                <option value="ROLE_CUSTOMER">Khách mua hàng (ROLE_CUSTOMER)</option>
                <option value="ROLE_ADMIN">Quản trị viên (ROLE_ADMIN)</option>
              </select>
            </div>

            {/* Active Filter */}
            <div>
              <select
                value={activeFilter}
                onChange={(e) => {
                  setActiveFilter(e.target.value);
                  setCurrentPage(0);
                }}
                className="w-full h-9 px-3 text-xs rounded-xl border border-input bg-background focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
              >
                <option value="ALL">Tất cả trạng thái</option>
                <option value="ACTIVE">Đang hoạt động</option>
                <option value="BLOCKED">Đang bị khóa</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* BẢNG NGƯỜI DÙNG */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Họ & Tên</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Số Điện Thoại</TableHead>
                <TableHead>Vai Trò (Role)</TableHead>
                <TableHead>Trạng Thái</TableHead>
                <TableHead>Ngày Đăng Ký</TableHead>
                <TableHead className="text-right">Hành Động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableSkeletonRows rows={5} cols={7} />
              ) : usersData.items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-xs text-muted-foreground">
                    Không tìm thấy người dùng nào phù hợp.
                  </TableCell>
                </TableRow>
              ) : (
                usersData.items.map((user) => {
                  const isAdmin =
                    user.roles?.includes("ROLE_ADMIN") ||
                    user.roles?.includes("ADMIN");

                  return (
                    <TableRow key={user.id} className="hover:bg-muted/40 transition-colors">
                      {/* Name with Avatar initials */}
                      <TableCell>
                        <div className="flex items-center space-x-2.5">
                          <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-sm">
                            {user.fullName ? user.fullName[0].toUpperCase() : "U"}
                          </div>
                          <div>
                            <p className="font-semibold text-xs text-foreground">
                              {user.fullName || "Chưa đặt tên"}
                            </p>
                            {user.emailVerified && (
                              <span className="text-[10px] text-emerald-600 flex items-center gap-0.5">
                                <CheckCircle2 className="h-3 w-3" /> Email đã xác thực
                              </span>
                            )}
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="font-mono text-xs text-foreground">
                        {user.email}
                      </TableCell>

                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {user.phone || "—"}
                      </TableCell>

                      {/* Roles */}
                      <TableCell>
                        <Badge
                          variant={isAdmin ? "default" : "secondary"}
                          className={`text-[10px] font-mono ${
                            isAdmin
                              ? "bg-indigo-600 text-white"
                              : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {isAdmin ? "ROLE_ADMIN" : "ROLE_CUSTOMER"}
                        </Badge>
                      </TableCell>

                      {/* Status */}
                      <TableCell>
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border ${
                            user.active
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-rose-50 text-rose-700 border-rose-200"
                          }`}
                        >
                          {user.active ? (
                            <>
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                              <span>Hoạt động</span>
                            </>
                          ) : (
                            <>
                              <span className="h-1.5 w-1.5 rounded-full bg-rose-500"></span>
                              <span>Đã khóa</span>
                            </>
                          )}
                        </span>
                      </TableCell>

                      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                        {formatDate(user.createdAt)}
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="text-right whitespace-nowrap space-x-1.5">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs px-2 rounded-lg text-indigo-600"
                          onClick={() => handleOpenRoleModal(user)}
                          title="Cấp quyền"
                        >
                          <ShieldCheck className="h-3.5 w-3.5 mr-1" />
                          Phân quyền
                        </Button>

                        <Button
                          size="sm"
                          variant="ghost"
                          className={`h-7 text-xs px-2 rounded-lg ${
                            user.active
                              ? "text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                              : "text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700"
                          }`}
                          onClick={() => handleToggleStatus(user)}
                          title={user.active ? "Khóa tài khoản" : "Mở khóa tài khoản"}
                        >
                          {user.active ? (
                            <>
                              <Lock className="h-3.5 w-3.5 mr-1" />
                              Khóa
                            </>
                          ) : (
                            <>
                              <Unlock className="h-3.5 w-3.5 mr-1" />
                              Mở khóa
                            </>
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>

          {/* PHÂN TRANG */}
          {usersData.totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t">
              <span className="text-xs text-muted-foreground">
                Trang {usersData.pageNo + 1} / {usersData.totalPages} ({usersData.totalElements} tài khoản)
              </span>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={usersData.pageNo === 0}
                  onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                  className="h-8 text-xs rounded-lg"
                >
                  Trước
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={usersData.last}
                  onClick={() => setCurrentPage((p) => p + 1)}
                  className="h-8 text-xs rounded-lg"
                >
                  Sau
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* MODAL PHÂN QUYỀN */}
      <Modal
        isOpen={roleModalOpen}
        onClose={() => setRoleModalOpen(false)}
        title="Cập Nhật Phân Quyền Tài Khoản"
        description={selectedUser ? `Cấp vai trò cho tài khoản: ${selectedUser.email}` : ""}
        maxWidth="md"
        footer={
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setRoleModalOpen(false)}
              className="h-8 text-xs rounded-xl"
            >
              Hủy
            </Button>
            <Button
              size="sm"
              disabled={updating}
              onClick={handleSaveRoles}
              className="bg-indigo-600 hover:bg-indigo-700 text-white h-8 text-xs rounded-xl px-4 font-semibold"
            >
              {updating ? "Đang lưu..." : "Xác Nhận Phân Quyền"}
            </Button>
          </div>
        }
      >
        <div className="space-y-4 text-xs">
          <p className="text-muted-foreground leading-relaxed">
            Chọn các vai trò áp dụng cho tài khoản này. Người có vai trò <strong>ROLE_ADMIN</strong> sẽ có toàn quyền truy cập vào Cổng Quản Trị này.
          </p>

          <div className="space-y-2 border p-3 rounded-xl bg-muted/20">
            <label className="flex items-start space-x-3 cursor-pointer p-2 rounded-lg hover:bg-muted/40">
              <input
                type="checkbox"
                checked={targetRoles.includes("ROLE_ADMIN")}
                onChange={(e) => {
                  if (e.target.checked) {
                    setTargetRoles([...targetRoles, "ROLE_ADMIN"]);
                  } else {
                    setTargetRoles(targetRoles.filter((r) => r !== "ROLE_ADMIN"));
                  }
                }}
                className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500"
              />
              <div>
                <p className="font-bold text-foreground">ROLE_ADMIN (Quản trị viên)</p>
                <p className="text-[11px] text-muted-foreground">
                  Toàn quyền quản lý Đơn hàng, Kho sản phẩm, Giao dịch SePay và Người dùng.
                </p>
              </div>
            </label>

            <label className="flex items-start space-x-3 cursor-pointer p-2 rounded-lg hover:bg-muted/40">
              <input
                type="checkbox"
                checked={targetRoles.includes("ROLE_CUSTOMER")}
                onChange={(e) => {
                  if (e.target.checked) {
                    setTargetRoles([...targetRoles, "ROLE_CUSTOMER"]);
                  } else {
                    setTargetRoles(targetRoles.filter((r) => r !== "ROLE_CUSTOMER"));
                  }
                }}
                className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500"
              />
              <div>
                <p className="font-bold text-foreground">ROLE_CUSTOMER (Khách mua hàng)</p>
                <p className="text-[11px] text-muted-foreground">
                  Chỉ có quyền mua sắm và theo dõi lịch sử đơn hàng của chính mình.
                </p>
              </div>
            </label>
          </div>
        </div>
      </Modal>
    </div>
  );
}
