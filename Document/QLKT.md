# 📋 Tài liệu API dự án QLKT (Quản lý Khen thưởng)

## 🔐 1. Xác thực & Phân quyền (Authentication)

Hệ thống sử dụng cơ chế JWT (JSON Web Token) với Access Token (thời hạn ngắn, dùng để xác thực API) và Refresh Token (thời hạn dài, dùng để lấy Access Token mới).

| Method | Endpoint                    | Chức năng chi tiết                    | Request Body                                     | Response (Success)                                                                            |
| :----- | :-------------------------- | :------------------------------------ | :----------------------------------------------- | :-------------------------------------------------------------------------------------------- |
| `POST` | `/api/auth/login`           | Đăng nhập hệ thống.                   | `{ "username": "...", "password": "..." }`       | `{ "accessToken": "...", "refreshToken": "...", "user": { "role": "...", "ho_ten": "..." } }` |
| `POST` | `/api/auth/refresh`         | Lấy Access Token mới khi hết hạn.     | `{ "refreshToken": "..." }`                      | `{ "accessToken": "..." }`                                                                    |
| `POST` | `/api/auth/logout`          | (Tùy chọn) Vô hiệu hóa Refresh Token. | `{ "refreshToken": "..." }`                      | `{ "message": "Logged out" }`                                                                 |
| `POST` | `/api/auth/change-password` | Tự đổi mật khẩu (khi đã đăng nhập).   | `{ "oldPassword": "...", "newPassword": "..." }` | `{ "message": "Password changed" }`                                                           |

> **⚠️ Lưu ý:** Tất cả các API dưới đây (trừ các endpoint Auth) đều yêu cầu `access_token` trong Header:
>
> ```
> Authorization: Bearer <your_access_token>
> ```

---

## 👑 2. Quản lý Tài khoản (Vai trò: SUPER_ADMIN)

| Method   | Endpoint                       | Chức năng chi tiết                       | Request Body / Params                                                              | Vai trò     |
| :------- | :----------------------------- | :--------------------------------------- | :--------------------------------------------------------------------------------- | :---------- |
| `GET`    | `/api/accounts`                | Lấy danh sách tài khoản (có phân trang). | `?page=1&limit=10`                                                                 | SUPER_ADMIN |
| `POST`   | `/api/accounts`                | Tạo tài khoản mới.                       | `{ "personnel_id": "...", "username": "...", "password": "...", "role": "ADMIN" }` | SUPER_ADMIN |
| `PUT`    | `/api/accounts/{id}`           | Cập nhật tài khoản (đổi vai trò).        | `{ "role": "MANAGER" }`                                                            | SUPER_ADMIN |
| `POST`   | `/api/accounts/reset-password` | Đặt lại mật khẩu cho tài khoản.          | `{ "account_id": "..." }`                                                          | SUPER_ADMIN |
| `DELETE` | `/api/accounts/{id}`           | Xóa (vô hiệu hóa) tài khoản.             | `Params: {id}`                                                                     | SUPER_ADMIN |

---

## 📁 3. Quản lý Danh mục (Vai trò: ADMIN)

### 3.1. Đơn vị (Units)

| Method   | Endpoint          | Chức năng chi tiết                              | Request Body / Params                         | Vai trò |
| :------- | :---------------- | :---------------------------------------------- | :-------------------------------------------- | :------ |
| `GET`    | `/api/units`      | Lấy tất cả Đơn vị.                              | (Không)                                       | ADMIN   |
| `POST`   | `/api/units`      | Tạo Đơn vị mới.                                 | `{ "ma_don_vi": "K1", "ten_don_vi": "Hệ 1" }` | ADMIN   |
| `PUT`    | `/api/units/{id}` | Sửa tên Đơn vị.                                 | `{ "ten_don_vi": "Hệ 1 (Mới)" }`              | ADMIN   |
| `DELETE` | `/api/units/{id}` | Xóa Đơn vị (nếu đơn vị đó không còn quân nhân). | `Params: {id}`                                | ADMIN   |

### 3.2. Nhóm cống hiến (Contribution Groups)

