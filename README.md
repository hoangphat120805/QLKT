# 🎖️ QLKT - Hệ thống Quản lý Khen thưởng

## 📋 Giới thiệu

**QLKT** (Quản lý Khen thưởng) là hệ thống quản lý khen thưởng toàn diện cho Học viện Khoa học Quân sự, giúp quản lý danh hiệu, thành tích khoa học và tính toán khen thưởng tự động.

## 📖 Repository này chứa gì?

Repository này chứa **tài liệu và cấu hình** cho dự án QLKT:

- ✅ **Tài liệu Tổng hợp** ([DOCUMENTATION.md](DOCUMENTATION.md)) - Tất cả thông tin về dự án
- ✅ **API Documentation** ([QLKT.md](QLKT.md)) - Chi tiết các API endpoints
- ✅ **AI Assistant Guides** ([.claude/CLAUDE.md](.claude/CLAUDE.md), [.cursor/CURSOR.md](.cursor/CURSOR.md))
- ✅ **Coding Standards** ([.cursorrules](.cursorrules))

> **Lưu ý**: Source code không được public trên GitHub. Repository này chỉ phục vụ mục đích documentation và configuration.

## 🚀 Tech Stack

### Frontend

- **Framework**: Next.js 14.2.4 (App Router)
- **UI Library**: React 18
- **Language**: TypeScript 5.9.3
- **Styling**: TailwindCSS 3.4.18 + shadcn/ui
- **State Management**: Redux Toolkit
- **Form Handling**: React Hook Form + Zod
- **HTTP Client**: Axios

### Backend

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT (jsonwebtoken)
- **File Processing**: xlsx, fast-csv, multer

## 📂 Cấu trúc Thư mục

```
QLKT/
├── FE-QLKT/                    # Frontend (Next.js)
│   ├── src/
│   │   ├── app/                # App Router pages
│   │   │   ├── (auth)/         # Authentication pages
│   │   │   ├── super-admin/    # Super admin dashboard
│   │   │   ├── admin/          # Admin pages
│   │   │   ├── manager/        # Manager pages
│   │   │   └── user/           # User pages
│   │   ├── components/         # Reusable components
│   │   │   ├── ui/             # shadcn/ui components
│   │   │   └── layout/         # Layout components
│   │   ├── hooks/              # Custom React hooks
│   │   ├── lib/                # Utility functions
│   │   ├── configs/            # App configurations
│   │   └── constants/          # Constants
│   └── public/                 # Static files
│
├── BE-QLKT/                    # Backend (Express)
│   ├── src/
│   │   ├── controllers/        # Request handlers
│   │   ├── services/           # Business logic
│   │   ├── routes/             # API routes
│   │   ├── middlewares/        # Express middlewares
│   │   ├── models/             # Prisma models
│   │   ├── helpers/            # Helper functions
│   │   ├── configs/            # Database config
│   │   └── scripts/            # Utility scripts
│   └── prisma/                 # Prisma schema & migrations
│
├── .claude/                    # Claude AI documentation
│   └── CLAUDE.md               # Full project documentation for Claude
├── .cursor/                    # Cursor AI documentation
│   └── CURSOR.md               # Quick reference guide for Cursor
├── .cursorrules                # Cursor editor rules
├── DOCUMENTATION.md            # Tài liệu tổng hợp (tất cả thông tin)
├── QLKT.md                     # API documentation chi tiết
└── README.md                   # This file
```

## 🎭 Phân quyền Hệ thống

### 1. SUPER_ADMIN

- Quản lý tài khoản hệ thống
- Tất cả quyền của ADMIN

### 2. ADMIN

- Quản lý đơn vị, chức vụ, nhóm cống hiến
- Quản lý toàn bộ quân nhân
- Import/Export dữ liệu Excel
- Quản lý khen thưởng toàn hệ thống
- Tính toán lại hồ sơ

### 3. MANAGER

- Quản lý quân nhân trong đơn vị được phân công
- Nhập/Sửa khen thưởng cho đơn vị
- Xem hồ sơ gợi ý
- Tạo báo cáo đơn vị

### 4. USER

- Xem thông tin cá nhân
- Xem lịch sử khen thưởng
- Xem hồ sơ gợi ý của mình

## 🗄️ Database Schema

### Bảng Dữ liệu Chính (Master Data)

1. **DonVi** - Đơn vị (Hệ, Phòng, Ban)
2. **NhomCongHien** - Nhóm cống hiến
3. **ChucVu** - Chức vụ
4. **QuanNhan** - Quân nhân
5. **TaiKhoan** - Tài khoản

### Bảng Dữ liệu Đầu vào (INPUT)

6. **LichSuChucVu** - Lịch sử chức vụ (tính cống hiến)
7. **ThanhTichKhoaHoc** - Thành tích ĐTKH/SKKH
8. **DanhHieuHangNam** - Danh hiệu hằng năm (CSTĐCS/CSTT)

### Bảng Dữ liệu Đầu ra (OUTPUT)

