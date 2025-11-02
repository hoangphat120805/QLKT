const { prisma } = require('../models');

class UnitService {
  /**
   * Lấy tất cả đơn vị
   */
  async getAllUnits() {
    try {
      const units = await prisma.donVi.findMany({
        orderBy: {
          ma_don_vi: 'asc',
        },
      });

      return units;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Tạo đơn vị mới
   */
  async createUnit(data) {
    try {
      const { ma_don_vi, ten_don_vi } = data;

      // Kiểm tra mã đơn vị đã tồn tại chưa
      const existingUnit = await prisma.donVi.findUnique({
        where: { ma_don_vi },
      });

      if (existingUnit) {
        throw new Error('Mã đơn vị đã tồn tại');
      }

      // Tạo đơn vị mới
      const newUnit = await prisma.donVi.create({
        data: {
          ma_don_vi,
          ten_don_vi,
          so_luong: 0,
        },
      });

      return newUnit;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Sửa tên đơn vị
   */
  async updateUnit(id, data) {
    try {
      const { ten_don_vi } = data;

      // Kiểm tra đơn vị có tồn tại không
      const unit = await prisma.donVi.findUnique({
        where: { id },
      });

      if (!unit) {
        throw new Error('Đơn vị không tồn tại');
      }

      // Cập nhật tên đơn vị
      const updatedUnit = await prisma.donVi.update({
        where: { id },
        data: { ten_don_vi },
      });

      return updatedUnit;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Xóa đơn vị (nếu đơn vị đó không còn quân nhân)
   */
  async deleteUnit(id) {
    try {
      // Kiểm tra đơn vị có tồn tại không
      const unit = await prisma.donVi.findUnique({
        where: { id },
      });

      if (!unit) {
        throw new Error('Đơn vị không tồn tại');
      }

      // Kiểm tra đơn vị có quân nhân không
      const personnelCount = await prisma.quanNhan.count({
        where: { don_vi_id: id },
      });

      if (personnelCount > 0) {
        throw new Error(`Không thể xóa đơn vị vì còn ${personnelCount} quân nhân`);
      }

      // Xóa đơn vị
      await prisma.donVi.delete({
        where: { id },
      });

      return { message: 'Xóa đơn vị thành công' };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new UnitService();
