"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import Image from "next/image";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  RefreshCw,
  AlertTriangle,
  Upload,
  CheckCircle,
  EyeOff,
  Eye,
  Package,
  Layers,
  Image as ImageIcon,
  Download,
  X,
  Maximize2,
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
import adminProductApi, { AdminProductCriteria } from "@/api/adminProductApi";
import adminCategoryApi from "@/api/adminCategoryApi";
import adminBrandApi from "@/api/adminBrandApi";
import mediaApi from "@/api/mediaApi";
import { Brand, Category, PageResponse, Product, ProductRequest } from "@/types";

export default function AdminProductsPage() {
  const { success, error: toastError, info } = useToast();

  const [loading, setLoading] = useState<boolean>(true);
  const [productsData, setProductsData] = useState<PageResponse<Product>>({
    items: [],
    pageNo: 0,
    pageSize: 10,
    totalElements: 0,
    totalPages: 0,
    last: true,
  });

  // Bộ lọc
  const [keyword, setKeyword] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [selectedBrand, setSelectedBrand] = useState<string>("ALL");
  const [lowStockFilter, setLowStockFilter] = useState<boolean>(false);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [currentPage, setCurrentPage] = useState<number>(0);

  // Danh sách Categories & Brands nạp từ BE
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);

  // Modal Thêm / Sửa Sản phẩm
  const [formModalOpen, setFormModalOpen] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [uploadingImage, setUploadingImage] = useState<boolean>(false);
  const [uploadingGallery, setUploadingGallery] = useState<boolean>(false);

  // Modal Lightbox Phóng to ảnh
  const [lightboxOpen, setLightboxOpen] = useState<boolean>(false);
  const [lightboxImageUrl, setLightboxImageUrl] = useState<string>("");
  const [lightboxTitle, setLightboxTitle] = useState<string>("");

  // Form State
  const [formData, setFormData] = useState<ProductRequest>({
    sku: "",
    name: "",
    slug: "",
    description: "",
    price: 0,
    stockQuantity: 0,
    thumbnailUrl: "",
    images: [],
    categoryId: "",
    brandId: "",
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  // Tải danh mục và thương hiệu ban đầu
  useEffect(() => {
    async function loadMetadata() {
      try {
        const [catRes, brandRes] = await Promise.all([
          adminCategoryApi.getCategories(),
          adminBrandApi.getBrands(),
        ]);
        if (catRes.data) setCategories(catRes.data);
        if (brandRes.data) setBrands(brandRes.data);
      } catch (err) {
        console.warn("Lỗi tải danh mục / thương hiệu:", err);
      }
    }
    loadMetadata();
  }, []);

  // Tải danh sách sản phẩm
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const criteria: AdminProductCriteria = {
        keyword: keyword.trim() || undefined,
        categoryId: selectedCategory !== "ALL" ? selectedCategory : undefined,
        brandId: selectedBrand !== "ALL" ? selectedBrand : undefined,
        lowStock: lowStockFilter ? true : undefined,
        active:
          statusFilter === "ACTIVE"
            ? true
            : statusFilter === "INACTIVE"
            ? false
            : undefined,
        page: currentPage,
        size: 10,
        sortBy: "createdAt",
        sortDir: "desc",
      };

      const res = await adminProductApi.getProducts(criteria);
      if (res.data) {
        setProductsData(res.data);
      }
    } catch (err) {
      console.error("Lỗi khi tải sản phẩm:", err);
      toastError("Lỗi", "Không thể lấy danh sách sản phẩm từ database.");
    } finally {
      setLoading(false);
    }
  }, [keyword, selectedCategory, selectedBrand, lowStockFilter, statusFilter, currentPage, toastError]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Bật modal thêm mới
  const handleOpenCreateModal = () => {
    setEditingProduct(null);
    setFormData({
      sku: `PROD-${Date.now().toString().slice(-6)}`,
      name: "",
      slug: "",
      description: "",
      price: 100000,
      stockQuantity: 10,
      thumbnailUrl: "",
      images: [],
      categoryId: categories[0]?.id || "",
      brandId: brands[0]?.id || "",
    });
    setFormModalOpen(true);
  };

  // Bật modal chỉnh sửa
  const handleOpenEditModal = (prod: Product) => {
    setEditingProduct(prod);
    setFormData({
      sku: prod.sku,
      name: prod.name,
      slug: prod.slug,
      description: prod.description || "",
      price: prod.price,
      stockQuantity: prod.stockQuantity,
      thumbnailUrl: prod.thumbnailUrl || "",
      images: prod.images || [],
      categoryId: prod.categoryId,
      brandId: prod.brandId || "",
    });
    setFormModalOpen(true);
  };

  // Xem to ảnh Lightbox
  const handleOpenLightbox = (imageUrl: string, title: string) => {
    setLightboxImageUrl(imageUrl);
    setLightboxTitle(title);
    setLightboxOpen(true);
  };

  // Xử lý Upload ảnh Thumbnail
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const res = await mediaApi.uploadFile(file);
      if (res.data?.url) {
        setFormData((prev) => ({ ...prev, thumbnailUrl: res.data.url }));
        success("Tải ảnh thành công", "Ảnh đã được tải lên Cloudinary.");
      }
    } catch (err) {
      console.error("Lỗi tải ảnh:", err);
      toastError("Tải ảnh thất bại", "Chỉ hỗ trợ file ảnh định dạng JPG, PNG, WEBP.");
    } finally {
      setUploadingImage(false);
    }
  };

  // Xử lý Upload nhiều ảnh cho Gallery
  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingGallery(true);
    try {
      const fileList = Array.from(files);
      const res = await mediaApi.uploadMultipleFiles(fileList);
      if (res.data) {
        const newUrls = res.data.map((item) => item.url);
        setFormData((prev) => ({
          ...prev,
          images: [...(prev.images || []), ...newUrls],
        }));
        success("Tải album thành công", `Đã thêm ${newUrls.length} ảnh vào album sản phẩm.`);
      }
    } catch (err) {
      console.error("Lỗi upload gallery:", err);
      toastError("Thất bại", "Không thể tải lên album ảnh.");
    } finally {
      setUploadingGallery(false);
    }
  };

  // Xóa ảnh khỏi gallery
  const handleRemoveGalleryImage = (idxToRemove: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images?.filter((_, idx) => idx !== idxToRemove) || [],
    }));
  };

  // Tự sinh slug từ tên sản phẩm
  const handleNameChange = (name: string) => {
    const slug = name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[đĐ]/g, "d")
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-");

    setFormData((prev) => ({
      ...prev,
      name,
      slug: editingProduct ? prev.slug : slug,
    }));
  };

  // Lưu sản phẩm
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.sku.trim() || !formData.categoryId) {
      toastError("Thiếu thông tin", "Vui lòng nhập đầy đủ Tên, Mã SKU và Danh mục.");
      return;
    }

    setSubmitting(true);
    try {
      if (editingProduct) {
        await adminProductApi.updateProduct(editingProduct.id, formData);
        success("Cập nhật thành công", "Thông tin sản phẩm đã được lưu lại.");
      } else {
        await adminProductApi.createProduct(formData);
        success("Tạo mới thành công", "Sản phẩm đã được thêm vào cơ sở dữ liệu.");
      }
      setFormModalOpen(false);
      fetchProducts();
    } catch (err) {
      console.error("Lỗi lưu sản phẩm:", err);
      toastError("Thao tác thất bại", "Vui lòng kiểm tra lại dữ liệu và thử lại.");
    } finally {
      setSubmitting(false);
    }
  };

  // Bật / tắt trạng thái bán
  const handleToggleStatus = async (prod: Product) => {
    const newStatus = !prod.active;
    try {
      await adminProductApi.updateProductStatus(prod.id, newStatus);
      success("Đã cập nhật", `Sản phẩm "${prod.name}" đã ${newStatus ? "bật kinh doanh" : "tạm dừng bán"}.`);
      setProductsData((prev) => ({
        ...prev,
        items: prev.items.map((p) =>
          p.id === prod.id ? { ...p, active: newStatus } : p
        ),
      }));
    } catch (err) {
      console.error("Lỗi đổi trạng thái:", err);
      toastError("Lỗi", "Không thể thay đổi trạng thái sản phẩm.");
    }
  };

  // Vô hiệu hóa / Xóa mềm sản phẩm
  const handleDeleteProduct = async (prod: Product) => {
    if (!confirm(`Bạn có chắc muốn vô hiệu hóa sản phẩm "${prod.name}"?`)) {
      return;
    }
    try {
      await adminProductApi.deleteProduct(prod.id);
      success("Đã xóa", `Sản phẩm "${prod.name}" đã được chuyển vào thùng rác.`);
      fetchProducts();
    } catch (err) {
      console.error("Lỗi xóa sản phẩm:", err);
      toastError("Lỗi", "Không thể xóa sản phẩm.");
    }
  };

  // Xuất file CSV Kiểm kê kho hàng
  const handleExportCsv = () => {
    if (productsData.items.length === 0) {
      toastError("Trống", "Không có sản phẩm nào để xuất file.");
      return;
    }

    const exportRows = productsData.items.map((prod) => ({
      sku: prod.sku,
      name: prod.name,
      categoryName: prod.categoryName || "Chung",
      brandName: prod.brandName || "—",
      price: prod.price,
      stockQuantity: prod.stockQuantity,
      status: prod.active ? "Đang kinh doanh" : "Ngừng bán",
      createdAt: formatDate(prod.createdAt),
    }));

    exportToCsv("Kiem_Ke_Kho_Hang", exportRows, [
      { key: "sku", label: "Mã SKU" },
      { key: "name", label: "Tên Sản Phẩm" },
      { key: "categoryName", label: "Danh Mục" },
      { key: "brandName", label: "Thương Hiệu" },
      { key: "price", label: "Giá Niêm Yết (VNĐ)" },
      { key: "stockQuantity", label: "Tồn Kho Hiện Tại" },
      { key: "status", label: "Trạng Thái" },
      { key: "createdAt", label: "Ngày Tạo" },
    ]);

    success("Xuất file thành công", "Đã tải xuống danh sách kiểm kê kho hàng.");
  };

  return (
    <div className="space-y-6">
      {/* HEADER & THAO TÁC */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
            <span>Quản Lý Sản Phẩm & Kho Hàng</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-200">
              {productsData.totalElements} sản phẩm
            </span>
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Quản trị thông tin sản phẩm, cập nhật giá bán, kiểm soát số lượng tồn kho và upload ảnh Cloudinary.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCsv}
            className="border-input hover:bg-muted font-semibold text-xs flex items-center gap-1.5 h-9 rounded-xl"
            title="Tải danh sách kiểm kê kho hàng về máy"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Xuất Excel/CSV</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={fetchProducts}
            disabled={loading}
            className="border-input hover:bg-muted font-semibold text-xs flex items-center gap-1.5 h-9 rounded-xl"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Làm mới</span>
          </Button>

          <Button
            size="sm"
            onClick={handleOpenCreateModal}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs flex items-center gap-1.5 h-9 rounded-xl shadow-md shadow-indigo-600/20"
          >
            <Plus className="h-4 w-4" />
            <span>Thêm Sản Phẩm Mới</span>
          </Button>
        </div>
      </div>

      {/* THANH TÌM KIẾM & BỘ LỌC */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {/* Search Input */}
            <div className="lg:col-span-2 relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm theo tên sản phẩm, mã SKU..."
                value={keyword}
                onChange={(e) => {
                  setKeyword(e.target.value);
                  setCurrentPage(0);
                }}
                className="pl-9 h-9 text-xs rounded-xl"
              />
            </div>

            {/* Category Filter */}
            <div>
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setCurrentPage(0);
                }}
                className="w-full h-9 px-3 text-xs rounded-xl border border-input bg-background focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
              >
                <option value="ALL">Tất cả danh mục</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(0);
                }}
                className="w-full h-9 px-3 text-xs rounded-xl border border-input bg-background focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
              >
                <option value="ALL">Tất cả trạng thái</option>
                <option value="ACTIVE">Đang kinh doanh</option>
                <option value="INACTIVE">Ngừng bán (Ẩn)</option>
              </select>
            </div>

            {/* Low stock checkbox toggle */}
            <div className="flex items-center">
              <label className="flex items-center space-x-2 text-xs font-semibold text-rose-600 cursor-pointer bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 px-3 py-2 rounded-xl w-full">
                <input
                  type="checkbox"
                  checked={lowStockFilter}
                  onChange={(e) => {
                    setLowStockFilter(e.target.checked);
                    setCurrentPage(0);
                  }}
                  className="rounded text-rose-600 focus:ring-rose-500"
                />
                <span className="flex items-center gap-1">
                  <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                  <span>Sắp hết hàng (&le; 10)</span>
                </span>
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* BẢNG DỮ LIỆU SẢN PHẨM */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Sản Phẩm</TableHead>
                <TableHead>Mã SKU</TableHead>
                <TableHead>Danh Mục</TableHead>
                <TableHead>Giá Niêm Yết</TableHead>
                <TableHead>Tồn Kho</TableHead>
                <TableHead>Trạng Thái</TableHead>
                <TableHead className="text-right">Hành Động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableSkeletonRows rows={5} cols={7} />
              ) : productsData.items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-xs text-muted-foreground">
                    Không tìm thấy sản phẩm nào phù hợp.
                  </TableCell>
                </TableRow>
              ) : (
                productsData.items.map((prod) => (
                  <TableRow key={prod.id} className="hover:bg-muted/40 transition-colors">
                    {/* Cột Tên & Ảnh */}
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div
                          className="h-10 w-10 relative rounded-lg overflow-hidden bg-muted shrink-0 border cursor-pointer group"
                          onClick={() =>
                            handleOpenLightbox(
                              prod.thumbnailUrl ||
                                "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80",
                              prod.name
                            )
                          }
                          title="Click để phóng to ảnh"
                        >
                          <Image
                            src={
                              prod.thumbnailUrl ||
                              "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100&auto=format&fit=crop&q=80"
                            }
                            alt={prod.name}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform"
                          />
                          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white">
                            <Maximize2 className="h-3 w-3" />
                          </div>
                        </div>
                        <div className="min-w-0 max-w-xs">
                          <p className="font-semibold text-xs text-foreground truncate">
                            {prod.name}
                          </p>
                          <p className="text-[10px] text-muted-foreground truncate">
                            {prod.brandName ? `Hãng: ${prod.brandName}` : "Chính hãng"}
                          </p>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="font-mono text-xs font-semibold text-foreground">
                      {prod.sku}
                    </TableCell>

                    <TableCell className="text-xs text-muted-foreground">
                      {prod.categoryName || "Chung"}
                    </TableCell>

                    <TableCell className="font-bold text-xs text-foreground">
                      {formatCurrency(prod.price)}
                    </TableCell>

                    <TableCell>
                      <span
                        className={`font-bold text-xs inline-flex items-center gap-1 ${
                          prod.stockQuantity <= 10 ? "text-rose-600" : "text-foreground"
                        }`}
                      >
                        {prod.stockQuantity <= 10 && (
                          <AlertTriangle className="h-3.5 w-3.5 text-rose-500 shrink-0" />
                        )}
                        <span>{prod.stockQuantity} món</span>
                      </span>
                    </TableCell>

                    <TableCell>
                      <button
                        onClick={() => handleToggleStatus(prod)}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border transition-colors ${
                          prod.active
                            ? "bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-300"
                            : "bg-slate-100 text-slate-600 border-slate-300 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
                        }`}
                        title="Bấm để bật/tắt trạng thái"
                      >
                        {prod.active ? (
                          <>
                            <CheckCircle className="h-3 w-3 text-emerald-600" />
                            <span>Đang bán</span>
                          </>
                        ) : (
                          <>
                            <EyeOff className="h-3 w-3 text-slate-500" />
                            <span>Tạm dừng</span>
                          </>
                        )}
                      </button>
                    </TableCell>

                    <TableCell className="text-right whitespace-nowrap space-x-1.5">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs px-2 rounded-lg text-indigo-600 hover:text-indigo-700"
                        onClick={() => handleOpenEditModal(prod)}
                        title="Chỉnh sửa sản phẩm"
                      >
                        <Edit className="h-3.5 w-3.5 mr-1" />
                        Sửa
                      </Button>

                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 text-xs px-2 rounded-lg text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                        onClick={() => handleDeleteProduct(prod)}
                        title="Vô hiệu hóa sản phẩm"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* PHÂN TRANG */}
          {productsData.totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t">
              <span className="text-xs text-muted-foreground">
                Trang {productsData.pageNo + 1} / {productsData.totalPages} ({productsData.totalElements} sản phẩm)
              </span>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={productsData.pageNo === 0}
                  onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                  className="h-8 text-xs rounded-lg"
                >
                  Trước
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={productsData.last}
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

      {/* MODAL THÊM / CHỈNH SỬA SẢN PHẨM (KÈM MULTI-IMAGE GALLERY) */}
      <Modal
        isOpen={formModalOpen}
        onClose={() => setFormModalOpen(false)}
        title={editingProduct ? "Chỉnh Sửa Thông Tin Sản Phẩm" : "Thêm Sản Phẩm Mới Vào Kho"}
        description="Điền thông tin chi tiết và tải ảnh album lên Cloudinary."
        maxWidth="2xl"
      >
        <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Tên sản phẩm */}
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Tên Sản Phẩm (*)</Label>
              <Input
                placeholder="Ví dụ: iPhone 16 Pro Max 256GB"
                value={formData.name}
                onChange={(e) => handleNameChange(e.target.value)}
                required
                className="h-9 text-xs rounded-xl"
              />
            </div>

            {/* Mã SKU */}
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Mã SKU (*)</Label>
              <Input
                placeholder="IPHONE-16-PRO"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value.toUpperCase() })}
                required
                className="h-9 text-xs rounded-xl font-mono uppercase"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Giá bán VNĐ */}
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Giá Bán (VNĐ) (*)</Label>
              <Input
                type="number"
                min="0"
                step="1000"
                placeholder="34990000"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                required
                className="h-9 text-xs rounded-xl font-bold text-rose-600"
              />
            </div>

            {/* Số lượng tồn kho */}
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Tồn Kho Ban Đầu (*)</Label>
              <Input
                type="number"
                min="0"
                placeholder="50"
                value={formData.stockQuantity}
                onChange={(e) => setFormData({ ...formData, stockQuantity: Number(e.target.value) })}
                required
                className="h-9 text-xs rounded-xl font-semibold"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Danh mục */}
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Danh Mục Sản Phẩm (*)</Label>
              <select
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                required
                className="w-full h-9 px-3 text-xs rounded-xl border border-input bg-background focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
              >
                <option value="">-- Chọn danh mục --</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Thương hiệu */}
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Thương Hiệu</Label>
              <select
                value={formData.brandId}
                onChange={(e) => setFormData({ ...formData, brandId: e.target.value })}
                className="w-full h-9 px-3 text-xs rounded-xl border border-input bg-background focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
              >
                <option value="">-- Không có / Khác --</option>
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* UPLOAD ẢNH ĐẠI DIỆN THUMBNAIL */}
          <div className="space-y-1.5 p-3.5 rounded-xl border bg-muted/20">
            <Label className="text-xs font-semibold flex items-center justify-between">
              <span>Ảnh Bìa Chính (Thumbnail)</span>
              {uploadingImage && (
                <span className="text-[11px] text-indigo-600 font-medium animate-pulse flex items-center gap-1">
                  <RefreshCw className="h-3 w-3 animate-spin" />
                  Đang tải ảnh lên Cloudinary...
                </span>
              )}
            </Label>

            <div className="flex items-center gap-4">
              {formData.thumbnailUrl ? (
                <div className="relative h-16 w-16 rounded-xl overflow-hidden border bg-background shrink-0 shadow-sm">
                  <Image
                    src={formData.thumbnailUrl}
                    alt="Thumbnail preview"
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="h-16 w-16 rounded-xl border-2 border-dashed flex flex-col items-center justify-center text-muted-foreground shrink-0 bg-background">
                  <ImageIcon className="h-6 w-6 stroke-1" />
                </div>
              )}

              <div className="flex-1 space-y-2">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={uploadingImage}
                  onClick={() => fileInputRef.current?.click()}
                  className="h-8 text-xs rounded-xl gap-1.5"
                >
                  <Upload className="h-3.5 w-3.5" />
                  <span>Tải ảnh bìa mới</span>
                </Button>
                <Input
                  placeholder="Hoặc dán URL ảnh trực tiếp..."
                  value={formData.thumbnailUrl}
                  onChange={(e) => setFormData({ ...formData, thumbnailUrl: e.target.value })}
                  className="h-8 text-[11px] rounded-xl"
                />
              </div>
            </div>
          </div>

          {/* UPLOAD ALBUM GALLERY ẢNH CHI TIẾT */}
          <div className="space-y-2 p-3.5 rounded-xl border bg-muted/20">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold">
                Album Ảnh Chi Tiết ({formData.images?.length || 0})
              </Label>
              <input
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp"
                ref={galleryInputRef}
                onChange={handleGalleryUpload}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={uploadingGallery}
                onClick={() => galleryInputRef.current?.click()}
                className="h-7 text-xs rounded-lg gap-1"
              >
                <Upload className="h-3 w-3" />
                <span>{uploadingGallery ? "Đang tải album..." : "Thêm nhiều ảnh"}</span>
              </Button>
            </div>

            {/* Photo Grid */}
            {formData.images && formData.images.length > 0 ? (
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 pt-1">
                {formData.images.map((imgUrl, idx) => (
                  <div key={idx} className="relative h-16 rounded-lg overflow-hidden border group bg-background">
                    <Image src={imgUrl} alt="Gallery item" fill className="object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemoveGalleryImage(idx)}
                      className="absolute top-1 right-1 h-5 w-5 bg-rose-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                      title="Xóa ảnh này"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[11px] text-muted-foreground italic">
                Chưa có ảnh trong album chi tiết. Bấm &quot;Thêm nhiều ảnh&quot; để chọn các góc chụp sản phẩm.
              </p>
            )}
          </div>

          {/* Mô tả sản phẩm */}
          <div className="space-y-1">
            <Label className="text-xs font-semibold">Mô Tả Chi Tiết</Label>
            <textarea
              rows={3}
              placeholder="Nhập thông số kỹ thuật, mô tả nổi bật của sản phẩm..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full p-2.5 text-xs rounded-xl border border-input bg-background focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed"
            />
          </div>

          {/* Buttons Footer */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setFormModalOpen(false)}
              className="h-9 text-xs rounded-xl"
            >
              Hủy Bỏ
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={submitting || uploadingImage || uploadingGallery}
              className="bg-indigo-600 hover:bg-indigo-700 text-white h-9 text-xs rounded-xl px-5 font-semibold shadow-md shadow-indigo-600/20"
            >
              {submitting ? "Đang lưu..." : editingProduct ? "Lưu Thay Đổi" : "Tạo Sản Phẩm"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL LIGHTBOX PHÓNG TO ẢNH SẢN PHẨM */}
      <Modal
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        title={lightboxTitle || "Xem Ảnh Sản Phẩm Cận Cảnh"}
        maxWidth="lg"
      >
        <div className="relative w-full h-80 sm:h-96 rounded-xl overflow-hidden bg-muted flex items-center justify-center">
          {lightboxImageUrl && (
            <Image
              src={lightboxImageUrl}
              alt={lightboxTitle}
              fill
              className="object-contain"
            />
          )}
        </div>
      </Modal>
    </div>
  );
}
