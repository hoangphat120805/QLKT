const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profile.controller');
const { verifyToken, requireAdmin, requireManager, requireAuth } = require('../middlewares/auth');

/**
 * @route   GET /api/profiles/annual/:personnel_id
 * @desc    Lấy hồ sơ gợi ý hằng năm
 * @access  Private - ADMIN, MANAGER, USER
 */
router.get('/annual/:personnel_id', verifyToken, requireAuth, profileController.getAnnualProfile);

/**
 * @route   GET /api/profiles/service/:personnel_id
 * @desc    Lấy hồ sơ gợi ý niên hạn
 * @access  Private - ADMIN, MANAGER, USER
 */
router.get('/service/:personnel_id', verifyToken, requireAuth, profileController.getServiceProfile);

/**
 * @route   POST /api/profiles/recalculate/:personnel_id
 * @desc    Tính toán lại hồ sơ cho 1 quân nhân
 * @access  Private - ADMIN, MANAGER
 */
router.post('/recalculate/:personnel_id', verifyToken, requireManager, profileController.recalculateProfile);

/**
 * @route   POST /api/profiles/recalculate-all
 * @desc    Tính toán lại cho toàn bộ quân nhân
 * @access  Private - ADMIN only
 */
router.post('/recalculate-all', verifyToken, requireAdmin, profileController.recalculateAll);

/**
 * @route   GET /api/profiles/service
 * @desc    Lấy danh sách tất cả hồ sơ niên hạn (cho admin)
 * @access  Private - ADMIN only
 */
router.get('/service', verifyToken, requireAdmin, profileController.getAllServiceProfiles);

/**
 * @route   PUT /api/profiles/service/:personnel_id
 * @desc    Cập nhật trạng thái hồ sơ niên hạn (ADMIN duyệt huân chương)
 * @access  Private - ADMIN only
 */
router.put('/service/:personnel_id', verifyToken, requireAdmin, profileController.updateServiceProfile);

module.exports = router;
