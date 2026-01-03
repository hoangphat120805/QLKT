# 📚 Bản đồ Tài liệu Hệ thống QLKT

## 🎯 Bắt đầu từ đâu?

### 👤 Cho Người mới

1. **[README.md](../README.md)** (10 phút) - Tổng quan dự án
2. **[QUICK_START.md](../BE-QLKT/QUICK_START_PROPOSALS.md)** (5 phút) - Hướng dẫn setup
3. **[CHEATSHEET.md](../CHEATSHEET.md)** - Tham khảo nhanh

### 👨‍💻 Cho Developer

1. **[QLKT.md](../QLKT.md)** - Tài liệu API đầy đủ
2. **[CHEATSHEET.md](../CHEATSHEET.md)** - Code examples
3. **[Document/](./README.md)** - Tài liệu chi tiết từng loại khen thưởng

### 📊 Cho Stakeholder/Báo cáo

1. **[Document/README.md](./README.md)** - Tổng quan tài liệu
2. **[Document/01-CA-NHAN-HANG-NAM.md](./01-CA-NHAN-HANG-NAM.md)** - Chi tiết từng loại
3. **[Document/02-DON-VI-HANG-NAM.md](./02-DON-VI-HANG-NAM.md)**
4. ... (xem danh sách đầy đủ trong [Document/README.md](./README.md))

---

## 📖 Tài liệu theo Chủ đề

### 🔐 Xác thực & Phân quyền

- **File**: [QLKT.md](../QLKT.md) - Phần 1: Authentication
- **Nội dung**: JWT, Access Token, Refresh Token, Roles

### 👥 Quản lý Quân nhân

- **File**: [QLKT.md](../QLKT.md) - Phần 4: Personnel Management
- **Nội dung**: CRUD quân nhân, Import/Export

### 🏆 Khen thưởng Hằng năm

#### Cá nhân Hằng năm

- **File**: [Document/01-CA-NHAN-HANG-NAM.md](./01-CA-NHAN-HANG-NAM.md)
- **Loại**: CSTĐCS, CSTT, BKBQP, CSTDTQ
- **API**: `/api/annual-rewards`

#### Đơn vị Hằng năm

- **File**: [Document/02-DON-VI-HANG-NAM.md](./02-DON-VI-HANG-NAM.md)
- **Loại**: ĐVQT, ĐVTT, BKBQP, BKTTCP
- **API**: `/api/unit-annual-awards`

### ⏱️ Khen thưởng Niên hạn

- **File**: [Document/03-NIEN-HAN.md](./03-NIEN-HAN.md)
- **Loại**: HCCSVV (Hạng Ba, Nhì, Nhất)
- **Điều kiện**: Dựa trên thời gian phục vụ

### 💪 Khen thưởng Cống hiến

- **File**: [Document/04-CONG-HIEN.md](./04-CONG-HIEN.md)
- **Loại**: HCBVTQ (Hạng Ba, Nhì, Nhất)
- **Điều kiện**: Dựa trên hệ số chức vụ và thời gian

### 🎖️ Khen thưởng Đặc biệt

#### Huy chương quân kỳ Quyết thắng

- **File**: [Document/05-HC-QKQT.md](./05-HC-QKQT.md)
- **Điều kiện**: ≥ 25 năm phục vụ

#### Kỷ niệm chương VSNXD QĐNDVN

- **File**: [Document/06-KNC-VSNXD-QDNDVN.md](./06-KNC-VSNXD-QDNDVN.md)
- **Điều kiện**: ≥ 20 năm (nữ), ≥ 25 năm (nam)

#### Khen thưởng Đột xuất

- **File**: [Document/07-DOT-XUAT.md](./07-DOT-XUAT.md)
- **Điều kiện**: Theo quyết định đặc biệt

### 🔬 Thành tích Khoa học

- **File**: [Document/08-THANH-TICH-KHOA-HOC.md](./08-THANH-TICH-KHOA-HOC.md)
- **Loại**: NCKH (Đề tài khoa học), SKKH (Sáng kiến khoa học)
- **API**: `/api/scientific-achievements`

### 📊 Sơ đồ Tuần tự

- **File**: [Document/09-SO-DO-TUAN-TU.md](./09-SO-DO-TUAN-TU.md)
- **Nội dung**: Sơ đồ tuần tự (sequence diagram) cho các chức năng chính: Đăng nhập, Tạo đề xuất, Phê duyệt, Quản lý quân nhân, Tính toán hồ sơ, Dashboard, Quản lý tài khoản

