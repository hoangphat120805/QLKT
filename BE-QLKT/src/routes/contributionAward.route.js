const router = require('express').Router();
const multer = require('multer');
const contributionAwardController = require('../controllers/contributionAward.controller');
const { verifyToken, checkRole, requireManager } = require('../middlewares/auth');

// Cấu hình multer cho file upload
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
    ];
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Chỉ chấp nhận file Excel (.xlsx, .xls)'));
    }
  },
});

// ============================================
// ROUTES - QUẢN LÝ HUÂN CHƯƠNG BẢO VỆ TỔ QUỐC (CỐNG HIẾN)
// ============================================

/**
 * @route   GET /api/contribution-awards/template
 * @desc    Tải file mẫu Excel để import Huân chương Bảo vệ Tổ quốc
 * @access  ADMIN
 */
router.get('/template', verifyToken, requireManager, contributionAwardController.getTemplate);

/**
 * @route   POST /api/contribution-awards/import
 * @desc    Import Huân chương Bảo vệ Tổ quốc từ file Excel
 * @access  ADMIN, MANAGER
 */
router.post(
  '/import',
  verifyToken,
  checkRole(['ADMIN', 'MANAGER']),
  upload.single('file'),
  contributionAwardController.importFromExcel
);

/**
 * @route   GET /api/contribution-awards
 * @desc    Lấy danh sách Huân chương Bảo vệ Tổ quốc (Admin: tất cả, Manager: đơn vị mình)
 * @access  ADMIN, MANAGER
 */
router.get('/', verifyToken, checkRole(['ADMIN', 'MANAGER']), contributionAwardController.getAll);

/**
 * @route   GET /api/contribution-awards/export
 * @desc    Xuất file Excel Huân chương Bảo vệ Tổ quốc (Admin: tất cả, Manager: đơn vị mình)
 * @access  ADMIN, MANAGER
 */
router.get(
  '/export',
  verifyToken,
  checkRole(['ADMIN', 'MANAGER']),
  contributionAwardController.exportToExcel
);

/**
 * @route   GET /api/contribution-awards/statistics
 * @desc    Thống kê Huân chương Bảo vệ Tổ quốc theo hạng
 * @access  ADMIN, MANAGER
 */
router.get(
  '/statistics',
  verifyToken,
  checkRole(['ADMIN', 'MANAGER']),
  contributionAwardController.getStatistics
);

module.exports = router;