| Method   | Endpoint                        | Chức năng chi tiết                           | Request Body / Params             | Vai trò |
| :------- | :------------------------------ | :------------------------------------------- | :-------------------------------- | :------ |
| `GET`    | `/api/contribution-groups`      | Lấy danh sách Nhóm cống hiến (Nhóm 5, 6...). | (Không)                           | ADMIN   |
| `POST`   | `/api/contribution-groups`      | Thêm Nhóm cống hiến mới.                     | `{ "ten_nhom": "Nhóm 10" }`       | ADMIN   |
| `PUT`    | `/api/contribution-groups/{id}` | Sửa tên Nhóm cống hiến.                      | `{ "ten_nhom": "Nhóm 10 (Mới)" }` | ADMIN   |
| `DELETE` | `/api/contribution-groups/{id}` | Xóa Nhóm cống hiến.                          | `Params: {id}`                    | ADMIN   |

### 3.3. Chức vụ (Positions)

| Method   | Endpoint              | Chức năng chi tiết                   | Request Body / Params                                                                             | Vai trò        |
| :------- | :-------------------- | :----------------------------------- | :------------------------------------------------------------------------------------------------ | :------------- |
| `GET`    | `/api/positions`      | Lấy Chức vụ (lọc theo Đơn vị).       | `?unit_id={id}` (Bắt buộc)                                                                        | ADMIN, MANAGER |
| `POST`   | `/api/positions`      | Tạo Chức vụ mới (gắn với `unit_id`). | `{ "unit_id": "...", "ten_chuc_vu": "Học viên", "is_manager": false, "nhom_cong_hien_id": null }` | ADMIN          |
| `PUT`    | `/api/positions/{id}` | Sửa Chức vụ (gán Nhóm cống hiến).    | `{ "nhom_cong_hien_id": "..." }`                                                                  | ADMIN          |
| `DELETE` | `/api/positions/{id}` | Xóa Chức vụ.                         | `Params: {id}`                                                                                    | ADMIN          |

---

## 👨‍💼 4. Quản lý Quân nhân (Personnel)

| Method | Endpoint                | Chức năng chi tiết                                          | Request Body / Params                                                                                | Vai trò                          |
| :----- | :---------------------- | :---------------------------------------------------------- | :--------------------------------------------------------------------------------------------------- | :------------------------------- |
| `GET`  | `/api/personnel`        | Lấy DS Quân nhân (Admin: tất cả; Manager: lọc theo đơn vị). | `?page=1&limit=10`                                                                                   | ADMIN, MANAGER                   |
| `GET`  | `/api/personnel/{id}`   | Lấy chi tiết 1 Quân nhân.                                   | `Params: {id}`. User chỉ lấy được `id` của mình.                                                     | ADMIN, MANAGER, USER             |
| `POST` | `/api/personnel`        | Thêm Quân nhân mới.                                         | `{ "cccd": "...", "ho_ten": "...", "ngay_nhap_ngu": "...", "unit_id": "...", "position_id": "..." }` | ADMIN                            |
| `PUT`  | `/api/personnel/{id}`   | Cập nhật Quân nhân (chuyển đơn vị, chức vụ).                | `{ "unit_id": "...", "position_id": "..." }`                                                         | ADMIN, MANAGER (cho đơn vị mình) |
| `POST` | `/api/personnel/import` | Import hàng loạt từ Excel.                                  | `Body: multipart/form-data` (File Excel)                                                             | ADMIN                            |
| `GET`  | `/api/personnel/export` | Xuất toàn bộ dữ liệu ra Excel.                              | (Không)                                                                                              | ADMIN                            |

---

## 🏆 5. Quản lý Khen thưởng (Input - Nghiệp vụ chính)

> **📚 Tài liệu Chi tiết**: Xem thêm các file trong thư mục `Document/` để biết chi tiết về từng loại khen thưởng:
>
> - [Cá nhân Hằng năm](./Document/01-CA-NHAN-HANG-NAM.md)
> - [Đơn vị Hằng năm](./Document/02-DON-VI-HANG-NAM.md)
> - [Niên hạn](./Document/03-NIEN-HAN.md)
> - [Cống hiến](./Document/04-CONG-HIEN.md)
> - [Huy chương quân kỳ Quyết thắng](./Document/05-HC-QKQT.md)
> - [Kỷ niệm chương VSNXD QĐNDVN](./Document/06-KNC-VSNXD-QDNDVN.md)
> - [Đột xuất](./Document/07-DOT-XUAT.md)
> - [Thành tích Khoa học](./Document/08-THANH-TICH-KHOA-HOC.md)

