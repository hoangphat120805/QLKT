const { prisma } = require('../models');

class ScientificAchievementService {
  async getAchievements(personnelId) {
    try {
      if (!personnelId) {
        throw new Error('personnel_id là bắt buộc');
      }

      const personnel = await prisma.quanNhan.findUnique({
        where: { id: personnelId },
      });

      if (!personnel) {
        throw new Error('Quân nhân không tồn tại');
      }

      const achievements = await prisma.thanhTichKhoaHoc.findMany({
        where: { quan_nhan_id: personnelId },
        orderBy: { nam: 'desc' },
      });

      return achievements;
    } catch (error) {
      throw error;
    }
  }

  async createAchievement(data) {
    try {
      const { personnel_id, nam, loai, mo_ta, cap_bac, chuc_vu, ghi_chu, status } = data;

      console.log('=== CREATE ACHIEVEMENT ===');
      console.log('Received data:', data);
      console.log('cap_bac:', cap_bac);
      console.log('chuc_vu:', chuc_vu);

      const personnel = await prisma.quanNhan.findUnique({
        where: { id: personnel_id },
      });

      if (!personnel) {
        throw new Error('Quân nhân không tồn tại');
      }

      const validLoai = ['NCKH', 'SKKH'];
      if (!validLoai.includes(loai)) {
        throw new Error('Loại thành tích không hợp lệ. Loại hợp lệ: ' + validLoai.join(', '));
      }

      const validStatus = ['APPROVED', 'PENDING'];
      if (status && !validStatus.includes(status)) {
        throw new Error('Trạng thái không hợp lệ. Trạng thái hợp lệ: ' + validStatus.join(', '));
      }

      const createData = {
        quan_nhan_id: personnel_id,
        nam,
        loai,
        mo_ta,
        cap_bac: cap_bac || null,
        chuc_vu: chuc_vu || null,
        ghi_chu: ghi_chu || null,
        status: status || 'PENDING',
      };

      console.log('Create data:', createData);

      const newAchievement = await prisma.thanhTichKhoaHoc.create({
        data: createData,
      });

      console.log('Created achievement:', newAchievement);

      // Tự động cập nhật lại hồ sơ hằng năm (chỉ khi status = APPROVED)
      const finalStatus = status || 'PENDING';
      if (finalStatus === 'APPROVED') {
        try {
          const profileService = require('./profile.service');
          await profileService.recalculateAnnualProfile(personnel_id);
        } catch (recalcError) {
          console.error(
            `⚠️ Failed to auto-recalculate annual profile for personnel ${personnel_id}:`,
            recalcError.message
          );
          // Không throw error, chỉ log để không ảnh hưởng đến việc tạo thành tích
        }
      }

      return newAchievement;
    } catch (error) {
      throw error;
    }
  }

  async updateAchievement(id, data) {
    try {
      const { nam, loai, mo_ta, cap_bac, chuc_vu, ghi_chu, status } = data;

      const achievement = await prisma.thanhTichKhoaHoc.findUnique({
        where: { id },
      });

      if (!achievement) {
        throw new Error('Thành tích không tồn tại');
      }

      if (loai) {
        const validLoai = ['NCKH', 'SKKH'];
        if (!validLoai.includes(loai)) {
          throw new Error('Loại thành tích không hợp lệ');
        }
      }

      if (status) {
        const validStatus = ['APPROVED', 'PENDING'];
        if (!validStatus.includes(status)) {
          throw new Error('Trạng thái không hợp lệ');
        }
      }

      const updateData = {};
      if (nam !== undefined) updateData.nam = nam;
      if (loai !== undefined) updateData.loai = loai;
      if (mo_ta !== undefined) updateData.mo_ta = mo_ta;
      if (cap_bac !== undefined) updateData.cap_bac = cap_bac;
      if (chuc_vu !== undefined) updateData.chuc_vu = chuc_vu;
      if (ghi_chu !== undefined) updateData.ghi_chu = ghi_chu;
      if (status !== undefined) updateData.status = status;

      const updatedAchievement = await prisma.thanhTichKhoaHoc.update({
        where: { id },
        data: updateData,
      });

      // Tự động cập nhật lại hồ sơ hằng năm (chỉ khi status = APPROVED)
      const finalStatus = status || achievement.status;
      if (finalStatus === 'APPROVED') {
        try {
          const profileService = require('./profile.service');
          await profileService.recalculateAnnualProfile(achievement.quan_nhan_id);
        } catch (recalcError) {
          console.error(
            `⚠️ Failed to auto-recalculate annual profile for personnel ${achievement.quan_nhan_id}:`,
            recalcError.message
          );
          // Không throw error, chỉ log để không ảnh hưởng đến việc cập nhật thành tích
        }
      }

      return updatedAchievement;
    } catch (error) {
      throw error;
    }
  }