---

## 🗂️ Cấu trúc File Tài liệu

```
QLKT/
├── README.md                    # Tổng quan dự án
├── QLKT.md                      # Tài liệu API đầy đủ
├── CHEATSHEET.md                # Cheatsheet developers
├── DOCS_TREE.txt                # Cây thư mục tài liệu
│
├── Document/                    # 📚 Tài liệu chi tiết
│   ├── README.md                # Mục lục tài liệu
│   ├── DOCUMENTATION_INDEX.md   # Bản đồ tài liệu (file này)
│   ├── 01-CA-NHAN-HANG-NAM.md   # Cá nhân Hằng năm
│   ├── 02-DON-VI-HANG-NAM.md    # Đơn vị Hằng năm
│   ├── 03-NIEN-HAN.md           # Niên hạn
│   ├── 04-CONG-HIEN.md          # Cống hiến
│   ├── 05-HC-QKQT.md            # HC Quân kỳ Quyết thắng
│   ├── 06-KNC-VSNXD-QDNDVN.md   # Kỷ niệm chương
│   ├── 07-DOT-XUAT.md           # Đột xuất
│   ├── 08-THANH-TICH-KHOA-HOC.md # Thành tích khoa học
│   └── 09-SO-DO-TUAN-TU.md      # Sơ đồ tuần tự các chức năng chính
│
├── .claude/
│   └── CLAUDE.md                # Tài liệu cho Claude AI
│
└── .cursor/
    └── CURSOR.md                # Tài liệu cho Cursor AI
```

---

## 🎓 Learning Paths

### Path 1: Hiểu hệ thống (30 phút)

1. README.md (10 phút)
2. QLKT.md - Phần 1-2 (10 phút)
3. Document/README.md (10 phút)

### Path 2: Phát triển tính năng mới (1 giờ)

1. CHEATSHEET.md (15 phút)
2. QLKT.md - Phần liên quan (20 phút)
3. Document/[loại khen thưởng].md (25 phút)

### Path 3: Báo cáo/Thuyết trình (2 giờ)

1. Document/README.md (15 phút)
2. Đọc tất cả 8 file loại khen thưởng (90 phút)
3. QLKT.md - Tổng quan API (15 phút)

### Path 4: Hiểu luồng xử lý (1 giờ)

1. Document/09-SO-DO-TUAN-TU.md (60 phút) - Xem sơ đồ tuần tự các chức năng chính

---

## 🔍 Tìm kiếm Nhanh

### "Làm thế nào để..."

- **Thêm API endpoint mới?** → CHEATSHEET.md - "Add New API Endpoint"
- **Tạo đề xuất khen thưởng?** → Document/[loại khen thưởng].md
- **Hiểu cấu trúc database?** → QLKT.md - Phần "Database Schema"
- **Setup môi trường?** → QUICK_START.md

### "Tôi cần biết về..."

- **Cá nhân Hằng năm?** → Document/01-CA-NHAN-HANG-NAM.md
- **Niên hạn?** → Document/03-NIEN-HAN.md
- **Cống hiến?** → Document/04-CONG-HIEN.md
- **API endpoints?** → QLKT.md
- **Luồng xử lý hệ thống?** → Document/09-SO-DO-TUAN-TU.md

---

## 📊 Thống kê Tài liệu

- **Tổng số file**: 16+
- **Tổng số trang**: ~250 trang
- **Độ phủ**: 98%
- **Cập nhật lần cuối**: 2024

---

## ✅ Checklist Đọc Tài liệu

### Cho Developer mới

- [ ] Đọc README.md
- [ ] Setup project thành công
- [ ] Đọc CHEATSHEET.md
- [ ] Hiểu cấu trúc database (QLKT.md)
- [ ] Đọc tài liệu loại khen thưởng đang làm việc
- [ ] Xem sơ đồ tuần tự các chức năng chính (Document/09-SO-DO-TUAN-TU.md)

### Cho Stakeholder

- [ ] Đọc Document/README.md
- [ ] Đọc tài liệu các loại khen thưởng quan tâm
- [ ] Hiểu quy trình đề xuất và phê duyệt
- [ ] Xem ví dụ cụ thể

---

**💡 Tip**: Bookmark file này để dễ dàng tìm kiếm tài liệu!
