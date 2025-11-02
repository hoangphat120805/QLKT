const express = require('express');
const router = express.Router();
const positionController = require('../controllers/position.controller');
const { verifyToken, requireAdmin, requireManager } = require('../middlewares/auth');
const { auditLog, createDescription, getResourceId } = require('../middlewares/auditLog');

/**
 * @route   GET /api/positions?unit_id={id}
 * @desc    Lấy chức vụ (lọc theo đơn vị)
 * @access  Private - ADMIN, MANAGER
 */
router.get('/', verifyToken, requireManager, positionController.getPositions);

/**
 * @route   POST /api/positions
 * @desc    Tạo chức vụ mới
 * @access  Private - ADMIN and above
 */
router.post(
  '/',
  verifyToken,
  requireAdmin,
  auditLog({
    action: 'CREATE',
    resource: 'positions',
    getDescription: (req, res, responseData) => {
      // Lấy tên chức vụ từ request body
      const tenChucVu = req.body?.ten_chuc_vu || 'N/A';
      return `Tạo mới chức vụ: ${tenChucVu}`;
    },
    getResourceId: getResourceId.fromResponse('id'),
  }),
  positionController.createPosition
);

/**
 * @route   PUT /api/positions/:id
 * @desc    Sửa chức vụ
 * @access  Private - ADMIN and above
 */
router.put(
  '/:id',
  verifyToken,
  requireAdmin,
  auditLog({
    action: 'UPDATE',
    resource: 'positions',
    getDescription: (req, res, responseData) => {
      // Lấy tên chức vụ từ request body
      const tenChucVu = req.body?.ten_chuc_vu || 'N/A';
      return `Cập nhật chức vụ: ${tenChucVu}`;
    },
    getResourceId: getResourceId.fromParams('id'),
  }),
  positionController.updatePosition
);

/**
 * @route   DELETE /api/positions/:id
 * @desc    Xóa chức vụ
 * @access  Private - ADMIN and above
 */
router.delete(
  '/:id',
  verifyToken,
  requireAdmin,
  auditLog({
    action: 'DELETE',
    resource: 'positions',
    getDescription: (req, res, responseData) => {
      // Cố gắng lấy tên chức vụ từ response nếu có
      try {
        const data = typeof responseData === 'string' ? JSON.parse(responseData) : responseData;
        const tenChucVu = data?.data?.ten_chuc_vu || `ID ${req.params.id}`;
        return `Xóa chức vụ: ${tenChucVu}`;
      } catch {
        return `Xóa chức vụ: ID ${req.params.id}`;
      }
    },
    getResourceId: getResourceId.fromParams('id'),
  }),
  positionController.deletePosition
);

module.exports = router;