### 5.1. Danh hiệu hằng năm (Annual Rewards)

| Method   | Endpoint                   | Chức năng chi tiết                                                  | Request Body / Params                                           | Vai trò              |
| :------- | :------------------------- | :------------------------------------------------------------------ | :-------------------------------------------------------------- | :------------------- |
| `GET`    | `/api/annual-rewards`      | Lấy nhật ký Danh hiệu (CSTĐCS...) của 1 quân nhân.                  | `?personnel_id={id}` (Bắt buộc)                                 | ADMIN, MANAGER, USER |
| `POST`   | `/api/annual-rewards`      | Thêm 1 Danh hiệu (CSTĐCS...) cho quân nhân.                         | `{ "personnel_id": "...", "nam": 2024, "danh_hieu": "CSTĐCS" }` | ADMIN, MANAGER       |
| `PUT`    | `/api/annual-rewards/{id}` | Sửa một bản ghi Danh hiệu (ví dụ: nhập nhầm 'CSTT' thành 'CSTĐCS'). | `{ "nam": 2024, "danh_hieu": "CSTĐCS" }`                        | ADMIN, MANAGER       |
| `DELETE` | `/api/annual-rewards/{id}` | Xóa 1 bản ghi Danh hiệu.                                            | `Params: {id}`                                                  | ADMIN, MANAGER       |

### 5.2. Thành tích khoa học (Scientific Achievements)

| Method   | Endpoint                            | Chức năng chi tiết                              | Request Body / Params                                                                         | Vai trò              |
| :------- | :---------------------------------- | :---------------------------------------------- | :-------------------------------------------------------------------------------------------- | :------------------- |
| `GET`    | `/api/scientific-achievements`      | Lấy nhật ký ĐTKH/SKKH của 1 quân nhân.          | `?personnel_id={id}` (Bắt buộc)                                                               | ADMIN, MANAGER, USER |
| `POST`   | `/api/scientific-achievements`      | Thêm 1 ĐTKH/SKKH.                               | `{ "personnel_id": "...", "nam": 2024, "loai": "NCKH", "mo_ta": "...", "status": "PENDING" }` | ADMIN, MANAGER       |
| `PUT`    | `/api/scientific-achievements/{id}` | Sửa thông tin NCKH (ví dụ: sửa mo_ta hoặc nam). | `{ "nam": 2024, "loai": "NCKH", "mo_ta": "...", "status": "APPROVED" }`                       | ADMIN, MANAGER       |
| `DELETE` | `/api/scientific-achievements/{id}` | Xóa một bản ghi NCKH (nhập thừa, nhập sai).     | `Params: {id}`                                                                                | ADMIN, MANAGER       |

### 5.3. Lịch sử chức vụ (Position History)

| Method   | Endpoint                     | Chức năng chi tiết                                          | Request Body / Params                                                    | Vai trò              |
| :------- | :--------------------------- | :---------------------------------------------------------- | :----------------------------------------------------------------------- | :------------------- |
| `GET`    | `/api/position-history`      | Lấy Lịch sử chức vụ (Cống hiến) của 1 người.                | `?personnel_id={id}` (Bắt buộc)                                          | ADMIN, MANAGER, USER |
| `POST`   | `/api/position-history`      | Thêm 1 mốc Lịch sử chức vụ (để tính cống hiến).             | `{ "personnel_id": "...", "chuc_vu_id": "...", "ngay_bat_dau": "..." }`  | ADMIN, MANAGER       |
| `PUT`    | `/api/position-history/{id}` | Sửa một mốc Lịch sử chức vụ (ví dụ: nhập sai ngay_bat_dau). | `{ "chuc_vu_id": "...", "ngay_bat_dau": "...", "ngay_ket_thuc": "..." }` | ADMIN, MANAGER       |
| `DELETE` | `/api/position-history/{id}` | Xóa một mốc Lịch sử chức vụ.                                | `Params: {id}`                                                           | ADMIN, MANAGER       |

---

## 📊 6. Hồ sơ Gợi ý (Output - Chỉ đọc)

### 6.1. Xem Hồ sơ Gợi ý

