const positionService = require('../services/position.service');

class PositionController {
  /**
   * GET /api/positions?unit_id={id}
   * Lấy chức vụ (lọc theo đơn vị, nếu không có unit_id thì trả về tất cả)
   */
  async getPositions(req, res) {
    try {
      const { unit_id } = req.query;

      const result = await positionService.getPositions(unit_id);

      return res.status(200).json({
        success: true,
        message: 'Lấy danh sách chức vụ thành công',
        data: result,
      });
    } catch (error) {
      console.error('Get positions error:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Lấy danh sách chức vụ thất bại',
      });
    }
  }

  /**
   * POST /api/positions
   * Tạo chức vụ mới
   */
  async createPosition(req, res) {
    try {
      const { unit_id, ten_chuc_vu, is_manager, nhom_cong_hien_id } = req.body;

      // Validate input
      if (!unit_id || !ten_chuc_vu) {
        return res.status(400).json({
          success: false,
          message: 'Vui lòng nhập đầy đủ thông tin: unit_id, ten_chuc_vu',
        });
      }

      const result = await positionService.createPosition({
        unit_id,
        ten_chuc_vu,
        is_manager,
        nhom_cong_hien_id,
      });

      return res.status(201).json({
        success: true,
        message: 'Tạo chức vụ thành công',
        data: result,
      });
    } catch (error) {
      console.error('Create position error:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Tạo chức vụ thất bại',
      });
    }
  }

  /**
   * PUT /api/positions/:id
   * Sửa chức vụ
   */
  async updatePosition(req, res) {
    try {
      const { id } = req.params;
      const { ten_chuc_vu, is_manager, nhom_cong_hien_id } = req.body;

      const result = await positionService.updatePosition(parseInt(id), {
        ten_chuc_vu,
        is_manager,
        nhom_cong_hien_id,
      });

      return res.status(200).json({
        success: true,
        message: 'Cập nhật chức vụ thành công',
        data: result,
      });
    } catch (error) {
      console.error('Update position error:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Cập nhật chức vụ thất bại',
      });
    }
  }

  /**
   * DELETE /api/positions/:id
   * Xóa chức vụ
   */
  async deletePosition(req, res) {
    try {
      const { id } = req.params;

      const result = await positionService.deletePosition(parseInt(id));

      return res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      console.error('Delete position error:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Xóa chức vụ thất bại',
      });
    }
  }
}

module.exports = new PositionController();
