// ==========================================
// 1. CHUNG (COMMON & API WRAPPERS)
// ==========================================

export interface ApiResponse<T> {
  success: boolean;
  code: number;
  message: string;
  data: T;
  timestamp?: string;
}

export interface PageResponse<T> {
  items: T[];
  pageNo: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

// ==========================================
// 2. PHÂN QUYỀN & XÁC THỰC (AUTH & ROLES)
// ==========================================

export type RoleType = "ROLE_ADMIN" | "ROLE_CUSTOMER" | "ADMIN" | "CUSTOMER";

export interface JwtPayload {
  sub: string; // Email người dùng
  uid?: string; // MongoDB User ID
  roles?: string[]; // Mảng danh sách quyền từ BE, ví dụ ["ROLE_ADMIN"]
  role?: string;
  typ?: string; // "ACCESS" | "REFRESH"
  exp: number; // Unix timestamp hết hạn
  iat?: number;
  iss?: string;
  jti?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

// ==========================================
// 3. NGƯỜI DÙNG & KHÁCH HÀNG (USERS & ADMIN)
// ==========================================

export interface Address {
  id?: string;
  receiverName: string;
  phone: string;
  streetAddress: string;
  ward?: string;
  district?: string;
  city: string;
  isDefault: boolean;
}

export interface User {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  avatarUrl?: string;
  roles: RoleType[];
  addresses?: Address[];
  active?: boolean;
  createdAt?: string;
}

export interface AdminUserResponse {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  avatarUrl?: string;
  roles: RoleType[];
  active: boolean;
  emailVerified: boolean;
  phoneVerified: boolean;
  addresses?: Address[];
  createdAt: string;
  updatedAt?: string;
  totalOrders?: number;
  totalSpent?: number;
}

export interface UpdateProfileRequest {
  fullName: string;
  phone?: string;
  avatarUrl?: string;
}

export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// ==========================================
// 4. DANH MỤC & THƯƠNG HIỆU (CATALOG BASE)
// ==========================================

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  active?: boolean;
  createdAt?: string;
}

export interface CategoryRequest {
  name: string;
  slug?: string;
  description?: string;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logoUrl?: string;
  active?: boolean;
  createdAt?: string;
}

export interface BrandRequest {
  name: string;
  slug?: string;
  description?: string;
  logoUrl?: string;
}

// ==========================================
// 5. SẢN PHẨM & TỒN KHO (PRODUCTS)
// ==========================================

export interface Product {
  id: string;
  sku: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  stockQuantity: number;
  thumbnailUrl: string;
  images: string[];
  active: boolean;
  categoryId: string;
  categoryName: string;
  brandId?: string;
  brandName?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductRequest {
  sku: string;
  name: string;
  slug: string;
  description?: string;
  price: number;
  stockQuantity: number;
  thumbnailUrl?: string;
  images?: string[];
  categoryId: string;
  brandId?: string;
}

export interface LowStockProductResponse {
  id: string;
  name: string;
  sku: string;
  stockQuantity: number;
  price: number;
  active: boolean;
}

// ==========================================
// 6. ĐƠN HÀNG & STATE MACHINE (ORDERS)
// ==========================================

export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "SHIPPING"
  | "DELIVERED"
  | "CANCELLED"
  | "AWAITING_REFUND"
  | "REFUNDED";

export type PaymentMethod = "COD" | "SEPAY" | "VNPAY" | "MOMO";

export type PaymentStatus = "UNPAID" | "PENDING" | "PAID" | "FAILED" | "REFUNDED";

export interface OrderItem {
  productId: string;
  productName: string;
  productSku?: string;
  productThumbnail?: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
}

export interface Order {
  id: string;
  orderCode: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: Address;
  items: OrderItem[];
  totalAmount: number;
  shippingFee: number;
  finalAmount: number;
  paymentMethod: PaymentMethod;
  paymentStatus?: PaymentStatus;
  status: OrderStatus;
  note?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface AdminOrderDetailResponse {
  order: Order;
  transactions: SePayTransactionResponse[];
}

export interface UpdateOrderStatusRequest {
  status: OrderStatus;
  note?: string;
}

// ==========================================
// 7. GIAO DỊCH SEPAY VIETQR (PAYMENTS)
// ==========================================

export type SePayTransactionStatus =
  | "PENDING"
  | "MATCHED"
  | "FAILED"
  | "EXPIRED"
  | "UNMATCHED";

export interface SePayTransactionResponse {
  id: string;
  sepayId?: number;
  gateway?: string;
  transactionDate?: string;
  accountNumber?: string;
  subAccount?: string;
  code?: string;
  amountIn?: number;
  amountOut?: number;
  accumulated?: number;
  content?: string;
  referenceCode?: string;
  status: SePayTransactionStatus;
  orderId?: string;
  orderCode?: string;
  amountDiscrepancy?: number;
  failureReason?: string;
  adminProcessed?: boolean;
  processedBy?: string;
  processedAt?: string;
  adminNote?: string;
  createdAt: string;
}

export interface AdminProcessTransactionRequest {
  note: string;
  action?: string;
}

// ==========================================
// 8. THỐNG KÊ & BÁO CÁO (ADMIN STATISTICS)
// ==========================================

export interface StatisticsOverviewResponse {
  totalRevenue: number;
  totalOrders: number;
  paidOrdersCount: number;
  averageOrderValue: number;
  orderCountByStatus: Record<string, number>;
  newUsersCount: number;
  lowStockProductsCount: number;
}

export interface AdminDashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  totalProducts: number;
  revenueGrowth?: number;
  ordersGrowth?: number;
}

export interface RevenueStatisticsResponse {
  period: string; // "2026-11-01" hoặc "2026-11"
  revenue: number;
  orderCount: number;
}

export interface TopSellingProductResponse {
  productId: string;
  productName: string;
  totalSold: number;
  totalRevenue: number;
}

// ==========================================
// 9. MEDIA UPLOAD (CLOUDINARY)
// ==========================================

export interface MediaUploadResponse {
  url: string;
  fileUrl?: string;
  fileName?: string;
  publicId?: string;
  originalName?: string;
  contentType?: string;
  format?: string;
  bytes?: number;
  size?: number;
}
