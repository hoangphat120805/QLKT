const router = require('express').Router();
const multer = require('multer');
const militaryFlagController = require('../controllers/militaryFlag.controller');
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
// ROUTES - QUẢN LÝ HUÂN CHƯƠNG QUÂN KỲ QUYẾT THẮNG
// ============================================

/**
 * @route   GET /api/military-flag/template
 * @desc    Tải file mẫu Excel để import Huân chương Quân kỳ Quyết thắng
 * @access  ADMIN
 */
router.get('/template', verifyToken, requireManager, militaryFlagController.getTemplate);

/**
 * @route   POST /api/military-flag/import
 * @desc    Import Huân chương Quân kỳ Quyết thắng từ file Excel
 * @access  ADMIN, MANAGER
 */
router.post(
  '/import',
  verifyToken,
  checkRole(['ADMIN', 'MANAGER']),
  upload.single('file'),
  militaryFlagController.importFromExcel
);

/**
 * @route   GET /api/military-flag
 * @desc    Lấy danh sách Huân chương Quân kỳ Quyết thắng (Admin: tất cả, Manager: đơn vị mình)
 * @access  ADMIN, MANAGER
 */
router.get('/', verifyToken, checkRole(['ADMIN', 'MANAGER']), militaryFlagController.getAll);

/**
 * @route   GET /api/military-flag/export
 * @desc    Xuất file Excel Huân chương Quân kỳ Quyết thắng (Admin: tất cả, Manager: đơn vị mình)
 * @access  ADMIN, MANAGER
 */
router.get(
  '/export',
  verifyToken,
  checkRole(['ADMIN', 'MANAGER']),
  militaryFlagController.exportToExcel
);

/**
 * @route   GET /api/military-flag/statistics
 * @desc    Thống kê Huân chương Quân kỳ Quyết thắng
 * @access  ADMIN, MANAGER
 */
router.get(
  '/statistics',
  verifyToken,
  checkRole(['ADMIN', 'MANAGER']),
  militaryFlagController.getStatistics
);

/**
 * @route   GET /api/military-flag/personnel/:personnel_id
 * @desc    Lấy Huân chương Quân kỳ Quyết thắng theo personnel_id
 * @access  ADMIN, MANAGER, USER
 */
router.get(
  '/personnel/:personnel_id',
  verifyToken,
  checkRole(['ADMIN', 'MANAGER', 'USER']),
  militaryFlagController.getByPersonnelId
);

module.exports = router;