9. **HoSoNienHan** - Hồ sơ khen thưởng niên hạn
10. **HoSoHangNam** - Hồ sơ khen thưởng hằng năm

## 🎯 Tính năng Chính

### 1. Quản lý Quân nhân

- Thêm/Sửa/Xóa thông tin quân nhân
- Import hàng loạt từ Excel
- Export dữ liệu ra Excel
- Quản lý theo đơn vị

### 2. Quản lý Khen thưởng

- **Danh hiệu hằng năm**: CSTĐCS, CSTT
- **Thành tích khoa học**: NCKH, SKKH
- **Lịch sử chức vụ**: Theo dõi cống hiến

### 3. Tính toán Tự động ("Bộ não")

- **Khen thưởng Niên hạn**:
  - Huy chương Chiến sĩ Vẻ vang (10/15/20 năm)
  - Huân chương Bảo vệ Tổ quốc (dựa trên cống hiến)
- **Khen thưởng Hằng năm**:
  - Bằng khen BQP (5 năm CSTĐCS liên tục)
  - CSTD Toàn quân (10 năm CSTĐCS + ĐTKH/SKKH)

### 4. Hồ sơ Gợi ý

- Gợi ý khen thưởng dựa trên dữ liệu hiện có
- Hiển thị tiến độ đạt khen thưởng
- Cảnh báo sắp đủ điều kiện

### 5. Báo cáo & Thống kê

- Thống kê theo đơn vị
- Báo cáo khen thưởng theo năm
- Phân tích dữ liệu

## 🛠️ Sử dụng Documentation

### Cho Developers

1. **Bắt đầu từ**: [DOCUMENTATION.md](DOCUMENTATION.md) - Tài liệu tổng hợp đầy đủ
2. **API Reference**: [QLKT.md](QLKT.md) - Chi tiết các API endpoints
3. **Code Style**: [.cursorrules](.cursorrules) - Coding standards và conventions

### Cho AI Assistants (Claude/Cursor)

1. **Claude AI**: Import `.claude/CLAUDE.md` vào context
2. **Cursor AI**: Tham khảo `.cursor/CURSOR.md` cho quick reference
3. **Chung**: Tuân thủ coding standards trong `.cursorrules`

### Setup Dự án (Nếu có source code)

#### Yêu cầu Hệ thống

- Node.js >= 18.x
- PostgreSQL >= 14.x
- npm hoặc yarn

#### Backend Setup

```bash
cd BE-QLKT
npm install
npx prisma generate
npx prisma migrate dev
npm run dev  # Port 5000
```

#### Frontend Setup

```bash
cd FE-QLKT
npm install
npm run dev  # Port 3000
```

## 📝 Environment Variables

### Backend (.env)

```env
DATABASE_URL="postgresql://user:password@localhost:5432/qlkt"
JWT_SECRET="your-secret-key-here"
JWT_REFRESH_SECRET="your-refresh-secret-here"
PORT=5000
```

### Frontend (.env.local)

```env
NEXT_PUBLIC_API_URL="http://localhost:5000/api"
```

## 🔧 Scripts Hữu ích

### Frontend

```bash
npm run dev         # Chạy development server
npm run build       # Build production
npm run start       # Chạy production server
npm run lint        # Chạy ESLint
```

### Backend

```bash
npm run dev              # Chạy development server
npx prisma studio        # Mở Prisma Studio (GUI database)
npx prisma migrate dev   # Chạy migrations
npx prisma generate      # Generate Prisma Client
npx prisma db push       # Push schema lên database
```

## 📚 Tài liệu

### Cho Developers

- **[DOCUMENTATION.md](DOCUMENTATION.md)**: ⭐ Tài liệu tổng hợp đầy đủ về dự án (BẮT ĐẦU TỪ ĐÂY)
- **[QLKT.md](QLKT.md)**: API documentation chi tiết
- **[.cursorrules](.cursorrules)**: Code style & conventions

### Cho AI Assistants

- **[.claude/CLAUDE.md](.claude/CLAUDE.md)**: Full project documentation cho Claude AI
- **[.cursor/CURSOR.md](.cursor/CURSOR.md)**: Quick reference guide cho Cursor AI
- **[.cursorrules](.cursorrules)**: Coding standards (chung cho cả hai)

## 🔐 Authentication Flow

1. User login với username & password
2. Backend trả về Access Token (15 phút) + Refresh Token (7 ngày)
3. Frontend lưu tokens vào localStorage
4. Mọi API call đều gửi kèm: `Authorization: Bearer <access_token>`
5. Khi Access Token hết hạn → Dùng Refresh Token để lấy Access Token mới

## 📄 License

This project is proprietary software for Vietnam Military Science Academy.

## 📞 Contact

- **Developer**: Trần Đức
- **Email**: support@hvkhqs.edu.vn
- **Organization**: Học viện Khoa học Quân sự

---

**Built with ❤️ for Vietnam Military Science Academy**
