const express = require('express');
const router = express.Router();
const decisionController = require('../controllers/decision.controller');
const { verifyToken, requireAdmin } = require('../middlewares/auth');
const { auditLog, createDescription, getResourceId } = require('../middlewares/auditLog');

/**
 * @route   GET /api/decisions
 * @desc    Lấy tất cả quyết định khen thưởng (?nam=2024&loai_khen_thuong=...&search=...&page=1&limit=50)
 * @access  Private - ADMIN and above
 */
router.get('/', verifyToken, requireAdmin, decisionController.getAllDecisions);

/**
 * @route   GET /api/decisions/autocomplete
 * @desc    Autocomplete tìm kiếm quyết định (?q=123&limit=10)
 * @access  Private - ADMIN and above
 */
router.get('/autocomplete', verifyToken, requireAdmin, decisionController.autocomplete);

/**
 * @route   GET /api/decisions/years
 * @desc    Lấy danh sách năm có quyết định
 * @access  Private - ADMIN and above
 */
router.get('/years', verifyToken, requireAdmin, decisionController.getAvailableYears);

/**
 * @route   GET /api/decisions/award-types
 * @desc    Lấy danh sách loại khen thưởng
 * @access  Private - ADMIN and above
 */
router.get('/award-types', verifyToken, requireAdmin, decisionController.getAwardTypes);

/**
 * @route   GET /api/decisions/by-number/:soQuyetDinh
 * @desc    Lấy quyết định theo số quyết định
 * @access  Private - ADMIN and above
 */
router.get(
  '/by-number/:soQuyetDinh',
  verifyToken,
  requireAdmin,
  decisionController.getDecisionBySoQuyetDinh
);

/**
 * @route   GET /api/decisions/:id
 * @desc    Lấy chi tiết quyết định theo ID
 * @access  Private - ADMIN and above
 */
router.get('/:id', verifyToken, requireAdmin, decisionController.getDecisionById);

/**
 * @route   POST /api/decisions
 * @desc    Tạo quyết định mới
 * @access  Private - ADMIN and above
 */
router.post(
  '/',
  verifyToken,
  requireAdmin,
  auditLog({
    action: 'CREATE',
    resource: 'decisions',
    getDescription: (req, res, responseData) => {
      const soQuyetDinh = req.body?.so_quyet_dinh || 'N/A';
      return `Tạo mới quyết định: ${soQuyetDinh}`;
    },
    getResourceId: getResourceId.fromResponse('id'),
  }),
  decisionController.createDecision
);

/**
 * @route   PUT /api/decisions/:id
 * @desc    Cập nhật quyết định
 * @access  Private - ADMIN and above
 */
router.put(
  '/:id',
  verifyToken,
  requireAdmin,
  auditLog({
    action: 'UPDATE',
    resource: 'decisions',
    getDescription: (req, res, responseData) => {
      const soQuyetDinh = req.body?.so_quyet_dinh || `ID ${req.params.id}`;
      return `Cập nhật quyết định: ${soQuyetDinh}`;
    },
    getResourceId: getResourceId.fromParams('id'),
  }),
  decisionController.updateDecision
);

/**
 * @route   DELETE /api/decisions/:id
 * @desc    Xóa quyết định
 * @access  Private - ADMIN and above
 */
router.delete(
  '/:id',
  verifyToken,
  requireAdmin,
  auditLog({
    action: 'DELETE',
    resource: 'decisions',
    getDescription: (req, res, responseData) => {
      return `Xóa quyết định: ID ${req.params.id}`;
    },
    getResourceId: getResourceId.fromParams('id'),
  }),
  decisionController.deleteDecision
);

module.exports = router;
