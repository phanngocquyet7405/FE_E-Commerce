"use client";

import React, { useRef } from "react";
import { Printer, X, ShoppingBag, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Order } from "@/types";
import { formatCurrency, formatDate } from "@/utils/format";

interface InvoicePrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
}

export function InvoicePrintModal({
  isOpen,
  onClose,
  order,
}: InvoicePrintModalProps) {
  const printAreaRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !order) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 print:p-0">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-background/80 backdrop-blur-sm print:hidden"
        onClick={onClose}
      />

      {/* Container */}
      <div className="relative w-full max-w-2xl bg-card rounded-2xl border shadow-2xl z-10 flex flex-col max-h-[92vh] overflow-hidden print:max-h-none print:border-none print:shadow-none print:rounded-none print:w-full">
        {/* Modal Actions (Hidden when printing) */}
        <div className="flex items-center justify-between px-6 py-3.5 border-b shrink-0 print:hidden bg-muted/40">
          <div className="flex items-center space-x-2">
            <Printer className="h-4 w-4 text-indigo-600" />
            <span className="text-xs font-bold text-foreground">
              Xem Trước Phiếu Giao Hàng & Hóa Đơn
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              size="sm"
              onClick={handlePrint}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs h-8 rounded-xl font-semibold gap-1.5 shadow-md shadow-indigo-600/20"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>In Phiếu Ngay</span>
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={onClose}
              className="h-8 w-8 p-0 rounded-xl"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* PRINTABLE BODY */}
        <div
          ref={printAreaRef}
          className="p-6 sm:p-8 overflow-y-auto space-y-6 text-foreground bg-white dark:bg-card print:p-0 print:overflow-visible print:bg-white print:text-black"
        >
          {/* Header phiếu */}
          <div className="flex justify-between items-start border-b pb-5">
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold">
                  <ShoppingBag className="h-4 w-4" />
                </div>
                <h2 className="text-xl font-extrabold tracking-tight text-foreground print:text-black">
                  ShopDev E-Commerce
                </h2>
              </div>
              <p className="text-[11px] text-muted-foreground print:text-gray-600">
                Kho Tổng: Tòa nhà FPT Tower, Cầu Giấy, Hà Nội
              </p>
              <p className="text-[11px] text-muted-foreground print:text-gray-600">
                Hotline hỗ trợ: 1900 6868 | Website: shopdev.vn
              </p>
            </div>

            <div className="text-right">
              <h3 className="text-base font-extrabold tracking-tight uppercase text-indigo-600 print:text-black">
                Phiếu Giao Hàng & Hóa Đơn
              </h3>
              <p className="font-mono text-xs font-bold text-foreground print:text-black mt-0.5">
                {order.orderCode}
              </p>
              <p className="text-[10px] text-muted-foreground print:text-gray-500 mt-1">
                Ngày đặt: {formatDate(order.createdAt)}
              </p>
              {/* Giả lập Barcode bằng CSS font-mono */}
              <div className="mt-2 inline-block border border-dashed border-gray-400 px-2 py-1 bg-gray-50 rounded">
                <span className="font-mono tracking-[0.25em] text-[10px] font-bold">
                  *{order.orderCode}*
                </span>
              </div>
            </div>
          </div>

          {/* Người gửi - Người nhận */}
          <div className="grid grid-cols-2 gap-6 text-xs">
            <div className="p-3 rounded-xl bg-muted/30 border print:border-gray-300 print:bg-transparent">
              <p className="font-bold text-[11px] text-indigo-600 print:text-black uppercase tracking-wider mb-1">
                Người Gửi (Shop)
              </p>
              <p className="font-semibold">ShopDev Fulfillment Center</p>
              <p className="text-muted-foreground print:text-gray-600">SĐT: 0988.123.456</p>
              <p className="text-muted-foreground print:text-gray-600">Dịch Vọng Hậu, Cầu Giấy, Hà Nội</p>
            </div>

            <div className="p-3 rounded-xl bg-muted/30 border print:border-gray-300 print:bg-transparent">
              <p className="font-bold text-[11px] text-indigo-600 print:text-black uppercase tracking-wider mb-1">
                Người Nhận (Khách Hàng)
              </p>
              <p className="font-semibold">{order.customerName}</p>
              <p className="text-muted-foreground print:text-gray-600 font-mono">SĐT: {order.customerPhone}</p>
              <p className="text-muted-foreground print:text-gray-600">
                {order.shippingAddress?.streetAddress},{" "}
                {order.shippingAddress?.ward ? `${order.shippingAddress.ward}, ` : ""}
                {order.shippingAddress?.district ? `${order.shippingAddress.district}, ` : ""}
                {order.shippingAddress?.city}
              </p>
            </div>
          </div>

          {/* Bảng sản phẩm */}
          <div className="border rounded-xl overflow-hidden print:border-gray-400">
            <table className="w-full text-xs text-left">
              <thead className="bg-muted/50 border-b print:bg-gray-100 print:border-gray-400">
                <tr>
                  <th className="p-2.5 font-bold">STT</th>
                  <th className="p-2.5 font-bold">Tên Sản Phẩm</th>
                  <th className="p-2.5 font-bold text-center">SL</th>
                  <th className="p-2.5 font-bold text-right">Đơn Giá</th>
                  <th className="p-2.5 font-bold text-right">Thành Tiền</th>
                </tr>
              </thead>
              <tbody className="divide-y print:divide-gray-300">
                {order.items?.map((item, idx) => (
                  <tr key={idx}>
                    <td className="p-2.5 text-muted-foreground text-center w-10">
                      {idx + 1}
                    </td>
                    <td className="p-2.5 font-medium">
                      <p className="text-foreground print:text-black font-semibold">
                        {item.productName}
                      </p>
                      <p className="font-mono text-[10px] text-muted-foreground print:text-gray-500">
                        SKU: {item.productSku || "—"}
                      </p>
                    </td>
                    <td className="p-2.5 text-center font-bold">{item.quantity}</td>
                    <td className="p-2.5 text-right">{formatCurrency(item.unitPrice)}</td>
                    <td className="p-2.5 text-right font-bold text-foreground print:text-black">
                      {formatCurrency(item.subtotal)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Thanh toán & Tiền thu hộ COD */}
          <div className="flex justify-between items-start text-xs pt-1">
            <div className="max-w-xs space-y-1">
              <p>
                <strong>Hình thức thanh toán:</strong>{" "}
                <span className="font-mono font-bold">{order.paymentMethod}</span>
              </p>
              <p>
                <strong>Trạng thái:</strong> {order.status}
              </p>
              {order.note && (
                <p className="text-[11px] text-muted-foreground italic print:text-gray-600">
                  Ghi chú giao hàng: &quot;{order.note}&quot;
                </p>
              )}
            </div>

            <div className="w-56 space-y-1 text-right">
              <div className="flex justify-between text-muted-foreground print:text-gray-600">
                <span>Tiền hàng:</span>
                <span>{formatCurrency(order.totalAmount)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground print:text-gray-600">
                <span>Cước vận chuyển:</span>
                <span>{formatCurrency(order.shippingFee || 0)}</span>
              </div>
              <div className="flex justify-between font-extrabold text-sm border-t pt-1.5 text-rose-600 print:text-black">
                <span>
                  {order.paymentMethod === "COD" ? "TIỀN THU HỘ (COD):" : "TỔNG THANH TOÁN:"}
                </span>
                <span>{formatCurrency(order.finalAmount || order.totalAmount)}</span>
              </div>
            </div>
          </div>

          {/* Chữ ký xác nhận */}
          <div className="grid grid-cols-2 gap-8 text-center text-xs pt-8 border-t print:pt-6">
            <div>
              <p className="font-bold text-foreground print:text-black">Người Giao Hàng</p>
              <p className="text-[10px] text-muted-foreground italic mt-0.5">(Ký và ghi rõ họ tên)</p>
              <div className="h-16"></div>
            </div>

            <div>
              <p className="font-bold text-foreground print:text-black">Người Nhận Hàng</p>
              <p className="text-[10px] text-muted-foreground italic mt-0.5">(Đã kiểm tra nguyên vẹn bưu phẩm)</p>
              <div className="h-16"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default InvoicePrintModal;