| Method | Endpoint                               | Chức năng chi tiết                               | Request Body / Params    | Vai trò              |
| :----- | :------------------------------------- | :----------------------------------------------- | :----------------------- | :------------------- |
| `GET`  | `/api/profiles/annual/{personnel_id}`  | Lấy Hồ sơ gợi ý Hằng năm (Bảng 8 `HoSoHangNam`). | `Params: {personnel_id}` | ADMIN, MANAGER, USER |
| `GET`  | `/api/profiles/service/{personnel_id}` | Lấy Hồ sơ gợi ý Niên hạn (Bảng 7 `HoSoNienHan`). | `Params: {personnel_id}` | ADMIN, MANAGER, USER |

### 6.2. Tính toán lại Hồ sơ (Bộ não)

| Method | Endpoint                                   | Chức năng chi tiết                                            | Request Body / Params    | Vai trò        |
| :----- | :----------------------------------------- | :------------------------------------------------------------ | :----------------------- | :------------- |
| `POST` | `/api/profiles/recalculate/{personnel_id}` | Yêu cầu "bộ não" chạy tính toán lại cho 1 quân nhân.          | `Params: {personnel_id}` | ADMIN, MANAGER |
| `POST` | `/api/profiles/recalculate-all`            | (Tùy chọn) Yêu cầu tính toán lại cho toàn bộ đơn vị/Học viện. | (Không)                  | ADMIN          |

---

# 🗄️ Cấu trúc Database Schema

## 📋 1. DonVi (Đơn vị)

**Mục đích:** Quản lý danh sách các Hệ, Phòng, Ban (K1, K2, Phòng Chính trị...).

| Tên Cột      | Kiểu Dữ Liệu | Khóa            | Ghi Chú                                            |
| :----------- | :----------- | :-------------- | :------------------------------------------------- |
| `id`         | Serial       | PK (Khóa chính) | Mã tự động tăng (1, 2, 3...).                      |
| `ma_don_vi`  | Varchar      | Unique          | Mã nghiệp vụ (VD: "K1", "PCT"). Dùng để import.    |
| `ten_don_vi` | Varchar      |                 | Tên đầy đủ (VD: "Hệ 1", "Phòng Chính trị").        |
| `so_luong`   | Integer      |                 | Tổng quân số (Nên được hệ thống tự động cập nhật). |

---

## 📋 2. NhomCongHien (Nhóm cống hiến)

**Mục đích:** Quản lý danh sách các Nhóm cống hiến (Nhóm 5, 6, 7...) để Admin có thể Thêm/Sửa/Xóa.

| Tên Cột    | Kiểu Dữ Liệu | Khóa   | Ghi Chú                                       |
| :--------- | :----------- | :----- | :-------------------------------------------- |
| `id`       | Serial       | PK     | Mã tự động tăng.                              |
| `ten_nhom` | Varchar      | Unique | Tên nhóm (VD: "Nhóm 5", "Nhóm 6", "Nhóm 10"). |
| `mo_ta`    | Varchar      |        | (Tùy chọn) Mô tả chi tiết nhóm này là gì.     |

---

## 📋 3. ChucVu (Chức vụ)

**Mục đích:** Quản lý các loại chức vụ có trong từng đơn vị.

| Tên Cột             | Kiểu Dữ Liệu | Khóa                     | Ghi Chú                                                 |
| :------------------ | :----------- | :----------------------- | :------------------------------------------------------ |
| `id`                | Serial       | PK                       | Mã tự động tăng.                                        |
| `don_vi_id`         | Integer      | FK (tới DonVi.id)        | Xác định chức vụ này thuộc đơn vị nào.                  |
| `ten_chuc_vu`       | Varchar      |                          | Tên chức vụ (VD: "Hệ trưởng", "Học viên").              |
| `is_manager`        | Boolean      |                          | true nếu đây là chức vụ Chỉ huy (để cấp quyền Manager). |
| `nhom_cong_hien_id` | Integer      | FK (tới NhomCongHien.id) | Liên kết chức vụ với Nhóm cống hiến (Có thể NULL).      |

> **Constraint:** `UNIQUE(don_vi_id, ten_chuc_vu)` - Không cho phép trùng tên chức vụ trong cùng 1 đơn vị.

---

## 📋 4. QuanNhan (Quân nhân)

**Mục đích:** Bảng trung tâm lưu trữ thông tin gốc của tất cả quân nhân.

