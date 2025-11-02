const contributionGroupService = require('../services/contributionGroup.service');

class ContributionGroupController {
  async getAllGroups(req, res) {
    try {
      const result = await contributionGroupService.getAllGroups();
      return res.status(200).json({
        success: true,
        message: 'Lấy danh sách nhóm cống hiến thành công',
        data: result,
      });
    } catch (error) {
      console.error('Get contribution groups error:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Lấy danh sách nhóm cống hiến thất bại',
      });
    }
  }

  async createGroup(req, res) {
    try {
      const { ten_nhom, mo_ta } = req.body;

      if (!ten_nhom) {
        return res.status(400).json({
          success: false,
          message: 'Vui lòng nhập tên nhóm cống hiến',
        });
      }

      const result = await contributionGroupService.createGroup({ ten_nhom, mo_ta });

      return res.status(201).json({
        success: true,
        message: 'Tạo nhóm cống hiến thành công',
        data: result,
      });
    } catch (error) {
      console.error('Create contribution group error:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Tạo nhóm cống hiến thất bại',
      });
    }
  }

  async updateGroup(req, res) {
    try {
      const { id } = req.params;
      const { ten_nhom, mo_ta } = req.body;

      const result = await contributionGroupService.updateGroup(parseInt(id), { ten_nhom, mo_ta });

      return res.status(200).json({
        success: true,
        message: 'Cập nhật nhóm cống hiến thành công',
        data: result,
      });
    } catch (error) {
      console.error('Update contribution group error:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Cập nhật nhóm cống hiến thất bại',
      });
    }
  }

  async deleteGroup(req, res) {
    try {
      const { id } = req.params;

      const result = await contributionGroupService.deleteGroup(parseInt(id));

      return res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      console.error('Delete contribution group error:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Xóa nhóm cống hiến thất bại',
      });
    }
  }
}

module.exports = new ContributionGroupController();
