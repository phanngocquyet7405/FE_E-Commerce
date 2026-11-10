import React from "react";
import Link from "next/link";
import { ShoppingBag, Mail, Phone, MapPin, Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t bg-muted/30 text-muted-foreground mt-auto">
      <div className="container mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* CỘT 1: THÔNG TIN THƯƠNG HIỆU */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold">
                <ShoppingBag className="h-4 w-4" />
              </div>
              <span className="font-bold text-lg text-foreground tracking-tight">
                ShopDev
              </span>
            </Link>
            <p className="text-sm leading-relaxed">
              Nền tảng thương mại điện tử hiện đại, cung cấp các sản phẩm công nghệ,
              thời trang và tiêu dùng chính hãng với trải nghiệm mượt mà nhất.
            </p>
            <div className="flex items-center space-x-3 text-xs">
              <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-medium">
                100% Chính Hãng
              </span>
              <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 font-medium">
                Giao Hàng Siêu Tốc
              </span>
            </div>
          </div>

          {/* CỘT 2: DANH MỤC PHỔ BIẾN */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-foreground uppercase tracking-wider">
              Danh Mục Sản Phẩm
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/?category=dien-thoai" className="hover:text-indigo-600 transition-colors">
                  Điện Thoại & Phụ Kiện
                </Link>
              </li>
              <li>
                <Link href="/?category=laptop" className="hover:text-indigo-600 transition-colors">
                  Laptop & Máy Tính Bảng
                </Link>
              </li>
              <li>
                <Link href="/?category=thoi-trang" className="hover:text-indigo-600 transition-colors">
                  Thời Trang Nam Nữ
                </Link>
              </li>
              <li>
                <Link href="/?category=gia-dung" className="hover:text-indigo-600 transition-colors">
                  Đồ Gia Dụng Thông Minh
                </Link>
              </li>
            </ul>
          </div>

          {/* CỘT 3: HỖ TRỢ KHÁCH HÀNG */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-foreground uppercase tracking-wider">
              Hỗ Trợ Khách Hàng
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/faq" className="hover:text-indigo-600 transition-colors">
                  Câu hỏi thường gặp (FAQ)
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="hover:text-indigo-600 transition-colors">
                  Chính sách vận chuyển
                </Link>
              </li>
              <li>
                <Link href="/returns" className="hover:text-indigo-600 transition-colors">
                  Chính sách đổi trả 30 ngày
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-indigo-600 transition-colors">
                  Điều khoản dịch vụ & Bảo mật
                </Link>
              </li>
            </ul>
          </div>

          {/* CỘT 4: LIÊN HỆ */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-foreground uppercase tracking-wider">
              Thông Tin Liên Hệ
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-indigo-600 shrink-0" />
                <span>Tòa nhà Innovation, Khu Công Nghệ Cao, Hà Nội</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-indigo-600 shrink-0" />
                <span>Hotline: 1900 6868 (8:00 - 21:00)</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-indigo-600 shrink-0" />
                <span>support@shopdev.vn</span>
              </div>
            </div>
          </div>
        </div>

        {/* BẢN QUYỀN */}
        <div className="border-t mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-muted-foreground gap-4">
          <p>© {new Date().getFullYear()} ShopDev E-Commerce. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Thiết kế & phát triển với <Heart className="h-3 w-3 text-rose-500 fill-rose-500" /> bởi Senior Full-stack Team
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