| Tên Cột         | Kiểu Dữ Liệu | Khóa               | Ghi Chú                                |
| :-------------- | :----------- | :----------------- | :------------------------------------- |
| `id`            | Serial       | PK                 | Mã tự động tăng.                       |
| `cccd`          | Varchar      | Unique             | **CHÌA KHÓA IMPORT/EXPORT.**           |
| `ho_ten`        | Varchar      |                    | Họ và tên.                             |
| `ngay_sinh`     | Date         |                    | Ngày sinh.                             |
| `ngay_nhap_ngu` | Date         |                    | **DÙNG ĐỂ TÍNH KHEN THƯỞNG NIÊN HẠN.** |
| `don_vi_id`     | Integer      | FK (tới DonVi.id)  | Đơn vị hiện tại của quân nhân.         |
| `chuc_vu_id`    | Integer      | FK (tới ChucVu.id) | Chức vụ hiện tại của quân nhân.        |

---

## 📋 5. TaiKhoan (Tài khoản)

**Mục đích:** Quản lý đăng nhập và phân quyền.

| Tên Cột         | Kiểu Dữ Liệu | Khóa                 | Ghi Chú                                                         |
| :-------------- | :----------- | :------------------- | :-------------------------------------------------------------- |
| `id`            | Serial       | PK                   | Mã tự động tăng.                                                |
| `quan_nhan_id`  | Integer      | FK (tới QuanNhan.id) | Liên kết tài khoản với quân nhân (Có thể NULL cho SUPER_ADMIN). |
| `username`      | Varchar      | Unique               | Tên đăng nhập.                                                  |
| `password_hash` | Varchar      |                      | Mật khẩu đã mã hóa.                                             |
| `role`          | ENUM         |                      | ('SUPER_ADMIN', 'ADMIN', 'MANAGER', 'USER').                    |

---

## 📋 6. LichSuChucVu (Lịch sử chức vụ)

**Mục đích:** **(INPUT)** Lưu "nguyên liệu" để tính Khen thưởng Cống hiến (HCBVTQ).

| Tên Cột         | Kiểu Dữ Liệu | Khóa                 | Ghi Chú                            |
| :-------------- | :----------- | :------------------- | :--------------------------------- |
| `id`            | Serial       | PK                   | Mã tự động tăng.                   |
| `quan_nhan_id`  | Integer      | FK (tới QuanNhan.id) | Quân nhân.                         |
| `chuc_vu_id`    | Integer      | FK (tới ChucVu.id)   | Giữ chức vụ _cụ thể_ nào.          |
| `ngay_bat_dau`  | Date         |                      | Ngày bắt đầu.                      |
| `ngay_ket_thuc` | Date         |                      | (Để NULL nếu là chức vụ hiện tại). |

---

## 📋 7. ThanhTichKhoaHoc (Thành tích khoa học)

**Mục đích:** **(INPUT)** Lưu các "tiền đề" NCKH, SKKH. Một người có thể có nhiều đề tài trong 1 năm.

| Tên Cột        | Kiểu Dữ Liệu | Khóa                 | Ghi Chú                    |
| :------------- | :----------- | :------------------- | :------------------------- |
| `id`           | Serial       | PK                   | Mã tự động tăng.           |
| `quan_nhan_id` | Integer      | FK (tới QuanNhan.id) | Quân nhân.                 |
| `nam`          | Integer      |                      | Năm hoàn thành/được duyệt. |
| `loai`         | ENUM         |                      | ('NCKH', 'SKKH').          |
| `mo_ta`        | Varchar      |                      | Tên đề tài, sáng kiến.     |
| `status`       | ENUM         |                      | ('APPROVED', 'PENDING').   |

---

## 📋 8. DanhHieuHangNam (Danh hiệu hằng năm)

**Mục đích:** **(INPUT)** Lưu danh hiệu chính (CSTĐCS, CSTT) và **(OUTPUT)** Ghi nhận khen thưởng bậc cao đạt được năm đó.

