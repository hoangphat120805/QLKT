const scientificAchievementService = require('../services/scientificAchievement.service');
const profileService = require('../services/profile.service');
const { prisma } = require('../models');
const { DATE } = require('sequelize');

class ScientificAchievementController {
  async getAchievements(req, res) {
    try {
      const { personnel_id, page, limit, nam, loai } = req.query;

      // Nếu có personnel_id, lấy thành tích của 1 người
      if (personnel_id) {
        const result = await scientificAchievementService.getAchievements(personnel_id);
        return res.status(200).json({
          success: true,
          message: 'Lấy danh sách thành tích khoa học thành công',
          data: result,
        });
      }

      // Nếu không có personnel_id, lấy danh sách tất cả với phân trang
      const pageNum = parseInt(page) || 1;
      const limitNum = parseInt(limit) || 1000;
      const where = {};

      if (nam) where.nam = parseInt(nam);
      if (loai) where.loai = loai;

      // Phân quyền: Manager chỉ xem được dữ liệu đơn vị mình
      const userRole = req.user?.role;
      const userId = req.user?.id;
      if (userRole === 'MANAGER' && userId) {
        const user = await prisma.quanNhan.findUnique({
          where: { id: userId },
          select: { co_quan_don_vi_id: true, don_vi_truc_thuoc_id: true },
        });
        if (user) {
          const unitId = user.co_quan_don_vi_id || user.don_vi_truc_thuoc_id;
          if (unitId) {
            where.QuanNhan = {
              OR: [{ co_quan_don_vi_id: unitId }, { don_vi_truc_thuoc_id: unitId }],
            };
          }
        }
      }

      const [achievements, total] = await Promise.all([
        prisma.thanhTichKhoaHoc.findMany({
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
          skip: (pageNum - 1) * limitNum,
          take: limitNum,
        }),
        prisma.thanhTichKhoaHoc.count({ where }),
      ]);

      return res.status(200).json({
        success: true,
        message: 'Lấy danh sách thành tích khoa học thành công',
        data: {
          awards: achievements,
          pagination: {
            total,
            page: pageNum,
            limit: limitNum,
            totalPages: Math.ceil(total / limitNum),
          },
        },
      });
    } catch (error) {
      console.error('Get achievements error:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Lấy danh sách thành tích thất bại',
      });
    }
  }

  async createAchievement(req, res) {
    try {
      const { personnel_id, nam, loai, mo_ta, cap_bac, chuc_vu, ghi_chu, status } = req.body;

      if (!personnel_id || !nam || !loai || !mo_ta) {
        return res.status(400).json({
          success: false,
          message: 'Vui lòng nhập đầy đủ: personnel_id, nam, loai, mo_ta',
        });
      }

      const result = await scientificAchievementService.createAchievement({
        personnel_id,
        nam,
        loai,
        mo_ta,
        cap_bac,
        chuc_vu,
        ghi_chu,
        status,
      });

      // Tự động cập nhật lại hồ sơ sau khi thêm thành tích
      try {
        await profileService.recalculateAnnualProfile(personnel_id);
        console.log(`✅ Auto-recalculated profile for personnel ${personnel_id}`);
      } catch (recalcError) {
        console.error(`⚠️ Failed to auto-recalculate profile:`, recalcError.message);
      }

      return res.status(201).json({
        success: true,
        message: 'Thêm thành tích thành công',
        data: result,
      });
    } catch (error) {
      console.error('Create achievement error:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Thêm thành tích thất bại',
      });
    }
  }

  async updateAchievement(req, res) {
    try {
      const { id } = req.params;
      const { nam, loai, mo_ta, cap_bac, chuc_vu, ghi_chu, status } = req.body;

      const result = await scientificAchievementService.updateAchievement(id, {
        nam,
        loai,
        mo_ta,
        cap_bac,
        chuc_vu,
        ghi_chu,
        status,
      });

      // Tự động cập nhật lại hồ sơ sau khi cập nhật thành tích
      try {
        await profileService.recalculateAnnualProfile(result.quan_nhan_id, year(DATE.now()));
        console.log(`✅ Auto-recalculated profile for personnel ${result.quan_nhan_id}`);
      } catch (recalcError) {
        console.error(`⚠️ Failed to auto-recalculate profile:`, recalcError.message);
      }

      return res.status(200).json({
        success: true,
        message: 'Cập nhật thành tích thành công',
        data: result,
      });
    } catch (error) {
      console.error('Update achievement error:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Cập nhật thành tích thất bại',
      });
    }
  }

  async deleteAchievement(req, res) {
    try {
      const { id } = req.params;

      const result = await scientificAchievementService.deleteAchievement(id);

      // Tự động cập nhật lại hồ sơ sau khi xóa thành tích
      if (result.personnelId) {
        try {
          await profileService.recalculateAnnualProfile(result.personnelId);
          console.log(`✅ Auto-recalculated profile for personnel ${result.personnelId}`);
        } catch (recalcError) {
          console.error(`⚠️ Failed to auto-recalculate profile:`, recalcError.message);
        }
      }

      return res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      console.error('Delete achievement error:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Xóa thành tích thất bại',
      });
    }
  }

  async exportToExcel(req, res) {
    try {
      const { nam, loai } = req.query;
      const role = req.user?.role;
      const userUnitId = req.user?.co_quan_don_vi_id || req.user?.don_vi_truc_thuoc_id;

      const filters = {
        nam: nam ? parseInt(nam) : undefined,
        loai: loai || undefined,
      };

      // Manager chỉ được xuất dữ liệu đơn vị mình
      if (role === 'MANAGER' && userUnitId) {
        filters.don_vi_id = userUnitId;
      }

      const workbook = await scientificAchievementService.exportToExcel(filters);

      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="danh_sach_thanh_tich_khoa_hoc_${new Date()
          .toISOString()
          .slice(0, 10)}.xlsx"`
      );

      const buffer = await workbook.xlsx.writeBuffer();
      return res.send(buffer);
    } catch (error) {
      console.error('Export scientific achievements error:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Xuất danh sách thất bại',
      });
    }
  }

  async downloadTemplate(req, res) {
    try {
      const userRole = req.user?.role || 'MANAGER';
      const workbook = await scientificAchievementService.generateTemplate(userRole);

      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="mau_import_thanh_tich_khoa_hoc_${new Date()
          .toISOString()
          .slice(0, 10)}.xlsx"`
      );

      const buffer = await workbook.xlsx.writeBuffer();
      return res.send(buffer);
    } catch (error) {
      console.error('Download template error:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Tải file mẫu thất bại',
      });
    }
  }

  async importFromExcel(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'Vui lòng tải lên file Excel',
        });
      }

      const result = await scientificAchievementService.importFromExcel(req.file.buffer);

      return res.status(200).json({
        success: true,
        message: `Đã thêm thành công ${result.imported}/${result.total} bản ghi`,
        data: result,
      });
    } catch (error) {
      console.error('Import scientific achievements error:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Import thất bại',
      });
    }
  }
}

module.exports = new ScientificAchievementController();
