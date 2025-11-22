const annualRewardService = require('../services/annualReward.service');
const profileService = require('../services/profile.service');
const { prisma } = require('../models');

class AnnualRewardController {
  async getAnnualRewards(req, res) {
    try {
      const { personnel_id } = req.query;

      if (!personnel_id) {
        return res.status(400).json({
          success: false,
          message: 'Tham số personnel_id là bắt buộc',
        });
      }

      const result = await annualRewardService.getAnnualRewards(personnel_id);

      return res.status(200).json({
        success: true,
        message: 'Lấy danh sách danh hiệu thành công',
        data: result,
      });
    } catch (error) {
      console.error('Get annual rewards error:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Lấy danh sách danh hiệu thất bại',
      });
    }
  }

  async createAnnualReward(req, res) {
    try {
      const {
        personnel_id,
        nam,
        danh_hieu,
        nhan_bkbqp,
        so_quyet_dinh_bkbqp,
        nhan_cstdtq,
        so_quyet_dinh_cstdtq,
      } = req.body;

      if (!personnel_id || !nam || !danh_hieu) {
        return res.status(400).json({
          success: false,
          message: 'Vui lòng nhập đầy đủ thông tin: personnel_id, nam, danh_hieu',
        });
      }

      const result = await annualRewardService.createAnnualReward({
        personnel_id,
        nam,
        danh_hieu,
        nhan_bkbqp,
        so_quyet_dinh_bkbqp,
        nhan_cstdtq,
        so_quyet_dinh_cstdtq,
      });

      // Tự động cập nhật lại hồ sơ sau khi thêm danh hiệu
      try {
        await profileService.recalculateProfile(personnel_id);
        console.log(`✅ Auto-recalculated profile for personnel ${personnel_id}`);
      } catch (recalcError) {
        console.error(`⚠️ Failed to auto-recalculate profile:`, recalcError.message);
      }

      return res.status(201).json({
        success: true,
        message: 'Thêm danh hiệu thành công',
        data: result,
      });
    } catch (error) {
      console.error('Create annual reward error:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Thêm danh hiệu thất bại',
      });
    }
  }

  async updateAnnualReward(req, res) {
    try {
      const { id } = req.params;
      const { nam, danh_hieu, nhan_bkbqp, so_quyet_dinh_bkbqp, nhan_cstdtq, so_quyet_dinh_cstdtq } =
        req.body;

      const result = await annualRewardService.updateAnnualReward(id, {
        nam,
        danh_hieu,
        nhan_bkbqp,
        so_quyet_dinh_bkbqp,
        nhan_cstdtq,
        so_quyet_dinh_cstdtq,
      });

      // Tự động cập nhật lại hồ sơ sau khi cập nhật danh hiệu
      try {
        await profileService.recalculateProfile(result.quan_nhan_id);
        console.log(`✅ Auto-recalculated profile for personnel ${result.quan_nhan_id}`);
      } catch (recalcError) {
        console.error(`⚠️ Failed to auto-recalculate profile:`, recalcError.message);
      }

      return res.status(200).json({
        success: true,
        message: 'Cập nhật danh hiệu thành công',
        data: result,
      });
    } catch (error) {
      console.error('Update annual reward error:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Cập nhật danh hiệu thất bại',
      });
    }
  }

  async deleteAnnualReward(req, res) {
    try {
      const { id } = req.params;

      const result = await annualRewardService.deleteAnnualReward(id);

      // Tự động cập nhật lại hồ sơ sau khi xóa danh hiệu
      if (result.personnelId) {
        try {
          await profileService.recalculateProfile(result.personnelId);
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
      console.error('Delete annual reward error:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Xóa danh hiệu thất bại',
      });
    }
  }

  /**
   * POST /api/annual-rewards/bulk
   * Thêm danh hiệu hằng năm đồng loạt cho nhiều quân nhân
   * Body: { personnel_ids: [1,2,3], nam: 2024, danh_hieu: 'CSTDCS', so_quyet_dinh: '123/QĐ' }
   * File: file_quyet_dinh (PDF, optional)
   */
  async bulkCreateAnnualRewards(req, res) {
    try {
      const { personnel_ids, nam, danh_hieu, so_quyet_dinh } = req.body;

      // Parse personnel_ids nếu là string
      let parsedPersonnelIds = personnel_ids;
      if (typeof personnel_ids === 'string') {
        try {
          parsedPersonnelIds = JSON.parse(personnel_ids);
        } catch (e) {
          return res.status(400).json({
            success: false,
            message: 'personnel_ids phải là mảng hoặc chuỗi JSON hợp lệ',
          });
        }
      }

      if (
        !parsedPersonnelIds ||
        !Array.isArray(parsedPersonnelIds) ||
        parsedPersonnelIds.length === 0
      ) {
        return res.status(400).json({
          success: false,
          message: 'Vui lòng chọn ít nhất một quân nhân (personnel_ids)',
        });
      }

      if (!nam || !danh_hieu) {
        return res.status(400).json({
          success: false,
          message: 'Vui lòng nhập đầy đủ thông tin: nam, danh_hieu',
        });
      }

      // Lấy file path nếu có upload
      const file_quyet_dinh = req.file ? req.file.filename : null;

      const result = await annualRewardService.bulkCreateAnnualRewards({
        personnel_ids: parsedPersonnelIds,
        nam,
        danh_hieu,
        so_quyet_dinh,
        file_quyet_dinh,
      });

      return res.status(201).json({
        success: true,
        message: `Thêm danh hiệu thành công cho ${result.success} quân nhân`,
        data: result,
      });
    } catch (error) {
      console.error('Bulk create annual rewards error:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Thêm danh hiệu đồng loạt thất bại',
      });
    }
  }

  /**
   * POST /api/annual-rewards/import
   * Import danh hiệu hằng năm từ file Excel
   * Định dạng cột: CCCD (bắt buộc), nam (bắt buộc), danh_hieu (CSTDCS, CSTT)
   * Lưu ý: Nếu danh_hieu rỗng hoặc KHONG_DAT → lưu là null (không đạt)
   */
  async importAnnualRewards(req, res) {
    try {
      if (!req.file || !req.file.buffer) {
        return res.status(400).json({
          success: false,
          message: 'Không tìm thấy file upload. Vui lòng gửi form-data field "file"',
        });
      }

      const result = await annualRewardService.importFromExcelBuffer(req.file.buffer);

      return res.status(200).json({
        success: true,
        message: 'Import danh hiệu hằng năm hoàn tất',
        data: result,
      });
    } catch (error) {
      console.error('Import annual rewards error:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Import danh hiệu hằng năm thất bại',
      });
    }
  }

  /**
   * Kiểm tra quân nhân đã nhận Huy chương Quân kỳ Quyết thắng chưa
   * GET /api/annual-reward/check-hcqkqt/:personnelId
   */
  async checkAlreadyReceivedHCQKQT(req, res) {
    try {
      const { personnelId } = req.params;

      const record = await prisma.huanChuongQuanKyQuyetThang.findFirst({
        where: { quan_nhan_id: personnelId },
      });

      return res.status(200).json({
        success: true,
        data: {
          alreadyReceived: !!record,
          record: record || null,
        },
      });
    } catch (error) {
      console.error('Check HC QKQT error:', error);
      return res.status(500).json({
        success: false,
        message: 'Lỗi khi kiểm tra trạng thái nhận HC QKQT',
      });
    }
  }

  /**
   * Kiểm tra quân nhân đã nhận Kỷ niệm chương VSNXD QĐNDVN chưa
   * GET /api/annual-reward/check-knc-vsnxd/:personnelId
   */
  async checkAlreadyReceivedKNCVSNXD(req, res) {
    try {
      const { personnelId } = req.params;

      const record = await prisma.kyNiemChuongVSNXDQDNDVN.findFirst({
        where: { quan_nhan_id: personnelId },
      });

      return res.status(200).json({
        success: true,
        data: {
          alreadyReceived: !!record,
          record: record || null,
        },
      });
    } catch (error) {
      console.error('Check KNC VSNXD error:', error);
      return res.status(500).json({
        success: false,
        message: 'Lỗi khi kiểm tra trạng thái nhận KNC VSNXD QĐNDVN',
      });
    }
  }
}

module.exports = new AnnualRewardController();
