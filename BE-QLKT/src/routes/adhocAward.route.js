const express = require('express');
const router = express.Router();
const adhocAwardController = require('../controllers/adhocAward.controller');
const { verifyToken, checkRole } = require('../middlewares/auth');
const multer = require('multer');

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB per file
  },
  fileFilter: (req, file, cb) => {
    // Accept PDF, images, and common document formats
    const allowedMimes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/jpg',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ];

    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          'File type not allowed. Only PDF, images (JPEG, PNG), Word, and Excel files are accepted.'
        )
      );
    }
  },
});

// Special route for users to view their own awards
router.get('/personnel/:personnelId', verifyToken, adhocAwardController.getAdhocAwardsByPersonnel);

// All routes above require authentication and ADMIN role
router.use(verifyToken);
router.use(checkRole(['ADMIN']));

/**
 * @route   POST /api/adhoc-awards
 * @desc    Create ad-hoc award
 * @access  Admin only
 */
router.post(
  '/',
  upload.fields([
    { name: 'decisionFiles', maxCount: 10 },
    { name: 'attachedFiles', maxCount: 10 },
  ]),
  adhocAwardController.createAdhocAward
);

/**
 * @route   GET /api/adhoc-awards
 * @desc    Get all ad-hoc awards with filters
 * @access  Admin only
 */
router.get('/', adhocAwardController.getAdhocAwards);

/**
 * @route   GET /api/adhoc-awards/unit/:unitId
 * @desc    Get all ad-hoc awards for a specific unit
 * @access  Admin only
 */
router.get('/unit/:unitId', adhocAwardController.getAdhocAwardsByUnit);

/**
 * @route   GET /api/adhoc-awards/:id
 * @desc    Get single ad-hoc award by ID
 * @access  Admin only
 */
router.get('/:id', adhocAwardController.getAdhocAwardById);

/**
 * @route   PUT /api/adhoc-awards/:id
 * @desc    Update ad-hoc award
 * @access  Admin only
 */
router.put(
  '/:id',
  upload.fields([
    { name: 'decisionFiles', maxCount: 10 },
    { name: 'attachedFiles', maxCount: 10 },
  ]),
  adhocAwardController.updateAdhocAward
);

/**
 * @route   DELETE /api/adhoc-awards/:id
 * @desc    Delete ad-hoc award
 * @access  Admin only
 */
router.delete('/:id', adhocAwardController.deleteAdhocAward);

module.exports = router;
