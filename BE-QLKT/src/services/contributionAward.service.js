const { prisma } = require('../models');
const ExcelJS = require('exceljs');

class ContributionAwardService {
  /**
   * Export template Excel for Contribution Awards (HCBVTQ) import
   */
  async exportTemplate() {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('HCBVTQ');

    worksheet.columns = [
      { header: 'CCCD', key: 'cccd', width: 15 },
      { header: 'Họ tên', key: 'ho_ten', width: 25 },
      { header: 'Năm', key: 'nam', width: 10 },
      {
        header: 'Danh hiệu (HCBVTQ_HANG_BA/HCBVTQ_HANG_NHI/HCBVTQ_HANG_NHAT)',
        key: 'danh_hieu',
        width: 40,
      },
      { header: 'Cấp bậc', key: 'cap_bac', width: 15 },
      { header: 'Chức vụ', key: 'chuc_vu', width: 30 },
      { header: 'Ghi chú', key: 'ghi_chu', width: 30 },
      { header: 'Số quyết định', key: 'so_quyet_dinh', width: 20 },
    ];

    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFD9E1F2' },
    };

    worksheet.addRow({
      cccd: '001234567890',
      ho_ten: 'Nguyễn Văn A',
      nam: 2024,
      danh_hieu: 'HCBVTQ_HANG_BA',
      cap_bac: 'Thiếu tá',
      chuc_vu: 'Phó Chỉ huy trưởng',
      ghi_chu: 'Ghi chú mẫu',
      so_quyet_dinh: '123/QĐ-BQP',
    });

