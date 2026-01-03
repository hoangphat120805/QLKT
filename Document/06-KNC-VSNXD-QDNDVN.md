# 🎖️ Kỷ niệm chương Vì sự nghiệp Xây dựng QĐNDVN (KNC_VSNXD_QDNDVN)

## 📋 Tổng quan

Kỷ niệm chương Vì sự nghiệp Xây dựng Quân đội Nhân dân Việt Nam là kỷ niệm chương được trao tặng cho quân nhân có thời gian phục vụ lâu dài, với điều kiện khác nhau cho nam và nữ.

## 🎯 Điều kiện Đề xuất

### Điều kiện Bắt buộc

- **Nữ**: **≥ 20 năm** phục vụ (tính từ ngày nhập ngũ)
- **Nam**: **≥ 25 năm** phục vụ (tính từ ngày nhập ngũ)

### Tính toán Thời gian

- **Bắt đầu**: Từ `ngay_nhap_ngu`
- **Kết thúc**: `ngay_xuat_ngu` (nếu có) hoặc ngày hiện tại
- **Đơn vị**: Tính theo năm (làm tròn xuống)

## 📊 Cấu trúc Dữ liệu

### Database Schema

**Bảng**: `ky_niem_chuong_vsnxd_qdndvn`

| Tên Cột           | Kiểu          | Mô tả                       |
| ----------------- | ------------- | --------------------------- |
| `id`              | String (CUID) | Khóa chính                  |
| `quan_nhan_id`    | String        | ID quân nhân (UNIQUE)       |
| `nam`             | Integer       | Năm được trao tặng          |
| `so_quyet_dinh`   | String?       | Số quyết định               |
| `file_quyet_dinh` | String?       | File PDF quyết định         |
| `thoi_gian`       | JSON          | Thông tin thời gian phục vụ |

**Ràng buộc**: `UNIQUE(quan_nhan_id)` - Mỗi quân nhân chỉ có 1 bản ghi KNC_VSNXD_QDNDVN

### JSON Structure trong Đề xuất

```json
{
  "personnel_id": "abc123",
  "ho_ten": "Nguyễn Thị A",
  "nam": 2024,
  "danh_hieu": "KNC_VSNXD_QDNDVN",
  "thoi_gian": {
    "total_months": 240,
    "years": 20,
    "months": 0,
    "display": "20 năm"
  },
  "cap_bac": "Thiếu tá",
  "chuc_vu": "Hệ trưởng",
  "co_quan_don_vi": {
    "id": "xyz",
    "ten_co_quan_don_vi": "Học viện Khoa học Quân sự",
    "ma_co_quan_don_vi": "HVKHQS"
  },
  "don_vi_truc_thuoc": {
    "id": "def",
    "ten_don_vi": "Hệ 1",
    "ma_don_vi": "K1"
  }
}
```

## 🔄 Quy trình Đề xuất

### Bước 1: Manager tạo đề xuất

1. Chọn loại đề xuất: **Kỷ niệm chương VSNXD QĐNDVN**
2. Chọn quân nhân cần đề xuất
3. Hệ thống tự động:
   - Kiểm tra `gioi_tinh` (NAM hoặc NU)
   - Kiểm tra `ngay_nhap_ngu`
   - Tính thời gian phục vụ
   - **Validation**:
     - Nữ: Chỉ cho phép nếu ≥ 20 năm
     - Nam: Chỉ cho phép nếu ≥ 25 năm
4. Nhập năm đề xuất
5. Upload file đính kèm (nếu có)
6. Gửi đề xuất

### Bước 2: Admin xem và chỉnh sửa

1. Xem danh sách đề xuất `PENDING`
2. Xem chi tiết từng đề xuất
3. Kiểm tra thời gian phục vụ theo giới tính
4. Chỉnh sửa thông tin (nếu cần)
5. Thêm số quyết định (nếu đã có)

### Bước 3: Admin phê duyệt

1. Kiểm tra lại điều kiện theo giới tính
2. Phê duyệt đề xuất → Trạng thái `APPROVED`
3. Hệ thống tự động lưu vào bảng `KyNiemChuongVSNXDQDNDVN`

## 📡 API Endpoints

### 1. Lấy danh sách Đề xuất KNC_VSNXD_QDNDVN

**Endpoint**: `GET /api/proposals?type=KNC_VSNXD_QDNDVN`

