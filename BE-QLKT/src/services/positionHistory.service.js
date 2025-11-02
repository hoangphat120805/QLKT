const { prisma } = require('../models');

class PositionHistoryService {
  async getPositionHistory(personnelId) {
    try {
      if (!personnelId) {
        throw new Error('personnel_id là bắt buộc');
      }

      const personnel = await prisma.quanNhan.findUnique({
        where: { id: parseInt(personnelId) },
      });

      if (!personnel) {
        throw new Error('Quân nhân không tồn tại');
      }

      const history = await prisma.lichSuChucVu.findMany({
        where: { quan_nhan_id: parseInt(personnelId) },
        include: {
          ChucVu: {
            include: {
              NhomCongHien: true,
              DonVi: true,
            },
          },
        },
        orderBy: { ngay_bat_dau: 'desc' },
      });

      return history;
    } catch (error) {
      throw error;
    }
  }

  async createPositionHistory(data) {
    try {
      const { personnel_id, chuc_vu_id, ngay_bat_dau, ngay_ket_thuc } = data;

      const personnel = await prisma.quanNhan.findUnique({
        where: { id: personnel_id },
      });

      if (!personnel) {
        throw new Error('Quân nhân không tồn tại');
      }

      const position = await prisma.chucVu.findUnique({
        where: { id: chuc_vu_id },
      });

      if (!position) {
        throw new Error('Chức vụ không tồn tại');
      }

      const newHistory = await prisma.lichSuChucVu.create({
        data: {
          quan_nhan_id: personnel_id,
          chuc_vu_id,
          ngay_bat_dau: new Date(ngay_bat_dau),
          ngay_ket_thuc: ngay_ket_thuc ? new Date(ngay_ket_thuc) : null,
        },
        include: {
          ChucVu: {
            include: {
              NhomCongHien: true,
              DonVi: true,
            },
          },
        },
      });

      return newHistory;
    } catch (error) {
      throw error;
    }
  }

  async updatePositionHistory(id, data) {
    try {
      const { chuc_vu_id, ngay_bat_dau, ngay_ket_thuc } = data;

      const history = await prisma.lichSuChucVu.findUnique({
        where: { id },
      });

      if (!history) {
        throw new Error('Lịch sử chức vụ không tồn tại');
      }

      if (chuc_vu_id) {
        const position = await prisma.chucVu.findUnique({
          where: { id: chuc_vu_id },
        });

        if (!position) {
          throw new Error('Chức vụ không tồn tại');
        }
      }

      const updatedHistory = await prisma.lichSuChucVu.update({
        where: { id },
        data: {
          chuc_vu_id: chuc_vu_id || history.chuc_vu_id,
          ngay_bat_dau: ngay_bat_dau ? new Date(ngay_bat_dau) : history.ngay_bat_dau,
          ngay_ket_thuc: ngay_ket_thuc !== undefined ? (ngay_ket_thuc ? new Date(ngay_ket_thuc) : null) : history.ngay_ket_thuc,
        },
        include: {
          ChucVu: {
            include: {
              NhomCongHien: true,
              DonVi: true,
            },
          },
        },
      });

      return updatedHistory;
    } catch (error) {
      throw error;
    }
  }

  async deletePositionHistory(id) {
    try {
      const history = await prisma.lichSuChucVu.findUnique({
        where: { id },
      });

      if (!history) {
        throw new Error('Lịch sử chức vụ không tồn tại');
      }

      await prisma.lichSuChucVu.delete({
        where: { id },
      });

      return { message: 'Xóa lịch sử chức vụ thành công' };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new PositionHistoryService();
