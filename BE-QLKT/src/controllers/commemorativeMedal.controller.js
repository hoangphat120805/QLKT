const commemorativeMedalService = require('../services/commemorativeMedal.service');

class CommemorativeMedalController {
  /**
   * GET /api/commemorative-medals/template
   * Tải file mẫu Excel để import Kỷ niệm chương
   */
  async getTemplate(req, res) {
    try {
      const userRole = req.user?.role || 'MANAGER';
      const buffer = await commemorativeMedalService.exportTemplate(userRole);

      const fileName = `mau_import_knc_vsnxd_${new Date().toISOString().slice(0, 10)}.xlsx`;
      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);

      return res.status(200).send(buffer);
    } catch (error) {
      console.error('Get commemorative medals template error:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Tải file mẫu thất bại',
      });
    }
  }

  /**
   * POST /api/commemorative-medals/import
   * Import Kỷ niệm chương từ file Excel
   */
  async importFromExcel(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'Vui lòng gửi file Excel',
        });
      }

      const result = await commemorativeMedalService.importFromExcel(req.file.buffer, req.user.id);

      return res.status(200).json({
        success: true,
        message: 'Import Kỷ niệm chương thành công',
        data: result,
      });
    } catch (error) {
      console.error('Import commemorative medals error:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Import thất bại',
      });
    }
  }

  /**
   * GET /api/commemorative-medals
   * Lấy danh sách Kỷ niệm chương
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
        const user = await commemorativeMedalService.getUserWithUnit(userId);
        if (!user || !user.QuanNhan) {
          return res.status(403).json({
            success: false,
            message: 'Không tìm thấy thông tin đơn vị',
          });
        }
        filters.don_vi_id = user.QuanNhan.co_quan_don_vi_id || user.QuanNhan.don_vi_truc_thuoc_id;
      }

      const result = await commemorativeMedalService.getAll(filters, page, limit);

      return res.status(200).json({
        success: true,
        message: 'Lấy danh sách Kỷ niệm chương thành công',
        data: result,
      });
    } catch (error) {
      console.error('Get all commemorative medals error:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Lấy danh sách thất bại',
      });
    }
  }

  /**
   * GET /api/commemorative-medals/export
   * Xuất file Excel Kỷ niệm chương
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
        const user = await commemorativeMedalService.getUserWithUnit(userId);
        if (!user || !user.QuanNhan) {
          return res.status(403).json({
            success: false,
            message: 'Không tìm thấy thông tin đơn vị',
          });
        }
        filters.don_vi_id = user.QuanNhan.co_quan_don_vi_id || user.QuanNhan.don_vi_truc_thuoc_id;
      }

      const buffer = await commemorativeMedalService.exportToExcel(filters);

      const fileName = `danh_sach_knc_vsnxd_${new Date().toISOString().slice(0, 10)}.xlsx`;
      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);

      return res.status(200).send(buffer);
    } catch (error) {
      console.error('Export commemorative medals Excel error:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Xuất file Excel thất bại',
      });
    }
  }

  /**
   * GET /api/commemorative-medals/statistics
   * Thống kê Kỷ niệm chương
   */
  async getStatistics(req, res) {
    try {
      const statistics = await commemorativeMedalService.getStatistics();

      return res.status(200).json({
        success: true,
        message: 'Lấy thống kê Kỷ niệm chương thành công',
        data: statistics,
      });
    } catch (error) {
      console.error('Get commemorative medals statistics error:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Lấy thống kê thất bại',
      });
    }
  }
}

module.exports = new CommemorativeMedalController();