**Response**:

```json
{
  "success": true,
  "data": {
    "proposals": [
      {
        "id": 1,
        "loai_de_xuat": "KNC_VSNXD_QDNDVN",
        "data_nien_han": [
          {
            "personnel_id": "abc123",
            "ho_ten": "Nguyễn Thị A",
            "nam": 2024,
            "danh_hieu": "KNC_VSNXD_QDNDVN",
            "thoi_gian": {
              "total_months": 240,
              "years": 20,
              "months": 0,
              "display": "20 năm"
            }
          }
        ]
      }
    ]
  }
}
```

## 💡 Ví dụ Cụ thể

### Ví dụ 1: Đề xuất thành công (Nữ)

**Quân nhân**: Nguyễn Thị A (Nữ)
**Ngày nhập ngũ**: 01/01/2004
**Ngày hiện tại**: 01/01/2024
**Thời gian phục vụ**: 20 năm
**Kết quả**: ✅ Đủ điều kiện (nữ ≥ 20 năm), đề xuất được gửi

### Ví dụ 2: Đề xuất thành công (Nam)

**Quân nhân**: Trần Văn B (Nam)
**Ngày nhập ngũ**: 01/01/1999
**Ngày hiện tại**: 01/01/2024
**Thời gian phục vụ**: 25 năm
**Kết quả**: ✅ Đủ điều kiện (nam ≥ 25 năm), đề xuất được gửi

### Ví dụ 3: Không đủ điều kiện (Nữ)

**Quân nhân**: Lê Thị C (Nữ)
**Ngày nhập ngũ**: 01/01/2010
**Ngày hiện tại**: 01/01/2024
**Thời gian phục vụ**: 14 năm
**Kết quả**: ❌ Chưa đủ 20 năm, không thể đề xuất

### Ví dụ 4: Tính thời gian phục vụ

```javascript
// Tính từ ngày nhập ngũ
const ngayNhapNgu = new Date('2004-01-01');
const ngayKetThuc = new Date('2024-01-01'); // hoặc new Date()

let months = (ngayKetThuc.getFullYear() - ngayNhapNgu.getFullYear()) * 12;
months += ngayKetThuc.getMonth() - ngayNhapNgu.getMonth();
if (ngayKetThuc.getDate() < ngayNhapNgu.getDate()) {
  months--;
}
months = Math.max(0, months);

const years = Math.floor(months / 12);

// Yêu cầu theo giới tính
const requiredYears = gioiTinh === 'NU' ? 20 : 25;

if (years < requiredYears) {
  throw new Error(`Chưa đủ ${requiredYears} năm phục vụ (hiện tại: ${years} năm)`);
}
```

## ⚠️ Lưu ý Quan trọng

1. **Điều kiện khác nhau**: Nữ ≥ 20 năm, Nam ≥ 25 năm
2. **Giới tính bắt buộc**: Phải có thông tin `gioi_tinh` (NAM hoặc NU)
3. **Mỗi quân nhân chỉ 1 bản ghi**: KNC_VSNXD_QDNDVN là duy nhất cho mỗi quân nhân
4. **Validation tự động**: Hệ thống tự động kiểm tra điều kiện theo giới tính khi tạo đề xuất
5. **Ngày nhập ngũ**: Bắt buộc phải có `ngay_nhap_ngu` trong hồ sơ
6. **Dữ liệu lưu**: Lưu cả thông tin thời gian phục vụ vào JSON

## 📖 Use Cases

### UC-01: Manager đề xuất KNC_VSNXD_QDNDVN

**Actor**: Manager

**Mô tả**: Manager tạo đề xuất Kỷ niệm chương VSNXD QĐNDVN cho quân nhân đủ điều kiện theo giới tính

**Preconditions**:

- Manager đã đăng nhập hệ thống
- Manager có quyền quản lý đơn vị
- Quân nhân thuộc đơn vị của Manager
- Quân nhân có `ngay_nhap_ngu` và `gioi_tinh` trong hồ sơ
- Quân nhân đủ điều kiện: Nữ ≥ 20 năm, Nam ≥ 25 năm

**Main Flow**:

