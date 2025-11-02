const { prisma } = require('../models');

class ScientificAchievementService {
  async getAchievements(personnelId) {
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

      const achievements = await prisma.thanhTichKhoaHoc.findMany({
        where: { quan_nhan_id: parseInt(personnelId) },
        orderBy: { nam: 'desc' },
      });

      return achievements;
    } catch (error) {
      throw error;
    }
  }

  async createAchievement(data) {
    try {
      const { personnel_id, nam, loai, mo_ta, status } = data;

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

      const newAchievement = await prisma.thanhTichKhoaHoc.create({
        data: {
          quan_nhan_id: personnel_id,
          nam,
          loai,
          mo_ta,
          status: status || 'PENDING',
        },
      });

      return newAchievement;
    } catch (error) {
      throw error;
    }
  }

  async updateAchievement(id, data) {
    try {
      const { nam, loai, mo_ta, status } = data;

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

      const updatedAchievement = await prisma.thanhTichKhoaHoc.update({
        where: { id },
        data: {
          nam: nam || achievement.nam,
          loai: loai || achievement.loai,
          mo_ta: mo_ta || achievement.mo_ta,
          status: status || achievement.status,
        },
      });

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

      await prisma.thanhTichKhoaHoc.delete({
        where: { id },
      });

      return { message: 'Xóa thành tích thành công' };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new ScientificAchievementService();
