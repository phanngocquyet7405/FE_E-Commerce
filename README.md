# ShopDev E-Commerce Frontend (Next.js 14 App Router + TypeScript + Tailwind CSS + Shadcn UI)

Dự án Frontend chuẩn mực kết nối trực tiếp với hệ sinh thái **E-Commerce Backend Spring Boot 3 + MongoDB Atlas + Redis**.

## 1. Công nghệ sử dụng
- **Framework**: Next.js 14+ (App Router)
- **Ngôn ngữ**: TypeScript 5
- **Giao diện**: Tailwind CSS + phong cách thiết kế Shadcn UI
- **Biểu tượng**: Lucide React
- **HTTP Client**: Axios với Request/Response Interceptors tự động
- **Xác thực**: JWT (JJWT HMAC-SHA256) giải mã an toàn qua `jwt-decode`
- **Backend API**: `https://ecommerce-backend-q1wt.onrender.com/`

## 2. Hướng dẫn khởi chạy

### Bước 1: Cài đặt dependencies
```bash
npm install
# hoặc
pnpm install
# hoặc
yarn install
```

### Bước 2: Cấu hình biến môi trường
File `.env.local` đã được tạo sẵn:
```env
NEXT_PUBLIC_API_URL=https://ecommerce-backend-q1wt.onrender.com/
```

### Bước 3: Khởi chạy môi trường phát triển (Dev)
```bash
npm run dev
```
Mở trình duyệt truy cập: `http://localhost:3000`

## 3. Tài khoản thử nghiệm (Demo Accounts)
- **Admin Portal (`/dashboard`)**:
  - Email: `admin@ecommerce.com`
  - Password: `Admin@123`
- **Khách hàng (`/`)**:
  - Đăng ký tài khoản mới trực tiếp tại `/register` hoặc đăng nhập để mua hàng.

## 4. Cấu trúc thư mục chuẩn hóa
```text
src/
├── api/
│   ├── axiosClient.ts      # Axios instance kèm Interceptors gắn Bearer & bắt 401
│   ├── authApi.ts          # API login, register, refresh, logout, profile
│   └── adminApi.ts         # API orders, products, users cho Admin
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx     # Form đăng nhập căn giữa, phân luồng theo Role JWT
│   │   └── register/page.tsx  # Form đăng ký khách hàng
│   ├── dashboard/
│   │   ├── layout.tsx         # Route Guard: Chặn truy cập nếu không phải ADMIN
│   │   └── page.tsx           # 4 StatsCard + Table đơn hàng & sản phẩm mới nhất
│   ├── globals.css            # Biến màu sắc CSS Variables (Shadcn UI)
│   ├── layout.tsx             # Root Layout
│   └── page.tsx               # Trang chủ: Header, Hero, Badges, Product Grid, Footer
├── components/
│   ├── admin/
│   │   ├── AdminSidebar.tsx   # Sidebar quản trị cố định
│   │   └── StatsCard.tsx      # Thẻ số liệu thống kê (Doanh thu, Đơn hàng...)
│   ├── shared/
│   │   ├── Header.tsx         # Header điều hướng, giỏ hàng, nhận diện auth JWT
│   │   └── Footer.tsx         # Chân trang thông tin & chính sách
│   └── ui/                    # Bộ thành phần Shadcn UI: button, card, input, label, table, badge
├── services/
│   ├── authService.ts         # Nghiệp vụ auth, lưu token, kiểm tra session
│   └── adminService.ts        # Nghiệp vụ tổng hợp thống kê & cập nhật trạng thái đơn
├── types/
│   └── index.ts               # Khai báo TypeScript Interfaces đồng bộ 100% với Backend
└── utils/
    ├── format.ts              # Định dạng tiền tệ VND, ngày tháng, trạng thái đơn
    └── jwt.ts                 # Giải mã JWT, kiểm tra hạn exp, trích xuất Role
```