1. Manager chọn loại đề xuất: "Kỷ niệm chương VSNXD QĐNDVN"
2. Manager chọn quân nhân cần đề xuất
3. Hệ thống tự động kiểm tra điều kiện:
   - Lấy `ngay_nhap_ngu` và `gioi_tinh` từ hồ sơ quân nhân
   - Tính thời gian phục vụ từ `ngay_nhap_ngu` đến hiện tại (hoặc `ngay_xuat_ngu`)
   - Kiểm tra theo giới tính:
     - Nữ: ≥ 20 năm
     - Nam: ≥ 25 năm
4. Nếu đủ điều kiện:
   - Hệ thống hiển thị thời gian phục vụ và giới tính
   - Manager nhập năm đề xuất
   - Manager upload file đính kèm (tùy chọn)
   - Manager gửi đề xuất
   - Hệ thống tạo đề xuất với trạng thái `PENDING`
5. Hệ thống gửi thông báo cho Admin

**Postconditions**:

- Đề xuất được tạo với trạng thái `PENDING`
- Thông tin thời gian phục vụ được lưu trong đề xuất
- Admin nhận được thông báo có đề xuất mới

**Exception Flow**:

- 3a. Quân nhân chưa có `ngay_nhap_ngu` → Hệ thống từ chối, yêu cầu cập nhật
- 3b. Quân nhân chưa có `gioi_tinh` → Hệ thống từ chối, yêu cầu cập nhật
- 3c. Quân nhân chưa đủ điều kiện → Hệ thống từ chối, hiển thị số năm hiện tại và yêu cầu

---

### UC-02: Admin phê duyệt đề xuất KNC_VSNXD_QDNDVN

**Actor**: Admin

**Mô tả**: Admin kiểm tra điều kiện theo giới tính và phê duyệt đề xuất

**Preconditions**:

- Admin đã đăng nhập hệ thống
- Có đề xuất KNC_VSNXD_QDNDVN với trạng thái `PENDING`

**Main Flow**:

1. Admin xem danh sách đề xuất `PENDING`
2. Admin chọn đề xuất KNC_VSNXD_QDNDVN
3. Admin xem chi tiết đề xuất:
   - Thông tin quân nhân
   - Giới tính
   - Ngày nhập ngũ
   - Ngày xuất ngũ (nếu có)
   - Thời gian phục vụ (tự động tính)
   - Điều kiện yêu cầu (theo giới tính)
   - Năm đề xuất
   - File đính kèm (nếu có)
4. Admin kiểm tra lại điều kiện:
   - Xác nhận giới tính
   - Xác nhận thời gian phục vụ đủ điều kiện (Nữ ≥ 20, Nam ≥ 25)
   - Kiểm tra tính toán đúng
5. Admin có thể chỉnh sửa:
   - Số quyết định (nếu đã có)
   - File quyết định (nếu đã có)
6. Admin phê duyệt đề xuất
7. Hệ thống cập nhật:
   - Trạng thái đề xuất: `APPROVED`
   - Bảng `KyNiemChuongVSNXDQDNDVN`: Thêm/cập nhật bản ghi (UNIQUE quan_nhan_id)
8. Hệ thống gửi thông báo cho Manager

**Postconditions**:

- Đề xuất có trạng thái `APPROVED`
- Dữ liệu được cập nhật vào database
- Manager nhận được thông báo phê duyệt

**Alternative Flow**:

- 5a. Admin từ chối đề xuất → Trạng thái `REJECTED`, gửi thông báo cho Manager
- 4a. Thời gian phục vụ không đủ điều kiện → Admin từ chối, ghi chú lý do

---

## 🔧 Đặc tả Kỹ thuật

### Validation Rules

#### 1. Validation khi tạo đề xuất (Frontend)

**Rule V-01**: Kiểm tra loại đề xuất hợp lệ

- **Input**: `proposalType`
- **Validation**: Phải là `'KNC_VSNXD_QDNDVN'`
- **Error**: "Loại đề xuất không hợp lệ"

**Rule V-02**: Kiểm tra đã chọn quân nhân

- **Input**: `selectedPersonnelIds`
- **Validation**: Phải có ít nhất 1 quân nhân
- **Error**: "Vui lòng chọn ít nhất 1 quân nhân"

**Rule V-03**: Kiểm tra có giới tính

- **Input**: `personnel.gioi_tinh`
- **Validation**: Phải có `gioi_tinh` và phải là 'NAM' hoặc 'NU'
- **Error**: "Quân nhân chưa có thông tin giới tính hoặc giới tính không hợp lệ"

