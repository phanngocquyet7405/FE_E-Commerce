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

export type RoleType = 'ROLE_ADMIN' | 'ROLE_CUSTOMER' | 'ADMIN' | 'CUSTOMER';

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
// 3. NGƯỜI DÙNG & ĐỊA CHỈ (USER & ADDRESS)
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

// ==========================================
// 4. SẢN PHẨM & DANH MỤC (CATALOG)
// ==========================================

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  active?: boolean;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string;
  active?: boolean;
}

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

// ==========================================
// 5. GIỎ HÀNG (CART)
// ==========================================

export interface CartItem {
  productId: string;
  productName: string;
  productSku?: string;
  productThumbnail?: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
}

export interface Cart {
  id: string;
  userId: string;
  items: CartItem[];
  totalAmount: number;
}

// ==========================================
// 6. ĐƠN HÀNG (ORDERS)
// ==========================================

export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'SHIPPING'
  | 'DELIVERED'
  | 'CANCELLED';

export type PaymentMethod = 'COD' | 'VNPAY' | 'MOMO';

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
  status: OrderStatus;
  note?: string;
  createdAt: string;
}

// ==========================================
// 7. THỐNG KÊ ADMIN (DASHBOARD STATS)
// ==========================================

export interface AdminDashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  totalProducts: number;
  revenueGrowth?: number;
  ordersGrowth?: number;
}
