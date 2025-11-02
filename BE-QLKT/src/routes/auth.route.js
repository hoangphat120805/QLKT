const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { verifyToken } = require('../middlewares/auth');
const { auditLog, createDescription } = require('../middlewares/auditLog');

/**
 * @route   POST /api/auth/login
 * @desc    Đăng nhập hệ thống
 * @access  Public
 */
router.post(
  '/login',
  auditLog({
    action: 'LOGIN',
    resource: 'auth',
    getDescription: () => createDescription.login(),
  }),
  authController.login
);

/**
 * @route   POST /api/auth/refresh
 * @desc    Lấy access token mới khi hết hạn
 * @access  Public
 */
router.post('/refresh', authController.refresh);

/**
 * @route   POST /api/auth/logout
 * @desc    Đăng xuất (vô hiệu hóa refresh token)
 * @access  Public
 */
router.post(
  '/logout',
  auditLog({
    action: 'LOGOUT',
    resource: 'auth',
    getDescription: () => createDescription.logout(),
  }),
  authController.logout
);

/**
 * @route   POST /api/auth/change-password
 * @desc    Tự đổi mật khẩu (khi đã đăng nhập)
 * @access  Private (Yêu cầu đăng nhập)
 */
router.post(
  '/change-password',
  verifyToken,
  auditLog({
    action: 'CHANGE_PASSWORD',
    resource: 'auth',
    getDescription: () => 'Tự đổi mật khẩu',
  }),
  authController.changePassword
);

module.exports = router;
