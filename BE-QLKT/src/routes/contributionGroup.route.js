const express = require('express');
const router = express.Router();
const contributionGroupController = require('../controllers/contributionGroup.controller');
const { verifyToken, requireAdmin } = require('../middlewares/auth');
const { auditLog, getResourceId } = require('../middlewares/auditLog');

/**
 * @route   GET /api/contribution-groups
 * @desc    Lấy tất cả nhóm cống hiến
 * @access  Private - ADMIN and above
 */
router.get('/', verifyToken, requireAdmin, contributionGroupController.getAllGroups);

/**
 * @route   POST /api/contribution-groups
 * @desc    Tạo nhóm cống hiến mới
 * @access  Private - ADMIN and above
 */
router.post(
  '/',
  verifyToken,
  requireAdmin,
  auditLog({
    action: 'CREATE',
    resource: 'contribution_groups',
    getDescription: (req, res, responseData) => {
      const tenNhom = req.body?.ten_nhom_cong_hien || 'N/A';
      return `Tạo mới nhóm cống hiến: ${tenNhom}`;
    },
    getResourceId: getResourceId.fromResponse('id'),
  }),
  contributionGroupController.createGroup
);

/**
 * @route   PUT /api/contribution-groups/:id
 * @desc    Cập nhật nhóm cống hiến
 * @access  Private - ADMIN and above
 */
router.put(
  '/:id',
  verifyToken,
  requireAdmin,
  auditLog({
    action: 'UPDATE',
    resource: 'contribution_groups',
    getDescription: (req, res, responseData) => {
      const tenNhom = req.body?.ten_nhom_cong_hien || 'N/A';
      return `Cập nhật nhóm cống hiến: ${tenNhom}`;
    },
    getResourceId: getResourceId.fromParams('id'),
  }),
  contributionGroupController.updateGroup
);

/**
 * @route   DELETE /api/contribution-groups/:id
 * @desc    Xóa nhóm cống hiến
 * @access  Private - ADMIN and above
 */
router.delete(
  '/:id',
  verifyToken,
  requireAdmin,
  auditLog({
    action: 'DELETE',
    resource: 'contribution_groups',
    getDescription: (req, res, responseData) => {
      try {
        const data = typeof responseData === 'string' ? JSON.parse(responseData) : responseData;
        const tenNhom = data?.data?.ten_nhom_cong_hien || `ID ${req.params.id}`;
        return `Xóa nhóm cống hiến: ${tenNhom}`;
      } catch {
        return `Xóa nhóm cống hiến: ID ${req.params.id}`;
      }
    },
    getResourceId: getResourceId.fromParams('id'),
  }),
  contributionGroupController.deleteGroup
);

module.exports = router;
