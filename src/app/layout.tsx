import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ShopDev E-Commerce | Mua Sắm Trực Tuyến Đẳng Cấp",
  description:
    "Hệ thống thương mại điện tử hiện đại xây dựng trên nền tảng Next.js 14 App Router, TypeScript, Tailwind CSS và Spring Boot 3 Backend.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body className="min-h-screen flex flex-col antialiased selection:bg-indigo-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