    return await workbook.xlsx.writeBuffer();
  }

  /**
   * Import Contribution Awards from Excel
   */
  async importFromExcel(excelBuffer, adminId) {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(excelBuffer);
    const worksheet = workbook.getWorksheet('HCBVTQ');

    if (!worksheet) {
      throw new Error('Không tìm thấy sheet "HCBVTQ" trong file Excel');
    }

    const results = {
      success: 0,
      failed: 0,
      errors: [],
    };

    const rows = [];
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber > 1) {
        rows.push({ row, rowNumber });
      }
    });

    for (const { row, rowNumber } of rows) {
      try {
        const cccd = row.getCell(1).value?.toString().trim();
        const nam = parseInt(row.getCell(3).value);
        const danh_hieu = row.getCell(4).value?.toString().trim();

        if (!cccd || !nam || !danh_hieu) {
          results.errors.push(`Dòng ${rowNumber}: Thiếu thông tin bắt buộc`);
          results.failed++;
          continue;
        }

        // Validate danh_hieu
        const validDanhHieu = ['HCBVTQ_HANG_BA', 'HCBVTQ_HANG_NHI', 'HCBVTQ_HANG_NHAT'];
        if (!validDanhHieu.includes(danh_hieu)) {
          results.errors.push(
            `Dòng ${rowNumber}: Danh hiệu không hợp lệ. Chỉ chấp nhận: ${validDanhHieu.join(', ')}`
          );
          results.failed++;
          continue;
        }

        const personnel = await prisma.quanNhan.findUnique({ where: { cccd } });
        if (!personnel) {
          results.errors.push(`Dòng ${rowNumber}: Không tìm thấy quân nhân CCCD ${cccd}`);
          results.failed++;
          continue;
        }

        // Upsert (mỗi quân nhân chỉ có 1 bản ghi)
        await prisma.khenThuongCongHien.upsert({
          where: { quan_nhan_id: personnel.id },
          create: {
            quan_nhan_id: personnel.id,
            danh_hieu,
            nam,
            cap_bac: row.getCell(5).value?.toString() || null,
            chuc_vu: row.getCell(6).value?.toString() || null,
            ghi_chu: row.getCell(7).value?.toString() || null,
            so_quyet_dinh: row.getCell(8).value?.toString() || null,
          },
          update: {
            danh_hieu,
            nam,
            cap_bac: row.getCell(5).value?.toString() || null,
            chuc_vu: row.getCell(6).value?.toString() || null,
            ghi_chu: row.getCell(7).value?.toString() || null,
            so_quyet_dinh: row.getCell(8).value?.toString() || null,
          },
        });

        results.success++;
      } catch (error) {
        results.errors.push(`Dòng ${rowNumber}: ${error.message}`);
        results.failed++;
      }
    }

    return results;
  }

  /**
   * Get all Contribution Awards with filters and pagination
   */
  async getAll(filters = {}, page = 1, limit = 50) {
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const where = {};

    if (filters.don_vi_id) {
      where.QuanNhan = {
        OR: [{ co_quan_don_vi_id: filters.don_vi_id }, { don_vi_truc_thuoc_id: filters.don_vi_id }],
      };
    }

    if (filters.nam) {
      where.nam = parseInt(filters.nam);
    }

    if (filters.danh_hieu) {
      where.danh_hieu = filters.danh_hieu;
    }

    const [data, total] = await Promise.all([
      prisma.khenThuongCongHien.findMany({
        where,
        include: {
          QuanNhan: {
            select: {
              cccd: true,
              ho_ten: true,
              cap_bac: true,
              CoQuanDonVi: { select: { ten_don_vi: true } },
              DonViTrucThuoc: { select: { ten_don_vi: true } },
            },
          },
        },
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
        orderBy: { nam: 'desc' },
      }),
      prisma.khenThuongCongHien.count({ where }),
    ]);

    return {
      data,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    };
  }

  /**
   * Export Contribution Awards to Excel
   */
  async exportToExcel(filters = {}) {
    const { data } = await this.getAll(filters, 1, 10000);

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('HCBVTQ');

    worksheet.columns = [
      { header: 'STT', key: 'stt', width: 5 },
      { header: 'CCCD', key: 'cccd', width: 15 },
      { header: 'Họ tên', key: 'ho_ten', width: 25 },
      { header: 'Đơn vị', key: 'don_vi', width: 30 },
      { header: 'Năm', key: 'nam', width: 10 },
      { header: 'Danh hiệu', key: 'danh_hieu', width: 25 },
      { header: 'Cấp bậc', key: 'cap_bac', width: 15 },
      { header: 'Chức vụ', key: 'chuc_vu', width: 30 },
      { header: 'Số quyết định', key: 'so_quyet_dinh', width: 20 },
    ];

    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFD9E1F2' },
    };

    data.forEach((item, index) => {
      worksheet.addRow({
        stt: index + 1,
        cccd: item.QuanNhan.cccd,
        ho_ten: item.QuanNhan.ho_ten,
        don_vi:
          item.QuanNhan.CoQuanDonVi?.ten_don_vi || item.QuanNhan.DonViTrucThuoc?.ten_don_vi || '',
        nam: item.nam,
        danh_hieu: item.danh_hieu,
        cap_bac: item.cap_bac,
        chuc_vu: item.chuc_vu,
        so_quyet_dinh: item.so_quyet_dinh,
      });
    });

    return await workbook.xlsx.writeBuffer();
  }

  /**
   * Get Contribution Awards statistics
   */
  async getStatistics() {
    const byRank = await prisma.khenThuongCongHien.groupBy({
      by: ['danh_hieu'],
      _count: { id: true },
    });

    const byYear = await prisma.khenThuongCongHien.groupBy({
      by: ['nam'],
      _count: { id: true },
      orderBy: { nam: 'desc' },
    });

    const total = await prisma.khenThuongCongHien.count();

    return {
      total,
      byRank,
      byYear,
    };
  }

  /**
   * Get user with unit info (helper method)
   */
  async getUserWithUnit(userId) {
    return await prisma.taiKhoan.findUnique({
      where: { id: userId },
      include: {
        QuanNhan: {
          select: {
            co_quan_don_vi_id: true,
            don_vi_truc_thuoc_id: true,
          },
        },
      },
    });
  }
}

module.exports = new ContributionAwardService();
