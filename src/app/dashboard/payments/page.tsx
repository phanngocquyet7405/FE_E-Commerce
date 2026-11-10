"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  CreditCard,
  Search,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Clock,
  ArrowDownLeft,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
  FileText,
  Building,
  Download,
  Zap,
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
import { Label } from "@/components/ui/label";
import { Modal } from "@/components/ui/modal";
import { TableSkeletonRows } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import { formatCurrency, formatDate } from "@/utils/format";
import { exportToCsv } from "@/utils/exportCsv";
import adminPaymentApi from "@/api/adminPaymentApi";
import {
  AdminProcessTransactionRequest,
  PageResponse,
  SePayTransactionResponse,
  SePayTransactionStatus,
} from "@/types";

export default function AdminPaymentsPage() {
  const { success, error: toastError, info } = useToast();

  const [loading, setLoading] = useState<boolean>(true);
  const [transactionsData, setTransactionsData] = useState<
    PageResponse<SePayTransactionResponse>
  >({
    items: [],
    pageNo: 0,
    pageSize: 15,
    totalElements: 0,
    totalPages: 0,
    last: true,
  });

  // Bộ lọc
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [currentPage, setCurrentPage] = useState<number>(0);

  // Auto-refresh timer (30s)
  const [autoRefresh, setAutoRefresh] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number>(30);

  // Modal Xử lý đối soát thủ công
  const [processModalOpen, setProcessModalOpen] = useState<boolean>(false);
  const [selectedTx, setSelectedTx] = useState<SePayTransactionResponse | null>(null);
  const [processForm, setProcessForm] = useState<AdminProcessTransactionRequest>({
    note: "",
    action: "RESOLVED",
  });
  const [processing, setProcessing] = useState<boolean>(false);

  const fetchTransactions = useCallback(async (isSilent: boolean = false) => {
    if (!isSilent) setLoading(true);
    try {
      const res = await adminPaymentApi.getTransactions(
        statusFilter !== "ALL" ? (statusFilter as SePayTransactionStatus) : undefined,
        currentPage,
        15
      );
      if (res.data) {
        setTransactionsData(res.data);
      }
    } catch (err) {
      console.error("Lỗi tải giao dịch SePay:", err);
      if (!isSilent) toastError("Lỗi", "Không thể lấy danh sách giao dịch SePay.");
    } finally {
      if (!isSilent) setLoading(false);
    }
  }, [statusFilter, currentPage, toastError]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  // Bộ đếm Auto-Refresh Live Polling
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          fetchTransactions(true);
          return 30;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [autoRefresh, fetchTransactions]);

  const handleOpenProcessModal = (tx: SePayTransactionResponse) => {
    setSelectedTx(tx);
    setProcessForm({
      note: tx.adminNote || "Đã đối soát xác nhận chuyển khoản ngân hàng",
      action: "RESOLVED",
    });
    setProcessModalOpen(true);
  };

  const handleProcessTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTx) return;

    if (!processForm.note.trim()) {
      toastError("Thiếu ghi chú", "Vui lòng nhập ghi chú đối soát.");
      return;
    }

    setProcessing(true);
    try {
      await adminPaymentApi.processTransaction(selectedTx.id, processForm);
      success("Xử lý thành công", `Đã cập nhật trạng thái đối soát cho GD #${selectedTx.sepayId || selectedTx.id}`);
      setProcessModalOpen(false);
      fetchTransactions();
    } catch (err) {
      console.error("Lỗi xử lý giao dịch:", err);
      toastError("Thất bại", "Không thể xử lý giao dịch SePay.");
    } finally {
      setProcessing(false);
    }
  };

  // Xuất file CSV Giao dịch SePay
  const handleExportCsv = () => {
    if (transactionsData.items.length === 0) {
      toastError("Trống", "Không có giao dịch nào để xuất.");
      return;
    }

    const exportRows = transactionsData.items.map((tx) => ({
      sepayId: tx.sepayId || tx.id,
      gateway: tx.gateway || "MBBank",
      accountNumber: tx.accountNumber || "—",
      amountIn: tx.amountIn || 0,
      content: tx.content || "",
      orderCode: tx.orderCode || "Chưa gắn",
      status: tx.status,
      transactionDate: formatDate(tx.createdAt || tx.transactionDate || new Date().toISOString()),
      adminNote: tx.adminNote || "—",
    }));

    exportToCsv("So_Cai_Giao_Dich_SePay", exportRows, [
      { key: "sepayId", label: "Mã Giao Dịch SePay" },
      { key: "gateway", label: "Ngân Hàng" },
      { key: "accountNumber", label: "Số Tài Khoản" },
      { key: "amountIn", label: "Số Tiền Vào (VNĐ)" },
      { key: "content", label: "Nội Dung Chuyển Khoản" },
      { key: "orderCode", label: "Mã Đơn Hàng" },
      { key: "status", label: "Trạng Thái Đối Soát" },
      { key: "transactionDate", label: "Thời Gian Ghi Nhận" },
      { key: "adminNote", label: "Ghi Chú Admin" },
    ]);

    success("Xuất file thành công", "Đã tải xuống sổ cái giao dịch SePay.");
  };

  const formatTxStatus = (status: SePayTransactionStatus) => {
    switch (status) {
      case "MATCHED":
        return { label: "Khớp tự động", badge: "bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/20 dark:text-emerald-300" };
      case "PENDING":
        return { label: "Chờ đối soát", badge: "bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950/20 dark:text-amber-300" };
      case "UNMATCHED":
        return { label: "Chưa khớp đơn", badge: "bg-purple-50 text-purple-700 border-purple-300 dark:bg-purple-950/20 dark:text-purple-300" };
      case "EXPIRED":
        return { label: "Hết hạn", badge: "bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300" };
      case "FAILED":
      default:
        return { label: "Thất bại", badge: "bg-rose-50 text-rose-700 border-rose-300 dark:bg-rose-950/20 dark:text-rose-300" };
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
            <span>Đối Soát Giao Dịch VietQR SePay</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200">
              Webhook Active
            </span>
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Log biến động số dư ngân hàng theo thời gian thực và xử lý thủ công các giao dịch chuyển nhầm nội dung.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Nút bật tắt Live Auto-refresh */}
          <button
            onClick={() => {
              setAutoRefresh(!autoRefresh);
              setCountdown(30);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-all ${
              autoRefresh
                ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                : "bg-card text-muted-foreground border-border hover:bg-muted hover:text-foreground"
            }`}
            title="Tự động đồng bộ mỗi 30 giây"
          >
            <Zap className={`h-3.5 w-3.5 ${autoRefresh ? "animate-bounce text-amber-300" : ""}`} />
            <span>{autoRefresh ? `Tự động: ${countdown}s` : "Bật Live 30s"}</span>
          </button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCsv}
            className="border-input hover:bg-muted font-semibold text-xs flex items-center gap-1.5 h-9 rounded-xl"
            title="Tải sổ cái giao dịch SePay về máy"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Xuất Excel/CSV</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchTransactions()}
            disabled={loading}
            className="border-input hover:bg-muted font-semibold text-xs flex items-center gap-1.5 h-9 rounded-xl"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Làm mới</span>
          </Button>
        </div>
      </div>

      {/* FILTER TABS */}
      <div className="flex flex-wrap items-center gap-2">
        {["ALL", "MATCHED", "PENDING", "UNMATCHED", "FAILED"].map((st) => (
          <button
            key={st}
            onClick={() => {
              setStatusFilter(st);
              setCurrentPage(0);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
              statusFilter === st
                ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                : "bg-card text-muted-foreground border-border hover:bg-muted hover:text-foreground"
            }`}
          >
            {st === "ALL"
              ? "Tất cả giao dịch"
              : st === "MATCHED"
              ? "Đã khớp đơn"
              : st === "PENDING"
              ? "Chờ xử lý"
              : st === "UNMATCHED"
              ? "Chưa khớp mã đơn"
              : "Thất bại"}
          </button>
        ))}
      </div>

      {/* TABLE GIAO DỊCH */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mã GD SePay</TableHead>
                <TableHead>Ngân Hàng / STK</TableHead>
                <TableHead>Số Tiền Vào</TableHead>
                <TableHead>Nội Dung Chuyển Khoản</TableHead>
                <TableHead>Đơn Hàng Gán</TableHead>
                <TableHead>Trạng Thái</TableHead>
                <TableHead>Thời Gian</TableHead>
                <TableHead className="text-right">Đối Soát</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableSkeletonRows rows={5} cols={8} />
              ) : transactionsData.items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-12 text-xs text-muted-foreground">
                    Không có giao dịch nào phù hợp với bộ lọc.
                  </TableCell>
                </TableRow>
              ) : (
                transactionsData.items.map((tx) => {
                  const statusInfo = formatTxStatus(tx.status);

                  return (
                    <TableRow key={tx.id} className="hover:bg-muted/40 transition-colors">
                      <TableCell className="font-mono text-xs font-bold text-foreground">
                        #{tx.sepayId || tx.id.slice(-8)}
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center space-x-1.5 font-medium text-xs text-foreground">
                          <Building className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                          <span>{tx.gateway || "MBBank"}</span>
                        </div>
                        <div className="font-mono text-[11px] text-muted-foreground">
                          {tx.accountNumber || "—"}
                        </div>
                      </TableCell>

                      <TableCell className="font-bold text-xs text-emerald-600 whitespace-nowrap">
                        +{formatCurrency(tx.amountIn || 0)}
                      </TableCell>

                      <TableCell className="text-xs text-foreground max-w-xs truncate" title={tx.content}>
                        <span className="font-mono bg-muted/60 px-1.5 py-0.5 rounded text-[11px]">
                          {tx.content || "—"}
                        </span>
                      </TableCell>

                      <TableCell className="font-mono text-xs font-semibold text-indigo-600">
                        {tx.orderCode ? (
                          <span>{tx.orderCode}</span>
                        ) : tx.orderId ? (
                          <span className="truncate max-w-[100px] inline-block">{tx.orderId}</span>
                        ) : (
                          <span className="text-muted-foreground italic text-[11px]">Chưa gắn đơn</span>
                        )}
                      </TableCell>

                      <TableCell>
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${statusInfo.badge}`}
                        >
                          {statusInfo.label}
                        </span>
                      </TableCell>

                      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                        {formatDate(tx.createdAt || tx.transactionDate || new Date().toISOString())}
                      </TableCell>

                      <TableCell className="text-right whitespace-nowrap">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs px-2.5 rounded-lg text-indigo-600 hover:text-indigo-700"
                          onClick={() => handleOpenProcessModal(tx)}
                        >
                          Xử lý
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>

          {/* PHÂN TRANG */}
          {transactionsData.totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t">
              <span className="text-xs text-muted-foreground">
                Trang {transactionsData.pageNo + 1} / {transactionsData.totalPages} ({transactionsData.totalElements} giao dịch)
              </span>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={transactionsData.pageNo === 0}
                  onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                  className="h-8 text-xs rounded-lg"
                >
                  Trước
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={transactionsData.last}
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

      {/* MODAL XỬ LÝ ĐỐI SOÁT THỦ CÔNG */}
      <Modal
        isOpen={processModalOpen}
        onClose={() => setProcessModalOpen(false)}
        title="Đối Soát Giao Dịch Chuyển Khoản Thủ Công"
        description={selectedTx ? `Giao dịch SePay #${selectedTx.sepayId || selectedTx.id}` : ""}
        maxWidth="md"
      >
        {selectedTx && (
          <form onSubmit={handleProcessTransaction} className="space-y-4 text-xs">
            <div className="p-3 rounded-xl bg-muted/30 border space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Số tiền thực nhận:</span>
                <span className="font-bold text-emerald-600">+{formatCurrency(selectedTx.amountIn || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Nội dung khách CK:</span>
                <span className="font-mono text-foreground font-semibold">{selectedTx.content}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Đơn hàng hiện tại:</span>
                <span className="font-mono text-indigo-600 font-bold">{selectedTx.orderCode || "Chưa gắn"}</span>
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold">Hành Động Xử Lý</Label>
              <select
                value={processForm.action}
                onChange={(e) => setProcessForm({ ...processForm, action: e.target.value })}
                className="w-full h-9 px-3 text-xs rounded-xl border border-input bg-background focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
              >
                <option value="RESOLVED">Xác nhận khớp đơn thủ công (RESOLVED)</option>
                <option value="REFUNDED">Đã hoàn tiền lại cho khách (REFUNDED)</option>
                <option value="REJECTED">Từ chối / Giao dịch ảo (REJECTED)</option>
              </select>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold">Ghi Chú Của Quản Trị Viên (*)</Label>
              <textarea
                rows={3}
                placeholder="Ví dụ: Khách ghi thiếu mã đơn, đã xác minh SĐT và xác nhận khớp cho đơn ORD-..."
                value={processForm.note}
                onChange={(e) => setProcessForm({ ...processForm, note: e.target.value })}
                required
                className="w-full p-2.5 text-xs rounded-xl border border-input bg-background focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setProcessModalOpen(false)}
                className="h-8 text-xs rounded-xl"
              >
                Hủy
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={processing}
                className="bg-indigo-600 hover:bg-indigo-700 text-white h-8 text-xs rounded-xl px-4 font-semibold"
              >
                {processing ? "Đang xử lý..." : "Xác Nhận Đối Soát"}
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
