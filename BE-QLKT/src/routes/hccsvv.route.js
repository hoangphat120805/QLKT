const router = require('express').Router();
const multer = require('multer');
const hccsvvController = require('../controllers/hccsvv.controller');
const { verifyToken, checkRole } = require('../middlewares/auth');

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
// ROUTES - QUẢN LÝ HUÂN CHƯƠNG CHIẾN SĨ VẺ VANG
// ============================================

/**
 * @route   GET /api/hccsvv/template
 * @desc    Tải file mẫu Excel để import Huân chương Chiến sĩ Vẻ vang
 * @access  ADMIN
 */
router.get('/template', verifyToken, checkRole(['ADMIN']), hccsvvController.getTemplate);

/**
 * @route   POST /api/hccsvv/import
 * @desc    Import Huân chương Chiến sĩ Vẻ vang từ file Excel
 * @access  ADMIN
 */
router.post(
  '/import',
  verifyToken,
  checkRole(['ADMIN']),
  upload.single('file'),
  hccsvvController.importFromExcel
);

/**
 * @route   GET /api/hccsvv
 * @desc    Lấy danh sách Huân chương Chiến sĩ Vẻ vang (Admin: tất cả, Manager: đơn vị mình)
 * @access  ADMIN, MANAGER
 */
router.get('/', verifyToken, checkRole(['ADMIN', 'MANAGER']), hccsvvController.getAll);

/**
 * @route   GET /api/hccsvv/export
 * @desc    Xuất file Excel Huân chương Chiến sĩ Vẻ vang (Admin: tất cả, Manager: đơn vị mình)
 * @access  ADMIN, MANAGER
 */
router.get('/export', verifyToken, checkRole(['ADMIN', 'MANAGER']), hccsvvController.exportToExcel);

/**
 * @route   GET /api/hccsvv/statistics
 * @desc    Thống kê Huân chương Chiến sĩ Vẻ vang theo hạng
 * @access  ADMIN, MANAGER
 */
router.get(
  '/statistics',
  verifyToken,
  checkRole(['ADMIN', 'MANAGER']),
  hccsvvController.getStatistics
);

module.exports = router;
