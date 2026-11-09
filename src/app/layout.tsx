import type { Metadata } from "next";
import "./globals.css";
import { ToastProvider } from "@/components/ui/toast";

export const metadata: Metadata = {
  title: "ShopDev Admin Portal | Bảng Điều Khiển Quản Trị Hệ Thống",
  description:
    "Hệ thống quản trị thương mại điện tử chuyên nghiệp xây dựng trên Next.js 14 App Router, TypeScript, Tailwind CSS kết nối Spring Boot 3 & MongoDB.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body className="min-h-screen flex flex-col antialiased selection:bg-indigo-500 selection:text-white">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
