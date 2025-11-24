const militaryFlagService = require('../services/militaryFlag.service');

class MilitaryFlagController {
  /**
   * GET /api/military-flag/template
   * Tải file mẫu Excel để import Huân chương Quân kỳ Quyết thắng
   */
  async getTemplate(req, res) {
    try {
      const buffer = await militaryFlagService.exportTemplate();

      const fileName = `mau_import_hcqkqt_${new Date().toISOString().slice(0, 10)}.xlsx`;
      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);

      return res.status(200).send(buffer);
    } catch (error) {
      console.error('Get military flag template error:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Tải file mẫu thất bại',
      });
    }
  }

  /**
   * POST /api/military-flag/import
   * Import Huân chương Quân kỳ Quyết thắng từ file Excel
   */
  async importFromExcel(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'Vui lòng gửi file Excel',
        });
      }

      const result = await militaryFlagService.importFromExcel(req.file.buffer, req.user.id);

      return res.status(200).json({
        success: true,
        message: 'Import Huân chương Quân kỳ Quyết thắng thành công',
        data: result,
      });
    } catch (error) {
      console.error('Import military flag error:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Import thất bại',
      });
    }
  }

  /**
   * GET /api/military-flag
   * Lấy danh sách Huân chương Quân kỳ Quyết thắng
   */
  async getAll(req, res) {
    try {
      const userId = req.user.id;
      const userRole = req.user.role;
      const { don_vi_id, nam, page = 1, limit = 50 } = req.query;

      const filters = {};
      if (don_vi_id) filters.don_vi_id = don_vi_id;
      if (nam) filters.nam = nam;

      if (userRole === 'MANAGER') {
        const user = await militaryFlagService.getUserWithUnit(userId);
        if (!user || !user.QuanNhan) {
          return res.status(403).json({
            success: false,
            message: 'Không tìm thấy thông tin đơn vị',
          });
        }
        filters.don_vi_id = user.QuanNhan.co_quan_don_vi_id || user.QuanNhan.don_vi_truc_thuoc_id;
      }

      const result = await militaryFlagService.getAll(filters, page, limit);

      return res.status(200).json({
        success: true,
        message: 'Lấy danh sách HCQKQT thành công',
        data: result,
      });
    } catch (error) {
      console.error('Get all military flag error:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Lấy danh sách thất bại',
      });
    }
  }

  /**
   * GET /api/military-flag/export
   * Xuất file Excel Huân chương Quân kỳ Quyết thắng
   */
  async exportToExcel(req, res) {
    try {
      const userId = req.user.id;
      const userRole = req.user.role;
      const { don_vi_id, nam } = req.query;

      const filters = {};
      if (don_vi_id) filters.don_vi_id = don_vi_id;
      if (nam) filters.nam = nam;

      if (userRole === 'MANAGER') {
        const user = await militaryFlagService.getUserWithUnit(userId);
        if (!user || !user.QuanNhan) {
          return res.status(403).json({
            success: false,
            message: 'Không tìm thấy thông tin đơn vị',
          });
        }
        filters.don_vi_id = user.QuanNhan.co_quan_don_vi_id || user.QuanNhan.don_vi_truc_thuoc_id;
      }

      const buffer = await militaryFlagService.exportToExcel(filters);

      const fileName = `danh_sach_hcqkqt_${new Date().toISOString().slice(0, 10)}.xlsx`;
      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);

      return res.status(200).send(buffer);
    } catch (error) {
      console.error('Export military flag Excel error:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Xuất file Excel thất bại',
      });
    }
  }

  /**
   * GET /api/military-flag/statistics
   * Thống kê Huân chương Quân kỳ Quyết thắng
   */
  async getStatistics(req, res) {
    try {
      const statistics = await militaryFlagService.getStatistics();

      return res.status(200).json({
        success: true,
        message: 'Lấy thống kê HCQKQT thành công',
        data: statistics,
      });
    } catch (error) {
      console.error('Get military flag statistics error:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Lấy thống kê thất bại',
      });
    }
  }
}

module.exports = new MilitaryFlagController();
