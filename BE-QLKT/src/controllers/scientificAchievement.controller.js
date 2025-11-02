const scientificAchievementService = require('../services/scientificAchievement.service');
const profileService = require('../services/profile.service');

class ScientificAchievementController {
  async getAchievements(req, res) {
    try {
      const { personnel_id } = req.query;

      if (!personnel_id) {
        return res.status(400).json({
          success: false,
          message: 'Tham số personnel_id là bắt buộc',
        });
      }

      const result = await scientificAchievementService.getAchievements(personnel_id);

      return res.status(200).json({
        success: true,
        message: 'Lấy danh sách thành tích khoa học thành công',
        data: result,
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
      const { personnel_id, nam, loai, mo_ta, status } = req.body;

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
        status,
      });

      // Tự động cập nhật lại hồ sơ sau khi thêm thành tích
      try {
        await profileService.recalculateProfile(parseInt(personnel_id));
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
      const { nam, loai, mo_ta, status } = req.body;

      const result = await scientificAchievementService.updateAchievement(parseInt(id), {
        nam,
        loai,
        mo_ta,
        status,
      });

      // Tự động cập nhật lại hồ sơ sau khi cập nhật thành tích
      try {
        await profileService.recalculateProfile(result.quan_nhan_id);
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

      const result = await scientificAchievementService.deleteAchievement(parseInt(id));

      // Tự động cập nhật lại hồ sơ sau khi xóa thành tích
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
      console.error('Delete achievement error:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Xóa thành tích thất bại',
      });
    }
  }
}

module.exports = new ScientificAchievementController();