**Rule V-04**: Kiểm tra có ngày nhập ngũ

- **Input**: `personnel.ngay_nhap_ngu`
- **Validation**: Phải có `ngay_nhap_ngu` trong hồ sơ quân nhân
- **Error**: "Quân nhân chưa có thông tin ngày nhập ngũ"

**Rule V-05**: Kiểm tra điều kiện thời gian phục vụ theo giới tính

- **Input**: `personnel.ngay_nhap_ngu`, `personnel.gioi_tinh`
- **Validation**:
  - Nữ: Thời gian phục vụ phải ≥ 20 năm
  - Nam: Thời gian phục vụ phải ≥ 25 năm
- **Error**: `Chưa đủ ${requiredYears} năm phục vụ (hiện tại: ${years} năm)`

**Rule V-06**: Kiểm tra năm đề xuất

- **Input**: `nam`
- **Validation**:
  - Phải là số nguyên dương
  - Phải <= năm hiện tại
  - Phải >= 2000
- **Error**: "Năm đề xuất không hợp lệ"

#### 2. Validation khi phê duyệt (Backend)

**Rule V-07**: Kiểm tra trùng lặp bản ghi

- **Input**: `personnel_id`
- **Validation**:
  - Kiểm tra `KyNiemChuongVSNXDQDNDVN` đã có bản ghi với `quan_nhan_id`
  - Nếu có → Cập nhật, nếu không → Tạo mới
- **Logic**: Sử dụng `upsert` với `UNIQUE(quan_nhan_id)`

**Rule V-08**: Kiểm tra lại điều kiện thời gian theo giới tính

- **Input**: `personnel_id`
- **Validation**:
  - Tính lại thời gian phục vụ
  - Kiểm tra giới tính
  - Nữ: Phải ≥ 20 năm
  - Nam: Phải ≥ 25 năm
- **Error**: `Chưa đủ ${requiredYears} năm phục vụ (hiện tại: ${years} năm)`

### Business Rules

**Rule B-01**: Điều kiện thời gian phục vụ theo giới tính

- **Mô tả**: Yêu cầu khác nhau tùy theo giới tính:
  - **Nữ**: ≥ 20 năm phục vụ
  - **Nam**: ≥ 25 năm phục vụ
- **Tính toán**: Từ `ngay_nhap_ngu` đến `ngay_xuat_ngu` (nếu có) hoặc ngày hiện tại
- **Ví dụ**:
  - Nữ: Nhập ngũ 01/01/2004, hiện tại 01/01/2024 → 20 năm → Đủ điều kiện
  - Nam: Nhập ngũ 01/01/1999, hiện tại 01/01/2024 → 25 năm → Đủ điều kiện

**Rule B-02**: Mỗi quân nhân chỉ 1 bản ghi KNC_VSNXD_QDNDVN

- **Mô tả**: KNC_VSNXD_QDNDVN là duy nhất cho mỗi quân nhân
- **Logic**: Sử dụng `UNIQUE(quan_nhan_id)` trong database
- **Lưu ý**: Nếu quân nhân đã có KNC_VSNXD_QDNDVN, đề xuất mới sẽ cập nhật bản ghi cũ

**Rule B-03**: Lưu thông tin thời gian vào JSON

- **Mô tả**: Thông tin thời gian phục vụ được lưu vào trường `thoi_gian` dạng JSON
- **Cấu trúc**:
  ```json
  {
    "total_months": 240,
    "years": 20,
    "months": 0,
    "display": "20 năm"
  }
  ```

### Error Handling

**Error E-01**: Validation failed khi tạo đề xuất

- **HTTP Status**: 400 Bad Request
- **Response**:

```json
{
  "success": false,
  "error": "Validation failed",
  "details": {
    "field": "thoi_gian",
    "message": "Chưa đủ 20 năm phục vụ (hiện tại: 18 năm)",
    "gioi_tinh": "NU",
    "required_years": 20
  }
}
```

**Error E-02**: Thiếu thông tin giới tính

- **HTTP Status**: 400 Bad Request
- **Response**:

```json
{
  "success": false,
  "error": "Quân nhân chưa có thông tin giới tính",
  "details": {
    "personnel_id": "abc123",
    "ho_ten": "Nguyễn Văn A"
  }
}
```

**Error E-03**: Trùng lặp bản ghi