  async deleteAchievement(id) {
    try {
      const achievement = await prisma.thanhTichKhoaHoc.findUnique({
        where: { id },
      });

      if (!achievement) {
        throw new Error('Thành tích không tồn tại');
      }

      const personnelId = achievement.quan_nhan_id;
      const wasApproved = achievement.status === 'APPROVED';

      await prisma.thanhTichKhoaHoc.delete({
        where: { id },
      });

      // Tự động cập nhật lại hồ sơ hằng năm (chỉ khi thành tích đã được duyệt)
      if (wasApproved) {
        try {
          const profileService = require('./profile.service');
          await profileService.recalculateAnnualProfile(personnelId);
        } catch (recalcError) {
          console.error(
            `⚠️ Failed to auto-recalculate annual profile for personnel ${personnelId}:`,
            recalcError.message
          );
          // Không throw error, chỉ log để không ảnh hưởng đến việc xóa thành tích
        }
      }

      return { message: 'Xóa thành tích thành công' };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Xuất danh sách thành tích khoa học ra Excel
   */
  async exportToExcel(filters = {}) {
    const ExcelJS = require('exceljs');
    const { nam, loai } = filters;

    const where = {};
    if (nam) where.nam = nam;
    if (loai) where.loai = loai;

    const achievements = await prisma.thanhTichKhoaHoc.findMany({
      where,
      include: {
        QuanNhan: {
          include: {
            CoQuanDonVi: true,
            DonViTrucThuoc: true,
            ChucVu: true,
          },
        },
      },
      orderBy: [{ nam: 'desc' }, { createdAt: 'desc' }],
      take: 10000,
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Thành tích khoa học');

    worksheet.columns = [
      { header: 'STT', key: 'stt', width: 8 },
      { header: 'Họ tên', key: 'ho_ten', width: 25 },
      { header: 'CCCD', key: 'cccd', width: 15 },
      { header: 'Cấp bậc', key: 'cap_bac', width: 15 },
      { header: 'Chức vụ', key: 'chuc_vu', width: 20 },
      { header: 'Đơn vị', key: 'don_vi', width: 30 },
      { header: 'Năm', key: 'nam', width: 10 },
      { header: 'Loại', key: 'loai', width: 15 },
      { header: 'Mô tả', key: 'mo_ta', width: 40 },
      { header: 'Ghi chú', key: 'ghi_chu', width: 30 },
    ];

    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4472C4' },
    };
    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };

    achievements.forEach((achievement, index) => {
      const quanNhan = achievement.QuanNhan;
      const donVi = quanNhan?.DonViTrucThuoc?.ten_don_vi || quanNhan?.CoQuanDonVi?.ten_don_vi || '';
      const loaiText =
        achievement.loai === 'NCKH'
          ? 'Nghiên cứu khoa học'
          : achievement.loai === 'SKKH'
          ? 'Sáng kiến khoa học'
          : achievement.loai;

      worksheet.addRow({
        stt: index + 1,
        ho_ten: quanNhan?.ho_ten || '',
        cccd: quanNhan?.cccd || '',
        cap_bac: achievement.cap_bac || quanNhan?.cap_bac || '',
        chuc_vu: achievement.chuc_vu || quanNhan?.ChucVu?.ten_chuc_vu || '',
        don_vi: donVi,
        nam: achievement.nam,
        loai: loaiText,
        mo_ta: achievement.mo_ta || '',
        ghi_chu: achievement.ghi_chu || '',
      });
    });

    return workbook;
  }
}

module.exports = new ScientificAchievementService();
