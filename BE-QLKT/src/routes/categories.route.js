const express = require('express');
const router = express.Router();
const unitController = require('../controllers/unit.controller');
const positionController = require('../controllers/position.controller');
const contributionGroupController = require('../controllers/contributionGroup.controller');
const { verifyToken, requireAdmin, requireManager } = require('../middlewares/auth');
const { auditLog, createDescription, getResourceId } = require('../middlewares/auditLog');

// ===== UNITS =====
/**
 * @route   GET /api/categories/units
 * @desc    Lấy tất cả đơn vị (alias for /api/units)
 * @access  Private - ADMIN and above
 */
router.get('/units', verifyToken, requireAdmin, unitController.getAllUnits);

/**
 * @route   POST /api/categories/units
 * @desc    Tạo đơn vị mới (alias for /api/units)
 * @access  Private - ADMIN and above
 */
router.post(
  '/units',
  verifyToken,
  requireAdmin,
  auditLog({
    action: 'CREATE',
    resource: 'units',
    getDescription: req => createDescription.create('đơn vị', req.body),
    getResourceId: getResourceId.fromResponse('id'),
  }),
  unitController.createUnit
);

/**
 * @route   PUT /api/categories/units/:id
 * @desc    Sửa tên đơn vị (alias for /api/units/:id)
 * @access  Private - ADMIN and above
 */
router.put(
  '/units/:id',
  verifyToken,
  requireAdmin,
  auditLog({
    action: 'UPDATE',
    resource: 'units',
    getDescription: req => createDescription.update('đơn vị', req.body),
    getResourceId: getResourceId.fromParams('id'),
  }),
  unitController.updateUnit
);

/**
 * @route   DELETE /api/categories/units/:id
 * @desc    Xóa đơn vị (alias for /api/units/:id)
 * @access  Private - ADMIN and above
 */
router.delete(
  '/units/:id',
  verifyToken,
  requireAdmin,
  auditLog({
    action: 'DELETE',
    resource: 'units',
    getDescription: req => createDescription.delete('đơn vị', { id: req.params.id }),
    getResourceId: getResourceId.fromParams('id'),
  }),
  unitController.deleteUnit
);

// ===== POSITIONS =====
/**
 * @route   GET /api/categories/positions?unit_id={id}
 * @desc    Lấy chức vụ (alias for /api/positions)
 * @access  Private - ADMIN, MANAGER
 */
router.get('/positions', verifyToken, requireManager, positionController.getPositions);

/**
 * @route   POST /api/categories/positions
 * @desc    Tạo chức vụ mới (alias for /api/positions)
 * @access  Private - ADMIN and above
 */
router.post(
  '/positions',
  verifyToken,
  requireAdmin,
  auditLog({
    action: 'CREATE',
    resource: 'positions',
    getDescription: req => createDescription.create('chức vụ', req.body),
    getResourceId: getResourceId.fromResponse('id'),
  }),
  positionController.createPosition
);

/**
 * @route   PUT /api/categories/positions/:id
 * @desc    Sửa chức vụ (alias for /api/positions/:id)
 * @access  Private - ADMIN and above
 */
router.put(
  '/positions/:id',
  verifyToken,
  requireAdmin,
  auditLog({
    action: 'UPDATE',
    resource: 'positions',
    getDescription: req => createDescription.update('chức vụ', req.body),
    getResourceId: getResourceId.fromParams('id'),
  }),
  positionController.updatePosition
);

/**
 * @route   DELETE /api/categories/positions/:id
 * @desc    Xóa chức vụ (alias for /api/positions/:id)
 * @access  Private - ADMIN and above
 */
router.delete(
  '/positions/:id',
  verifyToken,
  requireAdmin,
  auditLog({
    action: 'DELETE',
    resource: 'positions',
    getDescription: req => createDescription.delete('chức vụ', { id: req.params.id }),
    getResourceId: getResourceId.fromParams('id'),
  }),
  positionController.deletePosition
);

// ===== CONTRIBUTION GROUPS =====
/**
 * @route   GET /api/categories/contribution-groups
 * @desc    Lấy tất cả nhóm cống hiến (alias for /api/contribution-groups)
 * @access  Private - ADMIN and above
 */
router.get('/contribution-groups', verifyToken, requireAdmin, contributionGroupController.getAllGroups);

/**
 * @route   POST /api/categories/contribution-groups
 * @desc    Tạo nhóm mới (alias for /api/contribution-groups)
 * @access  Private - ADMIN and above
 */
router.post('/contribution-groups', verifyToken, requireAdmin, contributionGroupController.createGroup);

/**
 * @route   PUT /api/categories/contribution-groups/:id
 * @desc    Sửa nhóm (alias for /api/contribution-groups/:id)
 * @access  Private - ADMIN and above
 */
router.put('/contribution-groups/:id', verifyToken, requireAdmin, contributionGroupController.updateGroup);

/**
 * @route   DELETE /api/categories/contribution-groups/:id
 * @desc    Xóa nhóm (alias for /api/contribution-groups/:id)
 * @access  Private - ADMIN and above
 */
router.delete('/contribution-groups/:id', verifyToken, requireAdmin, contributionGroupController.deleteGroup);

module.exports = router;
