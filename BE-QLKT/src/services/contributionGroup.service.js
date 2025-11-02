const { prisma } = require('../models');

class ContributionGroupService {
  async getAllGroups() {
    try {
      const groups = await prisma.nhomCongHien.findMany({
        orderBy: { id: 'asc' },
      });
      return groups;
    } catch (error) {
      throw error;
    }
  }

  async createGroup(data) {
    try {
      const { ten_nhom, mo_ta } = data;

      const existingGroup = await prisma.nhomCongHien.findUnique({
        where: { ten_nhom },
      });

      if (existingGroup) {
        throw new Error('Tên nhóm cống hiến đã tồn tại');
      }

      const newGroup = await prisma.nhomCongHien.create({
        data: { ten_nhom, mo_ta: mo_ta || null },
      });

      return newGroup;
    } catch (error) {
      throw error;
    }
  }

  async updateGroup(id, data) {
    try {
      const { ten_nhom, mo_ta } = data;

      const group = await prisma.nhomCongHien.findUnique({
        where: { id },
      });

      if (!group) {
        throw new Error('Nhóm cống hiến không tồn tại');
      }

      const updatedGroup = await prisma.nhomCongHien.update({
        where: { id },
        data: { ten_nhom: ten_nhom || group.ten_nhom, mo_ta: mo_ta !== undefined ? mo_ta : group.mo_ta },
      });

      return updatedGroup;
    } catch (error) {
      throw error;
    }
  }

  async deleteGroup(id) {
    try {
      const group = await prisma.nhomCongHien.findUnique({
        where: { id },
      });

      if (!group) {
        throw new Error('Nhóm cống hiến không tồn tại');
      }

      // Kiểm tra có chức vụ nào đang sử dụng nhóm này không
      const positionCount = await prisma.chucVu.count({
        where: { nhom_cong_hien_id: id },
      });

      if (positionCount > 0) {
        throw new Error(`Không thể xóa nhóm cống hiến vì còn ${positionCount} chức vụ đang sử dụng`);
      }

      await prisma.nhomCongHien.delete({
        where: { id },
      });

      return { message: 'Xóa nhóm cống hiến thành công' };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new ContributionGroupService();
