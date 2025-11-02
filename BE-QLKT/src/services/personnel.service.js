const { prisma } = require('../models');
const ExcelJS = require('exceljs');
const bcrypt = require('bcryptjs');

class PersonnelService {
  /**
   * Parse CCCD từ Excel cell - hỗ trợ CCCD bắt đầu bằng số 0
   * Excel tự động loại bỏ số 0 đầu tiên khi lưu dưới dạng số
   * @param {*} value - Giá trị từ Excel cell
   * @returns {string} - CCCD đã được format đúng
   */
  parseCCCD(value) {
    if (!value) return '';

    // Chuyển về string và trim
    let cccd = value.toString().trim();

    // Nếu CCCD có độ dài < 12 (bị mất số 0 đầu), padding thêm số 0
    // CCCD Việt Nam chuẩn là 12 số
    if (/^\d+$/.test(cccd) && cccd.length < 12) {
      cccd = cccd.padStart(12, '0');
    }

    return cccd;
  }

  /**
   * Lấy danh sách quân nhân (có phân trang)
   * Admin: lấy tất cả
   * Manager: lọc theo đơn vị của mình
   */
  async getPersonnel(page = 1, limit = 10, userRole, userQuanNhanId) {
    try {
      const skip = (page - 1) * limit;
      let whereCondition = {};

      // Nếu là MANAGER, chỉ lấy quân nhân trong đơn vị của mình
      if (userRole === 'MANAGER' && userQuanNhanId) {
        const manager = await prisma.quanNhan.findUnique({
          where: { id: parseInt(userQuanNhanId) },
          select: { don_vi_id: true },
        });

        if (manager) {
          whereCondition.don_vi_id = manager.don_vi_id;
        }
      }

      const [personnel, total] = await Promise.all([
        prisma.quanNhan.findMany({
          where: whereCondition,
          skip,
          take: parseInt(limit),
          include: {
            DonVi: true,
            ChucVu: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        }),
        prisma.quanNhan.count({ where: whereCondition }),
      ]);

      return {
        personnel,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Lấy chi tiết 1 quân nhân
   */
  async getPersonnelById(id, userRole, userQuanNhanId) {
    try {
      const personnel = await prisma.quanNhan.findUnique({
        where: { id: parseInt(id) },
        include: {
          DonVi: true,
          ChucVu: {
            include: {
              NhomCongHien: true,
            },
          },
          TaiKhoan: {
            select: {
              id: true,
              username: true,
              role: true,
            },
          },
        },
      });

      if (!personnel) {
        throw new Error('Quân nhân không tồn tại');
      }

      // Kiểm tra quyền truy cập
      // USER chỉ xem được thông tin của chính mình
      if (userRole === 'USER' && parseInt(userQuanNhanId) !== parseInt(id)) {
        throw new Error('Bạn không có quyền xem thông tin này');
      }

      // MANAGER chỉ xem được quân nhân trong đơn vị của mình
      if (userRole === 'MANAGER' && userQuanNhanId) {
        const manager = await prisma.quanNhan.findUnique({
          where: { id: parseInt(userQuanNhanId) },
          select: { don_vi_id: true },
        });

        if (manager && personnel.don_vi_id !== manager.don_vi_id) {
          throw new Error('Bạn không có quyền xem thông tin quân nhân ngoài đơn vị');
        }
      }

      return personnel;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Thêm quân nhân mới
   */
  async createPersonnel(data) {
    try {
      const { cccd, ho_ten, ngay_sinh, ngay_nhap_ngu, unit_id, position_id, role = 'USER' } = data;

      // Kiểm tra CCCD đã tồn tại chưa
      const existingPersonnel = await prisma.quanNhan.findUnique({
        where: { cccd },
      });

      if (existingPersonnel) {
        throw new Error('CCCD đã tồn tại trong hệ thống');
      }

      // Kiểm tra đơn vị có tồn tại không
      const unit = await prisma.donVi.findUnique({
        where: { id: unit_id },
      });

      if (!unit) {
        throw new Error('Đơn vị không tồn tại');
      }

      // Kiểm tra chức vụ có tồn tại không
      const position = await prisma.chucVu.findUnique({
        where: { id: position_id },
      });

      if (!position) {
        throw new Error('Chức vụ không tồn tại');
      }

      // Tạo quân nhân mới
      const newPersonnel = await prisma.quanNhan.create({
        data: {
          cccd,
          ho_ten,
          ngay_sinh: ngay_sinh ? new Date(ngay_sinh) : null,
          ngay_nhap_ngu: new Date(ngay_nhap_ngu),
          don_vi_id: unit_id,
          chuc_vu_id: position_id,
        },
        include: {
          DonVi: true,
          ChucVu: true,
        },
      });

      // Tạo LichSuChucVu cho chức vụ ban đầu
      await prisma.lichSuChucVu.create({
        data: {
          quan_nhan_id: newPersonnel.id,
          chuc_vu_id: position_id,
          ngay_bat_dau: new Date(ngay_nhap_ngu), // Bắt đầu từ ngày nhập ngũ
          ngay_ket_thuc: null, // Chức vụ hiện tại
        },
      });

      // Tự động tạo tài khoản với role được chỉ định (mặc định USER)
      const defaultPassword = '123456'; // Mật khẩu mặc định
      const hashedPassword = await bcrypt.hash(defaultPassword, 10);

      // Tạo username từ CCCD (QN + CCCD)
      const username = `QN${cccd}`;

      // Kiểm tra username đã tồn tại chưa
      const existingAccount = await prisma.taiKhoan.findUnique({
        where: { username },
      });

      if (!existingAccount) {
        await prisma.taiKhoan.create({
          data: {
            username,
            password: hashedPassword,
            role: role,
            quan_nhan_id: newPersonnel.id,
          },
        });
      }

      // Cập nhật số lượng quân nhân trong đơn vị
      await prisma.donVi.update({
        where: { id: unit_id },
        data: {
          so_luong: {
            increment: 1,
          },
        },
      });

      return newPersonnel;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Cập nhật quân nhân (chuyển đơn vị, chức vụ)
   */
  async updatePersonnel(id, data, userRole, userQuanNhanId) {
    try {
      const { unit_id, position_id, ho_ten, ngay_sinh, cccd, ngay_nhap_ngu } = data;

      // Kiểm tra quân nhân có tồn tại không
      const personnel = await prisma.quanNhan.findUnique({
        where: { id: parseInt(id) },
      });

      if (!personnel) {
        throw new Error('Quân nhân không tồn tại');
      }

      // Kiểm tra quyền truy cập
      // USER chỉ sửa được thông tin của chính mình
      if (userRole === 'USER') {
        if (parseInt(userQuanNhanId) !== parseInt(id)) {
          throw new Error('Bạn không có quyền sửa thông tin của người khác');
        }

        // USER không được phép đổi unit_id và position_id
        if (unit_id || position_id) {
          throw new Error('Bạn không có quyền thay đổi đơn vị hoặc chức vụ');
        }
      }

      // Kiểm tra quyền: MANAGER chỉ sửa được quân nhân trong đơn vị của mình
      if (userRole === 'MANAGER' && userQuanNhanId) {
        const manager = await prisma.quanNhan.findUnique({
          where: { id: parseInt(userQuanNhanId) },
          select: { don_vi_id: true },
        });

        if (manager && personnel.don_vi_id !== manager.don_vi_id) {
          throw new Error('Bạn không có quyền sửa thông tin quân nhân ngoài đơn vị');
        }
      }

      // Kiểm tra CCCD mới nếu có thay đổi
      if (cccd && cccd !== personnel.cccd) {
        const existingPersonnel = await prisma.quanNhan.findUnique({
          where: { cccd },
        });

        if (existingPersonnel) {
          throw new Error('CCCD đã tồn tại trong hệ thống');
        }
      }

      // Kiểm tra đơn vị mới nếu có
      if (unit_id && unit_id !== personnel.don_vi_id) {
        const unit = await prisma.donVi.findUnique({
          where: { id: unit_id },
        });

        if (!unit) {
          throw new Error('Đơn vị không tồn tại');
        }
      }

      // Kiểm tra chức vụ mới nếu có
      if (position_id && position_id !== personnel.chuc_vu_id) {
        const position = await prisma.chucVu.findUnique({
          where: { id: position_id },
        });

        if (!position) {
          throw new Error('Chức vụ không tồn tại');
        }
      }

      // Chuẩn bị data update
      const updateData = {
        ho_ten: ho_ten || personnel.ho_ten,
        ngay_sinh: ngay_sinh ? new Date(ngay_sinh) : personnel.ngay_sinh,
        cccd: cccd || personnel.cccd,
        ngay_nhap_ngu: ngay_nhap_ngu ? new Date(ngay_nhap_ngu) : personnel.ngay_nhap_ngu,
        don_vi_id: unit_id || personnel.don_vi_id,
        chuc_vu_id: position_id || personnel.chuc_vu_id,
      };

      // Cập nhật quân nhân
      const updatedPersonnel = await prisma.quanNhan.update({
        where: { id: parseInt(id) },
        data: updateData,
        include: {
          DonVi: true,
          ChucVu: true,
        },
      });

      // Nếu đổi chức vụ, cập nhật lịch sử chức vụ
      if (position_id && position_id !== personnel.chuc_vu_id) {
        const today = new Date();

        // 1. Đóng lịch sử chức vụ cũ (set ngay_ket_thuc = hôm nay)
        await prisma.lichSuChucVu.updateMany({
          where: {
            quan_nhan_id: parseInt(id),
            ngay_ket_thuc: null, // Chỉ đóng lịch sử đang active
          },
          data: {
            ngay_ket_thuc: today,
          },
        });

        // 2. Tạo lịch sử chức vụ mới
        await prisma.lichSuChucVu.create({
          data: {
            quan_nhan_id: parseInt(id),
            chuc_vu_id: position_id,
            ngay_bat_dau: today,
            ngay_ket_thuc: null, // Chức vụ hiện tại
          },
        });
      }

      // Nếu đổi đơn vị, cập nhật số lượng
      if (unit_id && unit_id !== personnel.don_vi_id) {
        // Giảm số lượng ở đơn vị cũ
        await prisma.donVi.update({
          where: { id: personnel.don_vi_id },
          data: { so_luong: { decrement: 1 } },
        });

        // Tăng số lượng ở đơn vị mới
        await prisma.donVi.update({
          where: { id: unit_id },
          data: { so_luong: { increment: 1 } },
        });
      }

      return updatedPersonnel;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Xóa quân nhân
   */
  async deletePersonnel(id, userRole, userQuanNhanId) {
    try {
      // Kiểm tra quân nhân có tồn tại không
      const personnel = await prisma.quanNhan.findUnique({
        where: { id: parseInt(id) },
      });

      if (!personnel) {
        throw new Error('Quân nhân không tồn tại');
      }

      // Kiểm tra quyền: MANAGER chỉ xóa được quân nhân trong đơn vị của mình
      if (userRole === 'MANAGER' && userQuanNhanId) {
        const manager = await prisma.quanNhan.findUnique({
          where: { id: parseInt(userQuanNhanId) },
          select: { don_vi_id: true },
        });

        if (manager && personnel.don_vi_id !== manager.don_vi_id) {
          throw new Error('Bạn không có quyền xóa quân nhân ngoài đơn vị');
        }
      }

      // Xóa quân nhân
      await prisma.quanNhan.delete({
        where: { id: parseInt(id) },
      });

      // Giảm số lượng quân nhân trong đơn vị
      await prisma.donVi.update({
        where: { id: personnel.don_vi_id },
        data: {
          so_luong: {
            decrement: 1,
          },
        },
      });

      return { message: 'Xóa quân nhân thành công' };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Xuất toàn bộ dữ liệu ra Excel (sẽ implement sau)
   */
  async exportPersonnel() {
    try {
      const personnel = await prisma.quanNhan.findMany({
        include: {
          DonVi: true,
          ChucVu: {
            include: {
              NhomCongHien: true,
            },
          },
        },
        orderBy: [{ don_vi_id: 'asc' }, { ho_ten: 'asc' }],
      });

      // Tạo workbook Excel
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('QuanNhan');

      worksheet.columns = [
        { header: 'CCCD', key: 'cccd', width: 18 },
        { header: 'Họ tên', key: 'ho_ten', width: 28 },
        { header: 'Ngày sinh (YYYY-MM-DD)', key: 'ngay_sinh', width: 20 },
        {
          header: 'Ngày nhập ngũ (YYYY-MM-DD)',
          key: 'ngay_nhap_ngu',
          width: 24,
        },
        { header: 'Mã đơn vị', key: 'ma_don_vi', width: 14 },
        { header: 'Tên đơn vị', key: 'ten_don_vi', width: 24 },
        { header: 'Tên chức vụ', key: 'ten_chuc_vu', width: 22 },
        { header: 'Là chỉ huy (is_manager)', key: 'is_manager', width: 16 },
        { header: 'Nhóm cống hiến', key: 'ten_nhom_cong_hien', width: 20 },
      ];

      // Format cột CCCD thành Text (để giữ số 0 đầu tiên)
      worksheet.getColumn(1).numFmt = '@';

      personnel.forEach(p => {
        worksheet.addRow({
          cccd: p.cccd,
          ho_ten: p.ho_ten,
          ngay_sinh: p.ngay_sinh ? new Date(p.ngay_sinh).toISOString().slice(0, 10) : '',
          ngay_nhap_ngu: p.ngay_nhap_ngu
            ? new Date(p.ngay_nhap_ngu).toISOString().slice(0, 10)
            : '',
          ma_don_vi: p.DonVi?.ma_don_vi || '',
          ten_don_vi: p.DonVi?.ten_don_vi || '',
          ten_chuc_vu: p.ChucVu?.ten_chuc_vu || '',
          is_manager: p.ChucVu?.is_manager ? 'TRUE' : 'FALSE',
          ten_nhom_cong_hien: p.ChucVu?.NhomCongHien?.ten_nhom || '',
        });
      });

      const buffer = await workbook.xlsx.writeBuffer();
      return buffer;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Xuất file mẫu Excel để import quân nhân
   */
  async exportPersonnelSample() {
    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Mẫu Quân nhân');

      // Định nghĩa các cột
      const columns = [
        { header: 'CCCD', key: 'cccd', width: 15 },
        { header: 'Họ tên', key: 'ho_ten', width: 25 },
        { header: 'Ngày sinh', key: 'ngay_sinh', width: 15 },
        { header: 'Ngày nhập ngũ', key: 'ngay_nhap_ngu', width: 15 },
        { header: 'Mã đơn vị', key: 'ma_don_vi', width: 15 },
        { header: 'Tên chức vụ', key: 'ten_chuc_vu', width: 20 },
        { header: 'Trạng thái', key: 'trang_thai', width: 15 },
      ];

      worksheet.columns = columns;

      // Style cho header
      worksheet.getRow(1).font = { bold: true };
      worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE6F3FF' },
      };

      // Format cột CCCD thành Text (để giữ số 0 đầu tiên)
      worksheet.getColumn(1).numFmt = '@';

      // Thêm dữ liệu mẫu
      const sampleData = [
        {
          cccd: '123456789012',
          ho_ten: 'Nguyễn Văn A',
          ngay_sinh: '1990-01-15',
          ngay_nhap_ngu: '2010-03-01',
          ma_don_vi: 'DV001',
          ten_chuc_vu: 'Thiếu úy',
          trang_thai: 'ACTIVE',
        },
        {
          cccd: '123456789013',
          ho_ten: 'Trần Thị B',
          ngay_sinh: '1992-05-20',
          ngay_nhap_ngu: '2012-07-15',
          ma_don_vi: 'DV002',
          ten_chuc_vu: 'Trung úy',
          trang_thai: 'ACTIVE',
        },
      ];

      sampleData.forEach(row => {
        worksheet.addRow(row);
      });

      // Thêm ghi chú
      worksheet.addRow([]);
      worksheet.addRow(['Ghi chú:']);
      worksheet.addRow(['- Các cột có dấu * là bắt buộc']);
      worksheet.addRow(['- Mã đơn vị phải tồn tại trong hệ thống']);
      worksheet.addRow(['- Tên chức vụ phải tồn tại trong hệ thống']);
      worksheet.addRow(['- Ngày tháng định dạng: YYYY-MM-DD']);
      worksheet.addRow(['- Trạng thái: ACTIVE hoặc INACTIVE']);

      // Style cho ghi chú
      for (let i = sampleData.length + 3; i <= worksheet.rowCount; i++) {
        worksheet.getRow(i).font = { italic: true, color: { argb: 'FF666666' } };
      }

      const buffer = await workbook.xlsx.writeBuffer();
      return buffer;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Import quân nhân từ file Excel buffer
   * Hỗ trợ các cột: CCCD, Họ tên, Ngày sinh, Ngày nhập ngũ, Mã đơn vị, Tên chức vụ
   */
  async importFromExcelBuffer(buffer) {
    try {
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(buffer);
      const worksheet = workbook.worksheets[0];

      if (!worksheet) {
        throw new Error('File Excel không hợp lệ');
      }

      // Đọc header map
      const headerRow = worksheet.getRow(1);
      const headerMap = {};
      headerRow.eachCell((cell, colNumber) => {
        const key = String(cell.value || '')
          .trim()
          .toLowerCase();
        if (key) headerMap[key] = colNumber;
      });

      const requiredHeaders = ['cccd', 'họ tên', 'mã đơn vị', 'tên chức vụ'];
      for (const h of requiredHeaders) {
        if (!headerMap[h]) {
          throw new Error(`Thiếu cột bắt buộc: ${h}`);
        }
      }

      const created = [];
      const updated = [];
      const errors = [];

      // Duyệt các dòng dữ liệu
      for (let rowNumber = 2; rowNumber <= worksheet.rowCount; rowNumber++) {
        const row = worksheet.getRow(rowNumber);
        const cccd = this.parseCCCD(row.getCell(headerMap['cccd']).value);
        const ho_ten = String(row.getCell(headerMap['họ tên']).value || '').trim();
        const ma_don_vi = String(row.getCell(headerMap['mã đơn vị']).value || '').trim();
        const ten_chuc_vu = String(row.getCell(headerMap['tên chức vụ']).value || '').trim();
        const ngay_sinhRaw = headerMap['ngày sinh']
          ? row.getCell(headerMap['ngày sinh']).value
          : null;
        const ngay_nhap_nguRaw = headerMap['ngày nhập ngũ']
          ? row.getCell(headerMap['ngày nhập ngũ']).value
          : null;

        if (!cccd || !ho_ten || !ma_don_vi || !ten_chuc_vu) {
          if (!cccd && !ho_ten && !ma_don_vi && !ten_chuc_vu) continue; // dòng trống
          errors.push({ row: rowNumber, error: 'Thiếu dữ liệu bắt buộc' });
          continue;
        }

        // Tìm đơn vị
        const unit = await prisma.donVi.findUnique({ where: { ma_don_vi } });
        if (!unit) {
          errors.push({
            row: rowNumber,
            error: `Không tìm thấy đơn vị với mã ${ma_don_vi}`,
          });
          continue;
        }

        // Tìm chức vụ theo tên trong đơn vị
        const position = await prisma.chucVu.findFirst({
          where: { ten_chuc_vu, don_vi_id: unit.id },
        });
        if (!position) {
          errors.push({
            row: rowNumber,
            error: `Không tìm thấy chức vụ '${ten_chuc_vu}' trong đơn vị ${ma_don_vi}`,
          });
          continue;
        }

        // Chuẩn hóa ngày
        const parseDate = val => {
          if (!val) return null;
          if (val instanceof Date) return val;
          if (typeof val === 'object' && val?.result) return new Date(val.result);
          const s = String(val).trim();
          if (!s) return null;
          const d = new Date(s);
          return isNaN(d.getTime()) ? null : d;
        };

        const ngay_sinh = parseDate(ngay_sinhRaw);
        const ngay_nhap_ngu = parseDate(ngay_nhap_nguRaw);

        // Tạo hoặc cập nhật theo CCCD
        const existing = await prisma.quanNhan.findUnique({ where: { cccd } });
        if (!existing) {
          const newPersonnel = await prisma.quanNhan.create({
            data: {
              cccd,
              ho_ten,
              ngay_sinh,
              ngay_nhap_ngu,
              don_vi_id: unit.id,
              chuc_vu_id: position.id,
            },
          });
          // tăng số lượng đơn vị
          await prisma.donVi.update({
            where: { id: unit.id },
            data: { so_luong: { increment: 1 } },
          });

          // Tạo lịch sử chức vụ ban đầu
          await prisma.lichSuChucVu.create({
            data: {
              quan_nhan_id: newPersonnel.id,
              chuc_vu_id: position.id,
              ngay_bat_dau: ngay_nhap_ngu || new Date(),
              ngay_ket_thuc: null, // Chức vụ hiện tại
            },
          });

          created.push(newPersonnel.id);
        } else {
          // Kiểm tra nếu đổi đơn vị
          const oldUnitId = existing.don_vi_id;
          const newUnitId = unit.id;

          const updatedPersonnel = await prisma.quanNhan.update({
            where: { id: existing.id },
            data: {
              ho_ten,
              ngay_sinh: ngay_sinh ?? existing.ngay_sinh,
              ngay_nhap_ngu: ngay_nhap_ngu ?? existing.ngay_nhap_ngu,
              don_vi_id: unit.id,
              chuc_vu_id: position.id,
            },
          });

          // Nếu đổi đơn vị, cập nhật số lượng
          if (oldUnitId !== newUnitId) {
            // Giảm số lượng ở đơn vị cũ
            await prisma.donVi.update({
              where: { id: oldUnitId },
              data: { so_luong: { decrement: 1 } },
            });

            // Tăng số lượng ở đơn vị mới
            await prisma.donVi.update({
              where: { id: newUnitId },
              data: { so_luong: { increment: 1 } },
            });
          }

          // Nếu đổi chức vụ, cập nhật lịch sử chức vụ
          if (position.id !== existing.chuc_vu_id) {
            const today = new Date();

            // 1. Đóng lịch sử chức vụ cũ
            await prisma.lichSuChucVu.updateMany({
              where: {
                quan_nhan_id: existing.id,
                ngay_ket_thuc: null,
              },
              data: {
                ngay_ket_thuc: today,
              },
            });

            // 2. Tạo lịch sử chức vụ mới
            await prisma.lichSuChucVu.create({
              data: {
                quan_nhan_id: existing.id,
                chuc_vu_id: position.id,
                ngay_bat_dau: today,
                ngay_ket_thuc: null,
              },
            });
          }

          updated.push(updatedPersonnel.id);
        }
      }

      return {
        createdCount: created.length,
        updatedCount: updated.length,
        errors,
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new PersonnelService();
