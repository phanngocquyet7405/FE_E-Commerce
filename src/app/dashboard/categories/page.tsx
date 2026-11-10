"use client";

import React, { useEffect, useState, useRef } from "react";
import Image from "next/image";
import {
  Layers,
  Award,
  Plus,
  Edit,
  Trash2,
  RefreshCw,
  Upload,
  Search,
  CheckCircle,
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Modal } from "@/components/ui/modal";
import { TableSkeletonRows } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import adminCategoryApi from "@/api/adminCategoryApi";
import adminBrandApi from "@/api/adminBrandApi";
import mediaApi from "@/api/mediaApi";
import { Brand, BrandRequest, Category, CategoryRequest } from "@/types";

export default function AdminCategoriesBrandsPage() {
  const { success, error: toastError } = useToast();

  const [activeTab, setActiveTab] = useState<"categories" | "brands">("categories");
  const [loading, setLoading] = useState<boolean>(true);

  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Modal Category
  const [catModalOpen, setCatModalOpen] = useState<boolean>(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [catForm, setCatForm] = useState<CategoryRequest>({ name: "", description: "" });

  // Modal Brand
  const [brandModalOpen, setBrandModalOpen] = useState<boolean>(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [brandForm, setBrandForm] = useState<BrandRequest>({ name: "", description: "", logoUrl: "" });
  const [uploadingLogo, setUploadingLogo] = useState<boolean>(false);

  const [submitting, setSubmitting] = useState<boolean>(false);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [catRes, brandRes] = await Promise.all([
        adminCategoryApi.getCategories(),
        adminBrandApi.getBrands(),
      ]);
      if (catRes.data) setCategories(catRes.data);
      if (brandRes.data) setBrands(brandRes.data);
    } catch (err) {
      console.error("Lỗi khi tải danh mục / thương hiệu:", err);
      toastError("Lỗi kết nối", "Không thể lấy dữ liệu danh mục & thương hiệu.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // CATEGORY HANDLERS
  const handleOpenCatCreate = () => {
    setEditingCategory(null);
    setCatForm({ name: "", description: "" });
    setCatModalOpen(true);
  };

  const handleOpenCatEdit = (cat: Category) => {
    setEditingCategory(cat);
    setCatForm({ name: cat.name, description: cat.description || "" });
    setCatModalOpen(true);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catForm.name.trim()) {
      toastError("Thiếu tên", "Vui lòng nhập tên danh mục.");
      return;
    }

    setSubmitting(true);
    try {
      if (editingCategory) {
        await adminCategoryApi.updateCategory(editingCategory.id, catForm);
        success("Đã cập nhật", `Danh mục "${catForm.name}" đã được lưu.`);
      } else {
        await adminCategoryApi.createCategory(catForm);
        success("Tạo mới thành công", `Danh mục "${catForm.name}" đã được thêm.`);
      }
      setCatModalOpen(false);
      fetchData();
    } catch (err) {
      console.error("Lỗi lưu danh mục:", err);
      toastError("Lỗi", "Không thể lưu danh mục.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCategory = async (cat: Category) => {
    if (!confirm(`Bạn có chắc muốn xóa danh mục "${cat.name}"?`)) return;
    try {
      await adminCategoryApi.deleteCategory(cat.id);
      success("Đã xóa", `Danh mục "${cat.name}" đã được xóa.`);
      fetchData();
    } catch (err) {
      console.error("Lỗi xóa danh mục:", err);
      toastError("Lỗi", "Không thể xóa danh mục.");
    }
  };

  // BRAND HANDLERS
  const handleOpenBrandCreate = () => {
    setEditingBrand(null);
    setBrandForm({ name: "", description: "", logoUrl: "" });
    setBrandModalOpen(true);
  };

  const handleOpenBrandEdit = (brand: Brand) => {
    setEditingBrand(brand);
    setBrandForm({
      name: brand.name,
      description: brand.description || "",
      logoUrl: brand.logoUrl || "",
    });
    setBrandModalOpen(true);
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingLogo(true);
    try {
      const res = await mediaApi.uploadFile(file);
      if (res.data?.url) {
        setBrandForm((prev) => ({ ...prev, logoUrl: res.data.url }));
        success("Tải logo thành công", "Logo đã được tải lên Cloudinary.");
      }
    } catch (err) {
      console.error("Lỗi tải logo:", err);
      toastError("Lỗi", "Tải logo thất bại.");
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleSaveBrand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!brandForm.name.trim()) {
      toastError("Thiếu tên", "Vui lòng nhập tên thương hiệu.");
      return;
    }

    setSubmitting(true);
    try {
      if (editingBrand) {
        await adminBrandApi.updateBrand(editingBrand.id, brandForm);
        success("Đã cập nhật", `Thương hiệu "${brandForm.name}" đã được lưu.`);
      } else {
        await adminBrandApi.createBrand(brandForm);
        success("Tạo mới thành công", `Thương hiệu "${brandForm.name}" đã được thêm.`);
      }
      setBrandModalOpen(false);
      fetchData();
    } catch (err) {
      console.error("Lỗi lưu thương hiệu:", err);
      toastError("Lỗi", "Không thể lưu thương hiệu.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteBrand = async (brand: Brand) => {
    if (!confirm(`Bạn có chắc muốn xóa thương hiệu "${brand.name}"?`)) return;
    try {
      await adminBrandApi.deleteBrand(brand.id);
      success("Đã xóa", `Thương hiệu "${brand.name}" đã được xóa.`);
      fetchData();
    } catch (err) {
      console.error("Lỗi xóa thương hiệu:", err);
      toastError("Lỗi", "Không thể xóa thương hiệu.");
    }
  };

  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredBrands = brands.filter((b) =>
    b.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
            <span>Danh Mục & Thương Hiệu</span>
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Quản trị phân loại hàng hóa và đối tác nhãn hàng (Tự động xóa cache Redis 24h).
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchData}
            disabled={loading}
            className="border-input hover:bg-muted font-semibold text-xs flex items-center gap-1.5 h-9 rounded-xl"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Làm mới</span>
          </Button>

          {activeTab === "categories" ? (
            <Button
              size="sm"
              onClick={handleOpenCatCreate}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs flex items-center gap-1.5 h-9 rounded-xl shadow-md shadow-indigo-600/20"
            >
              <Plus className="h-4 w-4" />
              <span>Thêm Danh Mục</span>
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={handleOpenBrandCreate}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs flex items-center gap-1.5 h-9 rounded-xl shadow-md shadow-indigo-600/20"
            >
              <Plus className="h-4 w-4" />
              <span>Thêm Thương Hiệu</span>
            </Button>
          )}
        </div>
      </div>

      {/* TABS & SEARCH */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="inline-flex p-1 bg-muted rounded-xl text-xs font-semibold">
          <button
            onClick={() => setActiveTab("categories")}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg transition-all ${
              activeTab === "categories"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Layers className="h-4 w-4" />
            <span>Danh Mục Sản Phẩm ({categories.length})</span>
          </button>
          <button
            onClick={() => setActiveTab("brands")}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg transition-all ${
              activeTab === "brands"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Award className="h-4 w-4" />
            <span>Thương Hiệu Nhãn Hàng ({brands.length})</span>
          </button>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm theo tên..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 text-xs rounded-xl"
          />
        </div>
      </div>

      {/* TAB 1: DANH MỤC */}
      {activeTab === "categories" && (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tên Danh Mục</TableHead>
                  <TableHead>Slug Đường Dẫn</TableHead>
                  <TableHead>Mô Tả</TableHead>
                  <TableHead className="text-right">Hành Động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableSkeletonRows rows={4} cols={4} />
                ) : filteredCategories.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-10 text-xs text-muted-foreground">
                      Chưa có danh mục nào.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCategories.map((cat) => (
                    <TableRow key={cat.id} className="hover:bg-muted/40">
                      <TableCell className="font-semibold text-xs text-foreground">
                        {cat.name}
                      </TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        /{cat.slug}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground max-w-sm truncate">
                        {cat.description || "—"}
                      </TableCell>
                      <TableCell className="text-right space-x-1.5 whitespace-nowrap">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs px-2 rounded-lg text-indigo-600"
                          onClick={() => handleOpenCatEdit(cat)}
                        >
                          <Edit className="h-3.5 w-3.5 mr-1" />
                          Sửa
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 text-xs px-2 rounded-lg text-rose-600 hover:bg-rose-50"
                          onClick={() => handleDeleteCategory(cat)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* TAB 2: THƯƠNG HIỆU */}
      {activeTab === "brands" && (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Logo</TableHead>
                  <TableHead>Tên Thương Hiệu</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Mô Tả</TableHead>
                  <TableHead className="text-right">Hành Động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableSkeletonRows rows={4} cols={5} />
                ) : filteredBrands.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-10 text-xs text-muted-foreground">
                      Chưa có thương hiệu nào.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredBrands.map((brand) => (
                    <TableRow key={brand.id} className="hover:bg-muted/40">
                      <TableCell>
                        <div className="h-9 w-9 rounded-lg border bg-white relative overflow-hidden flex items-center justify-center">
                          {brand.logoUrl ? (
                            <Image
                              src={brand.logoUrl}
                              alt={brand.name}
                              fill
                              className="object-contain p-1"
                            />
                          ) : (
                            <Award className="h-4 w-4 text-slate-400" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold text-xs text-foreground">
                        {brand.name}
                      </TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        /{brand.slug}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground max-w-sm truncate">
                        {brand.description || "—"}
                      </TableCell>
                      <TableCell className="text-right space-x-1.5 whitespace-nowrap">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs px-2 rounded-lg text-indigo-600"
                          onClick={() => handleOpenBrandEdit(brand)}
                        >
                          <Edit className="h-3.5 w-3.5 mr-1" />
                          Sửa
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 text-xs px-2 rounded-lg text-rose-600 hover:bg-rose-50"
                          onClick={() => handleDeleteBrand(brand)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* MODAL CATEGORY */}
      <Modal
        isOpen={catModalOpen}
        onClose={() => setCatModalOpen(false)}
        title={editingCategory ? "Chỉnh Sửa Danh Mục" : "Thêm Danh Mục Mới"}
        description="Danh mục sản phẩm phân cấp phục vụ tìm kiếm & lọc hàng hóa"
        maxWidth="md"
      >
        <form onSubmit={handleSaveCategory} className="space-y-4 text-xs">
          <div className="space-y-1">
            <Label className="text-xs font-semibold">Tên Danh Mục (*)</Label>
            <Input
              placeholder="Ví dụ: Điện thoại, Máy tính xách tay..."
              value={catForm.name}
              onChange={(e) => setCatForm({ ...catForm, name: e.target.value })}
              required
              className="h-9 text-xs rounded-xl"
            />
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-semibold">Mô Tả Danh Mục</Label>
            <textarea
              rows={3}
              placeholder="Mô tả ngắn gọn về nhóm sản phẩm này..."
              value={catForm.description}
              onChange={(e) => setCatForm({ ...catForm, description: e.target.value })}
              className="w-full p-2.5 text-xs rounded-xl border border-input bg-background focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setCatModalOpen(false)}
              className="h-8 text-xs rounded-xl"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={submitting}
              className="bg-indigo-600 hover:bg-indigo-700 text-white h-8 text-xs rounded-xl px-4 font-semibold"
            >
              {submitting ? "Đang lưu..." : editingCategory ? "Lưu Thay Đổi" : "Tạo Danh Mục"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL BRAND */}
      <Modal
        isOpen={brandModalOpen}
        onClose={() => setBrandModalOpen(false)}
        title={editingBrand ? "Chỉnh Sửa Thương Hiệu" : "Thêm Thương Hiệu Mới"}
        description="Thương hiệu chính hãng và logo hiển thị"
        maxWidth="md"
      >
        <form onSubmit={handleSaveBrand} className="space-y-4 text-xs">
          <div className="space-y-1">
            <Label className="text-xs font-semibold">Tên Thương Hiệu (*)</Label>
            <Input
              placeholder="Ví dụ: Apple, Sony, Samsung..."
              value={brandForm.name}
              onChange={(e) => setBrandForm({ ...brandForm, name: e.target.value })}
              required
              className="h-9 text-xs rounded-xl"
            />
          </div>

          {/* Logo Upload */}
          <div className="space-y-1.5 p-3 rounded-xl border bg-muted/20">
            <Label className="text-xs font-semibold flex items-center justify-between">
              <span>Logo Thương Hiệu</span>
              {uploadingLogo && <span className="text-[10px] text-indigo-600 animate-pulse">Đang tải lên...</span>}
            </Label>
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl border bg-white flex items-center justify-center relative overflow-hidden shrink-0">
                {brandForm.logoUrl ? (
                  <Image src={brandForm.logoUrl} alt="Logo preview" fill className="object-contain p-1" />
                ) : (
                  <Award className="h-5 w-5 text-slate-300" />
                )}
              </div>
              <div className="flex-1 space-y-1.5">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  ref={logoInputRef}
                  onChange={handleLogoUpload}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={uploadingLogo}
                  onClick={() => logoInputRef.current?.click()}
                  className="h-7 text-xs rounded-lg gap-1"
                >
                  <Upload className="h-3 w-3" />
                  <span>Chọn ảnh logo</span>
                </Button>
                <Input
                  placeholder="Hoặc URL ảnh logo..."
                  value={brandForm.logoUrl}
                  onChange={(e) => setBrandForm({ ...brandForm, logoUrl: e.target.value })}
                  className="h-7 text-[10px] rounded-lg"
                />
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-semibold">Mô Tả Thương Hiệu</Label>
            <textarea
              rows={3}
              placeholder="Giới thiệu thương hiệu..."
              value={brandForm.description}
              onChange={(e) => setBrandForm({ ...brandForm, description: e.target.value })}
              className="w-full p-2.5 text-xs rounded-xl border border-input bg-background focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setBrandModalOpen(false)}
              className="h-8 text-xs rounded-xl"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={submitting || uploadingLogo}
              className="bg-indigo-600 hover:bg-indigo-700 text-white h-8 text-xs rounded-xl px-4 font-semibold"
            >
              {submitting ? "Đang lưu..." : editingBrand ? "Lưu Thay Đổi" : "Tạo Thương Hiệu"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
