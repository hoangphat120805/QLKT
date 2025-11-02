const unitService = require('../services/unit.service');

class UnitController {
  /**
   * GET /api/units
   * Lấy tất cả đơn vị
   */
  async getAllUnits(req, res) {
    try {
      const result = await unitService.getAllUnits();

      return res.status(200).json({
        success: true,
        message: 'Lấy danh sách đơn vị thành công',
        data: result,
      });
    } catch (error) {
      console.error('Get units error:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Lấy danh sách đơn vị thất bại',
      });
    }
  }

  /**
   * POST /api/units
   * Tạo đơn vị mới
   */
  async createUnit(req, res) {
    try {
      const { ma_don_vi, ten_don_vi } = req.body;

      // Validate input
      if (!ma_don_vi || !ten_don_vi) {
        return res.status(400).json({
          success: false,
          message: 'Vui lòng nhập đầy đủ thông tin: ma_don_vi, ten_don_vi',
        });
      }

      const result = await unitService.createUnit({ ma_don_vi, ten_don_vi });

      return res.status(201).json({
        success: true,
        message: 'Tạo đơn vị thành công',
        data: result,
      });
    } catch (error) {
      console.error('Create unit error:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Tạo đơn vị thất bại',
      });
    }
  }

  /**
   * PUT /api/units/:id
   * Sửa tên đơn vị
   */
  async updateUnit(req, res) {
    try {
      const { id } = req.params;
      const { ten_don_vi } = req.body;

      if (!ten_don_vi) {
        return res.status(400).json({
          success: false,
          message: 'Vui lòng cung cấp tên đơn vị mới',
        });
      }

      const result = await unitService.updateUnit(parseInt(id), { ten_don_vi });

      return res.status(200).json({
        success: true,
        message: 'Cập nhật đơn vị thành công',
        data: result,
      });
    } catch (error) {
      console.error('Update unit error:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Cập nhật đơn vị thất bại',
      });
    }
  }

  /**
   * DELETE /api/units/:id
   * Xóa đơn vị
   */
  async deleteUnit(req, res) {
    try {
      const { id } = req.params;

      const result = await unitService.deleteUnit(parseInt(id));

      return res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      console.error('Delete unit error:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Xóa đơn vị thất bại',
      });
    }
  }
}

module.exports = new UnitController();
