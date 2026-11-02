"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Sparkles,
  ShoppingBag,
  ShieldCheck,
  Truck,
  RotateCcw,
  Zap,
  ArrowRight,
  Star,
  CheckCircle2,
} from "lucide-react";
import Header from "@/components/shared/Header";
import Footer from "@/components/shared/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { formatCurrency } from "@/utils/format";
import { Product } from "@/types";
import adminApi from "@/api/adminApi";

// Dữ liệu sản phẩm mẫu dự phòng chất lượng cao khi backend chưa seed hoặc đang cold-start
const FALLBACK_PRODUCTS: Product[] = [
  {
    id: "prod-1",
    sku: "IPHONE-16-PRO",
    name: "iPhone 16 Pro Max 256GB - Titan Tự Nhiên",
    slug: "iphone-16-pro-max-256gb",
    description: "Chip A18 Pro đột phá, camera điều khiển chuyên nghiệp, thời lượng pin cả ngày.",
    price: 34990000,
    stockQuantity: 45,
    thumbnailUrl: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&auto=format&fit=crop&q=80",
    images: [],
    active: true,
    categoryId: "cat-phone",
    categoryName: "Điện thoại",
    brandName: "Apple",
    createdAt: new Date().toISOString(),
  },
  {
    id: "prod-2",
    sku: "MBP-M3-PRO",
    name: "MacBook Pro 14 inch M3 Pro (18GB / 512GB SSD)",
    slug: "macbook-pro-14-m3-pro",
    description: "Màn hình Liquid Retina XDR đỉnh cao, hiệu năng đồ họa cực mạnh mẽ.",
    price: 49990000,
    stockQuantity: 20,
    thumbnailUrl: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80",
    images: [],
    active: true,
    categoryId: "cat-laptop",
    categoryName: "Laptop",
    brandName: "Apple",
    createdAt: new Date().toISOString(),
  },
  {
    id: "prod-3",
    sku: "SONY-WH1000XM5",
    name: "Tai nghe chống ồn không dây Sony WH-1000XM5",
    slug: "tai-nghe-sony-wh-1000xm5",
    description: "Chống ồn thông minh hàng đầu, thời lượng pin 30 giờ, âm thanh Hi-Res Audio.",
    price: 7990000,
    stockQuantity: 60,
    thumbnailUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80",
    images: [],
    active: true,
    categoryId: "cat-audio",
    categoryName: "Phụ kiện âm thanh",
    brandName: "Sony",
    createdAt: new Date().toISOString(),
  },
  {
    id: "prod-4",
    sku: "AW-SERIES-10",
    name: "Đồng hồ Apple Watch Series 10 GPS 46mm Nhôm",
    slug: "apple-watch-series-10",
    description: "Màn hình OLED góc nhìn rộng, thiết kế mỏng nhẹ hơn, sạc nhanh ấn tượng.",
    price: 11490000,
    stockQuantity: 35,
    thumbnailUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80",
    images: [],
    active: true,
    categoryId: "cat-watch",
    categoryName: "Đồng hồ thông minh",
    brandName: "Apple",
    createdAt: new Date().toISOString(),
  },
  {
    id: "prod-5",
    sku: "SAMS-S24-ULTRA",
    name: "Samsung Galaxy S24 Ultra 5G 12GB/256GB",
    slug: "samsung-galaxy-s24-ultra",
    description: "Quyền năng Galaxy AI, khung viền Titan bền bỉ, camera 200MP thu phóng vượt trội.",
    price: 29990000,
    stockQuantity: 28,
    thumbnailUrl: "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800&auto=format&fit=crop&q=80",
    images: [],
    active: true,
    categoryId: "cat-phone",
    categoryName: "Điện thoại",
    brandName: "Samsung",
    createdAt: new Date().toISOString(),
  },
  {
    id: "prod-6",
    sku: "IPAD-AIR-M2",
    name: "iPad Air 11 inch M2 Wi-Fi 128GB",
    slug: "ipad-air-11-m2-wifi",
    description: "Sức mạnh từ chip Apple M2, hỗ trợ Apple Pencil Pro, thiết kế siêu mỏng nhẹ.",
    price: 16490000,
    stockQuantity: 40,
    thumbnailUrl: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&auto=format&fit=crop&q=80",
    images: [],
    active: true,
    categoryId: "cat-tablet",
    categoryName: "Máy tính bảng",
    brandName: "Apple",
    createdAt: new Date().toISOString(),
  },
];

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>(FALLBACK_PRODUCTS);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");

  useEffect(() => {
    async function loadProducts() {
      try {
        const res = await adminApi.getProducts(0, 8);
        if (res?.data?.items && res.data.items.length > 0) {
          setProducts(res.data.items);
        }
      } catch (error) {
        console.warn("Dùng danh sách sản phẩm fallback giao diện:", error);
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, []);

  const categories = [
    { id: "ALL", label: "Tất cả sản phẩm" },
    { id: "Điện thoại", label: "Điện thoại" },
    { id: "Laptop", label: "Laptop" },
    { id: "Phụ kiện âm thanh", label: "Âm thanh" },
    { id: "Đồng hồ thông minh", label: "Smartwatch" },
  ];

  const filteredProducts =
    selectedCategory === "ALL"
      ? products
      : products.filter(
          (p) =>
            p.categoryName?.toLowerCase() === selectedCategory.toLowerCase()
        );

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* 1. HEADER */}
      <Header />

      {/* 2. HERO BANNER SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-indigo-50/70 via-background to-background py-16 sm:py-24 border-b">
        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-xs font-semibold tracking-wide">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Siêu Phẩm Công Nghệ Mới Nhất 2026</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground leading-[1.15]">
                Nâng Tầm Trải Nghiệm{" "}
                <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 bg-clip-text text-transparent">
                  Mua Sắm Số
                </span>
              </h1>

              <p className="text-base sm:text-lg text-muted-foreground max-w-xl mx-auto lg:mx-0 leading-relaxed">
                Khám phá hàng ngàn sản phẩm công nghệ, phụ kiện cao cấp chính hãng
                với mức giá ưu đãi nhất cùng chính sách bảo hành 1 đổi 1 trong 30 ngày.
              </p>

              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
                <Button
                  size="lg"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/25 px-8 font-semibold flex items-center gap-2"
                >
                  <ShoppingBag className="h-5 w-5" />
                  <span>Mua Sắm Ngay</span>
                </Button>
                <Link href="/dashboard">
                  <Button
                    variant="outline"
                    size="lg"
                    className="border-indigo-200 text-indigo-700 hover:bg-indigo-50 font-semibold flex items-center gap-2"
                  >
                    <span>Vào Trang Quản Trị</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>

              {/* Badges / Trust proofs */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t max-w-lg mx-auto lg:mx-0">
                <div>
                  <h4 className="font-bold text-xl text-foreground">50k+</h4>
                  <p className="text-xs text-muted-foreground">Khách hàng tin dùng</p>
                </div>
                <div>
                  <h4 className="font-bold text-xl text-foreground">100%</h4>
                  <p className="text-xs text-muted-foreground">Chính hãng nguồn gốc</p>
                </div>
                <div>
                  <h4 className="font-bold text-xl text-foreground">4.9 / 5</h4>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 justify-center lg:justify-start">
                    <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                    Đánh giá xuất sắc
                  </p>
                </div>
              </div>
            </div>

            {/* Right Hero Image Card */}
            <div className="relative mx-auto lg:ml-auto w-full max-w-md">
              <div className="relative rounded-2xl overflow-hidden border bg-card p-3 shadow-2xl">
                <div className="aspect-[4/3] relative rounded-xl overflow-hidden bg-muted">
                  <Image
                    src="https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&auto=format&fit=crop&q=80"
                    alt="iPhone 16 Pro Max Banner"
                    fill
                    className="object-cover hover:scale-105 transition-transform duration-500"
                    priority
                  />
                  <div className="absolute top-3 left-3">
                    <Badge className="bg-rose-500 text-white font-bold px-3 py-1 text-xs">
                      HOT SALE -20%
                    </Badge>
                  </div>
                </div>

                <div className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">
                      Flagship Mới Ra Mắt
                    </span>
                    <span className="text-xs text-muted-foreground">Còn 45 máy</span>
                  </div>
                  <h3 className="font-bold text-lg text-foreground truncate">
                    iPhone 16 Pro Max 256GB Titan
                  </h3>
                  <div className="flex items-center justify-between pt-1">
                    <div>
                      <span className="text-xl font-black text-rose-600">
                        {formatCurrency(34990000)}
                      </span>
                      <span className="ml-2 text-xs text-muted-foreground line-through">
                        {formatCurrency(38990000)}
                      </span>
                    </div>
                    <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white">
                      Chi tiết
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. VALUE PROPOSITIONS (FEATURES) */}
      <section className="border-b py-8 bg-muted/20">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="flex items-center space-x-3.5">
              <div className="h-11 w-11 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                <Truck className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-foreground">Giao Hàng Miễn Phí</h4>
                <p className="text-xs text-muted-foreground">Đơn hàng từ 500k toàn quốc</p>
              </div>
            </div>

            <div className="flex items-center space-x-3.5">
              <div className="h-11 w-11 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-foreground">100% Chính Hãng</h4>
                <p className="text-xs text-muted-foreground">Cam kết hoàn tiền gấp đôi</p>
              </div>
            </div>

            <div className="flex items-center space-x-3.5">
              <div className="h-11 w-11 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                <RotateCcw className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-foreground">Đổi Trả Trong 30 Ngày</h4>
                <p className="text-xs text-muted-foreground">Thủ tục nhanh chóng, tiện lợi</p>
              </div>
            </div>

            <div className="flex items-center space-x-3.5">
              <div className="h-11 w-11 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                <Zap className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-foreground">Hỗ Trợ 24/7</h4>
                <p className="text-xs text-muted-foreground">Đội ngũ kỹ thuật tận tâm</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. PRODUCT GRID SECTION */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 space-y-8">
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2 text-indigo-600 text-xs font-bold uppercase tracking-wider mb-1">
                <Zap className="h-4 w-4" />
                <span>Danh Mục Nổi Bật</span>
              </div>
              <h2 className="text-3xl font-extrabold tracking-tight text-foreground">
                Sản Phẩm Bán Chạy Nhất
              </h2>
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                    selectedCategory === cat.id
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Grid Products */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <Card
                key={product.id}
                className="overflow-hidden group hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  {/* Thumbnail */}
                  <div className="aspect-[4/3] relative overflow-hidden bg-muted">
                    <Image
                      src={
                        product.thumbnailUrl ||
                        "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80"
                      }
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-2.5 right-2.5">
                      <Badge
                        variant="secondary"
                        className="bg-white/90 backdrop-blur text-foreground font-semibold text-[11px] shadow-sm"
                      >
                        {product.brandName || "ShopDev"}
                      </Badge>
                    </div>
                  </div>

                  {/* Body Info */}
                  <CardContent className="p-5 space-y-2">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{product.categoryName || "Công nghệ"}</span>
                      <span className="flex items-center text-emerald-600 font-medium">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Còn {product.stockQuantity} món
                      </span>
                    </div>

                    <h3
                      className="font-bold text-base text-foreground line-clamp-2 leading-snug group-hover:text-indigo-600 transition-colors"
                      title={product.name}
                    >
                      {product.name}
                    </h3>

                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {product.description}
                    </p>
                  </CardContent>
                </div>

                {/* Footer with Price & Action */}
                <CardFooter className="p-5 pt-0 flex items-center justify-between border-t mt-2">
                  <div className="pt-3">
                    <span className="text-xs text-muted-foreground block">Giá bán:</span>
                    <span className="text-lg font-black text-rose-600">
                      {formatCurrency(product.price)}
                    </span>
                  </div>
                  <div className="pt-3">
                    <Button
                      size="sm"
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium flex items-center gap-1.5 shadow-sm"
                    >
                      <ShoppingBag className="h-4 w-4" />
                      <span>Mua ngay</span>
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 5. FOOTER */}
      <Footer />
    </div>
  );
}