| Tên Cột                | Kiểu Dữ Liệu | Khóa                 | Ghi Chú                                              |
| :--------------------- | :----------- | :------------------- | :--------------------------------------------------- |
| `id`                   | Serial       | PK                   | Mã tự động tăng.                                     |
| `quan_nhan_id`         | Integer      | FK (tới QuanNhan.id) | Quân nhân.                                           |
| `nam`                  | Integer      |                      | Năm xét danh hiệu.                                   |
| `danh_hieu`            | ENUM         |                      | ('CSTĐCS', 'CSTT', 'KHONG_DAT').                     |
| `nhan_bkbqp`           | Boolean      |                      | **(OUTPUT)** Ghi nhận có đạt BKBQP năm nay.          |
| `so_quyet_dinh_bkbqp`  | Varchar      |                      | (Tương ứng với BKBQP)                                |
| `nhan_cstdtq`          | Boolean      |                      | **(OUTPUT)** Ghi nhận có đạt CSTD Toàn quân năm nay. |
| `so_quyet_dinh_cstdtq` | Varchar      |                      | (Tương ứng với CSTD Toàn quân)                       |

---

## 📋 9. HoSoNienHan (Hồ sơ Niên hạn)

**Mục đích:** **(OUTPUT)** Lưu "kết quả & gợi ý" đã tính toán cho Khen thưởng Niên hạn/Cống hiến.

| Tên Cột                   | Kiểu Dữ Liệu | Khóa                         | Ghi Chú                                    |
| :------------------------ | :----------- | :--------------------------- | :----------------------------------------- |
| `id`                      | Serial       | PK                           | Mã tự động tăng.                           |
| `quan_nhan_id`            | Integer      | FK (tới QuanNhan.id), Unique | Liên kết 1-1 với Quân nhân.                |
| `hccsvv_hang_ba_status`   | ENUM         |                              | ('CHUA_DU', 'DU_DIEU_KIEN', 'DA_NHAN').    |
| `hccsvv_hang_ba_ngay`     | Date         |                              | Ngày dự kiến đủ điều kiện.                 |
| `hccsvv_hang_nhi_status`  | ENUM         |                              | (Tương tự...)                              |
| `hccsvv_hang_nhi_ngay`    | Date         |                              | (Tương tự...)                              |
| `hccsvv_hang_nhat_status` | ENUM         |                              | (Tương tự...)                              |
| `hccsvv_hang_nhat_ngay`   | Date         |                              | (Tương tự...)                              |
| `hcbvtq_total_months`     | Integer      |                              | Tổng số tháng cống hiến đã tích lũy.       |
| `hcbvtq_hang_ba_status`   | ENUM         |                              | ('CHUA_DU', 'DU_DIEU_KIEN', 'DA_NHAN').    |
| `hcbvtq_hang_nhi_status`  | ENUM         |                              | (Tương tự...)                              |
| `hcbvtq_hang_nhat_status` | ENUM         |                              | (Tương tự...)                              |
| `goi_y`                   | Varchar      |                              | **LƯU GỢI Ý** (VD: "Sắp đủ điều kiện..."). |

---

## 📋 10. HoSoHangNam (Hồ sơ Hằng năm)

**Mục đích:** **(OUTPUT)** Lưu "kết quả & gợi ý" đã tính toán cho Khen thưởng Hằng năm.

| Tên Cột               | Kiểu Dữ Liệu | Khóa                         | Ghi Chú                                                       |
| :-------------------- | :----------- | :--------------------------- | :------------------------------------------------------------ |
| `id`                  | Serial       | PK                           | Mã tự động tăng.                                              |
| `quan_nhan_id`        | Integer      | FK (tới QuanNhan.id), Unique | Liên kết 1-1 với Quân nhân.                                   |
| `tong_CSTĐCS`         | Integer      |                              | Tổng số CSTĐCS đã đạt.                                        |
| `tong_nckh`           | Integer      |                              | Tổng số ĐTKH/SKKH đã APPROVED.                                |
| `CSTĐCS_lien_tuc`     | Integer      |                              | Số năm CSTĐCS _liên tục_ hiện tại.                            |
| `du_dieu_kien_bkbqp`  | Boolean      |                              | true nếu đủ điều kiện Bằng khen BQP.                          |
| `du_dieu_kien_cstdtq` | Boolean      |                              | true nếu đủ điều kiện CSTD Toàn quân.                         |
| `goi_y`               | Varchar      |                              | **LƯU GỢI Ý** (VD: "Cần thêm NCKH để đạt CSTD Toàn quân..."). |
