const { prisma } = require('../models');

class PositionService {
  /**
   * Lấy chức vụ (lọc theo đơn vị nếu có, nếu không thì trả về tất cả)
   */
  async getPositions(unitId) {
    try {
      const whereClause = unitId ? { don_vi_id: parseInt(unitId) } : {};

      const positions = await prisma.chucVu.findMany({
        where: whereClause,
        include: {
          DonVi: true,
          NhomCongHien: true,
        },
        orderBy: {
          id: 'asc',
        },
      });

      return positions;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Tạo chức vụ mới
   */
  async createPosition(data) {
    try {
      const { unit_id, ten_chuc_vu, is_manager, nhom_cong_hien_id } = data;

      // Kiểm tra đơn vị có tồn tại không
      const unit = await prisma.donVi.findUnique({
        where: { id: unit_id },
      });

      if (!unit) {
        throw new Error('Đơn vị không tồn tại');
      }

      // Kiểm tra nhóm cống hiến nếu có
      if (nhom_cong_hien_id) {
        const group = await prisma.nhomCongHien.findUnique({
          where: { id: nhom_cong_hien_id },
        });

        if (!group) {
          throw new Error('Nhóm cống hiến không tồn tại');
        }
      }

      // Kiểm tra trùng tên chức vụ trong cùng đơn vị
      const existingPosition = await prisma.chucVu.findFirst({
        where: {
          don_vi_id: unit_id,
          ten_chuc_vu,
        },
      });

      if (existingPosition) {
        throw new Error('Tên chức vụ đã tồn tại trong đơn vị này');
      }

      // Tạo chức vụ mới
      const newPosition = await prisma.chucVu.create({
        data: {
          don_vi_id: unit_id,
          ten_chuc_vu,
          is_manager: is_manager || false,
          nhom_cong_hien_id: nhom_cong_hien_id || null,
        },
        include: {
          DonVi: true,
          NhomCongHien: true,
        },
      });

      return newPosition;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Sửa chức vụ (gán nhóm cống hiến)
   */
  async updatePosition(id, data) {
    try {
      const { ten_chuc_vu, is_manager, nhom_cong_hien_id } = data;

      // Kiểm tra chức vụ có tồn tại không
      const position = await prisma.chucVu.findUnique({
        where: { id },
      });

      if (!position) {
        throw new Error('Chức vụ không tồn tại');
      }

      // Kiểm tra nhóm cống hiến nếu có
      if (nhom_cong_hien_id) {
        const group = await prisma.nhomCongHien.findUnique({
          where: { id: nhom_cong_hien_id },
        });

        if (!group) {
          throw new Error('Nhóm cống hiến không tồn tại');
        }
      }

      // Cập nhật chức vụ
      const updatedPosition = await prisma.chucVu.update({
        where: { id },
        data: {
          ten_chuc_vu: ten_chuc_vu || position.ten_chuc_vu,
          is_manager: is_manager !== undefined ? is_manager : position.is_manager,
          nhom_cong_hien_id: nhom_cong_hien_id !== undefined ? nhom_cong_hien_id : position.nhom_cong_hien_id,
        },
        include: {
          DonVi: true,
          NhomCongHien: true,
        },
      });

      return updatedPosition;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Xóa chức vụ
   */
  async deletePosition(id) {
    try {
      // Kiểm tra chức vụ có tồn tại không
      const position = await prisma.chucVu.findUnique({
        where: { id },
      });

      if (!position) {
        throw new Error('Chức vụ không tồn tại');
      }

      // Kiểm tra có quân nhân nào đang giữ chức vụ này không
      const personnelCount = await prisma.quanNhan.count({
        where: { chuc_vu_id: id },
      });

      if (personnelCount > 0) {
        throw new Error(`Không thể xóa chức vụ vì còn ${personnelCount} quân nhân đang giữ chức vụ này`);
      }

      // Xóa chức vụ
      await prisma.chucVu.delete({
        where: { id },
      });

      return { message: 'Xóa chức vụ thành công' };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new PositionService();