- **HTTP Status**: 409 Conflict
- **Response**:

```json
{
  "success": false,
  "error": "Quân nhân đã có Kỷ niệm chương VSNXD QĐNDVN",
  "details": {
    "personnel_id": "abc123",
    "existing_record_id": "xyz789",
    "existing_nam": 2020
  }
}
```

### Data Flow

**Flow F-01**: Tạo đề xuất KNC_VSNXD_QDNDVN

```
Manager → Frontend → API POST /api/proposals
  → ProposalService.submitProposal()
  → Validation (V-01 đến V-06)
  → Check gioi_tinh
  → Calculate service time (ngay_nhap_ngu)
  → Check condition by gender (NU >= 20, NAM >= 25)
  → Create Proposal (status: PENDING)
  → Create Notification (Admin)
  → Response to Manager
```

**Flow F-02**: Phê duyệt đề xuất KNC_VSNXD_QDNDVN

```
Admin → Frontend → API PUT /api/proposals/{id}/approve
  → ProposalService.approveProposal()
  → Validation (V-07, V-08)
  → Check existing record (UNIQUE quan_nhan_id)
  → Upsert KyNiemChuongVSNXDQDNDVN
  → Update Proposal (status: APPROVED)
  → Create Notification (Manager)
  → Response to Admin
```

## 🔍 Logic Validation

### Kiểm tra điều kiện thời gian

```javascript
async function validateKNC_VSNXD_QDNDVN(personnelId) {
  const quanNhan = await prisma.quanNhan.findUnique({
    where: { id: personnelId },
    select: {
      ho_ten: true,
      gioi_tinh: true,
      ngay_nhap_ngu: true,
      ngay_xuat_ngu: true,
    },
  });

  // Kiểm tra giới tính
  if (!quanNhan.gioi_tinh || (quanNhan.gioi_tinh !== 'NAM' && quanNhan.gioi_tinh !== 'NU')) {
    throw new Error('Chưa cập nhật thông tin giới tính');
  }

  // Kiểm tra ngày nhập ngũ
  if (!quanNhan.ngay_nhap_ngu) {
    throw new Error('Chưa có thông tin ngày nhập ngũ');
  }

  const ngayNhapNgu = new Date(quanNhan.ngay_nhap_ngu);
  const ngayKetThuc = quanNhan.ngay_xuat_ngu ? new Date(quanNhan.ngay_xuat_ngu) : new Date();

  let months = (ngayKetThuc.getFullYear() - ngayNhapNgu.getFullYear()) * 12;
  months += ngayKetThuc.getMonth() - ngayNhapNgu.getMonth();
  if (ngayKetThuc.getDate() < ngayNhapNgu.getDate()) {
    months--;
  }
  months = Math.max(0, months);

  const years = Math.floor(months / 12);

  // Yêu cầu: nữ >=20 năm, nam >=25 năm
  const requiredYears = quanNhan.gioi_tinh === 'NU' ? 20 : 25;

  if (years < requiredYears) {
    throw new Error(`Chưa đủ ${requiredYears} năm phục vụ (hiện tại: ${years} năm)`);
  }

  return true;
}
```

### Kiểm tra trùng lặp

```javascript
// Kiểm tra xem quân nhân đã có KNC_VSNXD_QDNDVN chưa
const existing = await prisma.kyNiemChuongVSNXDQDNDVN.findUnique({
  where: { quan_nhan_id: personnelId },
});

if (existing) {
  throw new Error(
    `Quân nhân đã có Kỷ niệm chương Vì sự nghiệp xây dựng QĐNDVN (năm ${existing.nam})`
  );
}
```

## 📈 Thống kê

- **Tổng số khen thưởng**: Đếm từ bảng `KyNiemChuongVSNXDQDNDVN`
- **Theo giới tính**: Phân tích theo `gioi_tinh` của quân nhân
- **Theo năm**: Nhóm theo `nam`
- **Theo thời gian phục vụ**: Phân tích từ trường `thoi_gian`

## 🔗 Tài liệu Liên quan

- [Tài liệu API](../QLKT.md) - Phần 5: Awards Management
- [Huy chương quân kỳ Quyết thắng](./05-HC-QKQT.md) - So sánh điều kiện (≥ 25 năm cho cả nam và nữ)
- [Niên hạn](./03-NIEN-HAN.md) - So sánh với khen thưởng niên hạn
